export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://menumoments.com';
export const WP_API = process.env.WORDPRESS_API_URL ?? 'https://menumoments.com/wp-json/wp/v2';
// After migration the site reads from local content by default. WP is
// consulted only for slugs that haven't been migrated yet.
export const CONTENT_SOURCE = (process.env.CONTENT_SOURCE ?? 'local') as
  | 'local'
  | 'wordpress'
  | 'mdx'
  | 'hybrid';
export const REVALIDATE = Number(process.env.REVALIDATE_SECONDS ?? 3600);

export const SITE = {
  name: 'Menu Moments',
  tagline: 'Recipes, kitchen know-how and honest food guides.',
  description:
    'Menu Moments is a food and kitchen magazine — weeknight dinners, weekend baking, gear we actually use, and honest reviews of the food we love.',
  author: 'Emily Carter',
  email: 'hello@menumoments.com',
};

// Google AdSense. Set NEXT_PUBLIC_ADSENSE_CLIENT to `ca-pub-XXXXXXXXXXXXXXXX`
// to enable ad rendering. Empty string disables ads everywhere.
export const ADSENSE_CLIENT = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '').trim();
// Auto Ads on by default when a client is configured. Set to 'false' to
// disable and rely only on manual <AdSlot /> placements.
export const ADSENSE_AUTO_ADS =
  (process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS ?? 'true').toLowerCase() !== 'false';
// Individual ad-unit slot IDs (per AdSense dashboard). Leave blank to hide.
export const ADSENSE_SLOTS = {
  inArticleTop: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_TOP ?? '').trim(),
  inArticleMid: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID ?? '').trim(),
  inArticleBottom: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_BOTTOM ?? '').trim(),
  sidebar: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? '').trim(),
};
