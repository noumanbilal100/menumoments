import { renderSitemapIndex, postSitemapCount, XML_HEADERS } from '@/lib/sitemap-xml';
import { SITE_URL } from '@/lib/env';

export const dynamic = 'force-static';
export const revalidate = 3600;

export function GET() {
  const now = new Date().toISOString();
  const children = [];

  for (let i = 1; i <= postSitemapCount(); i++) {
    children.push({ loc: `${SITE_URL}/post-sitemap${i}.xml`, lastmod: now });
  }
  children.push({ loc: `${SITE_URL}/page-sitemap.xml`, lastmod: now });
  children.push({ loc: `${SITE_URL}/category-sitemap.xml`, lastmod: now });

  return new Response(renderSitemapIndex(children), { headers: XML_HEADERS });
}
