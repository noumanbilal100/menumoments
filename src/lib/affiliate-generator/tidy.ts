/**
 * Cleans up what ChatGPT writes for the person who prompted it rather than for
 * readers: remarks about the "supplied" listings, and hand-written prices,
 * which Amazon's Associates rules don't allow and which go out of date.
 * Sentences are rewritten where a pattern is clear ("At $299.95, it offers…"
 * becomes "It offers…") and dropped where it isn't.
 */

export interface TidyOptions {
  /** Take product prices out of sentences. */
  prices: boolean;
  /** The prices the article gives its products, e.g. "$299.95". Any amount with cents counts as a price too. */
  productPrices: string[];
  /** What the products are ("espresso machines"), for "the supplied products" → "the espresso machines in this guide". */
  plural: string;
}

export interface Tidier {
  /** One paragraph, list item or table cell of Markdown. */
  text(markdown: string): string;
  /** Sentences that still need the editor's eye after cleaning. */
  leftovers(markdown: string): string[];
  /** How much was taken out so far. */
  readonly report: { notes: number; prices: number };
}

const MONEY = String.raw`\$\s?\d[\d,]*(?:\.\d{1,2})?`;
const MONEY_RE = new RegExp(MONEY, 'g');
/** `%` in a rule stands for an amount of money. */
const rule = (source: string, flags = 'gi') => new RegExp(source.replace(/%/g, `(${MONEY})`), flags);

/** Whole sentences addressed to the editor. */
const NOTE_SENTENCES = [
  /\b(?:listings?|urls?|links?|prices?|details?|information|data|products?)\b[^.]*?\b(?:were|was|are|is|been)\s+(?:provided|supplied)\b/i,
  /\bsupplied\s+(?:for|to)\s+(?:this|the|our)\b/i,
  /\bverified[- ]price/i,
  /\bnot guaranteed live prices?\b/i,
  /\bas an ai\b/i,
  /\b(?:you|the user)\s+(?:provided|supplied|shared|gave)\b/i,
];

/** Words left in otherwise good sentences ("the supplied listing" → "the listing"). */
const NOTE_WORDS = /\bsupplied\b|\bverified-price\b/gi;

function amount(token: string): number {
  return Number(token.replace(/[$,\s]/g, ''));
}

function words(text: string): number {
  return text.replace(/\u0001\d+\u0002/g, ' x ').replace(/[^A-Za-z0-9$]+/g, ' ').trim().split(' ').filter(Boolean).length;
}

