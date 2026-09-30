import type { Post } from './content';
import { isAffiliateArticle } from './affiliate';
import { ADSENSE_CLIENT } from './env';

/**
 * Category slugs that should NEVER show AdSense. Add slugs here as the
 * editor identifies them — this is the single source of truth.
 *
 * Rule of thumb: any category that primarily hosts affiliate / buying-guide
 * content already gets excluded automatically via isAffiliateArticle().
 * Use this list for extra, editorial-only overrides.
 */
export const NO_ADS_CATEGORIES = new Set<string>([
  // Example: 'sponsored-partners',
]);

/** True if AdSense is configured and this post should show ads. */
export function shouldShowAds(post: Pick<Post, 'kind' | 'categories' | 'slug' | 'html'>): boolean {
  if (!ADSENSE_CLIENT) return false;
  if (isAffiliateArticle(post as Post)) return false;
  if (post.categories.some((slug) => NO_ADS_CATEGORIES.has(slug))) return false;
  return true;
}

/** True if AdSense is configured at all (site-wide gate). */
export function adsEnabled(): boolean {
  return Boolean(ADSENSE_CLIENT);
}
