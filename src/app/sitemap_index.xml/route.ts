import {
  categoryEntries,
  newestLastmod,
  pageEntries,
  postEntries,
  postSitemapCount,
  renderSitemapIndex,
  XML_HEADERS,
} from '@/lib/sitemap-xml';
import { SITE_URL } from '@/lib/env';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const children = [];

  for (let i = 1; i <= postSitemapCount(); i++) {
    children.push({ loc: `${SITE_URL}/post-sitemap${i}.xml`, lastmod: newestLastmod(postEntries(i)) });
  }
  children.push({ loc: `${SITE_URL}/page-sitemap.xml`, lastmod: newestLastmod(await pageEntries()) });
  children.push({ loc: `${SITE_URL}/category-sitemap.xml`, lastmod: newestLastmod(categoryEntries()) });

  return new Response(renderSitemapIndex(children), { headers: XML_HEADERS });
}
