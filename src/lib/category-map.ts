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
import { deriveCategories } from './derive-categories';

interface IndexLike {
  slug: string;
  title: string;
  wpCategorySlugs?: string[];
}

/**
 * The full category list for one post: WP's own categories mapped onto
 * the taxonomy, plus the ones derived from the slug and title.
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
  if (!mapped.size) for (const c of legacyCategoriesFor(slug)) mapped.add(c);
  for (const c of deriveCategories(slug, title, [...mapped])) mapped.add(c);
  return [...mapped];
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

/** Categories that have content, in taxonomy order. */
export function categoriesWithPosts(): Category[] {
  const live = populatedCategorySlugs();
  return CATEGORIES.filter((c) => live.has(c.slug));
}

/** Categories in a section, filtered to those with content. */
export function liveCategoriesInSection(section: Category['section']): Category[] {
  return categoriesWithPosts().filter((c) => c.section === section);
}
