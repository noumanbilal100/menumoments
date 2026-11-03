/**
 * Pulls recipe facts out of a post's own HTML for structured data.
 *
 * Google requires structured data to be a true representation of the page, so
 * everything here comes from text the reader can see. It is deliberately
 * strict: a post only counts as a recipe when it clearly describes one dish
 * with a real ingredient list and real steps. Roundups, product posts and
 * posts covering two dishes return null and are marked up as plain articles.
 */

export interface ExtractedStep {
  name?: string;
  text: string;
}

export interface ExtractedRecipe {
  ingredients: string[];
  steps: ExtractedStep[];
  prepMinutes?: number;
  cookMinutes?: number;
  totalMinutes?: number;
  servings?: number;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', nbsp: ' ', quot: '"', apos: "'", lt: '<', gt: '>', hellip: '…', ndash: '–', mdash: '—',
  rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', frac12: '½', frac14: '¼', frac34: '¾', deg: '°',
  eacute: 'é', egrave: 'è', ntilde: 'ñ', times: '×',
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z0-9]+);/gi, (whole, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? whole;
  });
}

function plain(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
}

type Token =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'para'; text: string };

function tokenize(html: string): Token[] {
  const out: Token[] = [];
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>|<(ul|ol)\b[^>]*>([\s\S]*?)<\/\3>|<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  for (const m of html.matchAll(re)) {
    if (m[1]) {
      out.push({ kind: 'heading', level: Number(m[1]), text: plain(m[2]) });
    } else if (m[3]) {
      const items = [...m[4].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => plain(li[1])).filter(Boolean);
      if (items.length) out.push({ kind: 'list', items });
    } else {
      const text = plain(m[5]);
      if (text) out.push({ kind: 'para', text });
    }
  }
  return out;
}

const QUESTION = /\?\s*$|^(what|why|can|could|how (much|many|long|do|does|to store)|is|are|do|does|should|will)\b/i;
const NOT_A_LIST =
  /substitut|swap|faq|tip|table|recipes? you|you.ll (also )?love|benefit|why |quality|about|step\s*\d|prepare|gather|mix|combine|add |measure|whisk|\bwith \d|\bonly \d/i;
const COMPONENT =
  /\b(dry|wet|sauce|filling|dough|crust|topping|glaze|frosting|icing|marinade|batter|garnish|optional|main|core|essential|key|base|seasoning|spices?|broth|for the|for garnish|add-?ins?)\b/i;
const STEP_HEADING = /^step\s*\d+\b/i;
const STEP_PREFIX = /^(step\s*\d+\s*[:.\-–—)]*\s*|\d+[.)]\s+)/i;
const INSTRUCTIONS =
  /\b(instructions?|directions?|method|step[- ]by[- ]step|steps)\b|\bhow to (make|prepare|cook|bake)\b/i;
const NOT_INSTRUCTIONS = /cooking methods|alternative|variation|other|tips?\b|storage|reheat|serve|serving/i;
const NOT_A_STEP =
  /\b(time|serving size|servings|yield|nutrition|calories|tips?|notes?|faqs?|storage|variations?|overview|equipment|tools|introduction|origins?|history|serving suggestions?|ingredients? for|step[- ]by[- ]step|dietary|health|related)\b|^(how to (make|prepare|cook|bake)|instructions?$|directions?$|((key|main|core|essential) )?ingredients?$|(easy|basic|simple|quick|classic)\b.*\brecipe$)/i;
/** Cookware and advice that share a list with the ingredients. */
const NOT_AN_INGREDIENT =
  /\b(microwave[- ]safe|paper towels?|aluminum foil|parchment|bowls?|mixer|spatula|toothpicks?|tongs|loaf pan|baking sheet|cooling rack)\b|^(an? )?(large |medium |small )?(plate|mug|lid|skillet|saucepan|pan)\b|^(use |whisk\b|crumble\b|stir |stale\b|extra(?![- ]virgin)\b|more\b|optional sides|for (a|an|extra)\b)/i;
