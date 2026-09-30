import { renderUrlSet, categoryEntries, XML_HEADERS } from '@/lib/sitemap-xml';

export const dynamic = 'force-static';
export const revalidate = 3600;

export function GET() {
  return new Response(renderUrlSet(categoryEntries()), { headers: XML_HEADERS });
}
