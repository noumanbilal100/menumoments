import type { MetadataRoute } from 'next';
import { categoriesWithPosts } from '@/lib/category-map';
import { COLLECTIONS } from '@/data/collections';
import { allPostSlugs } from '@/lib/content';
import { SITE_URL } from '@/lib/env';

/** Append a trailing slash to every URL so the sitemap matches the site's
 *  actual canonical URLs (trailingSlash: true in next.config.mjs). */
function withSlash(path: string): string {
  if (!path) return `${SITE_URL}/`;
  const clean = path.endsWith('/') ? path : `${path}/`;
  return `${SITE_URL}${clean}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths = [
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
  ].map((path) => ({
    url: withSlash(path),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const categoryPaths = categoriesWithPosts().map((c) => ({
    url: withSlash(`/category/${c.slug}`),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const collectionPaths = COLLECTIONS.map((c) => ({
    url: withSlash(`/collections/${c.slug}`),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  const postPaths = allPostSlugs().map((slug) => ({
    url: withSlash(`/${slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPaths, ...categoryPaths, ...collectionPaths, ...postPaths];
}
