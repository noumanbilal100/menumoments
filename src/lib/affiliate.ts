import type { Post } from './content';

/**
 * Helpers that turn a plain migrated post into a "professional affiliate
 * article" experience — Wirecutter/Strategist vibe — WITHOUT touching the
 * actual content. Two responsibilities:
 *
 *   1. Decide whether a post should render through the affiliate template.
 *   2. Post-process the post HTML: add heading IDs, tag affiliate anchors,
 *      and extract a table of contents.
 */

const AFFILIATE_CATEGORIES = new Set([
  'product-reviews',
  'kitchen-product-reviews',
  'best-kitchen-products',
  'kitchen-gift-guides',
  'food-and-kitchen-comparisons',
  'amazon-kitchen-finds',
  'affiliate-product-guides',
  'kitchen-appliances',
  'cookware',
  'bakeware',
  'kitchen-gadgets',
  'knives-and-cutting-tools',
]);

/**
 * True if the post looks like a buying guide / product roundup / review.
 * Uses (in order): the derived post kind, category membership, slug hints,
 * and finally the presence of Amazon affiliate anchors in the HTML.
 */
export function isAffiliateArticle(post: Post): boolean {
  if (post.kind === 'review' || post.kind === 'roundup') return true;
  if (post.categories.some((c) => AFFILIATE_CATEGORIES.has(c))) {
    // These categories can still contain simple guides, so require at least
    // one other affiliate signal before switching to the specialised layout.
    if (
      /\b(best|top|vs|review|guide|comparison|worth-it)\b/i.test(post.slug) ||
      /amzn\.to|amazon\.[a-z.]+\/(dp|gp\/product)|[?&]tag=/i.test(post.html)
    ) {
      return true;
    }
  }
  return false;
}

export interface HeadingRef {
  level: 2 | 3;
  text: string;
  id: string;
}

export interface EnhancedArticle {
  html: string;
  headings: HeadingRef[];
  affiliateCount: number;
  firstAffiliateAnchorId: string | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'section';
}

function ensureUniqueId(taken: Set<string>, base: string): string {
  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  taken.add(id);
  return id;
}

const AFFILIATE_RE =
  /(amzn\.to|amazon\.[a-z.]+\/(?:dp|gp\/product|exec\/obidos)|amazon\.[a-z.]+\/[^"'\s]*[?&]tag=|shareasale(-analytics)?\.com|awin\d?\.com|linksynergy\.com|impact\.com|pxf\.io|anrdoezrs\.net|dpbolvw\.net|kqzyfj\.com|jdoqocy\.com|tkqlhce\.com)/i;

/**
 * Server-side HTML post-processor for affiliate articles.
 *
 * - Injects unique `id="…"` on every h2 and h3 so the TOC can jump.
 * - Tags every affiliate anchor with `data-affiliate`, `data-network`,
 *   `rel="sponsored nofollow noopener"`, and `target="_blank"`.
 * - Marks the first affiliate anchor with `id="top-pick"` so the hero
 *   "See top pick" CTA has a real anchor to jump to.
 */
export function enhanceAffiliateHtml(rawHtml: string): EnhancedArticle {
  const headings: HeadingRef[] = [];
  const takenIds = new Set<string>();
  let firstAffiliateAnchorId: string | null = null;
  let affiliateCount = 0;

  // Heading pass — capture text, inject ID.
  let html = rawHtml.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_full, levelStr, attrs, inner) => {
      const level = Number(levelStr) as 2 | 3;
      const text = inner
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (!text) return `<h${level}${attrs}>${inner}</h${level}>`;
      // Drop any existing id in attrs so ours is the canonical anchor.
      const cleanedAttrs = String(attrs).replace(/\sid=(["']).*?\1/gi, '');
      const id = ensureUniqueId(takenIds, slugify(text));
      headings.push({ level, text, id });
      return `<h${level} id="${id}"${cleanedAttrs}>${inner}</h${level}>`;
    },
  );

  // Affiliate anchor pass — tag + mark up.
  html = html.replace(/<a\s([^>]*?)href=(["'])([^"']+)\2([^>]*)>/gi, (_full, before, q, href, after) => {
    if (!AFFILIATE_RE.test(href)) {
      return `<a ${before}href=${q}${href}${q}${after}>`;
    }
    affiliateCount++;
    const network = /amzn\.to|amazon\.[a-z.]+/i.test(href) ? 'amazon' : 'partner';
    const stripped = (before + after)
      .replace(/\srel=(["']).*?\1/gi, '')
      .replace(/\starget=(["']).*?\1/gi, '')
      .replace(/\sdata-affiliate=(["']).*?\1/gi, '')
      .replace(/\sdata-network=(["']).*?\1/gi, '')
      .replace(/\sid=(["']).*?\1/gi, '');
    let idAttr = '';
    if (!firstAffiliateAnchorId) {
      firstAffiliateAnchorId = 'top-pick';
      idAttr = ` id="top-pick"`;
    }
    return `<a ${stripped.trim()} href=${q}${href}${q} data-affiliate="${network}" data-network="${network}" rel="sponsored nofollow noopener" target="_blank"${idAttr}>`;
  });

  return { html, headings, affiliateCount, firstAffiliateAnchorId };
}

/** Format the post's `updatedAt` (or fallback `publishedAt`) for display. */
export function formatUpdated(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/** "3 months ago" style relative label for editorial "updated" tag. */
export function relativeUpdated(iso?: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const days = Math.max(1, Math.floor((Date.now() - then) / 86_400_000));
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (days < 30) return `${Math.round(days / 7)} week${days < 14 ? '' : 's'} ago`;
  if (days < 365) return `${Math.round(days / 30)} month${days < 60 ? '' : 's'} ago`;
  return `${Math.round(days / 365)} year${days < 730 ? '' : 's'} ago`;
}
