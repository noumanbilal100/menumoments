import { getCategory, getSectionHub } from '@/data/taxonomy';

/**
 * Checks the links inside an article that point at this site.
 *
 * Text pasted from ChatGPT links to addresses it guessed, like
 * /how-to-clean-espresso-machine/ for /how-to-clean-an-espresso-machine/, and
 * those answer 404. A link whose address is close to a real post (the same
 * words once "a", "an" and "the" are set aside, or nearly the same words) is
 * pointed at that post; a link to nothing on the site loses its <a> and keeps
 * its text.
 */

export interface LinkReport {
  fixed: { from: string; to: string }[];
  unlinked: string[];
}

/** Addresses that are not posts but exist: built-in pages, and old ones that redirect (see next.config.mjs). */
const OTHER_PAGES = new Set([
  'blog',
  'collections',
  'search',
  'about-us',
  'contact',
  'write-for-us',
  'privacy-policy',
  'terms-conditions',
  'disclaimer',
  'best-kitchen-gear',
  'shop',
  'feed',
  'can-chickens-eat-oranges-a-guide-for-backyard-chickens',
  'how-to-poach-an-egg-in-the-microwave',
  'are-microwaves-bad-for-you',
  'https-menumoments-com-topgolf-food-and-drink-menu',
]);

const FILLER = new Set(['a', 'an', 'the']);

function keyWords(slug: string): string[] {
  return slug.split('-').filter((w) => w && !FILLER.has(w));
}

/** The real post an address most likely meant, or undefined when none is close enough to be sure. */
export function closestSlug(slug: string, slugs: Iterable<string>): string | undefined {
  const want = keyWords(slug);
  if (want.length < 2) return undefined;
  const wantKey = want.join('-');
  const wantSet = new Set(want);
  let best: string | undefined;
  let bestScore = 0;
  let tie = false;
  for (const candidate of slugs) {
    const have = keyWords(candidate);
    if (have.join('-') === wantKey) return candidate;
    const haveSet = new Set(have);
    let shared = 0;
    for (const w of wantSet) if (haveSet.has(w)) shared++;
    const score = shared / new Set([...wantSet, ...haveSet]).size;
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
      tie = false;
    } else if (score === bestScore) {
      tie = true;
    }
  }
  // Nearly the same words, one word apart at most in a typical slug, and no rival as close.
  return bestScore >= 0.8 && !tie ? best : undefined;
}

function decodeAttr(s: string): string {
  return s.replace(/&amp;/g, '&');
}

/**
 * Fixes or unlinks the article's links to addresses on this site that don't exist.
 * `known` holds every slug a link may point at: published posts, drafts and pages.
 */
export function checkInternalLinks(html: string, known: Set<string>): { html: string; report: LinkReport } {
  const report: LinkReport = { fixed: [], unlinked: [] };
  const out = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (whole, attrs: string, inner: string) => {
    const hrefMatch = attrs.match(/\bhref=(["'])([^"']*)\1/i);
    if (!hrefMatch) return whole;
    const href = decodeAttr(hrefMatch[2].trim());
    const path = href.replace(/^https?:\/\/(?:www\.)?menumoments\.com/i, '');
    // Only site addresses in the shapes posts and categories use; files, images and anything else are left alone.
    const m = path.match(/^\/(?:(category)\/)?([a-z0-9-]+)\/?([?#].*)?$/i);
    if (!m) return whole;
    const [, isCategory, rawSlug, rest = ''] = m;
    const slug = rawSlug.toLowerCase();

    if (isCategory) {
      if (getCategory(slug) || getSectionHub(slug)) return whole;
      report.unlinked.push(href);
      return inner;
    }
    if (known.has(slug) || OTHER_PAGES.has(slug)) return whole;

    const target = closestSlug(slug, known);
    if (target) {
      const to = `/${target}/${rest}`;
      report.fixed.push({ from: href, to });
      return whole.replace(hrefMatch[0], `href=${hrefMatch[1]}${to}${hrefMatch[1]}`);
    }
    report.unlinked.push(href);
    return inner;
  });
  return { html: out, report };
}

/** One line for the editor about what was changed, or '' when every link was fine. */
export function linkNote(fixed: number, unlinked: number): string {
  const parts = [
    fixed === 1 ? 'pointed 1 internal link at the post it meant' : fixed ? `pointed ${fixed} internal links at the posts they meant` : '',
    unlinked === 1
      ? 'removed 1 link to a page that doesn’t exist (its text stays)'
      : unlinked
        ? `removed ${unlinked} links to pages that don’t exist (their text stays)`
        : '',
  ].filter(Boolean);
  return parts.length ? ` Links: ${parts.join(', and ')}.` : '';
}
