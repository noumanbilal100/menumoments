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
// Individual ad-unit slot IDs (AdSense → Ads → By ad unit). Slot IDs are
// public (they are in every page's HTML), so the site's units are the
// defaults; a build variable can still override one, or set it to "off".
const slot = (value: string | undefined, fallback: string) => {
  const v = value?.trim() || fallback;
  return v.toLowerCase() === 'off' ? '' : v;
};
export const ADSENSE_SLOTS = {
  /** "Before Content" display unit. */
  inArticleTop: slot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_TOP, '4443867103'),
  /** "After parahgrapgh 2" display unit. */
  inArticleMid: slot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID, '6686887067'),
  inArticleBottom: slot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_BOTTOM, ''),
  /** "Side-bar 1" display unit. */
  sidebar: slot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR, '9408435085'),
};
