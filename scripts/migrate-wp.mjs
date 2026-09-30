#!/usr/bin/env node
/**
 * WordPress → local migration.
 *
 * Fetches every post from the WordPress REST API (paginated), normalizes it
 * into the shape our Next.js content adapter expects, and writes one JSON
 * file per post under `src/content/posts/<slug>.json`. Also emits an
 * `index.json` with a lightweight list of every migrated slug + metadata
 * so the site can list posts without loading every body.
 *
 * Usage:
 *   node scripts/migrate-wp.mjs
 *   WORDPRESS_API_URL=https://... node scripts/migrate-wp.mjs
 *
 * Idempotent — safe to re-run. Skips writes when nothing changed.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'src', 'content', 'posts');
const INDEX_FILE = path.join(ROOT, 'src', 'content', 'index.json');

const WP_API = process.env.WORDPRESS_API_URL ?? 'https://menumoments.com/wp-json/wp/v2';
const PER_PAGE = 100;

// -----------------------------------------------------------------------
// Fetch helpers
// -----------------------------------------------------------------------

async function fetchPage(page) {
  const url = `${WP_API}/posts?per_page=${PER_PAGE}&page=${page}&_embed=1&orderby=date&order=desc`;
  const res = await fetch(url, { headers: { 'User-Agent': 'menu-moments-migration/1.0' } });
  if (res.status === 400) {
    // WP returns 400 for pages past the end when combined with certain params.
    return { posts: [], totalPages: page - 1 };
  }
  if (!res.ok) throw new Error(`WP fetch failed (${res.status}): ${url}`);
  const posts = await res.json();
  const totalPages = Number(res.headers.get('x-wp-totalpages') ?? '1');
  return { posts, totalPages };
}

async function fetchAll() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    process.stdout.write(`  · page ${page}/${totalPages}\r`);
    const { posts, totalPages: tp } = await fetchPage(page);
    totalPages = tp || totalPages;
    all.push(...posts);
    page++;
  } while (page <= totalPages);
  process.stdout.write('\n');
  return all;
}

// -----------------------------------------------------------------------
// Normalization — matches Post shape in src/lib/content.ts
// -----------------------------------------------------------------------

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ');
}

function normalize(wp) {
  const featured = wp._embedded?.['wp:featuredmedia']?.[0];
  const author = wp._embedded?.author?.[0];
  const wpTerms =
    wp._embedded?.['wp:term']?.flat().filter((t) => t.taxonomy === 'category') ?? [];
  const wpCategorySlugs = wpTerms.map((t) => t.slug);

  const text = stripHtml(wp.content.rendered);
  return {
    slug: wp.slug,
    title: decode(wp.title.rendered),
    excerpt: decode(stripHtml(wp.excerpt.rendered)).trim(),
    html: wp.content.rendered,
    wpCategorySlugs,
    heroImage: featured
      ? {
          src: featured.source_url,
          alt: featured.alt_text || decode(wp.title.rendered),
          width: featured.media_details?.width ?? null,
          height: featured.media_details?.height ?? null,
        }
      : null,
    publishedAt: wp.date,
    updatedAt: wp.modified,
    readingMinutes: Math.max(1, Math.round(text.split(/\s+/).length / 220)),
    author: {
      name: author?.name ?? 'Menu Moments',
      avatar: author?.avatar_urls?.['96'] ?? null,
    },
  };
}

// -----------------------------------------------------------------------
// Write
// -----------------------------------------------------------------------

async function fileChanged(file, next) {
  if (!existsSync(file)) return true;
  try {
    const prev = await readFile(file, 'utf8');
    return prev !== next;
  } catch {
    return true;
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Migrating from ${WP_API}`);
  const raw = await fetchAll();
  console.log(`  ${raw.length} posts fetched`);

  let written = 0;
  let skipped = 0;
  const index = [];

  for (const wp of raw) {
    const post = normalize(wp);
    const json = JSON.stringify(post, null, 2) + '\n';
    const file = path.join(OUT_DIR, `${post.slug}.json`);
    if (await fileChanged(file, json)) {
      await writeFile(file, json, 'utf8');
      written++;
    } else {
      skipped++;
    }
    index.push({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      readingMinutes: post.readingMinutes,
      heroImage: post.heroImage
        ? { src: post.heroImage.src, alt: post.heroImage.alt }
        : null,
      wpCategorySlugs: post.wpCategorySlugs,
      author: post.author,
    });
  }

  // Sort index newest-first
  index.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  await writeFile(INDEX_FILE, JSON.stringify(index, null, 2) + '\n', 'utf8');

  console.log(`  wrote:   ${written}`);
  console.log(`  skipped: ${skipped} (unchanged)`);
  console.log(`  index:   ${INDEX_FILE}`);
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
