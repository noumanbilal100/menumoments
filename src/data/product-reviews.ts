/**
 * Posts that review or recommend products.
 *
 * These are listed by hand rather than detected, because every heuristic
 * tried here over-fires: matching on affiliate links catches recipes that
 * happen to link a pan, and matching on "best" or "guide" in the title
 * catches things like "Can Chickens Eat Oranges? A Guide".
 *
 * Two things follow from being on this list:
 *   1. the post joins the `product-reviews` category
 *   2. AdSense is suppressed on it (see src/lib/ads.ts)
 *
 * Add a slug here when a new buying guide or product review is published.
 */
export const PRODUCT_REVIEW_SLUGS = new Set<string>([
  'best-microwaves-top-ovens-reviewed-for-every-kitchen',
  'best-beverage-refrigerator',
  'best-blenders-for-smoothies',
  'best-stand-mixer-for-bread-dough',
  'best-popover-pans-bake-perfect-popovers-every-time',
  'best-coffee-makers',
  'best-air-fryer-guide-instant-pot-air-fryer-reviews',
  'best-stand-mixer-for-beginners-top-kitchenaid-cuisinart-reviewed',
  'stand-mixer-for-cakes-what-to-look-for-best-stand-mixer-buying-guide',
  'stand-mixer-buying-guide-how-to-choose-the-best-stand-mixer-for-baking-cooking',
  'stand-mixer-vs-hand-mixer-which-one-is-right-for-your-baking-needs',
  'what-is-a-stand-mixer-advantages-disadvantages-buying-guide-for-home-professional-bakers',
]);

/** The category every post on the list is filed under. */
export const PRODUCT_REVIEW_CATEGORY = 'product-reviews';

export function isProductReview(slug: string): boolean {
  return PRODUCT_REVIEW_SLUGS.has(slug);
}
