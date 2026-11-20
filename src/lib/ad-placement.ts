/**
 * Where manual ad units go inside an article's HTML.
 *
 * `splitAfterParagraph` cuts the text after its nth top-level paragraph, so
 * an ad can sit between two parts of the article ("After paragraph 2" in
 * AdSense). Paragraphs inside a box, list, table, figure or quote don't
 * count, so an ad never lands in the middle of one of those.
 */
const CONTAINER = /^(div|section|aside|table|ul|ol|blockquote|figure|details|pre)$/i;

export function splitAfterParagraph(html: string, n: number): [string, string] | null {
  const tag = /<(\/?)([a-z][a-z0-9]*)\b[^>]*>/gi;
  let depth = 0;
  let seen = 0;
  let m: RegExpExecArray | null;
  while ((m = tag.exec(html))) {
    const closing = m[1] === '/';
    const name = m[2];
    if (CONTAINER.test(name)) {
      depth = Math.max(0, depth + (closing ? -1 : 1));
      continue;
    }
    if (closing && name.toLowerCase() === 'p' && depth === 0 && ++seen >= n) {
      const at = m.index + m[0].length;
      const rest = html.slice(at);
      // A paragraph that introduces what follows ("…for a conventional oven:")
      // stays with its list or table; try the next paragraph instead.
      const text = html.slice(html.lastIndexOf('<p', m.index), m.index).replace(/<[^>]+>/g, '').trim();
      if (text.endsWith(':') || /^\s*<(ol|ul|table|div class="mm-scroll")\b/i.test(rest)) continue;
      // Not worth a break if almost nothing follows.
      if (rest.replace(/<[^>]+>/g, '').trim().length < 200) return null;
      return [html.slice(0, at), rest];
    }
  }
  return null;
}
