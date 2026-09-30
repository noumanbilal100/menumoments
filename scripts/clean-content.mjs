#!/usr/bin/env node
/**
 * Sanitize the migrated WordPress HTML — strip plugin junk that the WP
 * REST API happily hands us but that renders as garbage without the
 * matching plugin's CSS/JS.
 *
 * What gets removed / normalised (per post):
 *
 *   1. Entire `#ez-toc-container` block (Easy Table of Contents plugin —
 *      renders as an unstyled DIY toggle widget with dead SVG icons).
 *   2. `data-start="…"` / `data-end="…"` attributes (AI-generator
 *      tokens left on every paragraph — pure bloat).
 *   3. Absolute self-links `https://menumoments.com/...` → `/...`
 *      so the frontend router handles them.
 *   4. Heading IDs normalised from WP's underscore form
 *      (`id="What_Are_Juicing_Recipes"`) → slugified
 *      (`id="what-are-juicing-recipes"`), and any `#anchor` links
 *      in the body updated to match.
 *   5. Empty `class=""` attributes.
 *   6. Dead inline `style` values (`cursor:inherit`, `display:none`,
 *      `fill:#999`, etc.).
 *   7. Empty `<span></span>` wrappers (WP plugin residue).
 *   8. Trailing empty paragraphs and `<br>` runs.
 *   9. `<script>` and `<style>` tags — should never end up inline.
 *  10. Any `class="ez-toc-*"` / `class="decorated-link"` chaff.
 *
 * After cleaning, we also recompute `readingMinutes` from the leaner
 * body and rewrite both the per-post JSON and `index.json`.
 */

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');
const INDEX_FILE = path.join(ROOT, 'src', 'content', 'index.json');

// ---------------------------------------------------------------------------
// Sanitizers
// ---------------------------------------------------------------------------