function capitalise(sentence: string): string {
  return sentence.replace(/^([\s*_"“(]*)([a-z])/, (m, lead: string, c: string) => lead + c.toUpperCase());
}

function tidySpacing(s: string): string {
  return s
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/,\s*([,.;:!?])/g, '$1')
    .replace(/^[\s,;:]+/, '')
    .trim();
}

export function makeTidier(options: TidyOptions): Tidier {
  const known = options.productPrices.map(amount).filter((n) => n > 0);
  const isPrice = (token: string) => {
    const n = amount(token);
    return /\.\d/.test(token) || known.some((k) => Math.abs(k - n) < 0.01 || Math.floor(k) === n);
  };
  const things = options.plural.trim() || 'products';
  const report = { notes: 0, prices: 0 };

  /** Runs a replacement only when every amount it touches is a product price. */
  const onPrices =
    (to: (m: string, ...g: string[]) => string) =>
    (m: string, ...g: unknown[]) =>
      (m.match(MONEY_RE) ?? []).every(isPrice) ? to(m, ...(g.filter((x) => typeof x === 'string') as string[])) : m;

  const priceRules: [RegExp, (m: string, ...g: string[]) => string][] = [
    // "At its supplied price of $457.21, the Gaggia competes…" → "The Gaggia competes…"
    [rule(String.raw`^(?:at|for)\s+(?:(?:about|around|roughly|just|only)\s+)?(?:(?:its|the|a|an|this)\s+)?(?:(?:listed|supplied|current|asking|retail)\s+)?(?:price\s+(?:of\s+)?)?%\s*,\s*`, 'i'), () => ''],
    // "The Bambino costs $299.95, while the Bambino Plus costs $499.95" → "The Bambino costs less than the Bambino Plus"
    [rule(String.raw`^(.+?)\s+costs\s+%\s*,\s*while\s+(.+?)\s+costs\s+%`, 'i'), (m, a, p1, b, p2) => `${a} costs ${amount(p1) < amount(p2) ? 'less' : 'more'} than ${b}`],
    // "The Bambino Plus costs $499.95 and is positioned…" → "The Bambino Plus is positioned…"
    [rule(String.raw`\s+costs\s+%\s+and\s+(?=(?:is|are|has|have|offers?|comes?)\b)`), () => ' '],
    // "It is priced at $283, making it less expensive…" → "It is less expensive…"
    [rule(String.raw`\b(is|are)\s+(?:priced|listed|available|sold)\s+(?:at|for)\s+%\s*,\s*(?:making|which makes)\s+(?:it|them)\s+`), (m, verb) => `${verb} `],
    // "Its price is $99.99, placing it close to…" → "It is close to…"
    [rule(String.raw`\b(?:its|the)\s+price\s+is\s+%\s*,\s*(?:placing|putting|making)\s+it\s+`), () => 'it is '],
    // "a buyer spending $499.95 on the Bambino Plus" → "a buyer choosing the Bambino Plus"
    [rule(String.raw`\bspending\s+%\s+on\s+`), () => 'choosing '],
    // "is less expensive at the price of $299.95" → "is less expensive"
    [rule(String.raw`\s+at\s+(?:its|the)\s+(?:(?:listed|supplied)\s+)?price\s+of\s+%`), () => ''],
    // "Its price of $499.95 places it…" → "Its price places it…"
    [rule(String.raw`(\bprice)\s+of\s+%`), (m, word) => word],
    // "(about $97)" → ""
    [rule(String.raw`\s*\(\s*(?:about|around|approx\.?|roughly|~)?\s*%\s*\)`), () => ''],
    // "the Stilosa at $97.47 is…" → "the Stilosa is…"
    [rule(String.raw`\s+(?:at|for)\s+(?:(?:just|only|around|about|roughly)\s+)?%(?=[\s,.;:!?)]|$)`), () => ''],
    // "A $499.95 machine" → "A machine"; "Its $299.95 price" → "Its price"
    [
      rule(String.raw`\b(a|an|the|its|this|that)\s+%\s+([a-z])`),
      (m, det, price, next) => `${/^an?$/i.test(det) ? (det[0] === 'A' ? 'A' : 'a') + (/[aeiou]/i.test(next) ? 'n' : '') : det} ${next}`,
    ],
  ];

  /** A note sentence, or just its note clause: "Alternatives to research, but they are not part of the listings supplied for this comparison:" → "Alternatives to research:". */
  function withoutNote(sentence: string): string | null {
    if (!NOTE_SENTENCES.some((re) => re.test(sentence))) return sentence;
    const end = sentence.match(/[.:!?]\s*$/)?.[0].trim() ?? '';
    const clauses = sentence.split(/,\s+(?=(?:but|although|though|while|because|since)\b)/i);
    if (clauses.length > 1 && !NOTE_SENTENCES.some((re) => re.test(clauses[0])) && words(clauses[0]) >= 4) {
      return clauses[0].replace(/[.:!?]\s*$/, '') + end;
    }
    return null;
  }

  function sentence(original: string): string | null {
    let s = withoutNote(original);
    if (s === null) {
      report.notes++;
      return null;
    }
    if (s !== original) report.notes++;

    // Notes inside otherwise good sentences.
    const before = s;
    s = s
      .replace(/\bthe\s+((?:\w+\s+)?)supplied\s+(?:product\s+listings|products)\b/gi, `the $1${things} in this guide`)
      .replace(/\s*,?\s*based on (?:the\s+)?(?:supplied\s+|listed\s+)?prices\b/gi, '')
      .replace(/\b(?:supplied|provided)\s+(?=(?:product\s+)?(?:listings?|products?|prices?|shortlist|urls?|links?|figures?|details?|data|information|specifications?|specs|descriptions?|capacity|\d))/gi, '')
      .replace(/\blisted\s+(?=(?:price|prices|capacity|features?|specifications?)\b)/gi, '');
    if (s !== before) report.notes += Math.max(1, (before.match(/\bsupplied\b|\blisted\b/gi) ?? []).length - (s.match(/\bsupplied\b|\blisted\b/gi) ?? []).length);

    if (options.prices) {
      const count = (t: string) => (t.match(MONEY_RE) ?? []).filter(isPrice).length;
      const had = count(s);
      if (had) {
        for (const [re, to] of priceRules) s = s.replace(re, onPrices(to));
        // Amounts worked out from the prices, and remarks about prices this page no longer shows.
        if (/\$\d[\d,]*\s+(?:price\s+)?difference\b/i.test(s) || count(s)) s = '';
        report.prices += had;
      }
      if (/\b(?:listing|listed)\s+prices\b|^\W*prices\s+(?:are|were)\s+the\b/i.test(s)) {
        report.notes++;
        s = '';
      }
    }

    if (s === original) return s;
    s = capitalise(tidySpacing(s));
    return words(s) >= 2 ? s : null;
  }

  function text(markdown: string): string {
    if (!markdown.trim()) return markdown;
    // Links and images stay whole, so their URLs never split a sentence.
    const kept: string[] = [];
    let t = markdown.replace(/!?\[[^\]]*\]\([^)]*\)/g, (m) => `\u0001${kept.push(m) - 1}\u0002`);
    // A leading bold label ("**Our verdict:**") and italics around the whole text are put back afterwards.
    const label = t.match(/^\s*\*\*[^*]+\*\*:?\s*/)?.[0] ?? '';
    t = t.slice(label.length);
    if (!t.trim()) return markdown;
    const italic = /^\*[^*].*[^*]\*$|^_[^_].*[^_]_$/.test(t.trim()) ? t.trim()[0] : '';
    if (italic) t = t.trim().slice(1, -1);

    const out = t
      .split(/(?<=[.!?])\s+(?=[A-Z0-9"“'(*_\u0001])/)
      .map(sentence)
      .filter((s): s is string => s !== null && s.trim() !== '');
    let result = out.join(' ');
    if (result && italic) result = `${italic}${result}${italic}`;
    if (!result.trim()) return '';
    return (label + result).replace(/\u0001(\d+)\u0002/g, (m, i: string) => kept[Number(i)]);
  }

  function leftovers(markdown: string): string[] {
    const plainText = markdown.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '');
    return plainText
      .split(/(?<=[.!?])\s+/)
      .filter((s) => {
        NOTE_WORDS.lastIndex = 0;
        return NOTE_WORDS.test(s) || (options.prices && (s.match(MONEY_RE) ?? []).some(isPrice));
      })
      .map((s) => s.trim());
  }

  return { text, leftovers, report };
}
