import type { Post } from './content';
import { isProductReview } from '@/data/product-reviews';
import { ADSENSE_CLIENT } from './env';

/**
 * Where AdSense runs.
 *
 * Buying guides and product reviews earn through their store links, and ads
 * there pull readers away from them, so any post filed in a product category
 * is ad-free. That covers every guide the generator makes, which files them
 * under Buying guides. Pages with nothing to read (policies, contact, the
 * shop, search) carry no ads either. Everything else (recipes, tips, menus,
 * guides) shows them.
 */
export const NO_ADS_CATEGORIES = new Set<string>([
  'product-reviews',
  'affiliate-product-guides',
  'best-kitchen-products',
  'kitchen-product-reviews',
  'amazon-kitchen-finds',
  'kitchen-gift-guides',
]);

/** Pages outside the posts that never load ads. */
export const AD_FREE_PAGES = [
  '/about-us/',
  '/contact/',
  '/write-for-us/',
  '/privacy-policy/',
  '/terms-conditions/',
  '/disclaimer/',
  '/search/',
  '/best-kitchen-gear/',
];

/** True for buying guides and product reviews, whether or not AdSense is set up. */
export function isAdFreePost(post: Pick<Post, 'slug' | 'categories'>): boolean {
  return isProductReview(post.slug) || post.categories.some((slug) => NO_ADS_CATEGORIES.has(slug));
}

/** True if AdSense is configured and this post should show ads. */
export function shouldShowAds(post: Pick<Post, 'slug' | 'categories'>): boolean {
  return Boolean(ADSENSE_CLIENT) && !isAdFreePost(post);
}

/** True if AdSense is configured at all (site-wide gate). */
export function adsEnabled(): boolean {
  return Boolean(ADSENSE_CLIENT);
}
