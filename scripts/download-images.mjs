#!/usr/bin/env node
/**
 * Download every image referenced by the migrated posts and rewrite the
 * post JSON to point at local paths.
 *
 * Inputs:  src/content/posts/*.json   (from migrate-wp.mjs)
 * Outputs:
 *   - public/img/wp/<hash>-<basename>.<ext>       downloaded assets
 *   - src/content/image-map.json                  remote → local map
 *   - src/content/posts/*.json                    rewritten
 *
 * Idempotent — safe to re-run. Skips downloads for files that already
 * exist, and only rewrites JSON when the body actually changed.
 */

import { mkdir, readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync, createWriteStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');
const PUBLIC_DIR = path.join(ROOT, 'public', 'img', 'wp');
const MAP_FILE = path.join(ROOT, 'src', 'content', 'image-map.json');

const CONCURRENCY = 8;
const TIMEOUT_MS = 30_000;

// -----------------------------------------------------------------------
// URL discovery
// -----------------------------------------------------------------------

/** Pull every image URL from a post's hero + body HTML. */
function collectUrls(post) {
  const urls = new Set();
  if (post.heroImage?.src) urls.add(post.heroImage.src);

  const html = post.html ?? '';
  // <img src="…"> — attribute may use single or double quotes.
  for (const m of html.matchAll(/<img[^>]*\ssrc=["']([^"']+)["']/gi)) {
    urls.add(m[1]);
  }
  // srcset — pull every candidate url.
  for (const m of html.matchAll(/\ssrcset=["']([^"']+)["']/gi)) {
    const set = m[1];
    for (const part of set.split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (url) urls.add(url);
    }
  }
  // <a href="…image.jpg"> — pictures linked as full-size.
  for (const m of html.matchAll(/<a[^>]*\shref=["']([^"']+\.(?:jpe?g|png|webp|gif|avif))["']/gi)) {
    urls.add(m[1]);
  }
  return [...urls]
    .filter((u) => /^https?:\/\//i.test(u))
    .filter((u) => /\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i.test(u) || /wp-content\/uploads/i.test(u));
}

// -----------------------------------------------------------------------
// Local naming
// -----------------------------------------------------------------------

function extFromUrl(url) {
  try {
    const u = new URL(url);
    const ext = path.extname(u.pathname).toLowerCase().replace('.', '');
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg'].includes(ext)) return ext;
    return 'jpg';
  } catch {
    return 'jpg';
  }
}

function baseFromUrl(url) {
  try {
    const u = new URL(url);
    const raw = path.basename(u.pathname).replace(/\.[^.]+$/, '');
    return raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'image';
  } catch {
    return 'image';
  }
}

function localPathFor(url) {
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 10);
  const ext = extFromUrl(url);
  const base = baseFromUrl(url);
  const file = `${hash}-${base}.${ext}`;
  return {
    absPath: path.join(PUBLIC_DIR, file),
    urlPath: `/img/wp/${file}`,
  };
}

// -----------------------------------------------------------------------
// Downloader
// -----------------------------------------------------------------------

async function downloadOne(url, absPath) {
  if (existsSync(absPath)) {
    const st = await stat(absPath).catch(() => null);
    if (st && st.size > 0) return { url, absPath, skipped: true };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'menu-moments-migration/1.0',
        'Accept': 'image/*,*/*;q=0.8',
      },
    });
    if (!res.ok || !res.body) return { url, absPath, error: `HTTP ${res.status}` };
    await pipeline(Readable.fromWeb(res.body), createWriteStream(absPath));
    return { url, absPath, downloaded: true };
  } catch (err) {
    return { url, absPath, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

/** Simple concurrency runner. */
async function runParallel(tasks, limit, onDone) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      const result = await tasks[idx]();
      results[idx] = result;
      if (onDone) onDone(result, idx + 1, tasks.length);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

// -----------------------------------------------------------------------
// Rewrite HTML + hero
// -----------------------------------------------------------------------

function rewriteHtml(html, urlMap) {
  return html
    .replace(/(<img[^>]*\ssrc=["'])([^"']+)(["'])/gi, (m, pre, url, post) => {
      const local = urlMap.get(url);
      return local ? `${pre}${local}${post}` : m;
    })
    .replace(/(\ssrcset=["'])([^"']+)(["'])/gi, (m, pre, val, post) => {
      const rewritten = val
        .split(',')
        .map((part) => {
          const p = part.trim().split(/\s+/);
          const url = p[0];
          const local = urlMap.get(url);
          if (!local) return part;
          return part.replace(url, local);
        })
        .join(',');
      return `${pre}${rewritten}${post}`;
    })
    .replace(/(<a[^>]*\shref=["'])([^"']+\.(?:jpe?g|png|webp|gif|avif))(["'])/gi, (m, pre, url, post) => {
      const local = urlMap.get(url);
      return local ? `${pre}${local}${post}` : m;
    });
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });

  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.json'));
  console.log(`Scanning ${files.length} posts for images…`);

  // Load every post + collect unique URLs.
  const posts = [];
  const allUrls = new Set();
  for (const f of files) {
    const raw = await readFile(path.join(POSTS_DIR, f), 'utf8');
    const post = JSON.parse(raw);
    posts.push({ file: path.join(POSTS_DIR, f), post });
    for (const u of collectUrls(post)) allUrls.add(u);
  }
  console.log(`  ${allUrls.size} unique image URLs to fetch`);

  // Build the URL → local map first, then download in parallel.
  const urlMap = new Map();
  for (const url of allUrls) {
    const { urlPath } = localPathFor(url);
    urlMap.set(url, urlPath);
  }

  const tasks = [...allUrls].map((url) => {
    const { absPath } = localPathFor(url);
    return () => downloadOne(url, absPath);
  });

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];
  const results = await runParallel(tasks, CONCURRENCY, (r, done, total) => {
    if (r.skipped) skipped++;
    else if (r.downloaded) ok++;
    else if (r.error) {
      failed++;
      failures.push({ url: r.url, error: r.error });
    }
    if (done % 25 === 0 || done === total) {
      process.stdout.write(`  · ${done}/${total} (${ok} downloaded, ${skipped} cached, ${failed} failed)\r`);
    }
  });
  process.stdout.write('\n');

  // Drop failed URLs from the map so we don't rewrite to a broken local path.
  for (const fail of failures) urlMap.delete(fail.url);

  // Rewrite each post.
  let rewritten = 0;
  for (const { file, post } of posts) {
    const originalHtml = post.html ?? '';
    const newHtml = rewriteHtml(originalHtml, urlMap);
    const heroLocal = post.heroImage?.src ? urlMap.get(post.heroImage.src) : null;

    let changed = false;
    if (newHtml !== originalHtml) {
      post.html = newHtml;
      changed = true;
    }
    if (heroLocal && post.heroImage?.src !== heroLocal) {
      post.heroImage.remoteSrc = post.heroImage.src;
      post.heroImage.src = heroLocal;
      changed = true;
    }
    if (changed) {
      await writeFile(file, JSON.stringify(post, null, 2) + '\n', 'utf8');
      rewritten++;
    }
  }

  // Also update the index.json hero URLs.
  const indexPath = path.join(ROOT, 'src', 'content', 'index.json');
  const idx = JSON.parse(await readFile(indexPath, 'utf8'));
  for (const entry of idx) {
    if (entry.heroImage?.src) {
      const local = urlMap.get(entry.heroImage.src);
      if (local) entry.heroImage.src = local;
    }
  }
  await writeFile(indexPath, JSON.stringify(idx, null, 2) + '\n', 'utf8');

  // Persist the map for reference.
  await writeFile(MAP_FILE, JSON.stringify(Object.fromEntries(urlMap), null, 2) + '\n', 'utf8');

  console.log(`\nDone.`);
  console.log(`  downloaded: ${ok}`);
  console.log(`  cached:     ${skipped}`);
  console.log(`  failed:     ${failed}`);
  console.log(`  rewritten:  ${rewritten} post files`);
  if (failures.length) {
    const failFile = path.join(ROOT, 'src', 'content', 'image-failures.json');
    await writeFile(failFile, JSON.stringify(failures, null, 2), 'utf8');
    console.log(`  failures logged: ${failFile}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
