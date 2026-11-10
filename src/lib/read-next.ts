import { getCategory } from '@/data/taxonomy';
import { isAffiliateArticle } from './affiliate';
import { allListedPosts, pairHash, titleWords, type Post } from './content';
import { readContentFile } from './content-files';

/**
 * Links placed inside the article text, which count for more than menus and
 * lists:
 *
 * - "Read next", a box in the middle of every article with two or three posts
 *   from the same silo. When the post belongs to a buying guide's topic
 *   (a how-to about espresso machines, say), the guide comes first, so the
 *   supporting posts all point at the page that earns. The rest favour posts
 *   few others link to, so none is reachable only through menus.
 * - A buying guide lists every post on its topic, so the guide links down to
 *   its supporting posts as they link up to it.
 */

// --- How many posts link to each post (counted before the build) ------------

let inbound: Record<string, number> | null = null;

async function inboundCounts(): Promise<Record<string, number>> {
  // Only the settled value is kept between requests (a Workers rule); the file is fixed per build.
  if (inbound) return inbound;
  const raw = await readContentFile('.generated/link-graph.json');
  let counts: Record<string, number> = {};
  try {
    counts = raw ? ((JSON.parse(raw) as { inbound?: Record<string, number> }).inbound ?? {}) : {};
  } catch {
    counts = {};
  }
  inbound = counts;
  return counts;
}

// --- Buying guide topics -----------------------------------------------------

function singular(phrase: string): string {
  return phrase.replace(/(\w+)$/, (w) =>
    w === 'knives' ? 'knife' : w.replace(/ies$/, 'y').replace(/(ch|sh|x|ss)es$/, '$1').replace(/([^s])s$/, '$1'),
  );
}

/**
 * What a buying guide is about, from its title: "7 Best Espresso Machines
 * Under $500 (2026 Buying Guide)" → "espresso machine". Undefined when the
 * title doesn't name one product type.
 */
export function guideTopic(title: string): string | undefined {
  const t = title
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[:|–—?].*$/, ' ')
    .replace(/^\s*(?:what\s+is|how\s+to\s+(?:choose|pick|buy))\s+(?:an?\s+|the\s+)?/, '')
    .replace(/^\s*(?:the\s+)?(?:\d+\s+)?(?:best|top)\s+(?:\d+\s+)?/, '')
    .replace(/\s+(?:for|under|with|in|to|of|vs|versus|that|on|from|by)\b.*$/, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\b(?:buying|guide|guides|review|reviews|reviewed|picks?|(?:19|20)\d\d)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t || t.split(' ').length > 3) return undefined;
  return singular(t);
}

function guides(): { post: Post; topic: string }[] {
  return allListedPosts()
    .filter(isAffiliateArticle)
    .map((post) => ({ post, topic: guideTopic(post.title) ?? '' }))
    .filter((g) => g.topic.length > 2);
}

/** Every other post about a buying guide's topic, for the list in the guide. */
export function guideCluster(guide: Post, limit = 12): { topic: string; posts: Post[] } | null {
  if (!isAffiliateArticle(guide)) return null;
  const topic = guideTopic(guide.title);
  if (!topic) return null;
  const posts = allListedPosts()
    .filter((p) => p.slug !== guide.slug && p.title.toLowerCase().includes(topic))
    .sort((a, b) => pairHash(guide.slug, a.slug) - pairHash(guide.slug, b.slug))
    .slice(0, limit);
  return posts.length ? { topic, posts } : null;
}

/** The buying guide a post supports: one whose topic its title names. */
function pillarFor(post: Post, counts: Record<string, number>): Post | undefined {
  const title = post.title.toLowerCase();
  return guides()
    .filter((g) => g.post.slug !== post.slug && title.includes(g.topic))
    .sort((a, b) => (counts[b.post.slug] ?? 0) - (counts[a.post.slug] ?? 0) || pairHash(post.slug, a.post.slug) - pairHash(post.slug, b.post.slug))[0]?.post;
}

// --- Read next ---------------------------------------------------------------

function sectionOf(slug: string | undefined): string | undefined {
  return slug ? getCategory(slug)?.section : undefined;
}

export interface ReadNextItem {
  post: Post;
  /** The buying guide the post supports. */
  pillar: boolean;
}

/**
 * Two or three posts to read next, all from the post's own silo and related to
 * it by category or title. `exclude` holds posts the page already links.
 */
export async function readNextFor(post: Post, exclude: Set<string>, limit = 3): Promise<ReadNextItem[]> {
  const counts = await inboundCounts();
  const linked = new Set([...post.html.matchAll(/href=["'](?:https?:\/\/(?:www\.)?menumoments\.com)?\/([a-z0-9-]+)\/?["']/gi)].map((m) => m[1]));
  const skip = new Set([post.slug, ...exclude, ...linked]);

  const items: ReadNextItem[] = [];
  const pillar = pillarFor(post, counts);
  if (pillar && !linked.has(pillar.slug)) items.push({ post: pillar, pillar: true });

  const section = sectionOf(post.categories[0]);
  const words = titleWords(post.title);
  const picks = allListedPosts()
    .filter((p) => !skip.has(p.slug) && p.slug !== pillar?.slug && section && sectionOf(p.categories[0]) === section)
    .map((p) => {
      const sameCategory = p.categories[0] === post.categories[0];
      let shared = 0;
      for (const w of titleWords(p.title)) if (words.has(w)) shared++;
      const n = counts[p.slug] ?? 0;
      return { p, relevant: sameCategory || shared > 0, score: (sameCategory ? 6 : 0) + shared * 3 + (n === 0 ? 5 : n === 1 ? 2 : 0) };
    })
    .filter((x) => x.relevant)
    .sort((a, b) => b.score - a.score || pairHash(post.slug, a.p.slug) - pairHash(post.slug, b.p.slug));
  for (const { p } of picks) {
    if (items.length >= limit) break;
    items.push({ post: p, pillar: false });
  }
  return items.length >= 2 ? items : [];
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** The box as article HTML. */
export function readNextHtml(items: ReadNextItem[]): string {
  if (!items.length) return '';
  const li = items
    .map(
      ({ post, pillar }) =>
        `<li>${pillar ? '<span class="mm-readnext-tag">Buying guide</span>' : ''}<a href="/${post.slug}/">${escapeHtml(post.title)}</a></li>`,
    )
    .join('');
  return `<aside class="mm-readnext" aria-label="Read next"><p class="mm-readnext-title">Read next</p><ul>${li}</ul></aside>`;
}

/**
 * Puts the box in the middle of the article: before the middle section
 * heading, or after the third paragraph when there are too few headings.
 */
export function insertMidArticle(html: string, box: string): string {
  if (!box) return html;
  const headings = [...html.matchAll(/<h2\b/gi)].map((m) => m.index ?? 0);
  if (headings.length >= 2) {
    const at = headings[Math.max(1, Math.floor(headings.length / 2))];
    return html.slice(0, at) + box + html.slice(at);
  }
  const paragraphs = [...html.matchAll(/<\/p>/gi)].map((m) => (m.index ?? 0) + 4);
  if (paragraphs.length >= 4) return html.slice(0, paragraphs[2]) + box + html.slice(paragraphs[2]);
  return html + box;
}
