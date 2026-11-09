import { filled, items, parseBlocks, titleCase, type Block } from './format';
import type { GenSetup } from './setup';

/**
 * The article is written in sections, one ChatGPT prompt each, so no single
 * reply runs long enough to get cut off. Each section's template and the code
 * that reads it back sit together here so they cannot drift apart.
 */

export type SectionKind = 'overview' | 'guide' | 'reviews' | 'wrapup';

export interface SectionDef {
  id: string;
  kind: SectionKind;
  title: string;
  description: string;
  required: boolean;
  /** 1-based product numbers this section writes about. */
  refs: number[];
}

/** Reviews are long; five per reply stays well inside ChatGPT's output limit. */
const REVIEWS_PER_PROMPT = 5;

export function sectionsFor(setup: GenSetup): SectionDef[] {
  const all = setup.products.map((_, i) => i + 1);
  const batches: number[][] = [];
  for (let i = 0; i < all.length; i += REVIEWS_PER_PROMPT) batches.push(all.slice(i, i + REVIEWS_PER_PROMPT));
  return [
    { id: 'overview', kind: 'overview', title: 'Title, intro and quick picks', description: 'Headline, SEO fields, introduction, quick picks and the comparison table.', required: true, refs: all },
    { id: 'guide', kind: 'guide', title: 'How we chose and buying guide', description: 'Evaluation criteria, buying guide steps, a comparison of two options, checklists and key features.', required: false, refs: all },
    ...batches.map((refs, i): SectionDef => ({
      id: `reviews-${i + 1}`,
      kind: 'reviews',
      title: `Product reviews ${refs[0]}–${refs[refs.length - 1]}`,
      description: 'A full review of each product: who it suits, the review itself, pros, cons and a verdict.',
      required: true,
      refs,
    })),
    { id: 'wrapup', kind: 'wrapup', title: 'Who should buy, FAQ and verdict', description: 'Overall pros and cons, who should buy which product, FAQs and the final verdict.', required: false, refs: all },
  ];
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

function header(setup: GenSetup, task: string): string {
  const year = new Date().getFullYear();
  const list = setup.products
    .map((p, i) => {
      const facts = p.facts.trim() ? `\n     Known facts: ${p.facts.trim().replace(/\s*\n\s*/g, '; ')}` : '';
      return `[P${i + 1}] ${p.name.trim()}\n     Link: ${p.url.trim()}${facts}`;
    })
    .join('\n');
  const notes = setup.notes.trim() ? `\nEDITOR'S NOTES\n${setup.notes.trim()}\n` : '';
  return `You are helping write a buying guide for Menu Moments (menumoments.com), a food and kitchen website for home cooks in the United States.

ARTICLE
Main keyword: ${setup.keyword.trim()}
Products compared: ${setup.plural.trim()}
Year: ${year}

PRODUCTS (in ranking order; [P1] is our top pick)
${list}
${notes}
YOUR TASK
${task}

WRITING RULES
- Write clear, friendly American English for real home cooks. Keep paragraphs short (2 to 4 sentences) and specific.
- This is a research-based guide. Never say or imply that we bought, tested, used or measured the products. For product details, use phrases such as "according to the listing" or "the manufacturer says".
- Do not invent prices, star ratings, review counts, awards, dimensions or package contents. If you are not sure about a detail, describe it in general terms and tell readers to check the current listing.
- If you can browse the web, open each product link and use what the listing says.
- When you mention one of the products, write its tag, for example [P2], instead of its name. The website turns each tag into the product's linked name. Never put a tag in TITLE, SEO_TITLE, META, EXCERPT, HERO_ALT, BADGE or SHORT_NAME.
- Use the main keyword "${setup.keyword.trim()}" naturally where it fits, plus close variations. Never stuff keywords.
- Do not add links, emojis, tables or headings of your own. Use **bold** only for a few key phrases.

REPLY FORMAT
Reply with ONLY the template below, filled in, inside one \`\`\`text code block.
Keep every label exactly as written (in capitals, followed by a colon) and keep every ### line.
Replace each instruction in parentheses with your own text.

`;
}

function overviewTemplate(setup: GenSetup): string {
  const year = new Date().getFullYear();
  const n = setup.products.length;
  const picks = setup.products
    .map((_, i) => `### PICK P${i + 1}
BADGE: (2 to 4 words${i === 0 ? ', this one is "Best Overall"' : ', different from every other product, e.g. Best Budget, Best Value or Best for Beginners'})
BEST_FOR: (who it suits, one short line)
SUMMARY: (2 sentences on why it made the list)
SHORT_NAME: (brand and model in 2 to 4 words)
MAIN_APPEAL: (3 to 6 words)
BEST_BUYER: (3 to 6 words)
CHECK: (what to confirm on the listing before buying, 3 to 7 words)`)
    .join('\n\n');
  return `TITLE: (headline under 70 characters, e.g. "Best ${titleCase(setup.plural)} (${year}): ${n} Top Picks for Every Cook")
SEO_TITLE: (under 60 characters, includes "${setup.keyword}" and ${year})
META: (meta description, 140 to 155 characters, includes the main keyword)
EXCERPT: (one or two sentences for article cards, under 200 characters)
HERO_ALT: (alt text for a featured image showing these ${setup.plural}, under 125 characters)
INTRO:
(3 or 4 short paragraphs: why choosing the right ${setup.singular} matters, what separates good options, a mention of some of the products by tag, and what this guide covers)
RECOMMENDATION:
(2 or 3 sentences pointing readers to the right pick for their situation, using product tags)
EVALUATION_INTRO:
(1 paragraph on how the products were compared: listings, specifications, materials, ease of use and what buyers say)

${picks}`;
}

function guideTemplate(setup: GenSetup): string {
  const repeat = (block: string, times: number) => Array.from({ length: times }, () => block).join('\n\n');
  return `GUIDE_INTRO:
(1 paragraph introducing how to choose a ${setup.singular})
VERSUS_HEADING: (a heading comparing the two types or approaches buyers most often choose between, e.g. "Bamboo Mat or Sushi Bazooka?"; write NONE if there is no such choice)
VERSUS_A_TITLE: (first option, 2 to 5 words)
VERSUS_A_TEXT: (2 or 3 sentences)
VERSUS_B_TITLE: (second option, 2 to 5 words)
VERSUS_B_TEXT: (2 or 3 sentences)
VERSUS_AFTER:
(1 or 2 paragraphs on which option suits whom)
MUST_HAVE:
- (5 features or items a good ${setup.singular} should have, one per line)
NICE_TO_HAVE:
- (4 to 6 useful extras, one per line)

${repeat(`### CRITERION
TITLE: (one thing the products were compared on, 2 to 5 words)
TEXT: (2 or 3 sentences)`, 5)}

${repeat(`### STEP
TITLE: (a buying decision, e.g. "Decide Which Size You Need")
TEXT:
(1 or 2 paragraphs)`, 6)}

${repeat(`### FEATURE
TITLE: (a key feature, 2 to 5 words)
TEXT: (2 or 3 sentences)`, 6)}`;
}

function reviewsTemplate(refs: number[]): string {
  return refs
    .map((n) => `### REVIEW P${n}
BEST_FOR: (one sentence)
REVIEW:
(3 or 4 paragraphs: what it is, notable features or what the listing says is included, who it suits and why, and anything to watch for)
PROS:
- (3 to 5 short points, one per line)
CONS:
- (2 or 3 honest drawbacks, one per line)
VERDICT: (2 sentences)`)
    .join('\n\n');
}

function wrapupTemplate(setup: GenSetup): string {
  const shortlist = setup.products
    .map((_, i) => `### SHORTLIST P${i + 1}
LINE: (a short phrase that completes "product name — ...", e.g. "a versatile option for most home cooks")`)
    .join('\n\n');
  const who = Array.from({ length: 6 }, () => `### WHO
TITLE: (e.g. "If You Are a Complete Beginner")
LEAD: (one sentence recommending one or two products by tag)
TEXT: (2 or 3 sentences)`).join('\n\n');
  const faq = Array.from({ length: 12 }, () => `### FAQ
QUESTION: (a question people search for about ${setup.plural})
ANSWER: (2 to 4 sentences)`).join('\n\n');
  return `OVERALL_PROS:
- (4 to 6 points about ${setup.plural} in general, each written as "Short lead: one sentence")
OVERALL_CONS:
- (3 to 5 points in the same style)
VERDICT_INTRO:
(2 short paragraphs)
TOP_PICK:
(2 paragraphs on why [P1] is our top recommendation and which alternatives suit other needs)
CLOSING:
(1 or 2 paragraphs: what to check before buying, and a warm final line)

${shortlist}

${who}

${faq}`;
}

export function promptFor(section: SectionDef, setup: GenSetup): string {
  switch (section.kind) {
    case 'overview':
      return header(setup, `Write the headline, SEO fields, introduction, quick picks and comparison-table entries for every product.`) + overviewTemplate(setup);
    case 'guide':
      return header(setup, `Write the "how we chose" criteria, the buying guide, and the key features to consider. Do not review individual products here; mention them by tag only where it helps.`) + guideTemplate(setup);
    case 'reviews':
      return (
        header(setup, `Write a full review of these products only: ${section.refs.map((n) => `[P${n}]`).join(', ')}. The other products are listed so you know the line-up; do not review them here.`) +
        reviewsTemplate(section.refs)
      );
    case 'wrapup':
      return header(setup, `Write the overall pros and cons, the "who should buy which" advice, the FAQs and the final verdict.`) + wrapupTemplate(setup);
  }
}

// ---------------------------------------------------------------------------
// Reading replies back
// ---------------------------------------------------------------------------

export interface Item {
  title: string;
  text: string;
}

export interface Pick {
  badge: string;
  bestFor: string;
  summary: string;
  shortName: string;
  appeal: string;
  buyer: string;
  check: string;
}

export interface OverviewData {
  title: string;
  seoTitle: string;
  meta: string;
  excerpt: string;
  heroAlt: string;
  intro: string;
  recommendation: string;
  evaluationIntro: string;
  picks: Record<number, Pick>;
}

export interface GuideData {
  guideIntro: string;
  versus: { heading: string; aTitle: string; aText: string; bTitle: string; bText: string; after: string } | null;
  mustHave: string[];
  niceToHave: string[];
  criteria: Item[];
  steps: Item[];
  features: Item[];
}

export interface ReviewData {
  bestFor: string;
  review: string;
  pros: string[];
  cons: string[];
  verdict: string;
}

export interface WrapupData {
  overallPros: string[];
  overallCons: string[];
  verdictIntro: string;
  topPick: string;
  closing: string;
  shortlist: Record<number, string>;
  who: { title: string; lead: string; text: string }[];
  faq: { question: string; answer: string }[];
}

export type SectionData =
  | { kind: 'overview'; data: OverviewData }
  | { kind: 'guide'; data: GuideData }
  | { kind: 'reviews'; data: Record<number, ReviewData> }
  | { kind: 'wrapup'; data: WrapupData };

export interface ReadResult {
  /** Null when the reply can't be used at all. */
  value: SectionData | null;
  errors: string[];
  warnings: string[];
}

const LABELS: Record<SectionKind, string[]> = {
  overview: ['TITLE', 'SEO_TITLE', 'META', 'EXCERPT', 'HERO_ALT', 'INTRO', 'RECOMMENDATION', 'EVALUATION_INTRO', 'BADGE', 'BEST_FOR', 'SUMMARY', 'SHORT_NAME', 'MAIN_APPEAL', 'BEST_BUYER', 'CHECK'],
  guide: ['GUIDE_INTRO', 'VERSUS_HEADING', 'VERSUS_A_TITLE', 'VERSUS_A_TEXT', 'VERSUS_B_TITLE', 'VERSUS_B_TEXT', 'VERSUS_AFTER', 'MUST_HAVE', 'NICE_TO_HAVE', 'TITLE', 'TEXT'],
  reviews: ['BEST_FOR', 'REVIEW', 'PROS', 'CONS', 'VERDICT'],
  wrapup: ['OVERALL_PROS', 'OVERALL_CONS', 'VERDICT_INTRO', 'TOP_PICK', 'CLOSING', 'LINE', 'TITLE', 'LEAD', 'TEXT', 'QUESTION', 'ANSWER'],
};

const BLOCKS: Record<SectionKind, string[]> = {
  overview: ['PICK'],
  guide: ['CRITERION', 'STEP', 'FEATURE'],
  reviews: ['REVIEW'],
  wrapup: ['SHORTLIST', 'WHO', 'FAQ'],
};

const val = (v: string | undefined) => (filled(v) ? v.trim() : '');

function itemsOf(blocks: Block[], type: string): Item[] {
  return blocks
    .filter((b) => b.type === type && filled(b.fields.TITLE) && filled(b.fields.TEXT))
    .map((b) => ({ title: val(b.fields.TITLE), text: val(b.fields.TEXT) }));
}

export function readSection(section: SectionDef, reply: string): ReadResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!reply.trim()) return { value: null, errors: [], warnings: [] };

  const blocks = parseBlocks(reply, LABELS[section.kind], BLOCKS[section.kind]);
  const main = blocks[0].fields;
  const byRef = (type: string) => {
    const map = new Map<number, Record<string, string>>();
    for (const b of blocks) if (b.type === type && b.ref) map.set(b.ref, b.fields);
    return map;
  };
  if (!Object.keys(main).length && blocks.length === 1) {
    return { value: null, errors: ['No labels found. Paste ChatGPT’s whole reply, including lines such as TITLE: and ###.'], warnings };
  }

  switch (section.kind) {
    case 'overview': {
      const found = byRef('PICK');
      const picks: Record<number, Pick> = {};
      for (const n of section.refs) {
        const f = found.get(n);
        if (!f || !filled(f.SUMMARY)) {
          errors.push(`Quick pick for product ${n} is missing.`);
          continue;
        }
        picks[n] = {
          badge: val(f.BADGE),
          bestFor: val(f.BEST_FOR),
          summary: val(f.SUMMARY),
          shortName: val(f.SHORT_NAME),
          appeal: val(f.MAIN_APPEAL),
          buyer: val(f.BEST_BUYER),
          check: val(f.CHECK),
        };
        if (!picks[n].badge) warnings.push(`Product ${n} has no badge.`);
      }
      if (!filled(main.TITLE)) errors.push('TITLE is missing.');
      if (!filled(main.INTRO)) errors.push('INTRO is missing.');
      for (const k of ['SEO_TITLE', 'META', 'EXCERPT', 'RECOMMENDATION']) if (!filled(main[k])) warnings.push(`${k} is missing.`);
      const data: OverviewData = {
        title: val(main.TITLE).replace(/^["“]|["”]$/g, ''),
        seoTitle: val(main.SEO_TITLE).replace(/^["“]|["”]$/g, ''),
        meta: val(main.META),
        excerpt: val(main.EXCERPT),
        heroAlt: val(main.HERO_ALT),
        intro: val(main.INTRO),
        recommendation: val(main.RECOMMENDATION),
        evaluationIntro: val(main.EVALUATION_INTRO),
        picks,
      };
      if (data.seoTitle.length > 60) warnings.push(`SEO_TITLE is ${data.seoTitle.length} characters; Google shows about 60.`);
      if (data.meta.length > 160) warnings.push(`META is ${data.meta.length} characters; it will be shortened.`);
      return { value: errors.length ? null : { kind: 'overview', data }, errors, warnings };
    }

    case 'guide': {
      const versusOk = filled(main.VERSUS_HEADING) && filled(main.VERSUS_A_TEXT) && filled(main.VERSUS_B_TEXT);
      const data: GuideData = {
        guideIntro: val(main.GUIDE_INTRO),
        versus: versusOk
          ? {
              heading: val(main.VERSUS_HEADING),
              aTitle: val(main.VERSUS_A_TITLE),
              aText: val(main.VERSUS_A_TEXT),
              bTitle: val(main.VERSUS_B_TITLE),
              bText: val(main.VERSUS_B_TEXT),
              after: val(main.VERSUS_AFTER),
            }
          : null,
        mustHave: items(main.MUST_HAVE),
        niceToHave: items(main.NICE_TO_HAVE),
        criteria: itemsOf(blocks, 'CRITERION'),
        steps: itemsOf(blocks, 'STEP'),
        features: itemsOf(blocks, 'FEATURE'),
      };
      if (!data.steps.length) errors.push('No buying guide steps found (### STEP).');
      if (!data.criteria.length) warnings.push('No evaluation criteria found (### CRITERION).');
      if (!data.features.length) warnings.push('No key features found (### FEATURE).');
      return { value: errors.length ? null : { kind: 'guide', data }, errors, warnings };
    }

    case 'reviews': {
      const found = byRef('REVIEW');
      const data: Record<number, ReviewData> = {};
      for (const n of section.refs) {
        const f = found.get(n);
        if (!f || !filled(f.REVIEW)) {
          errors.push(`Review for product ${n} is missing.`);
          continue;
        }
        data[n] = { bestFor: val(f.BEST_FOR), review: val(f.REVIEW), pros: items(f.PROS), cons: items(f.CONS), verdict: val(f.VERDICT) };
        if (!data[n].pros.length || !data[n].cons.length) warnings.push(`Product ${n} is missing pros or cons.`);
      }
      return { value: errors.length ? null : { kind: 'reviews', data }, errors, warnings };
    }

    case 'wrapup': {
      const shortlist: Record<number, string> = {};
      for (const [n, f] of byRef('SHORTLIST')) if (filled(f.LINE)) shortlist[n] = val(f.LINE);
      const data: WrapupData = {
        overallPros: items(main.OVERALL_PROS),
        overallCons: items(main.OVERALL_CONS),
        verdictIntro: val(main.VERDICT_INTRO),
        topPick: val(main.TOP_PICK),
        closing: val(main.CLOSING),
        shortlist,
        who: blocks
          .filter((b) => b.type === 'WHO' && filled(b.fields.TITLE) && filled(b.fields.TEXT))
          .map((b) => ({ title: val(b.fields.TITLE), lead: val(b.fields.LEAD), text: val(b.fields.TEXT) })),
        faq: blocks
          .filter((b) => b.type === 'FAQ' && filled(b.fields.QUESTION) && filled(b.fields.ANSWER))
          .map((b) => ({ question: val(b.fields.QUESTION), answer: val(b.fields.ANSWER) })),
      };
      if (!data.verdictIntro && !data.topPick) errors.push('VERDICT_INTRO and TOP_PICK are both missing.');
      if (!data.faq.length) warnings.push('No FAQs found (### FAQ).');
      if (!data.who.length) warnings.push('No "who should buy" cards found (### WHO).');
      return { value: errors.length ? null : { kind: 'wrapup', data }, errors, warnings };
    }
  }
}
