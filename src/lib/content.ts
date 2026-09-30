import { CONTENT_SOURCE, REVALIDATE, WP_API } from './env';
import { legacyCategoriesFor } from '@/data/legacy-posts';
import { CATEGORIES, getCategory } from '@/data/taxonomy';
import { deriveKindAndRecipe } from './recipe-derive';
import {
  LOCAL_SLUGS,
  hasLocalPost,
  readLocalPost,
  localIndex,
  indexEntryToPost,
} from './local-content';

export type DietTag =
  | 'vegan'
  | 'vegetarian'
  | 'gluten-free'
  | 'dairy-free'
  | 'keto'
  | 'low-carb'
  | 'quick';

export interface RecipeMeta {
  prepMinutes?: number;
  cookMinutes?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'advanced';
  cuisine?: string;
  diet?: DietTag[];
}

export interface PostSeo {
  metaDescription?: string;
  focusKeyword?: string;
  seoTitle?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  html: string;
  categories: string[];
  heroImage?: { src: string; alt: string; width?: number; height?: number };
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  author: { name: string; avatar?: string };
  source: 'wordpress' | 'mdx';
  recipe?: RecipeMeta;
  kind: 'recipe' | 'guide' | 'review' | 'roundup' | 'tip';
  seo?: PostSeo;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch a post by URL slug. Serves ONLY real migrated content — any slug
 * that isn't in the local store returns null so the route 404s. No demo,
 * no placeholder, no "we're refreshing this" stubs.
 */
export async function getPost(slug: string): Promise<Post | null> {
  if (hasLocalPost(slug)) {
    const local = await readLocalPost(slug);
    if (local) return local;
  }
  // Optional escape hatch for pre-launch preview modes: pull live from WP
  // when explicitly configured. Never runs in the default `local` mode.
  if (CONTENT_SOURCE === 'wordpress' || CONTENT_SOURCE === 'hybrid') {
    const wp = await fetchWordPressPost(slug);
    if (wp) return wp;
  }
  return null;
}

export async function listRecentPosts(limit = 12): Promise<Post[]> {
  const index = localIndex();
  if (index.length) return index.slice(0, limit).map(indexEntryToPost);
  // Only used before the first migration has run.
  if (CONTENT_SOURCE === 'wordpress' || CONTENT_SOURCE === 'hybrid') {
    return fetchWordPressList({ perPage: limit });
  }
  return [];
}

export async function listPostsInCategory(categorySlug: string, limit = 24): Promise<Post[]> {
  return localIndex()
    .map(indexEntryToPost)
    .filter((p) => p.categories.includes(categorySlug))
    .slice(0, limit);
}

export function allCategorySlugs(): string[] {
  return CATEGORIES.map((c) => c.slug);
}

/** Every real, migrated post slug. Used for static params + sitemap. */
export function allPostSlugs(): string[] {
  return [...LOCAL_SLUGS];
}

// ---------------------------------------------------------------------------
// WordPress REST client (fallback only after local + for anything unmigrated)
// ---------------------------------------------------------------------------

interface WPPost {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: {
    author?: Array<{ name: string; avatar_urls?: Record<string, string> }>;
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text?: string;
      media_details?: { width: number; height: number };
    }>;
    'wp:term'?: Array<Array<{ taxonomy: string; slug: string; name: string }>>;
  };
}

async function fetchWordPressPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${WP_API}/posts?slug=${encodeURIComponent(slug)}&_embed=1`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as WPPost[];
    const wp = data[0];
    if (!wp) return null;
    return normalizeWordPress(wp);
  } catch {
    return null;
  }
}

async function fetchWordPressList(opts: {
  perPage?: number;
  categorySlug?: string;
}): Promise<Post[]> {
  try {
    const perPage = opts.perPage ?? 12;
    const params = new URLSearchParams({ per_page: String(perPage), _embed: '1' });
    if (opts.categorySlug) {
      const catId = await resolveWpCategoryId(opts.categorySlug);
      if (catId) params.set('categories', String(catId));
      else return [];
    }
    const res = await fetch(`${WP_API}/posts?${params}`, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return [];
    const data = (await res.json()) as WPPost[];
    return data.map(normalizeWordPress);
  } catch {
    return [];
  }
}

const wpCategoryIdCache = new Map<string, number | null>();

async function resolveWpCategoryId(slug: string): Promise<number | null> {
  if (wpCategoryIdCache.has(slug)) return wpCategoryIdCache.get(slug) ?? null;
  try {
    const res = await fetch(`${WP_API}/categories?slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) {
      wpCategoryIdCache.set(slug, null);
      return null;
    }
    const data = (await res.json()) as Array<{ id: number }>;
    const id = data[0]?.id ?? null;
    wpCategoryIdCache.set(slug, id);
    return id;
  } catch {
    wpCategoryIdCache.set(slug, null);
    return null;
  }
}

function normalizeWordPress(wp: WPPost): Post {
  const featured = wp._embedded?.['wp:featuredmedia']?.[0];
  const author = wp._embedded?.author?.[0];
  const wpTerms =
    wp._embedded?.['wp:term']?.flat().filter((t) => t.taxonomy === 'category') ?? [];
  const wpCategorySlugs = wpTerms.map((t) => t.slug);

  const mapped = new Set<string>();
  for (const wpSlug of wpCategorySlugs) {
    const cat = getCategory(wpSlug);
    if (cat) mapped.add(cat.slug);
  }
  if (!mapped.size) for (const c of legacyCategoriesFor(wp.slug)) mapped.add(c);

  const text = stripHtml(wp.content.rendered);
  const cats = [...mapped];
  const { kind, recipe } = deriveKindAndRecipe(wp.slug, cats);
  return {
    slug: wp.slug,
    title: decode(wp.title.rendered),
    excerpt: decode(stripHtml(wp.excerpt.rendered)).trim(),
    html: wp.content.rendered,
    categories: cats,
    heroImage: featured
      ? {
          src: featured.source_url,
          alt: featured.alt_text || decode(wp.title.rendered),
          width: featured.media_details?.width,
          height: featured.media_details?.height,
        }
      : undefined,
    publishedAt: wp.date,
    updatedAt: wp.modified,
    readingMinutes: Math.max(1, Math.round(text.split(/\s+/).length / 220)),
    author: {
      name: author?.name ?? 'Menu Moments',
      avatar: author?.avatar_urls?.['96'],
    },
    source: 'wordpress',
    kind,
    recipe,
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ');
}
