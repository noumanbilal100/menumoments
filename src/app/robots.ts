import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] }],
    // sitemap_index.xml first — it's the URL Search Console already has
    // from the WordPress/Yoast setup.
    sitemap: [`${SITE_URL}/sitemap_index.xml`, `${SITE_URL}/sitemap.xml`],
    host: SITE_URL,
  };
}
