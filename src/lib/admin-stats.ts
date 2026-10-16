import { localIndex, indexEntryToPost } from './local-content';
import { readContentFile } from './content-files';
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

interface PostMeta {
  pageCount: number;
  posts: { slug: string; hasSeo: boolean; productPhotoGaps: { product: string; asin: string }[] }[];
}

/** Built by scripts/export-content.mjs before every dev and build run. */
async function postMeta(): Promise<PostMeta> {
  const raw = await readContentFile('.generated/post-meta.json');
  return raw ? (JSON.parse(raw) as PostMeta) : { pageCount: 0, posts: [] };
}

async function scanPostFiles(): Promise<{ withSeo: number; withoutSeo: string[] }> {
  const { posts } = await postMeta();
  const withoutSeo = posts.filter((p) => !p.hasSeo).map((p) => p.slug);
  return { withSeo: posts.length - withoutSeo.length, withoutSeo };
}

/**
 * Product photos still showing a placeholder after rendering — in practice
 * links whose ASIN is dead or points at a different product, since those are
 * left out of src/data/product-images.ts.
 */
async function findProductPhotoGaps(titleOf: Map<string, string>): Promise<ProductPhotoGap[]> {
  const { posts } = await postMeta();
  return posts.flatMap((p) =>
    p.productPhotoGaps.map((g) => ({ slug: p.slug, title: titleOf.get(p.slug) ?? p.slug, ...g })),
  );
}

async function countPages(): Promise<number> {
  return (await postMeta()).pageCount;
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
