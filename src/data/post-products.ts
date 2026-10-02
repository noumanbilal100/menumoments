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
export const POST_PRODUCTS: Record<string, string[]> = {
  'butter-conversion-how-many-sticks-in-1-cup-measure-butter-in-grams': [
    'B07FCZSC41', // kitchen scale — the post is about grams, so this leads
    'B00M2J7PCI', // Pyrex measuring cups
    'B09SG1M7R2', // stainless measuring cups
    'B0FLJMCN5H', // butter dish
    'B0CHGFG64S', // spatula set
  ],
};

export function productsForPost(slug: string): string[] {
  return POST_PRODUCTS[slug] ?? [];
}
