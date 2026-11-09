/**
 * Reads ChatGPT's filled-in templates and turns their text into HTML.
 *
 * Templates are plain labelled text (TITLE: …, ### PICK P1) rather than JSON:
 * product copy is full of inch marks and quotes that break JSON, and an editor
 * can fix a stray line by hand.
 */

export interface Block {
  type: string;
  /** The product number from a "### REVIEW P3" line. */
  ref?: number;
  fields: Record<string, string>;
}

export type ProductLinks = { url: string; label: string }[];

const FENCE = /^\s*```/;
const FIELD = /^\s*(?:[-*]\s+)?\**\s*([A-Z][A-Z0-9_]*)\s*\**\s*:\s*\**\s?(.*)$/;
const BULLET = /^\s*(?:[-*•]|\d+[.)])\s+/;

/**
 * Splits a reply into blocks. Lines before the first ### line belong to MAIN.
 * Only the given labels count, so a prose line that happens to start with a
 * capitalised word and a colon stays part of the text.
 */
export function parseBlocks(text: string, labels: readonly string[], blockTypes: readonly string[]): Block[] {
  const known = new Set(labels);
  const header = new RegExp(`^\\s*#{2,4}\\s*\\**\\s*(${blockTypes.join('|')})\\b(?:\\s*\\[?P(\\d+)\\]?)?`, 'i');
  const blocks: Block[] = [{ type: 'MAIN', fields: {} }];
  let current = blocks[0];
  let label: string | null = null;
  for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
    if (FENCE.test(line)) continue;
    const h = line.match(header);
    if (h) {
      current = { type: h[1].toUpperCase(), ref: h[2] ? Number(h[2]) : undefined, fields: {} };
      blocks.push(current);
      label = null;
      continue;
    }
    const f = line.match(FIELD);
    if (f && known.has(f[1])) {
      label = f[1];
      current.fields[label] = f[2];
      continue;
    }
    if (label) current.fields[label] += `\n${line}`;
  }
  for (const b of blocks) for (const k of Object.keys(b.fields)) b.fields[k] = b.fields[k].trim();
  return blocks;
}

/** True when ChatGPT actually wrote something, not the template's own (instruction) or NONE. */
export function filled(value: string | undefined): value is string {
  const v = value?.trim();
  return Boolean(v) && !/^\([\s\S]*\)$/.test(v!) && !/^(none|n\/a|-|…|\.\.\.)$/i.test(v!);
}

export function items(value: string | undefined): string[] {
  if (!filled(value)) return [];
  return value
    .split('\n')
    .map((line) => line.replace(BULLET, '').trim())
    .filter((line) => filled(line));
}

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** One line of text: escaped, **bold** kept, and [P2] turned into the product's link. */
export function inline(text: string, links: ProductLinks): string {
  return esc(text.replace(/\s+/g, ' ').trim())
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[P(\d+)\]/g, (tag, n: string) => {
      const p = links[Number(n) - 1];
      return p ? `<a href="${esc(p.url)}">${esc(p.label)}</a>` : `P${n}`;
    });
}

/** Paragraphs split on blank lines; runs of bullet lines become a list. */
export function paragraphs(text: string | undefined, links: ProductLinks): string {
  if (!filled(text)) return '';
  const out: string[] = [];
  for (const chunk of text.split(/\n\s*\n/)) {
    let para: string[] = [];
    let list: string[] = [];
    const flushPara = () => {
      if (para.length) out.push(`<p>${inline(para.join(' '), links)}</p>`);
      para = [];
    };
    const flushList = () => {
      if (list.length) out.push(`<ul>${list.map((i) => `<li>${inline(i, links)}</li>`).join('')}</ul>`);
      list = [];
    };
    for (const raw of chunk.split('\n')) {
      const line = raw.replace(/^\s*#{1,6}\s+/, '').trim();
      if (!line) continue;
      if (BULLET.test(line)) {
        flushPara();
        list.push(line.replace(BULLET, ''));
      } else {
        flushList();
        para.push(line);
      }
    }
    flushPara();
    flushList();
  }
  return out.join('\n');
}

const SMALL_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'vs', 'with']);

export function titleCase(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}
