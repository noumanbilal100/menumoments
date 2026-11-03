import { allListedPosts } from '@/lib/content';
import { CATEGORIES, SECTIONS, getCategory, type SectionKey } from '@/data/taxonomy';
import { SITE, SITE_URL } from '@/lib/env';
import { decodeEntities } from '@/lib/recipe-extract';

export const dynamic = 'force-static';
export const revalidate = 3600;

function oneLine(text: string, max = 140): string {
  const clean = decodeEntities(text).replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, clean.lastIndexOf(' ', max))}…`;
}

/** A plain-text map of the site for AI assistants: https://llmstxt.org */
export function GET() {
  const bySection = new Map<SectionKey, string[]>();
  for (const post of allListedPosts()) {
    const section = (getCategory(post.categories[0])?.section ?? CATEGORIES[0].section) as SectionKey;
    const line = `- [${oneLine(post.title)}](${SITE_URL}/${post.slug}/): ${oneLine(post.excerpt)}`;
    bySection.set(section, [...(bySection.get(section) ?? []), line]);
  }

  const sections = (Object.keys(SECTIONS) as SectionKey[])
    .filter((key) => bySection.has(key))
    .map((key) => `## ${SECTIONS[key].name}\n\n${bySection.get(key)!.join('\n')}`);

  const body = `# ${SITE.name}

> ${SITE.description}

Every page is plain HTML with no login or paywall. Links to Amazon are affiliate links, as explained in the disclaimer.

## About this site

- [About ${SITE.name}](${SITE_URL}/about-us/): Who runs the site and what it covers.
- [All posts](${SITE_URL}/blog/): The full archive, grouped by category.
- [Best kitchen gear](${SITE_URL}/best-kitchen-gear/): The products recommended across our guides.
- [Disclaimer](${SITE_URL}/disclaimer/): Affiliate, editorial and nutrition disclaimer.

${sections.join('\n\n')}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