/** "Cheesy topping: Sprinkle…" is a variation written as a sentence. */
const COMMENTARY = /^[^:]+:\s+[A-Z]/;
/** "Double coating enhances crispiness" means the list is advice about ingredients. */
const ADVICE = /\b(enhances?|helps?|may|should)\b/i;
/** A conclusion or a roundup among the steps means the whole article was read as a method. */
const WHOLE_ARTICLE = /\b(conclusion|final thoughts|wrap(ping)? up|popular|explained)\b/i;
const QUANTITY = /^\s*(about |a |an )?[\d½¼¾⅓⅔⅛]|\(\s*[\d½¼¾⅓⅔⅛]/i;
/** Words shared by real ingredients ("garlic powder, onion powder"), so they say nothing about alternatives. */
const SHARED_WORD = /^(powder|sauce|seasoning|fresh|dried|ground|optional|juice|black|white|brown|green|sugar|extract|cheese|pepper|with|your|choice)$/;
const MAX_INGREDIENTS = 25;
const MAX_STEPS = 15;

function isIngredientHeading(text: string): boolean {
  return /ingredient/i.test(text) && !QUESTION.test(text) && !NOT_A_LIST.test(text);
}

function isInstructionHeading(text: string): boolean {
  return INSTRUCTIONS.test(text) && !QUESTION.test(text) && !NOT_INSTRUCTIONS.test(text) && !STEP_HEADING.test(text);
}

/** Tokens under the heading at `start`, up to the next heading of equal or higher rank. */
function sectionOf(tokens: Token[], start: number): Token[] {
  const head = tokens[start];
  if (head.kind !== 'heading') return [];
  const section: Token[] = [];
  for (let i = start + 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind === 'heading' && t.level <= head.level) break;
    section.push(t);
  }
  return section;
}

/** "Ground beef, lean ground beef, hamburger meat" lists options to choose from, not what goes in the dish. */
function listsAlternatives(items: string[]): boolean {
  const seen = new Map<string, number>();
  for (const item of items) {
    if (QUANTITY.test(item)) continue;
    const words = item.toLowerCase().split(/[^a-z]+/).map((w) => w.replace(/s$/, ''));
    for (const word of new Set(words)) {
      if (word.length >= 3 && !SHARED_WORD.test(word)) seen.set(word, (seen.get(word) ?? 0) + 1);
    }
  }
  return [...seen.values()].some((n) => n >= 4);
}

function extractIngredients(tokens: Token[]): string[] | null {
  const items: string[] = [];
  let separateDishes = 0;
  let coveredUntil = -1;
  tokens.forEach((t, i) => {
    if (t.kind !== 'heading' || i <= coveredUntil || !isIngredientHeading(t.text)) return;
    const section = sectionOf(tokens, i);
    coveredUntil = i + section.length;
    if (!COMPONENT.test(t.text)) separateDishes++;
    for (const s of section) if (s.kind === 'list') items.push(...s.items);
  });
  // Two independent ingredient sections mean the post covers two dishes.
  if (separateDishes > 1) return null;
  const unique = [...new Set(items.map((x) => x.replace(/[.;,]+$/, '')))].filter(
    (x) => !NOT_AN_INGREDIENT.test(x) && !COMMENTARY.test(x),
  );
  if (unique.length < 3 || unique.length > MAX_INGREDIENTS) return null;
  if (listsAlternatives(unique)) return null;
  if (unique.some((x) => !QUANTITY.test(x) && ADVICE.test(x))) return null;
  // A long list with hardly any amounts is a list of keywords.
  if (unique.length > 20 && unique.filter((x) => QUANTITY.test(x)).length < unique.length / 3) return null;
  // Long sentences are commentary about ingredients, not an ingredient list.
  if (unique.filter((x) => x.length > 160).length > unique.length / 3) return null;
  return unique;
}

