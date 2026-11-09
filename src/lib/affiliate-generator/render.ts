import { esc, inline, paragraphs, titleCase, type ProductLinks } from './format';
import type { GuideData, OverviewData, ReviewData, WrapupData } from './sections';
import { storeFor, type GenProduct, type GenSetup } from './setup';

/**
 * Builds the article HTML from the editor's products and ChatGPT's sections,
 * using the same mm- components as the hand-built sushi kit guide, so the
 * buying-guide layout and its styles apply unchanged.
 */

export interface ArticleParts {
  overview: OverviewData;
  guide: GuideData | null;
  reviews: Record<number, ReviewData>;
  wrapup: WrapupData | null;
}

export interface BuiltArticle {
  title: string;
  slug: string;
  html: string;
  excerpt: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  heroAlt: string;
  categories: string[];
}

const RESEARCH_NOTE =
  '<div class="mm-callout mm-callout-note"><p><strong>Important note:</strong> This is a research-based buying guide, not a report of hands-on testing. We compared product listings, specifications and buyer feedback; we did not run durability or performance tests on every product. Prices, availability and package contents change, so check the current listing before you buy.</p></div>';

const NOT_CLAIMED =
  '<p>We have not independently verified every product’s advertised features, materials, durability or long-term performance, and prices and package contents can differ by region.</p>\n<p>The labels in this guide point to different shopping priorities. They are not claims that a product won a lab test or outperformed every competitor.</p>';

const DISCLOSURE =
  '<p class="mm-disclosure"><strong>Affiliate disclosure:</strong> This article contains affiliate links. If you purchase through qualifying links, the publisher may earn a commission at no additional cost to you. Product specifications, prices, availability, and package contents may change; verify current details with the seller before purchasing.</p>';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function regExpEscape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Bolds the first plain-text mention of the keyword, as the hand-written guides do. */
function boldKeyword(html: string, keyword: string): string {
  if (!keyword.trim()) return html;
  const pattern = new RegExp(`(^|>)([^<]*?)(${regExpEscape(esc(keyword.trim()))})`, 'i');
  return html.replace(pattern, '$1$2<strong>$3</strong>');
}

