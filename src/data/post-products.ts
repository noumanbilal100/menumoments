/**
 * Which products get recommended inside which post.
 *
 * Kept out of the post HTML on purpose: the content JSON is a migration
 * artifact that gets rewritten whenever the import runs, so anything
 * injected into it would be lost. Mapping slugs to ASINs here means the
 * recommendations survive a re-migration and can be reordered without
 * touching article text.
 *
 * ASINs must exist in src/data/products.ts.
 */
export interface PostProductBlock {
  /** Small label above the heading. */
  eyebrow?: string;
  title?: string;
  /** One or two sentences linking the article to the picks. */
  intro?: string;
  /**
   * Text of the `<h2>` the block is placed in front of. Without it the block
   * sits after the article body. Match is exact on the heading's plain text.
   */
  beforeHeading?: string;
  asins: string[];
}

export const POST_PRODUCTS: Record<string, PostProductBlock> = {
  'butter-conversion-how-many-sticks-in-1-cup-measure-butter-in-grams': {
    asins: [
      'B07FCZSC41', // kitchen scale — the post is about grams, so this leads
      'B00M2J7PCI', // Pyrex measuring cups
      'B09SG1M7R2', // stainless measuring cups
      'B0FLJMCN5H', // butter dish
      'B0CHGFG64S', // spatula set
    ],
  },
  'can-you-microwave-styrofoam': {
    eyebrow: 'Reheat it right',
    title: 'A better microwave for reheating takeout',
    intro:
      'Once the food is out of the foam and into glass or ceramic, the microwave does the rest — and an even, well-controlled one is the difference between scorching edges with a cold middle and a properly reheated plate. These five cover every kitchen.',
    // Straight after "Alternatives to Microwaving Styrofoam", where the reader
    // has just been told to move the food into another dish.
    beforeHeading: 'Examples of When You Should Not Microwave Styrofoam',
    asins: [
      'B071WCB1T6', // Toshiba EM131A5C-BS — best overall
      'B07HGH1KG6', // BLACK+DECKER EM720CB7 — best budget
      'B07GV36BLD', // COMFEE' 0.7 cu ft — small spaces
      'B07TM72TFX', // Farberware 1.6 cu ft — large capacity
      'B01DEWZUG4', // Panasonic NN-SN686S — inverter
    ],
  },
};

export function blockForPost(slug: string): PostProductBlock | undefined {
  return POST_PRODUCTS[slug];
}

export function productsForPost(slug: string): string[] {
  return POST_PRODUCTS[slug]?.asins ?? [];
}

/**
 * Splits article HTML just before the `<h2>` whose plain text equals
 * `heading`. Returns null when the heading is not found, so callers can fall
 * back to placing the block after the article.
 */
export function splitBeforeHeading(html: string, heading: string): [string, string] | null {
  const re = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const text = m[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&#8217;|&rsquo;/g, '’')
      .replace(/&amp;/g, '&')
      .trim();
    if (text === heading) return [html.slice(0, m.index), html.slice(m.index)];
  }
  return null;
}
