import { esc, titleCase } from './format';
import type { BuiltArticle } from './render';
import { categoryFor, nounsFor, storeFor } from './setup';

/**
 * Turns an article ChatGPT wrote in its own Markdown, from the editor's own
 * prompt, into the designed buying-guide page. Products are read from the
 * article itself: a section with a store link and an image near its top is a
 * product. Everything else is styled by what it is (pros and cons, verdicts,
 * FAQs, numbered tips, comparison tables), so no fixed template is needed.
 */

export interface ImportedProduct {
  name: string;
  shortName: string;
  url: string;
  image: string;
  badge: string;
  price: string;
  verdict: string;
}

export interface ImportSummary {
  title: string;
  products: ImportedProduct[];
  tables: number;
  faqs: number;
  metaTitle: string;
  metaDescription: string;
  keyword: string;
}

export interface ImportResult {
  article: BuiltArticle | null;
  summary: ImportSummary;
  errors: string[];
  warnings: string[];
}

type Block =
  | { t: 'h'; level: number; text: string }
  | { t: 'p'; text: string }
  | { t: 'ul' | 'ol'; items: string[] }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'img'; alt: string; src: string };

interface Section {
  heading: string;
  blocks: Block[];
}

const DISCLOSURE =
  '<p class="mm-disclosure"><strong>Affiliate disclosure:</strong> This article contains affiliate links. If you purchase through qualifying links, the publisher may earn a commission at no additional cost to you. Product specifications, prices, availability, and package contents may change; verify current details with the seller before purchasing.</p>';

const STORE_LINK = /^\s*\**\s*\[[^\]]+\]\((https?:\/\/[^)\s]+)\)\s*\**\s*$/;
const IMAGE = /^\s*!\[([^\]]*)\]\((\S+?)(?:\s+"[^"]*")?\)\s*$/;
const WHOLE_BOLD = /^\s*\*\*([^*]+?)\*\*\s*$/;
const PROS = /^\s*\*\*\s*pros\s*:?\s*\*\*\s*:?\s*$/i;
const CONS = /^\s*\*\*\s*cons\s*:?\s*\*\*\s*:?\s*$/i;
const VERDICT = /^\s*\*\*\s*(?:our\s+|final\s+)?verdict\s*:?\s*\*\*\s*:?\s*/i;
const PRODUCT_LINE = /^\s*\*\*\s*product\s*:?\s*\*\*\s*:?\s*(.+)$/i;
const PRICE_LINE = /^\s*\*\*\s*(?:listed\s+|current\s+)?price\s*:?\s*\*\*\s*:?\s*(.+)$/i;
const NUMBERED = /^\s*\d+[.)]\s+/;

/** Phrases ChatGPT writes for the person who prompted it, not for readers. */
const NOTES_FOR_EDITOR = [/\bsupplied\b/i, /\bverified-price\b/i, /\bprovided (?:for|in|with) (?:this|the) (?:prompt|comparison)\b/i, /\bas an ai\b/i];

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

function safeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url) || url.startsWith('/');
}

/** One line of Markdown: links, bold, italics and code; everything else escaped. */
function md(text: string): string {
  return esc(text.replace(/\s+/g, ' ').trim())
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt: string, src: string) =>
      safeUrl(src) ? `<img src="${src}" alt="${alt}" loading="lazy" decoding="async">` : alt,
    )
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label: string, href: string) => (safeUrl(href) ? `<a href="${href}">${label}</a>` : label))
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])\*(?!\s)([^*]+?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/** Plain words of a Markdown line, for matching and for titles. */
function plain(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cells(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

function parseMarkdown(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ t: 'p', text: para.join(' ') });
    para = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) continue;
    if (!line.trim() || /^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      flush();
      continue;
    }
    const heading = line.match(/^\s*(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (heading) {
      flush();
      blocks.push({ t: 'h', level: heading[1].length, text: heading[2] });
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line) && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] ?? '')) {
      flush();
      const head = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      i--;
      blocks.push({ t: 'table', head, rows });
      continue;
    }
    const image = line.match(IMAGE);
    if (image) {
      flush();
      blocks.push({ t: 'img', alt: image[1], src: image[2] });
      continue;
    }
    const item = line.match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
    if (item) {
      flush();
      const type = /\d/.test(item[1]) ? 'ol' : 'ul';
      const last = blocks[blocks.length - 1];
      if (last && last.t === type) last.items.push(item[2]);
      else blocks.push({ t: type, items: [item[2]] });
      continue;
    }
    para.push(line.trim());
  }
  flush();
  return blocks;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

