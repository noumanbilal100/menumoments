import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { localIndex, indexEntryToPost } from './local-content';
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
  informationalCount: number;
  affiliateCount: number;
  noAdsCategoryCount: number;
  latestPublishedAt: string | null;
  oldestPublishedAt: string | null;
  totalReadingMinutes: number;
  postsWithHero: number;
  postsWithoutHero: number;
  postsWithSeo: number;
}

export async function adminSnapshot(): Promise<AdminSnapshot> {
  const index = localIndex();
  const posts = index.map(indexEntryToPost);
  const affiliate = posts.filter((p) => isAffiliateArticle(p));
  const informational = posts.filter((p) => !isAffiliateArticle(p));
  const withHero = index.filter((e) => e.heroImage).length;
  const totalReading = posts.reduce((sum, p) => sum + (p.readingMinutes ?? 0), 0);
  const sorted = index
    .map((e) => e.publishedAt)
    .filter(Boolean)
    .sort();

  const seoCount = await countPostsWithSeo();
  const pageCount = await countPages();

  return {
    totalPosts: posts.length,
    totalCategories: CATEGORIES.length,
    totalSections: Object.keys(SECTIONS).length,
    totalPages: pageCount,
    adsEnabled: Boolean(ADSENSE_CLIENT),
    adsClient: ADSENSE_CLIENT,
    informationalCount: informational.length,
    affiliateCount: affiliate.length,
    noAdsCategoryCount: NO_ADS_CATEGORIES.size,
    latestPublishedAt: sorted[sorted.length - 1] ?? null,
    oldestPublishedAt: sorted[0] ?? null,
    totalReadingMinutes: totalReading,
    postsWithHero: withHero,
    postsWithoutHero: posts.length - withHero,
    postsWithSeo: seoCount,
  };
}

async function countPostsWithSeo(): Promise<number> {
  const dir = path.join(process.cwd(), 'src', 'content', 'posts');
  try {
    const files = (await readdir(dir)).filter((f) => f.endsWith('.json'));
    let count = 0;
    for (const f of files) {
      const raw = await readFile(path.join(dir, f), 'utf8');
      if (raw.includes('"seo"')) count++;
    }
    return count;
  } catch {
    return 0;
  }
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
  affiliateCount: number;
  informationalCount: number;
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
      affiliateCount: inCat.filter((p) => p.isAffiliate).length,
      informationalCount: inCat.filter((p) => !p.isAffiliate).length,
      adsDisabled: NO_ADS_CATEGORIES.has(c.slug),
    };
  }).sort((a, b) => b.postCount - a.postCount);
}
