import type { Metadata } from 'next';
import { SITE, SITE_URL } from './env';

export const HOME_TITLE = `${SITE.name}: Recipes, Kitchen Tips & Honest Food Guides`;
export const TITLE_TEMPLATE = `%s — ${SITE.name}`;

/** Shared image for pages that have no photo of their own. */
export const DEFAULT_SOCIAL_IMAGE = { url: '/og-default.png', width: 1200, height: 630, alt: SITE.name };

const MAX_TITLE = 60;
const MAX_DESCRIPTION = 160;

/** Search results cut titles at about 60 characters, so the site name is only added when it fits. */
function fitTitle(title: string): Metadata['title'] {
  return TITLE_TEMPLATE.replace('%s', title).length > MAX_TITLE ? { absolute: title } : title;
}

/** Trims to a whole word, so a snippet never stops halfway through one. */
function fitDescription(text: string): string {
  if (text.length <= MAX_DESCRIPTION) return text;
  const cut = text.slice(0, MAX_DESCRIPTION - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:–—-]+$/, '')}…`;
}

interface PageMeta {
  title: string;
  description: string;
  /** Site-relative path with its trailing slash, e.g. `/about-us/`. */
  path: string;
  /** Overrides the path's own URL as the canonical. */
  canonical?: string;
  image?: string;
  socialTitle?: string;
  socialDescription?: string;
  noindex?: boolean;
  article?: { publishedTime: string; modifiedTime?: string; authors: string[]; section?: string };
}

/**
 * Metadata for one page. Next merges metadata shallowly, so a page that sets
 * `openGraph` loses the layout's fields; building them all here keeps the URL,
 * site name and image on every page.
 */
export function pageMeta(page: PageMeta): Metadata {
  const url = `${SITE_URL}${page.path}`;
  const description = fitDescription(page.description);
  const socialTitle = page.socialTitle ?? page.title;
  const socialDescription = page.socialDescription ? fitDescription(page.socialDescription) : description;
  const images = page.image ? [{ url: page.image }] : [DEFAULT_SOCIAL_IMAGE];
  const shared = { url, title: socialTitle, description: socialDescription, siteName: SITE.name, images };
  return {
    title: fitTitle(page.title),
    description,
    alternates: { canonical: page.canonical || url },
    openGraph: page.article ? { ...shared, type: 'article', ...page.article } : { ...shared, type: 'website' },
    twitter: { card: 'summary_large_image', title: socialTitle, description: socialDescription, images },
    ...(page.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