function words(text: string): Set<string> {
  return new Set(
    plain(text)
      .toLowerCase()
      .replace(/[’'`]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((w) => w.length > 1),
  );
}

/** The product a short name refers to: the one containing most of its words. */
function matchProduct(text: string, products: ImportedProduct[], threshold = 0.6): ImportedProduct | undefined {
  const target = words(text);
  if (!target.size) return undefined;
  let best: ImportedProduct | undefined;
  let bestScore = 0;
  for (const p of products) {
    const own = words(`${p.name} ${p.shortName}`);
    let shared = 0;
    for (const w of target) if (own.has(w)) shared++;
    const score = shared / target.size;
    if (score > bestScore) {
      best = p;
      bestScore = score;
    }
  }
  return bestScore >= threshold ? best : undefined;
}

/** "Best Overall Espresso Machine Under $500" → "Best Overall". */
function badgeFrom(label: string, nouns: { plural: string; singular: string }): string {
  let s = plain(label);
  for (const noun of [nouns.plural, nouns.singular].filter(Boolean)) {
    s = s.replace(new RegExp(`\\b${noun.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'ig'), '');
  }
  s = s.replace(/\b(under|below|less than)\s+\$?[\d,]+\b/gi, '').replace(/\s+/g, ' ').trim();
  return s.length > 2 && s.length <= 40 ? titleCase(s) : '';
}

/** A section opening with a store link and an image is a product; reads it and removes those lines. */
function takeProduct(section: Section, nouns: { plural: string; singular: string }): ImportedProduct | null {
  const firstHeading = section.blocks.findIndex((b) => b.t === 'h');
  const top = section.blocks.slice(0, firstHeading === -1 ? section.blocks.length : firstHeading);
  const image = top.find((b): b is Extract<Block, { t: 'img' }> => b.t === 'img');
  const link = top.find((b): b is Extract<Block, { t: 'p' }> => b.t === 'p' && STORE_LINK.test(b.text));
  if (!image || !link) return null;
  const productLine = top.find((b): b is Extract<Block, { t: 'p' }> => b.t === 'p' && PRODUCT_LINE.test(b.text));
  const priceLine = top.find((b): b is Extract<Block, { t: 'p' }> => b.t === 'p' && PRICE_LINE.test(b.text));
  const [label, ...rest] = section.heading.split(':');
  const shortName = plain(rest.join(':')) || plain(image.alt);
  const verdict = section.blocks.find((b): b is Extract<Block, { t: 'p' }> => b.t === 'p' && VERDICT.test(b.text));
  section.blocks = section.blocks.filter((b) => b !== image && b !== link && b !== productLine && b !== priceLine);
  return {
    name: plain(productLine?.text.match(PRODUCT_LINE)?.[1] ?? '') || shortName,
    shortName,
    url: link.text.match(STORE_LINK)![1],
    image: image.src,
    badge: rest.length ? badgeFrom(label, nouns) : '',
    price: plain(priceLine?.text.match(PRICE_LINE)?.[1] ?? ''),
    verdict: verdict ? verdict.text.replace(VERDICT, '') : '',
  };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

interface Ctx {
  products: ImportedProduct[];
  hidePrices: boolean;
}

const button = (p: ImportedProduct, cls: string, label: string) =>
  `<a class="${cls}" href="${esc(p.url)}" title="${esc(`${p.name} on ${storeFor(p.url)}`)}">${esc(label)}</a>`;
const img = (p: ImportedProduct) => `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async">`;
const badge = (text: string, small = false) => (text ? `<span class="mm-badge${small ? ' mm-badge-sm' : ''}">${esc(text)}</span>` : '');

function productCard(p: ImportedProduct, ctx: Ctx): string {
  const price = !ctx.hidePrices && p.price ? `<p class="mm-pick-for"><strong>Price when published:</strong> ${esc(p.price)}</p>` : '';
  return `<div class="mm-top-rec"><a class="mm-top-rec-img" href="${esc(p.url)}">${img(p)}</a><div class="mm-top-rec-body">${badge(p.badge)}<p class="mm-top-rec-title">${esc(
    p.name,
  )}</p>${price}${button(p, 'mm-btn mm-btn-lg', `Check price on ${storeFor(p.url)}`)}</div></div>`;
}

function renderTable(b: Extract<Block, { t: 'table' }>, ctx: Ctx): string {
  const keep = b.head.map((h) => !(ctx.hidePrices && /price/i.test(h)));
  const matches = b.rows.map((r) => matchProduct(r[0] ?? '', ctx.products));
  const productTable = matches.filter(Boolean).length >= 2;
  const head = b.head.filter((_, i) => keep[i]).map((h) => `<th>${md(h)}</th>`).join('') + (productTable ? '<th><span class="mm-sr">Buy</span></th>' : '');
  const rows = b.rows
    .map((r, ri) => {
      const p = matches[ri];
      const tds = r
        .map((c, ci) => {
          if (!keep[ci]) return '';
          if (ci === 0 && p) return `<td><div class="mm-compare-product">${img(p)}<div>${badge(p.badge, true)}<strong>${esc(plain(c))}</strong></div></div></td>`;
          return `<td>${md(c)}</td>`;
        })
        .join('');
      return `<tr>${tds}${productTable ? `<td>${p ? button(p, 'mm-btn mm-btn-sm', 'View') : ''}</td>` : ''}</tr>`;
    })
    .join('');
  return `<div class="mm-table-wrap"><table class="mm-compare"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderBlock(b: Block, ctx: Ctx): string {
  switch (b.t) {
    case 'h':
      return `<h${Math.max(3, b.level)}>${md(b.text)}</h${Math.max(3, b.level)}>`;
    case 'p':
      return `<p>${md(b.text)}</p>`;
    case 'ul':
    case 'ol':
      return `<${b.t}>${b.items
        .map((item) => {
          // A list item that is just one of the products' names becomes its link.
          const p = plain(item).length < 90 ? matchProduct(item, ctx.products, 0.95) : undefined;
          return `<li>${p && !/\]\(/.test(item) ? `<a href="${esc(p.url)}">${md(item)}</a>` : md(item)}</li>`;
        })
        .join('')}</${b.t}>`;
    case 'table':
      return renderTable(b, ctx);
    case 'img':
      return safeUrl(b.src) ? `<figure><img src="${esc(b.src)}" alt="${esc(b.alt)}" loading="lazy" decoding="async"></figure>` : '';
  }
}

/** Blocks in order, with pros/cons, verdicts and runs of "**Label: Product**" + text styled as components. */
function renderBlocks(blocks: Block[], ctx: Ctx): string {
  const out: string[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const next = blocks[i + 1];
    if (b.t === 'p' && (PROS.test(b.text) || CONS.test(b.text)) && next && next.t !== 'p' && next.t !== 'h' && 'items' in next) {
      let pros: string[] = [];
      let cons: string[] = [];
      let j = i;
      while (blocks[j]?.t === 'p' && (PROS.test((blocks[j] as { text: string }).text) || CONS.test((blocks[j] as { text: string }).text))) {
        const list = blocks[j + 1];
        if (!list || !('items' in list)) break;
        if (PROS.test((blocks[j] as { text: string }).text)) pros = list.items;
        else cons = list.items;
        j += 2;
      }
      const li = (items: string[]) => `<ul>${items.map((x) => `<li>${md(x)}</li>`).join('')}</ul>`;
      out.push(
        `<div class="mm-proscons"><div class="mm-pros"><p class="mm-pc-title">Pros</p>${li(pros)}</div><div class="mm-cons"><p class="mm-pc-title">Cons</p>${li(cons)}</div></div>`,
      );
      i = j - 1;
      continue;
    }
    if (b.t === 'p' && VERDICT.test(b.text)) {
      out.push(`<div class="mm-verdict"><p><strong>Verdict:</strong> ${md(b.text.replace(VERDICT, ''))}</p></div>`);
      continue;
    }
    if (b.t === 'p' && WHOLE_BOLD.test(b.text) && next?.t === 'p' && !WHOLE_BOLD.test(next.text)) {
      // Two or more "**Best Overall: Product**" lines, each followed by its text, read as recommendation cards.
      const cards: string[] = [];
      let j = i;
      while (blocks[j]?.t === 'p' && WHOLE_BOLD.test((blocks[j] as { text: string }).text)) {
        const title = plain((blocks[j] as { text: string }).text);
        const body: Block[] = [];
        let k = j + 1;
        while (blocks[k]?.t === 'p' && !WHOLE_BOLD.test((blocks[k] as { text: string }).text)) body.push(blocks[k++]);
        if (!body.length) break;
        const [label, ...rest] = title.split(':');
        const named = rest.join(':').trim();
        const p = named ? matchProduct(named, ctx.products) : undefined;
        const lead = named ? `<p class="mm-who-lead">${p ? `<a href="${esc(p.url)}">${esc(named)}</a>` : esc(named)}</p>` : '';
        cards.push(`<div class="mm-who-card"><p class="mm-who-title">${esc(named ? label.trim() : title)}</p>${lead}${body.map((x) => renderBlock(x, ctx)).join('')}</div>`);
        j = k;
      }
      if (cards.length >= 2) {
        out.push(`<div class="mm-who">${cards.join('')}</div>`);
        i = j - 1;
        continue;
      }
    }
    out.push(renderBlock(b, ctx));
  }
  return out.filter(Boolean).join('\n');
}

interface Group {
  title: string;
  blocks: Block[];
}

function h3Groups(blocks: Block[]): { pre: Block[]; groups: Group[] } {
  const pre: Block[] = [];
  const groups: Group[] = [];
  for (const b of blocks) {
    if (b.t === 'h' && b.level === 3) groups.push({ title: b.text, blocks: [] });
    else if (groups.length) groups[groups.length - 1].blocks.push(b);
    else pre.push(b);
  }
  return { pre, groups };
}

function renderSection(s: Section, product: ImportedProduct | null, ctx: Ctx): { html: string; faqs: number } {
  const out = [`<h2>${md(s.heading)}</h2>`];
  if (product) {
    out.push(productCard(product, ctx));
    out.push(renderBlocks(s.blocks, ctx));
    out.push(`<p class="mm-review-cta">${button(product, 'mm-btn mm-btn-lg', `View the ${product.shortName} on ${storeFor(product.url)}`)}</p>`);
    return { html: out.join('\n'), faqs: 0 };
  }

  const { pre, groups } = h3Groups(s.blocks);
  if (/\bfaqs?\b|frequently asked/i.test(s.heading) && groups.length) {
    out.push(renderBlocks(pre, ctx));
    out.push(
      `<div class="mm-faq">${groups
        .map((g) => `<details><summary>${md(g.title.replace(NUMBERED, ''))}</summary>${renderBlocks(g.blocks, ctx)}</details>`)
        .join('')}</div>`,
    );
    return { html: out.filter(Boolean).join('\n'), faqs: groups.length };
  }

  // Short numbered tips ("### 1. …") read better as numbered cards than as a run of headings.
  const asCards =
    groups.length >= 3 &&
    groups.every((g) => NUMBERED.test(g.title) && g.blocks.length <= 5 && g.blocks.every((b) => b.t === 'p' || b.t === 'ul' || b.t === 'ol'));
  if (asCards) {
    out.push(renderBlocks(pre, ctx));
    out.push(
      `<div class="mm-criteria">${groups
        .map(
          (g, i) =>
            `<div class="mm-criterion"><span class="mm-num">${i + 1}</span><p class="mm-criterion-title">${md(g.title.replace(NUMBERED, ''))}</p>${renderBlocks(g.blocks, ctx)}</div>`,
        )
        .join('')}</div>`,
    );
    return { html: out.filter(Boolean).join('\n'), faqs: 0 };
  }

  out.push(renderBlocks(s.blocks, ctx));
  return { html: out.filter(Boolean).join('\n'), faqs: 0 };
}

function quickPicks(products: ImportedProduct[]): string {
  return `<h2>Our Top Picks at a Glance</h2>\n<div class="mm-picks">${products
    .map((p, i) => {
      const text = p.verdict ? `<p class="mm-pick-text">${md(p.verdict)}</p>` : '';
      return `<div class="mm-pick${i === 0 ? ' mm-pick-top' : ''}"><a class="mm-pick-img" href="${esc(p.url)}">${img(p)}</a><div class="mm-pick-body">${badge(
        p.badge,
      )}<p class="mm-pick-name"><a href="${esc(p.url)}">${esc(p.name)}</a></p>${text}${button(p, 'mm-btn', `Check price on ${storeFor(p.url)}`)}</div></div>`;
    })
    .join('')}</div>`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function fromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/^\s*(top\s+)?\d+\s+/, '')
    .replace(/[:|–—-].*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function importArticle(markdown: string, options: { keyword: string; category: string; hidePrices: boolean }): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const blocks = parseMarkdown(markdown);

  // H1 is the page title; the page template prints it, so it leaves the body.
  const h1 = blocks.find((b): b is Extract<Block, { t: 'h' }> => b.t === 'h' && b.level === 1);
  const sections: Section[] = [{ heading: '', blocks: [] }];
  for (const b of blocks) {
    if (b === h1) continue;
    if (b.t === 'h' && b.level <= 2) sections.push({ heading: b.text, blocks: [] });
    else sections[sections.length - 1].blocks.push(b);
  }

  // The SEO table (or lines) at the end goes to the SEO fields.
  let metaTitle = '';
  let metaDescription = '';
  const seoIndex = sections.findIndex((s) => /\b(seo|meta)\b/i.test(s.heading));
  const seoBlocks = seoIndex > 0 ? sections[seoIndex].blocks : [];
  for (const b of seoBlocks) {
    const rows = b.t === 'table' ? [b.head, ...b.rows] : b.t === 'p' ? [b.text.split(/:\s*/)] : [];
    for (const [k, ...v] of rows) {
      const value = plain(v.join(': '));
      if (/meta\s*title|seo\s*title/i.test(k)) metaTitle = value;
      if (/meta\s*description/i.test(k)) metaDescription = value;
    }
  }
  if (seoIndex > 0) sections.splice(seoIndex, 1);

  const title = plain(h1?.text ?? '') || metaTitle;
  const keyword = (options.keyword.trim() || fromTitle(title)).toLowerCase();
  const nouns = nounsFor(keyword);

  const products: ImportedProduct[] = [];
  const productOf = new Map<Section, ImportedProduct>();
  for (const s of sections.slice(1)) {
    const p = takeProduct(s, nouns);
    if (p) {
      products.push(p);
      productOf.set(s, p);
    }
  }
  const ctx: Ctx = { products, hidePrices: options.hidePrices };

  const out: string[] = [];
  // Opening text: anything before the first heading, plus an "Introduction" section, which needs no heading.
  out.push(renderBlocks(sections[0].blocks, ctx));
  let rest = sections.slice(1);
  if (rest[0] && /^introduction$/i.test(plain(rest[0].heading))) {
    out.push(renderBlocks(rest[0].blocks, ctx));
    rest = rest.slice(1);
  }
  if (products.length >= 2) out.push(quickPicks(products));
  let tables = 0;
  let faqs = 0;
  for (const s of rest) {
    const r = renderSection(s, productOf.get(s) ?? null, ctx);
    out.push(r.html);
    faqs += r.faqs;
    tables += s.blocks.filter((b) => b.t === 'table').length;
  }
  out.push(DISCLOSURE);
  const html = out.filter(Boolean).join('\n');

  // What the editor should know before publishing.
  if (!title) errors.push('No title found. Add a line starting with "# " at the top, or a Meta Title row in the SEO table.');
  if (!products.length) errors.push('No products found. Each product section needs its store link and its image near the top.');
  if (!h1 && metaTitle) warnings.push('The article has no H1, so the meta title is used as the page title.');
  if (!metaDescription) warnings.push('No meta description found; the start of the article will be used.');
  for (const p of products) if (!p.badge) warnings.push(`"${p.shortName}" has no badge; its section heading has no "Best …:" label.`);
  const prose = markdown.replace(/^##\s*SEO[\s\S]*$/im, '');
  const notes = NOTES_FOR_EDITOR.map((re) => (prose.match(new RegExp(re.source, 'gi')) ?? []).length).reduce((a, b) => a + b, 0);
  if (notes) {
    const example = prose.split(/\n/).find((l) => NOTES_FOR_EDITOR.some((re) => re.test(l)))?.trim().slice(0, 120);
    warnings.push(`ChatGPT left ${notes} note${notes === 1 ? '' : 's'} meant for you, not readers (e.g. “${example}”). Edit them out, or ask ChatGPT to rewrite without words like “supplied”.`);
  }
  if (products.some((p) => p.price)) {
    const prices = [...new Set(products.map((p) => p.price.replace(/^\$?/, '$')).filter((p) => p.length > 1))];
    const mentions = prices.reduce((n, price) => n + (prose.split(price).length - 1), 0);
    if (mentions) {
      warnings.push(
        `Product prices appear ${mentions} times in the text. Amazon’s Associates rules don’t allow hand-written prices, which go out of date; edit them out or ask ChatGPT for a version without prices.${
          options.hidePrices ? ' The price lines and price columns have already been removed.' : ''
        }`,
      );
    }
  }

  const summary: ImportSummary = { title, products, tables, faqs, metaTitle, metaDescription, keyword };
  if (errors.length) return { article: null, summary, errors, warnings };
  return {
    article: {
      title,
      slug: slugify(keyword) || slugify(title),
      html,
      excerpt: metaDescription,
      seoTitle: metaTitle,
      metaDescription,
      focusKeyword: keyword,
      heroAlt: title,
      categories: [...new Set([options.category || categoryFor(keyword), 'best-kitchen-products', 'affiliate-product-guides'])],
    },
    summary,
    errors,
    warnings,
  };
}
