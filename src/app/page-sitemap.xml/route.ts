import { renderUrlSet, pageEntries, XML_HEADERS } from '@/lib/sitemap-xml';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  return new Response(renderUrlSet(await pageEntries()), { headers: XML_HEADERS });
}
