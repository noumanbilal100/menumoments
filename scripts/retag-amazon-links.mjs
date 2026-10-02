#!/usr/bin/env node
/**
 * Phase 2 of retagging Amazon affiliate links: rewrite post HTML so every
 * Amazon link carries the current Associates tag.
 *
 * Three cases:
 *   1. amzn.to shortlinks  — replaced with the full product URL recorded by
 *      resolve-amazon-links.mjs, carrying the new tag. The tag on a
 *      shortlink lives on Amazon's side, so the link has to be rebuilt
 *      rather than edited.
 *   2. Full Amazon URLs with an old tag — tag swapped in place.
 *   3. Full Amazon URLs with no tag at all — tag added.
 *
 * Shortlinks the resolver could not resolve are left alone and reported;
 * they still point at a working product page, just on the old account.
 *
 * Usage:
 *   node scripts/retag-amazon-links.mjs            # apply
 *   node scripts/retag-amazon-links.mjs --dry-run  # report only
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');
const MAP_FILE = path.join(ROOT, 'src', 'content', 'amazon-link-map.json');

const NEW_TAG = process.env.AMAZON_TAG ?? 'nomi06d06-20';
const DRY = process.argv.includes('--dry-run');

/** Put `tag=NEW_TAG` on a full Amazon URL, replacing any existing tag. */
function retagFullUrl(url) {
  if (/[?&]tag=/i.test(url)) {
    return url.replace(/([?&])tag=[^&"'#\s]*/i, `$1tag=${NEW_TAG}`);
  }
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}tag=${NEW_TAG}`;
}

async function main() {
  if (!existsSync(MAP_FILE)) {
    console.error(`✗ ${MAP_FILE} not found — run scripts/resolve-amazon-links.mjs first.`);
    process.exit(1);
  }
  const map = JSON.parse(await readFile(MAP_FILE, 'utf8'));
  // Keyed on `replacement`, not `asin` — search links (amazon.com/s?k=…)
  // have no ASIN but are still perfectly retaggable.
  const resolvable = Object.entries(map).filter(([, v]) => v.replacement);
  const unresolved = Object.entries(map).filter(([, v]) => !v.replacement);

  console.log(`tag: ${NEW_TAG}${DRY ? '   (dry run)' : ''}`);
  console.log(`map: ${resolvable.length} resolved, ${unresolved.length} unresolved`);
  console.log('');

  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.json'));
  let postsChanged = 0;
  let shortReplaced = 0;
  let fullRetagged = 0;
  let leftAlone = 0;
  const touched = [];

  for (const f of files) {
    const file = path.join(POSTS_DIR, f);
    const data = JSON.parse(await readFile(file, 'utf8'));
    const before = data.html ?? '';
    if (!before.includes('amzn.to') && !/amazon\.[a-z.]+/i.test(before)) continue;

    let html = before;
    let perPostShort = 0;
    let perPostFull = 0;

    // 1. shortlinks -> rebuilt product URL on the new tag
    for (const [short, info] of resolvable) {
      if (!html.includes(short)) continue;
      const hits = html.split(short).length - 1;
      html = html.split(short).join(info.replacement);
      perPostShort += hits;
    }

    // 2 + 3. full Amazon URLs inside href="" — swap or add the tag
    html = html.replace(
      /href=(["'])(https?:\/\/(?:www\.)?amazon\.[a-z.]+\/[^"']*)\1/gi,
      (full, q, url) => {
        const next = retagFullUrl(url);
        if (next !== url) perPostFull++;
        return `href=${q}${next}${q}`;
      },
    );

    const stillShort = (html.match(/amzn\.to/g) ?? []).length;
    leftAlone += stillShort;

    if (html !== before) {
      postsChanged++;
      shortReplaced += perPostShort;
      fullRetagged += perPostFull;
      touched.push(
        `  ${data.slug}  (${perPostShort} shortlink${perPostShort === 1 ? '' : 's'}, ${perPostFull} direct)`,
      );
      if (!DRY) {
        data.html = html;
        await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
      }
    }
  }

  console.log(touched.join('\n'));
  console.log('');
  console.log(`posts changed:        ${postsChanged}`);
  console.log(`shortlinks rebuilt:   ${shortReplaced}`);
  console.log(`direct URLs retagged: ${fullRetagged}`);
  console.log(`amzn.to left in place:${leftAlone}  (unresolved — still on the old account)`);
  if (DRY) console.log('\n(dry run — nothing written)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
