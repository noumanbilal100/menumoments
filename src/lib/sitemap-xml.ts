import { localIndex } from './local-content';
import { categoriesFor, categoriesWithPosts, isIndexableCategory } from './category-map';
import { COLLECTIONS } from '@/data/collections';
import { SITE_URL } from './env';
import { listSitePages } from './site-pages';

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

function iso(d: string | undefined): string | undefined {
  if (!d) return undefined;
  const time = new Date(d).getTime();
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

/**
 * Google only trusts lastmod when it is accurate, so a page gets the date its
 * content last changed. A page with no such date gets no lastmod: stamping the
 * build time would claim the whole site changed on every deploy.
 */
function newest(dates: (string | undefined)[]): string | undefined {
  return dates.filter((d): d is string => Boolean(d)).sort().pop();
}

function postDate(p: { publishedAt: string; updatedAt?: string }): string | undefined {
  return iso(p.updatedAt ?? p.publishedAt);
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
  lastmod?: string;
}

const lastmodTag = (e: SitemapEntry) => (e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : '');

export function newestLastmod(entries: SitemapEntry[]): string | undefined {
  return newest(entries.map((e) => e.lastmod));
}

export function renderUrlSet(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => `  <url>\n    <loc>${escapeXml(e.loc)}</loc>${lastmodTag(e)}\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function renderSitemapIndex(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => `  <sitemap>\n    <loc>${escapeXml(e.loc)}</loc>${lastmodTag(e)}\n  </sitemap>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

/** Posts for one 1-based page of the split. */
export function postEntries(page: number): SitemapEntry[] {
  const all = localIndex();
  const start = (page - 1) * POSTS_PER_SITEMAP;
  return all.slice(start, start + POSTS_PER_SITEMAP).map((p) => ({
    loc: url(`/${p.slug}`),
    lastmod: postDate(p),
  }));
}

export function postSitemapCount(): number {
  return Math.max(1, Math.ceil(localIndex().length / POSTS_PER_SITEMAP));
}

/** Static pages + collection landing pages. */
export async function pageEntries(): Promise<SitemapEntry[]> {
  const posts = localIndex();
  const latest = newest(posts.map(postDate));
  const statics = [
    { loc: url('/'), lastmod: latest },
    { loc: url('/blog'), lastmod: latest },
    { loc: url('/collections') },
    { loc: url('/best-kitchen-gear') },
    { loc: url('/about-us') },
    { loc: url('/contact') },
    { loc: url('/write-for-us') },
    { loc: url('/privacy-policy') },
    { loc: url('/terms-conditions') },
    { loc: url('/disclaimer') },
  ];

  const collections = COLLECTIONS.map((c) => ({
    loc: url(`/collections/${c.slug}`),
    lastmod: newest(posts.filter((p) => c.postSlugs.includes(p.slug)).map(postDate)),
  }));

  const sitePages = (await listSitePages()).map((p) => ({
    loc: url(`/${p.slug}`),
    lastmod: iso(p.updatedAt ?? p.publishedAt),
  }));

  return [...statics, ...sitePages, ...collections];
}

export function categoryEntries(): SitemapEntry[] {
  const posts = localIndex();
  return categoriesWithPosts()
    .filter((c) => isIndexableCategory(c.slug))
    .map((c) => ({
      loc: url(`/category/${c.slug}`),
      lastmod: newest(
        posts.filter((p) => categoriesFor(p.slug, p.title, p.wpCategorySlugs ?? []).includes(c.slug)).map(postDate),
      ),
    }));
}

export const XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
};
