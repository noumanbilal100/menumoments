import { renderUrlSet, pageEntries, XML_HEADERS } from '@/lib/sitemap-xml';

export const dynamic = 'force-static';
export const revalidate = 3600;

export function GET() {
  return new Response(renderUrlSet(pageEntries()), { headers: XML_HEADERS });
}
