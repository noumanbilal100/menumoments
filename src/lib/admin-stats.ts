import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { localIndex, indexEntryToPost } from './local-content';
import { cleanPostHtml } from './clean-html';
import { isAffiliateArticle } from './affiliate';
import { NO_ADS_CATEGORIES, shouldShowAds } from './ads';
import { CATEGORIES, SECTIONS } from '@/data/taxonomy';
import { ADSENSE_CLIENT } from './env';

export interface AdminSnapshot {
  totalPosts: number;
  totalCategories: number;
  totalSections: number;
  totalPages: number;
  adsEnabled: boolean;
  adsClient: string;
  /** Posts AdSense actually runs on, per shouldShowAds(). */
  adsOnCount: number;
  adsOffCount: number;
  /** Posts rendered with the buying-guide (affiliate) layout. */
  affiliateLayoutCount: number;
  noAdsCategoryCount: number;
  latestPublishedAt: string | null;
  oldestPublishedAt: string | null;
  totalReadingMinutes: number;
  postsWithHero: number;
  postsWithoutHero: number;
  postsWithSeo: number;
  postsWithoutSeo: { slug: string; title: string }[];
  postsWithoutHeroList: { slug: string; title: string }[];
  productPhotoGaps: ProductPhotoGap[];
}

export interface ProductPhotoGap {
  slug: string;
  title: string;
  product: string;
  asin: string;
}

export async function adminSnapshot(): Promise<AdminSnapshot> {
  const index = localIndex();
  const posts = index.map(indexEntryToPost);
  const affiliate = posts.filter((p) => isAffiliateArticle(p));
  const adsOn = posts.filter((p) => shouldShowAds(p)).length;
  const withHero = index.filter((e) => e.heroImage).length;
  const totalReading = posts.reduce((sum, p) => sum + (p.readingMinutes ?? 0), 0);
  const sorted = index
    .map((e) => e.publishedAt)
    .filter(Boolean)
    .sort();

  const { withSeo, withoutSeo } = await scanPostFiles();
  const pageCount = await countPages();
  const titleOf = new Map(index.map((e) => [e.slug, e.title]));

  return {
    totalPosts: posts.length,
    totalCategories: CATEGORIES.length,
    totalSections: Object.keys(SECTIONS).length,
    totalPages: pageCount,
    adsEnabled: Boolean(ADSENSE_CLIENT),
    adsClient: ADSENSE_CLIENT,
    adsOnCount: adsOn,
    adsOffCount: posts.length - adsOn,
    affiliateLayoutCount: affiliate.length,
    noAdsCategoryCount: NO_ADS_CATEGORIES.size,
    latestPublishedAt: sorted[sorted.length - 1] ?? null,
    oldestPublishedAt: sorted[0] ?? null,
    totalReadingMinutes: totalReading,
    postsWithHero: withHero,
    postsWithoutHero: posts.length - withHero,
    postsWithSeo: withSeo,
    postsWithoutSeo: withoutSeo.map((slug) => ({ slug, title: titleOf.get(slug) ?? slug })),
    postsWithoutHeroList: index
      .filter((e) => !e.heroImage)
      .map((e) => ({ slug: e.slug, title: e.title })),
    productPhotoGaps: await findProductPhotoGaps(titleOf),
  };
}

const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts');

async function scanPostFiles(): Promise<{ withSeo: number; withoutSeo: string[] }> {
  try {
    const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.json'));
    const withoutSeo: string[] = [];
    for (const f of files) {
      const raw = await readFile(path.join(POSTS_DIR, f), 'utf8');
      if (!raw.includes('"seo"')) withoutSeo.push(f.replace(/\.json$/, ''));
    }
    return { withSeo: files.length - withoutSeo.length, withoutSeo };
  } catch {
    return { withSeo: 0, withoutSeo: [] };
  }
}

/**
 * Product photos still showing a placeholder after rendering — in practice
 * links whose ASIN is dead or points at a different product, since those are
 * left out of src/data/product-images.ts.
 */
async function findProductPhotoGaps(titleOf: Map<string, string>): Promise<ProductPhotoGap[]> {
  const gaps: ProductPhotoGap[] = [];
  try {
    for (const f of (await readdir(POSTS_DIR)).filter((n) => n.endsWith('.json'))) {
      const raw = await readFile(path.join(POSTS_DIR, f), 'utf8');
      if (!raw.includes('/img/products/')) continue;
      const slug = f.replace(/\.json$/, '');
      const html = cleanPostHtml((JSON.parse(raw) as { html: string }).html);
      const seen = new Set<string>();
      const re = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>\s*<img\b[^>]*\bsrc=["']\/img\/products\/[^"']+["'][^>]*>/gi;
      for (const m of html.matchAll(re)) {
        const asin = m[1].match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1] ?? '';
        const product = (m[0].match(/\balt=["']([^"']*)["']/i)?.[1] ?? '').replace(/^\d+\.\s*/, '');
        const key = asin || product;
        if (seen.has(key)) continue;
        seen.add(key);
        gaps.push({ slug, title: titleOf.get(slug) ?? slug, product: product || 'Unnamed product', asin });
      }
    }
  } catch {
    // Content directory unavailable — report nothing rather than fail the page.
  }
  return gaps;
}

async function countPages(): Promise<number> {
  const dir = path.join(process.cwd(), 'src', 'content', 'pages');
  try {
    return (await readdir(dir)).filter((f) => f.endsWith('.json')).length;
  } catch {
    return 0;
  }
}

export interface AdminPostRow {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  categories: string[];
  primaryCategory?: string;
  hasHero: boolean;
  heroSrc?: string;
  isAffiliate: boolean;
  showsAds: boolean;
  kind: string;
}

export function adminPostRows(): AdminPostRow[] {
  return localIndex()
    .map(indexEntryToPost)
    .map((p) => {
      const affiliate = isAffiliateArticle(p);
      return {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        publishedAt: p.publishedAt,
        updatedAt: p.updatedAt,
        readingMinutes: p.readingMinutes,
        categories: p.categories,
        primaryCategory: p.categories[0],
        hasHero: Boolean(p.heroImage),
        heroSrc: p.heroImage?.src,
        isAffiliate: affiliate,
        showsAds: shouldShowAds(p),
        kind: p.kind,
      };
    });
}

export interface CategoryRow {
  slug: string;
  name: string;
  section: string;
  postCount: number;
  adsOnCount: number;
  adsOffCount: number;
  adsDisabled: boolean;
}

export function categoryRows(): CategoryRow[] {
  const posts = adminPostRows();
  return CATEGORIES.map((c) => {
    const inCat = posts.filter((p) => p.categories.includes(c.slug));
    return {
      slug: c.slug,
      name: c.name,
      section: c.section,
      postCount: inCat.length,
      adsOnCount: inCat.filter((p) => p.showsAds).length,
      adsOffCount: inCat.filter((p) => !p.showsAds).length,
      adsDisabled: NO_ADS_CATEGORIES.has(c.slug),
    };
  }).sort((a, b) => b.postCount - a.postCount);
}
