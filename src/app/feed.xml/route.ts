import { listRecentPosts } from '@/lib/content';
import { SITE, SITE_URL } from '@/lib/env';

export const revalidate = 3600;

export async function GET() {
  const posts = await listRecentPosts(30);
  const items = posts
    .map(
      (p) => `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE_URL}/${p.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/${p.slug}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
    </item>`,
    )
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en-US</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
