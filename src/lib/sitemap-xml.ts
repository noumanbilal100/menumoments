import { localIndex } from './local-content';
import { categoriesWithPosts } from './category-map';
import { COLLECTIONS } from '@/data/collections';
import { SITE_URL } from './env';

/**
 * Yoast-compatible sitemap set.
 *
 * The WordPress site published a sitemap index at /sitemap_index.xml with
 * four children (post-sitemap1, post-sitemap2, page-sitemap,
 * category-sitemap). Those URLs are what Search Console has on file and
 * what external crawlers already know, so the rebuild serves the same set
 * rather than asking Google to rediscover a single /sitemap.xml.
 */

/** Yoast's per-file cap; keeps the post split matching the old structure. */
export const POSTS_PER_SITEMAP = 250;

function iso(d: string | undefined): string {
  if (!d) return new Date().toISOString();
  try {
    return new Date(d).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/** Trailing slash on every URL, matching the site's canonical form. */
function url(path: string): string {
  const clean = path.endsWith('/') ? path : `${path}/`;
  return `${SITE_URL}${clean}`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface SitemapEntry {
  loc: string;
  lastmod: string;
}

export function renderUrlSet(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => `  <url>\n    <loc>${escapeXml(e.loc)}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function renderSitemapIndex(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => `  <sitemap>\n    <loc>${escapeXml(e.loc)}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n  </sitemap>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

/** Posts for one 1-based page of the split. */
export function postEntries(page: number): SitemapEntry[] {
  const all = localIndex();
  const start = (page - 1) * POSTS_PER_SITEMAP;
  return all.slice(start, start + POSTS_PER_SITEMAP).map((p) => ({
    loc: url(`/${p.slug}`),
    lastmod: iso(p.updatedAt ?? p.publishedAt),
  }));
}

export function postSitemapCount(): number {
  return Math.max(1, Math.ceil(localIndex().length / POSTS_PER_SITEMAP));
}

/** Static pages + collection landing pages. */
export function pageEntries(): SitemapEntry[] {
  const now = new Date().toISOString();
  const statics = [
    '',
    '/blog',
    '/search',
    '/collections',
    '/best-kitchen-gear',
    '/about-us',
    '/contact',
    '/write-for-us',
    '/privacy-policy',
    '/terms-conditions',
    '/disclaimer',
  ].map((p) => ({ loc: url(p), lastmod: now }));

  const collections = COLLECTIONS.map((c) => ({
    loc: url(`/collections/${c.slug}`),
    lastmod: now,
  }));

  return [...statics, ...collections];
}

export function categoryEntries(): SitemapEntry[] {
  const now = new Date().toISOString();
  return categoriesWithPosts().map((c) => ({ loc: url(`/category/${c.slug}`), lastmod: now }));
}

export const XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
};
