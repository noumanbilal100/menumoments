/**
 * Category resolution, free of any Node built-ins.
 *
 * Lives apart from `local-content.ts` because the site header is a client
 * component and needs the populated-category set — importing it from a
 * module that pulls in `node:fs` would break the client bundle.
 */

import indexData from '@/content/index.json';
import { CATEGORIES, getCategory, type Category } from '@/data/taxonomy';
import { legacyCategoriesFor } from '@/data/legacy-posts';
import { isProductReview, PRODUCT_REVIEW_CATEGORY } from '@/data/product-reviews';
import { deriveCategories } from './derive-categories';

interface IndexLike {
  slug: string;
  title: string;
  wpCategorySlugs?: string[];
}

/**
 * The full category list for one post. Categories saved with the post are the
 * whole answer; guessing from the slug and title only covers a post saved with
 * none. Taxonomy order keeps the first one, the post's primary category, the
 * same after the admin form saves it.
 */
export function categoriesFor(
  slug: string,
  title: string,
  wpCategorySlugs: string[] = [],
): string[] {
  const mapped = new Set<string>();
  for (const wpSlug of wpCategorySlugs) {
    const cat = getCategory(wpSlug);
    if (cat) mapped.add(cat.slug);
  }
  if (!mapped.size) {
    for (const c of legacyCategoriesFor(slug)) mapped.add(c);
    for (const c of deriveCategories(slug, title, [...mapped])) mapped.add(c);
  }
  // Hand-listed buying guides always file under product-reviews.
  if (isProductReview(slug)) mapped.add(PRODUCT_REVIEW_CATEGORY);
  return CATEGORIES.filter((c) => mapped.has(c.slug)).map((c) => c.slug);
}

let populatedCache: Set<string> | null = null;

/** Category slugs with at least one post behind them. */
export function populatedCategorySlugs(): Set<string> {
  if (populatedCache) return populatedCache;
  const live = new Set<string>();
  for (const entry of indexData as unknown as IndexLike[]) {
    for (const c of categoriesFor(entry.slug, entry.title, entry.wpCategorySlugs ?? [])) {
      live.add(c);
    }
  }
  populatedCache = live;
  return live;
}

let countCache: Map<string, number> | null = null;

function categoryPostCount(slug: string): number {
  if (!countCache) {
    countCache = new Map();
    for (const entry of indexData as unknown as IndexLike[]) {
      for (const c of categoriesFor(entry.slug, entry.title, entry.wpCategorySlugs ?? [])) {
        countCache.set(c, (countCache.get(c) ?? 0) + 1);
      }
    }
  }
  return countCache.get(slug) ?? 0;
}

/** Below this a listing is too thin to be worth a place in search results. */
const MIN_POSTS_TO_INDEX = 3;

export function isIndexableCategory(slug: string): boolean {
  return categoryPostCount(slug) >= MIN_POSTS_TO_INDEX;
}

/** Categories that have content, in taxonomy order. */
export function categoriesWithPosts(): Category[] {
  const live = populatedCategorySlugs();
  return CATEGORIES.filter((c) => live.has(c.slug));
}

/** Categories in a section, filtered to those with content. */
export function liveCategoriesInSection(section: Category['section']): Category[] {
  return categoriesWithPosts().filter((c) => c.section === section);
}
