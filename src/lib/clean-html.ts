import { PRODUCT_IMAGES } from '@/data/product-images';

/**
 * Cleans migrated post HTML before it is rendered.
 *
 * Much of the content was pasted from ChatGPT/Gemini and still carries their
 * Tailwind utility classes ("flex", "w-fit", "absolute", "h-px w-px" …).
 * This site is built with Tailwind too, so those classes take effect inside
 * articles and break the layout — a stray `flex` wrapper turns every section
 * after a table into a narrow column. Only classes that belong to the content
 * itself (WordPress blocks and the old product-box plugin) are kept.
 */
const CONTENT_CLASS = /^(wp-|wp_|align|size-|attachment|mmm-tools-|product-|cta-|has-|is-|aff-)/;

const ASIN_RE = /amazon\.[a-z.]+\/(?:[^"']*\/)?(?:dp|gp\/product)\/([A-Z0-9]{10})/i;
const PLACEHOLDER_SRC = /(<img\b[^>]*\bsrc=)(["'])\/img\/products\/[^"']+\2/i;

function photoUrl(asin: string): string | null {
  const src = PRODUCT_IMAGES[asin];
  return src ? `/_next/image/?url=${encodeURIComponent(src)}&amp;w=640&amp;q=75` : null;
}

function swapPlaceholder(fragment: string, asin: string | undefined): string {
  const url = asin && photoUrl(asin);
  return url ? fragment.replace(PLACEHOLDER_SRC, `$1$2${url}$2`) : fragment;
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&[#a-z0-9]+;/gi, ' ')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

/** WordPress excerpts end in "… Read more"; that is a link label, not copy. */
export function cleanExcerpt(excerpt: string): string {
  return excerpt.replace(/\s*(?:…|&hellip;|\.\.\.)?\s*Read more\s*$/i, '…').trim();
}

export function cleanPostHtml(html: string, title?: string): string {
  let out = html.replace(/\sclass=(["'])([\s\S]*?)\1/gi, (_m, q: string, value: string) => {
    const kept = value.split(/\s+/).filter((c) => CONTENT_CLASS.test(c));
    return kept.length ? ` class=${q}${kept.join(' ')}${q}` : '';
  });

  // The page template already renders the title as the only <h1>. A body
  // <h1> that repeats it is dropped; any other one becomes a section heading.
  const titleText = title ? plainText(title) : '';
  out = out.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi, (_m, attrs: string, inner: string) =>
    titleText && plainText(inner) === titleText ? '' : `<h2${attrs}>${inner}</h2>`,
  );

  // Empty spacer paragraphs from the WordPress editor.
  out = out.replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');

  if (!out.includes('/img/products/')) return out;

  // Placeholder inside a product link: the link names the product.
  out = out.replace(
    /<a\b[^>]*\bhref=(["'])([^"']+)\1[^>]*>\s*<img\b[^>]*>/gi,
    (frag, _q, href: string) => swapPlaceholder(frag, href.match(ASIN_RE)?.[1]),
  );
  // Placeholder in a comparison-table row: the row's buy link names it.
  out = out.replace(/<tr\b[\s\S]*?<\/tr>/gi, (row) =>
    row.includes('/img/products/') ? swapPlaceholder(row, row.match(ASIN_RE)?.[1]) : row,
  );

  return out;
}
