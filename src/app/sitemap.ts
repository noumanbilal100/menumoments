import type { MetadataRoute } from 'next';
import { categoryEntries, pageEntries, postEntries, postSitemapCount } from '@/lib/sitemap-xml';

/** The same URLs and dates as the sitemap index, for anything that asks for /sitemap.xml. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = Array.from({ length: postSitemapCount() }, (_, i) => postEntries(i + 1)).flat();
  return [...(await pageEntries()), ...categoryEntries(), ...posts].map((e) => ({
    url: e.loc,
    lastModified: e.lastmod,
  }));
}