export function buildArticle(setup: GenSetup, parts: ArticleParts): BuiltArticle {
  const { overview, guide, reviews, wrapup } = parts;
  const products = setup.products;
  const n = products.length;
  const year = new Date().getFullYear();
  const plural = titleCase(setup.plural);
  const singular = titleCase(setup.singular);
  const pick = (i: number) => overview.picks[i + 1];
  const links: ProductLinks = products.map((p, i) => ({
    url: p.url.trim(),
    label: pick(i)?.shortName.replace(/\[P\d+\]/g, '').trim() || p.name.trim(),
  }));
  const T = (s: string) => inline(s, links);
  const P = (s: string | undefined) => paragraphs(s, links);
  /** Fields that end up as plain text (titles, meta, badges) get names, not links, for any stray tag. */
  const plain = (s: string) => s.replace(/\[P(\d+)\]/g, (tag, k: string) => links[Number(k) - 1]?.label ?? '').replace(/\s+/g, ' ').trim();

  const url = (p: GenProduct) => esc(p.url.trim());
  const img = (p: GenProduct, alt: string) => `<img src="${esc(p.image.trim())}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  const button = (p: GenProduct, cls: string, label: string) =>
    `<a class="${cls}" href="${url(p)}" title="${esc(`${p.name.trim()} on ${storeFor(p.url)}`)}">${esc(label)}</a>`;
  const badge = (text: string | undefined, small = false) =>
    text ? `<span class="mm-badge${small ? ' mm-badge-sm' : ''}">${esc(plain(text))}</span>` : '';
  const list = (values: string[]) => `<ul>${values.map((v) => `<li>${T(v)}</li>`).join('')}</ul>`;
  /** "Lead phrase: sentence" → bold lead, as in the overall pros and cons. */
  const led = (values: string[]) =>
    `<ul>${values.map((v) => {
      const m = v.match(/^([^:]{2,60}):\s*(.+)$/);
      return `<li>${m ? `<strong>${esc(m[1].replace(/\*\*/g, ''))}:</strong> ${T(m[2])}` : T(v)}</li>`;
    }).join('')}</ul>`;

  const out: string[] = [];

  // Intro and quick picks ------------------------------------------------
  out.push(boldKeyword(P(overview.intro), setup.keyword));
  out.push(`<h2>Quick Picks: Our Top ${n} ${plural}</h2>`);
  out.push(
    `<div class="mm-picks">${products
      .map((p, i) => {
        const k = pick(i);
        return `<div class="mm-pick${i === 0 ? ' mm-pick-top' : ''}"><a class="mm-pick-img" href="${url(p)}">${img(p, p.name.trim())}</a><div class="mm-pick-body">${badge(k?.badge)}<p class="mm-pick-name"><a href="${url(p)}">${esc(p.name.trim())}</a></p>${
          k?.bestFor ? `<p class="mm-pick-for"><strong>Best suited for:</strong> ${T(k.bestFor)}</p>` : ''
        }<p class="mm-pick-text">${T(k?.summary ?? '')}</p>${button(p, 'mm-btn', `Check price on ${storeFor(p.url)}`)}</div></div>`;
      })
      .join('')}</div>`,
  );

  // Comparison table --------------------------------------------------------
  out.push(`<h2>Comparison Table: Which ${singular} Should You Buy?</h2>`);
  out.push(
    `<div class="mm-table-wrap"><table class="mm-compare"><thead><tr><th>Product</th><th>Main appeal</th><th>Best buyer</th><th>What to verify</th><th><span class="mm-sr">Buy</span></th></tr></thead><tbody>${products
      .map((p, i) => {
        const k = pick(i);
        const short = k?.shortName || p.name.trim();
        return `<tr><td><div class="mm-compare-product">${img(p, short)}<div>${badge(k?.badge, true)}<strong>${esc(short)}</strong></div></div></td><td>${T(k?.appeal ?? '')}</td><td>${T(k?.buyer ?? '')}</td><td>${T(k?.check ?? '')}</td><td>${button(p, 'mm-btn mm-btn-sm', 'View')}</td></tr>`;
      })
      .join('')}</tbody></table></div>`,
  );
  if (overview.recommendation) {
    out.push(`<div class="mm-callout mm-callout-tip"><p><strong>Our recommendation:</strong> ${T(overview.recommendation)}</p></div>`);
  }

  // How we evaluated ----------------------------------------------------------
  out.push(`<h2>How We Evaluated the Best ${plural}</h2>`);
  if (overview.evaluationIntro) out.push(P(overview.evaluationIntro));
  out.push(RESEARCH_NOTE);
  if (guide?.criteria.length) {
    out.push('<h3>Our Evaluation Criteria</h3>');
    out.push(
      `<div class="mm-criteria">${guide.criteria
        .map((c, i) => `<div class="mm-criterion"><span class="mm-num">${i + 1}</span><p class="mm-criterion-title">${T(c.title)}</p>${P(c.text)}</div>`)
        .join('')}</div>`,
    );
  }
  out.push('<h3>What This Guide Does Not Claim</h3>');
  out.push(NOT_CLAIMED);

  // Buying guide --------------------------------------------------------------
  if (guide) {
    out.push(`<h2>Buying Guide: How to Choose the Best ${singular}</h2>`);
    if (guide.guideIntro) out.push(P(guide.guideIntro));
    guide.steps.forEach((s, i) => {
      out.push(`<h3>${i + 1}. ${T(s.title)}</h3>`);
      out.push(P(s.text));
    });
    if (guide.versus) {
      const v = guide.versus;
      out.push(`<h3>${T(v.heading)}</h3>`);
      out.push(
        `<div class="mm-versus"><div class="mm-versus-card"><p class="mm-versus-title">${T(v.aTitle)}</p>${P(v.aText)}</div><div class="mm-versus-vs" aria-hidden="true">vs</div><div class="mm-versus-card"><p class="mm-versus-title">${T(v.bTitle)}</p>${P(v.bText)}</div></div>`,
      );
      if (v.after) out.push(P(v.after));
    }
    if (guide.mustHave.length || guide.niceToHave.length) {
      out.push(`<h3>What a Good ${singular} Should Include</h3>`);
      out.push(
        `<div class="mm-checklists">${
          guide.mustHave.length ? `<div class="mm-checklist mm-checklist-must"><p class="mm-checklist-title">Must-haves</p>${list(guide.mustHave)}</div>` : ''
        }${guide.niceToHave.length ? `<div class="mm-checklist mm-checklist-nice"><p class="mm-checklist-title">Nice to have</p>${list(guide.niceToHave)}</div>` : ''}</div>`,
      );
    }
    if (guide.features.length) {
      out.push('<h2>Key Features to Consider Before Buying</h2>');
      out.push(
        `<div class="mm-features">${guide.features
          .map((f) => `<div class="mm-feature"><p class="mm-feature-title">${T(f.title)}</p>${P(f.text)}</div>`)
          .join('')}</div>`,
      );
    }
  }

  // Reviews -------------------------------------------------------------------
  out.push(`<h2>Detailed Product Reviews: The ${n} Best ${plural}</h2>`);
  products.forEach((p, i) => {
    const r = reviews[i + 1];
    if (!r) return;
    const k = pick(i);
    const bestFor = r.bestFor || k?.bestFor;
    out.push(
      `<div class="mm-review"><div class="mm-review-head"><span class="mm-rank">${i + 1}</span><div class="mm-review-titles">${badge(k?.badge)}<h3>${esc(p.name.trim())}</h3>${
        bestFor ? `<p class="mm-bestfor"><strong>Best for:</strong> ${T(bestFor)}</p>` : ''
      }</div></div><div class="mm-review-grid"><div class="mm-review-media"><a class="mm-review-img" href="${url(p)}">${img(p, p.name.trim())}</a>${button(
        p,
        'mm-btn',
        `Check price on ${storeFor(p.url)}`,
      )}</div><div class="mm-review-body">${P(r.review)}</div></div>${
        r.pros.length || r.cons.length
          ? `<div class="mm-proscons"><div class="mm-pros"><p class="mm-pc-title">Pros</p>${list(r.pros)}</div><div class="mm-cons"><p class="mm-pc-title">Cons</p>${list(r.cons)}</div></div>`
          : ''
      }${r.verdict ? `<div class="mm-verdict"><p><strong>Verdict:</strong> ${T(r.verdict)}</p></div>` : ''}<p class="mm-review-cta">${button(
        p,
        'mm-btn mm-btn-lg',
        `View the ${p.name.trim()} on ${storeFor(p.url)}`,
      )}</p></div>`,
    );
  });

  // Wrap-up -------------------------------------------------------------------
  if (wrapup) {
    if (wrapup.overallPros.length || wrapup.overallCons.length) {
      out.push(`<h2>Overall Pros and Cons of ${plural}</h2>`);
      out.push(
        `<div class="mm-proscons mm-proscons-wide"><div class="mm-pros"><p class="mm-pc-title">Pros</p>${led(wrapup.overallPros)}</div><div class="mm-cons"><p class="mm-pc-title">Cons</p>${led(wrapup.overallCons)}</div></div>`,
      );
    }
    if (wrapup.who.length) {
      out.push(`<h2>Who Should Buy Which ${singular}?</h2>`);
      out.push(
        `<div class="mm-who">${wrapup.who
          .map((w) => `<div class="mm-who-card"><p class="mm-who-title">${T(w.title)}</p>${w.lead ? `<p class="mm-who-lead">${T(w.lead)}</p>` : ''}${P(w.text)}</div>`)
          .join('')}</div>`,
      );
    }
    if (wrapup.faq.length) {
      out.push('<h2>Frequently Asked Questions (FAQs)</h2>');
      out.push(
        `<div class="mm-faq">${wrapup.faq.map((f) => `<details><summary>${T(f.question)}</summary>${P(f.answer)}</details>`).join('')}</div>`,
      );
    }
  }

  out.push(`<h2>Final Verdict: Which Is the Best ${singular} to Buy?</h2>`);
  if (wrapup?.verdictIntro) out.push(P(wrapup.verdictIntro));
  out.push(
    `<ul class="mm-shortlist">${products
      .map((p, i) => {
        const line = wrapup?.shortlist[i + 1];
        return `<li>${badge(pick(i)?.badge, true)} <a href="${url(p)}">${esc(p.name.trim())}</a>${line ? ` — ${T(line)}` : ''}</li>`;
      })
      .join('')}</ul>`,
  );
  const top = products[0];
  out.push(
    `<div class="mm-top-rec"><a class="mm-top-rec-img" href="${url(top)}">${img(top, top.name.trim())}</a><div class="mm-top-rec-body"><span class="mm-badge">Our Top Recommendation</span><p class="mm-top-rec-title">${esc(
      top.name.trim(),
    )}</p>${P(wrapup?.topPick || pick(0)?.summary)}${button(top, 'mm-btn mm-btn-lg', `Check price on ${storeFor(top.url)}`)}</div></div>`,
  );
  if (wrapup?.closing) out.push(P(wrapup.closing));
  out.push(DISCLOSURE);

  const title = plain(overview.title) || `Best ${plural} (${year}): ${n} Top Picks`;
  return {
    title,
    slug: slugify(setup.keyword) || slugify(title),
    html: out.filter(Boolean).join('\n'),
    excerpt: plain(overview.excerpt),
    seoTitle: plain(overview.seoTitle),
    metaDescription: plain(overview.meta),
    focusKeyword: setup.keyword.trim().toLowerCase(),
    heroAlt: plain(overview.heroAlt),
    categories: [...new Set([setup.category, 'best-kitchen-products', 'affiliate-product-guides'].filter(Boolean))],
  };
}