/** Remove the ez-toc container using div-depth counting (nested-safe). */
function stripEzTocContainer(html) {
  const openRe = /<div\s+id=(["'])ez-toc-container\1[^>]*>/i;
  const m = html.match(openRe);
  if (!m) return html;
  const start = m.index;
  let i = start + m[0].length;
  let depth = 1;
  while (depth > 0 && i < html.length) {
    const openIdx = html.indexOf('<div', i);
    const closeIdx = html.indexOf('</div>', i);
    if (closeIdx === -1) break;
    if (openIdx !== -1 && openIdx < closeIdx) {
      // Skip past the '<div' — but only count it if it's a real tag.
      const nextChar = html[openIdx + 4];
      if (nextChar === '>' || /\s/.test(nextChar)) depth++;
      i = openIdx + 4;
    } else {
      depth--;
      i = closeIdx + '</div>'.length;
      if (depth === 0) {
        // Also swallow surrounding whitespace/newlines.
        let end = i;
        while (/\s/.test(html[end])) end++;
        let s = start;
        while (s > 0 && /\s/.test(html[s - 1])) s--;
        return html.slice(0, s) + html.slice(end);
      }
    }
  }
  return html;
}

/** Rewrite absolute self-links to relative paths. */
function rewriteInternalLinks(html) {
  return html.replace(
    /(href=(["']))https?:\/\/(?:www\.)?menumoments\.com([^"']*)\2/gi,
    (_full, pre, q, tail) => `${pre}${tail || '/'}${q}`,
  );
}

/** Normalise heading IDs to lowercase-hyphen form and update matching anchor links. */
function normaliseHeadingIds(html) {
  const idMap = new Map();
  const normalise = (id) =>
    id
      .toLowerCase()
      .replace(/_/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section';

  html = html.replace(
    /<(h[1-6])([^>]*?)\sid=(["'])([^"']+)\3([^>]*)>/gi,
    (_full, tag, before, q, id, after) => {
      const newId = normalise(id);
      if (id !== newId) idMap.set(id, newId);
      return `<${tag}${before} id=${q}${newId}${q}${after}>`;
    },
  );

  if (idMap.size) {
    html = html.replace(/href=(["'])#([^"']+)\1/gi, (m, q, hash) => {
      const mapped = idMap.get(hash) ?? normalise(hash);
      return `href=${q}#${mapped}${q}`;
    });
  }
  return html;
}

/** Remove noise attributes, dead inline styles, dead classes. */
function scrubAttributes(html) {
  return (
    html
      // Any AI-generator token pairs.
      .replace(/\sdata-(?:start|end)=(["'])[^"']*\1/gi, '')
      // Empty class attributes.
      .replace(/\sclass=(["'])\s*\1/gi, '')
      // Dead inline styles that only exist to prop up plugin UI.
      .replace(/\sstyle=(["'])[^"']*(?:cursor\s*:\s*inherit|display\s*:\s*none|fill\s*:\s*#999|color\s*:\s*#999)[^"']*\1/gi, '')
      // Plugin residue classes.
      .replace(/\bclass=(["'])([^"']+)\1/gi, (m, q, cls) => {
        const clean = cls
          .split(/\s+/)
          .filter(
            (c) =>
              !c.startsWith('ez-toc-') &&
              !c.startsWith('eztoc-') &&
              c !== 'decorated-link' &&
              c !== 'wp-block-heading',
          )
          .join(' ');
        return clean ? `class=${q}${clean}${q}` : '';
      })
  );
}

/** Remove <script> and <style> blocks (never safe inline). */
function stripScriptStyle(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
}

/** Iteratively remove empty span wrappers. */
function removeEmptySpans(html) {
  let prev;
  do {
    prev = html;
    html = html
      .replace(/<span[^>]*>\s*<\/span>/gi, '')
      .replace(/<p[^>]*>\s*<\/p>/gi, '')
      .replace(/<div[^>]*>\s*<\/div>/gi, '');
  } while (prev !== html);
  return html;
}

/** Collapse runs of <br> and trim trailing whitespace. */
function tidyBreaks(html) {
  return html
    .replace(/(?:\s*<br\s*\/?>\s*){3,}/gi, '<br><br>')
    .replace(/(<br\s*\/?>|\s)+$/i, '')
    .trim();
}

/** Recompute reading time in minutes from the cleaned body. */
function readingMinutes(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return Math.max(1, Math.round(text.split(/\s+/).length / 220));
}

/** Run every step in order. */
function sanitize(html) {
  if (!html) return html;
  let out = html;
  out = stripScriptStyle(out);
  out = stripEzTocContainer(out);
  out = rewriteInternalLinks(out);
  out = normaliseHeadingIds(out);
  out = scrubAttributes(out);
  out = removeEmptySpans(out);
  out = tidyBreaks(out);
  return out;
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function main() {
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.json'));
  console.log(`Cleaning ${files.length} posts…`);

  let touched = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;

  for (const f of files) {
    const p = path.join(POSTS_DIR, f);
    const raw = await readFile(p, 'utf8');
    const post = JSON.parse(raw);
    const before = post.html ?? '';
    bytesBefore += before.length;
    const cleaned = sanitize(before);
    bytesAfter += cleaned.length;
    if (cleaned !== before) {
      post.html = cleaned;
      post.readingMinutes = readingMinutes(cleaned);
      await writeFile(p, JSON.stringify(post, null, 2) + '\n', 'utf8');
      touched++;
    }
  }

  // Refresh index.json reading times so listings match reality.
  const index = JSON.parse(await readFile(INDEX_FILE, 'utf8'));
  for (const entry of index) {
    const p = path.join(POSTS_DIR, `${entry.slug}.json`);
    try {
      const post = JSON.parse(await readFile(p, 'utf8'));
      entry.readingMinutes = post.readingMinutes;
    } catch {
      /* orphan index entry — leave as-is */
    }
  }
  await writeFile(INDEX_FILE, JSON.stringify(index, null, 2) + '\n', 'utf8');

  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  console.log(`  cleaned:      ${touched} / ${files.length} posts`);
  console.log(`  html before:  ${kb(bytesBefore)}`);
  console.log(`  html after:   ${kb(bytesAfter)} (${(
    100 - (bytesAfter / bytesBefore) * 100
  ).toFixed(1)}% smaller)`);
  console.log(`  index.json refreshed with new reading times.`);
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
