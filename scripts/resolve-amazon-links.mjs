#!/usr/bin/env node
/**
 * Phase 1 of retagging Amazon affiliate links: resolve amzn.to shortlinks
 * to their product ASIN.
 *
 * An amzn.to link carries no tag in its text — Amazon stores the tracking
 * tag against the short code on their side. So moving to a new Associates
 * account can't be done by rewriting the URL; each link has to be resolved
 * to the product it points at and rebuilt against the new tag.
 *
 * Writes src/content/amazon-link-map.json and touches nothing else, so the
 * output can be reviewed before any post is modified.
 *
 * Usage: node scripts/resolve-amazon-links.mjs
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
// Amazon starts returning 503 if this is pushed much below a second.
// Retry passes over previously-failed links want a larger gap.
const DELAY_MS = Number(process.env.RESOLVE_DELAY_MS ?? 1200);
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Pull the ASIN out of any Amazon product URL shape. */
function asinFrom(url) {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
    /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1].toUpperCase();
  }
  return null;
}

/** Swap (or add) the tag on any Amazon URL. */
function retag(url) {
  if (/[?&]tag=/i.test(url)) return url.replace(/([?&])tag=[^&#\s]*/i, `$1tag=${NEW_TAG}`);
  return `${url}${url.includes('?') ? '&' : '?'}tag=${NEW_TAG}`;
}

/**
 * Work out what a shortlink should become.
 *
 * Product links collapse to a clean /dp/<asin> URL. Not every shortlink is
 * a product though — a good number are search links
 * (amazon.com/s?k=Ninja+Air+Fryer&tag=…), which carry the tag in the URL
 * itself and just need it swapped.
 */
function buildReplacement({ finalUrl, asin }) {
  if (asin) return `https://www.amazon.com/dp/${asin}?tag=${NEW_TAG}`;
  if (finalUrl && /^https?:\/\/(www\.)?amazon\.[a-z.]+\//i.test(finalUrl)) return retag(finalUrl);
  return null;
}

async function collectShortLinks() {
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.json'));
  const links = new Set();
  for (const f of files) {
    const html = JSON.parse(await readFile(path.join(POSTS_DIR, f), 'utf8')).html ?? '';
    for (const m of html.matchAll(/https?:\/\/amzn\.to\/[A-Za-z0-9]+/g)) links.add(m[0]);
  }
  return [...links];
}

/** Follow the redirect chain and report where it lands. */
async function resolve(shortUrl) {
  try {
    const res = await fetch(shortUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      signal: AbortSignal.timeout(20000),
    });
    const finalUrl = res.url || '';
    return { finalUrl, asin: asinFrom(finalUrl), status: res.status };
  } catch (err) {
    return { finalUrl: '', asin: null, status: 0, error: String(err?.message ?? err) };
  }
}

async function main() {
  const links = await collectShortLinks();
  console.log(`${links.length} unique amzn.to links`);
  console.log(`new tag: ${NEW_TAG}`);
  console.log('');

  // Resume from an existing map so a rerun doesn't refetch everything.
  let map = {};
  if (existsSync(MAP_FILE)) {
    map = JSON.parse(await readFile(MAP_FILE, 'utf8'));
    console.log(`resuming — ${Object.keys(map).length} already resolved`);
  }

  let done = 0;
  let resolved = 0;
  let failed = 0;

  for (const link of links) {
    done++;
    if (map[link]?.asin) {
      resolved++;
      continue;
    }
    const r = await resolve(link);
    const built = buildReplacement(r);
    if (built) {
      map[link] = { asin: r.asin, finalUrl: r.finalUrl, replacement: built };
      resolved++;
    } else {
      map[link] = { asin: null, finalUrl: r.finalUrl, error: r.error ?? `http ${r.status}` };
      failed++;
    }
    process.stdout.write(`  ${done}/${links.length}  ok:${resolved} failed:${failed}\r`);
    if (done % 20 === 0) await writeFile(MAP_FILE, JSON.stringify(map, null, 2) + '\n', 'utf8');
    await sleep(DELAY_MS);
  }

  await writeFile(MAP_FILE, JSON.stringify(map, null, 2) + '\n', 'utf8');
  console.log('');
  console.log('');
  console.log(`resolved: ${resolved}`);
  console.log(`failed:   ${failed}`);
  console.log(`map:      ${MAP_FILE}`);
  if (failed) {
    console.log('');
    console.log('unresolved links:');
    for (const [k, v] of Object.entries(map)) {
      if (!v.asin) console.log(`  ${k}  (${v.error})`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