function stepsFromHeadings(section: Token[]): ExtractedStep[] {
  const steps: ExtractedStep[] = [];
  let current: { name: string; parts: string[] } | null = null;
  const flush = () => {
    if (current && current.parts.length) steps.push({ name: current.name, text: current.parts.join(' ') });
    current = null;
  };
  for (const t of section) {
    if (t.kind === 'heading') {
      flush();
      current = { name: t.text.replace(STEP_PREFIX, '').replace(/[:.]+$/, ''), parts: [] };
    } else if (current) {
      if (t.kind === 'para') current.parts.push(t.text);
      else current.parts.push(t.items.join(' '));
    }
  }
  flush();
  return steps;
}

function extractSteps(tokens: Token[]): ExtractedStep[] | null {
  const start = tokens.findIndex((t) => t.kind === 'heading' && isInstructionHeading(t.text));
  let steps: ExtractedStep[] = [];
  if (start !== -1) {
    const section = sectionOf(tokens, start);
    if (section.some((t) => t.kind === 'heading')) {
      steps = stepsFromHeadings(section);
    } else {
      // Paragraphs alone are the post's intro, not a method.
      const list = section.filter((t) => t.kind === 'list').flatMap((t) => (t.kind === 'list' ? t.items : []));
      steps = list.map((text) => ({ text: text.replace(STEP_PREFIX, '') }));
    }
  }
  if (steps.length < 2) {
    // "Step 1: …" headings with no parent section.
    const first = tokens.findIndex((t) => t.kind === 'heading' && STEP_HEADING.test(t.text));
    if (first !== -1) {
      const run: Token[] = [];
      const level = (tokens[first] as { level: number }).level;
      for (let i = first; i < tokens.length; i++) {
        const t = tokens[i];
        if (t.kind === 'heading' && !STEP_HEADING.test(t.text) && t.level <= level) break;
        run.push(t);
      }
      steps = stepsFromHeadings(run);
    }
  }
  const usable = steps.filter(
    (s) => s.text.length >= 15 && !(s.name && (QUESTION.test(s.name) || NOT_A_STEP.test(s.name))),
  );
  if (usable.some((s) => s.name && WHOLE_ARTICLE.test(s.name))) return null;
  return usable.length >= 2 && usable.length <= MAX_STEPS ? usable : null;
}

function minutesAfter(label: string, text: string): number | undefined {
  const m = text.match(
    new RegExp(`${label}\\s*[:\\-–—]?\\s*(?:about\\s*)?(\\d+)\\s*(hours?|hrs?|minutes?|mins?)(?:\\s*(?:and\\s*)?(\\d+)\\s*(?:minutes?|mins?))?`, 'i'),
  );
  if (!m) return undefined;
  const first = Number(m[1]);
  return /^h/i.test(m[2]) ? first * 60 + Number(m[3] ?? 0) : first;
}

/** Titles that promise a list of recipes, or something that is not food at all. */
const NOT_ONE_DISH =
  /\brecipes\b|\b(soap|lotion|balm|bug spray|repellent|wax|shampoo|deodorant|horse|(dog|cat|puppy|fish|pet) food|organizer|menu|educational|informational|inspiration|global)\b/i;

export function extractRecipe(html: string, title: string): ExtractedRecipe | null {
  if (NOT_ONE_DISH.test(title)) return null;
  const tokens = tokenize(html);
  const ingredients = extractIngredients(tokens);
  if (!ingredients) return null;
  const steps = extractSteps(tokens);
  if (!steps) return null;

  const text = plain(html);
  const servings = text.match(/\b(?:servings?|serves|yield)\s*[:\-–—]?\s*(\d{1,3})\b/i);
  return {
    ingredients,
    steps,
    prepMinutes: minutesAfter('prep(?:aration)?\\s*time', text),
    cookMinutes: minutesAfter('cook(?:ing)?\\s*time', text),
    totalMinutes: minutesAfter('total\\s*time', text),
    servings: servings ? Number(servings[1]) : undefined,
  };
}
