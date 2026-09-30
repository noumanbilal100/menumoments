/**
 * Local content store — reads the JSON files produced by
 * `scripts/migrate-wp.mjs`. Files are shipped inside the bundle
 * (they're small text) via a static import of the index, plus
 * dynamic require of individual bodies.
 *
 * At runtime this is fully synchronous — no network calls, no WP
 * dependency — which is what makes the migrated site self-hosting.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import indexData from '@/content/index.json';
import { deriveKindAndRecipe } from './recipe-derive';
import type { Post, PostSeo } from './content';
import { getCategory } from '@/data/taxonomy';
import { legacyCategoriesFor } from '@/data/legacy-posts';

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'posts');

export interface LocalIndexEntry {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  heroImage: { src: string; alt: string } | null;
  wpCategorySlugs: string[];
  author: { name: string; avatar: string | null };
}

const INDEX: LocalIndexEntry[] = indexData as unknown as LocalIndexEntry[];

/** Every slug in the local store. */
export const LOCAL_SLUGS: string[] = INDEX.map((e) => e.slug);

/** Newest-first list of index entries (already sorted by the script). */
export function localIndex(): LocalIndexEntry[] {
  return INDEX;
}

/** True if this slug has been migrated locally. */
export function hasLocalPost(slug: string): boolean {
  return INDEX.some((e) => e.slug === slug);
}

/** Read one full post from disk. */
export async function readLocalPost(slug: string): Promise<Post | null> {
  if (!hasLocalPost(slug)) return null;
  try {
    const raw = await readFile(path.join(CONTENT_DIR, `${slug}.json`), 'utf8');
    const data = JSON.parse(raw) as {
      slug: string;
      title: string;
      excerpt: string;
      html: string;
      wpCategorySlugs: string[];
      heroImage: { src: string; alt: string; width?: number; height?: number } | null;
      publishedAt: string;
      updatedAt?: string;
      readingMinutes: number;
      author: { name: string; avatar: string | null };
      seo?: PostSeo;
    };

    // Map WP category slugs into our new taxonomy.
    const mapped = new Set<string>();
    for (const wpSlug of data.wpCategorySlugs ?? []) {
      const cat = getCategory(wpSlug);
      if (cat) mapped.add(cat.slug);
    }
    // Fall back to legacy hand-mapping for slugs that WP didn't tag well.
    if (!mapped.size) for (const c of legacyCategoriesFor(data.slug)) mapped.add(c);

    const categories = [...mapped];
    const { kind, recipe } = deriveKindAndRecipe(data.slug, categories);

    return {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      html: data.html,
      categories,
      heroImage: data.heroImage
        ? {
            src: data.heroImage.src,
            alt: data.heroImage.alt,
            width: data.heroImage.width,
            height: data.heroImage.height,
          }
        : undefined,
      publishedAt: data.publishedAt,
      updatedAt: data.updatedAt,
      readingMinutes: data.readingMinutes,
      author: {
        name: data.author.name,
        avatar: data.author.avatar ?? undefined,
      },
      source: 'mdx',
      kind,
      recipe,
      seo: data.seo,
    };
  } catch {
    return null;
  }
}

/** Build a lightweight Post from the index entry (no body). */
export function indexEntryToPost(e: LocalIndexEntry): Post {
  const mapped = new Set<string>();
  for (const wpSlug of e.wpCategorySlugs ?? []) {
    const cat = getCategory(wpSlug);
    if (cat) mapped.add(cat.slug);
  }
  if (!mapped.size) for (const c of legacyCategoriesFor(e.slug)) mapped.add(c);
  const categories = [...mapped];
  const { kind, recipe } = deriveKindAndRecipe(e.slug, categories);
  return {
    slug: e.slug,
    title: e.title,
    excerpt: e.excerpt,
    html: '',
    categories,
    heroImage: e.heroImage
      ? { src: e.heroImage.src, alt: e.heroImage.alt }
      : undefined,
    publishedAt: e.publishedAt,
    updatedAt: e.updatedAt,
    readingMinutes: e.readingMinutes,
    author: {
      name: e.author.name,
      avatar: e.author.avatar ?? undefined,
    },
    source: 'mdx',
    kind,
    recipe,
  };
}
