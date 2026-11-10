/**
 * Posts kept online but out of search and out of the site's own listings.
 *
 * These are off the site's topic (food and cooking): Google judges a site's
 * content as a whole, and pages far from its subject weigh the rest down.
 * Each one still opens at its address, with a noindex tag, but it is left
 * out of the sitemaps, category and hub pages, related posts, Read next
 * boxes, the feed and llms.txt, so the site no longer points at it.
 *
 * Decided with the owner on 2026-11-10. Remove a slug to bring a post back.
 */
export const NOINDEX_POSTS = new Set<string>([
  'homemade-sugar-wax-guide-natural-hair-removal-recipes-tips-uses',
  'whipped-tallow-balm-homemade-tallow-lotion-recipe-for-nourished-skin',
  'how-to-make-gentle-and-natural-breast-milk-soap-at-home-step-by-step-recipe',
  'french-mulberry-bug-spray-recipe-a-natural-beautyberry-based-insect-repellent',
  'measuring-and-recipe-educational-iep-goal-strategies-examples-and-life-skills-development',
  'aquarium-fish-food-flakes-pellets-goldfish-brine-shrimp-feed',
  'fenugreek-horse-treat-recipe-for-healthy-and-happy-horses',
  'rabbit-diet-hay-pellets-for-bunnies-adult-young-rabbit-food',
  'diamond-puppy-dry-dog-food-puppy-pet-food',
]);

export function isNoindexPost(slug: string): boolean {
  return NOINDEX_POSTS.has(slug);
}
