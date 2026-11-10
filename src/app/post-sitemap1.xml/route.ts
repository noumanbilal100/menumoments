import { renderUrlSet, postEntriesWithImages, XML_HEADERS } from '@/lib/sitemap-xml';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  return new Response(renderUrlSet(await postEntriesWithImages(1)), { headers: XML_HEADERS });
}
