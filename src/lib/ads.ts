import type { Post } from './content';
import { isProductReview } from '@/data/product-reviews';
import { ADSENSE_CLIENT } from './env';

/**
 * Category slugs that should NEVER show AdSense.
 *
 * `product-reviews` is here because every post in it is a buying guide
 * monetised through affiliate links instead. Add further slugs as the
 * editor identifies them — this is the single source of truth.
 */
export const NO_ADS_CATEGORIES = new Set<string>([
  'product-reviews',
]);

/**
 * True if AdSense is configured and this post should show ads.
 *
 * Deliberately does NOT use isAffiliateArticle(). That helper picks a post's
 * layout; suppressing ads is a separate call, driven by the hand-kept list.
 */
export function shouldShowAds(post: Pick<Post, 'slug' | 'categories'>): boolean {
  if (!ADSENSE_CLIENT) return false;
  if (isProductReview(post.slug)) return false;
  if (post.categories.some((slug) => NO_ADS_CATEGORIES.has(slug))) return false;
  return true;
}

/** True if AdSense is configured at all (site-wide gate). */
export function adsEnabled(): boolean {
  return Boolean(ADSENSE_CLIENT);
}
