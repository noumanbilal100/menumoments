#!/usr/bin/env node
/**
 * Cross-checks the local content store against the WP export XML and applies
 * safe repairs:
 *   1. Decodes lingering HTML entities in titles/excerpts (&#038; → &, etc.)
 *   2. Reports slugs that are in WP but not in local (missing posts)
 *   3. Re-tags obvious mis-categorised posts:
 *        - Any post whose only category is 'kitchen-appliances' but whose
 *          slug ends in '-recipe' or contains recipe keywords → moves to
 *          'recipes' as the primary WP category.
 *   4. Rebuilds src/content/index.json so the site reflects the changes.
 *
 * Idempotent — safe to re-run.
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');
const INDEX_FILE = path.join(ROOT, 'src', 'content', 'index.json');
const XML_FILE = path.resolve(ROOT, process.argv[2] ?? 'menumoments.WordPress.2026-09-30.xml');

const RECIPE_HINT = /(-recipe(-|$)|-recipes(-|$)|recipe-|cocktail|drink|dessert|cake|pasta|salad|soup|stew|casserole|smoothie|burger|sandwich|pancake|bread|pie|cookie|brownie|stuffing|dip|sauce|marinade)/i;

function decodeHtmlEntities(s) {
  if (!s || typeof s !== 'string') return s;
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#038;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8230;/g, '…')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ');
}

function wordCount(html) {
  return html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
}

async function main() {
  // ---- Load XML slug set for missing-check ------------------------------
  const wpSlugs = new Set();
  if (existsSync(XML_FILE)) {
    const xml = await readFile(XML_FILE, 'utf8');
    const re = /<item>[\s\S]*?<wp:post_name><!\[CDATA\[([^\]]+)\]\][\s\S]*?<wp:post_type><!\[CDATA\[([^\]]+)\]\][\s\S]*?<wp:status><!\[CDATA\[([^\]]+)\]\][\s\S]*?<\/item>/g;
    let m;
    while ((m = re.exec(xml))) {
      const [, slug, type, status] = m;
      if (type === 'post' && status === 'publish' && slug) wpSlugs.add(slug);
    }
    console.log(`XML: ${wpSlugs.size} published posts`);
  } else {
    console.log(`(XML file not found — skipping missing-check)`);
  }

  // ---- Walk local posts --------------------------------------------------
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.json'));
  console.log(`Local: ${files.length} posts`);

  let entityFixes = 0;
  let categoryFixes = 0;
  let wordCountFixes = 0;
  const localSlugs = new Set();
  const catFixExamples = [];

  for (const f of files) {
    const file = path.join(POSTS_DIR, f);
    const data = JSON.parse(await readFile(file, 'utf8'));
    localSlugs.add(data.slug);
    let changed = false;

    // 1. Decode HTML entities in title and excerpt
    const decodedTitle = decodeHtmlEntities(data.title);
    if (decodedTitle !== data.title) {
      data.title = decodedTitle;
      entityFixes++;
      changed = true;
    }
    const decodedExcerpt = decodeHtmlEntities(data.excerpt);
    if (decodedExcerpt !== data.excerpt) {
      data.excerpt = decodedExcerpt;
      changed = true;
    }
    if (data.seo?.seoTitle) {
      const dec = decodeHtmlEntities(data.seo.seoTitle);
      if (dec !== data.seo.seoTitle) {
        data.seo.seoTitle = dec;
        changed = true;
      }
    }
    if (data.heroImage?.alt) {
      const dec = decodeHtmlEntities(data.heroImage.alt);
      if (dec !== data.heroImage.alt) {
        data.heroImage.alt = dec;
        changed = true;
      }
    }

    // 2. Smart category re-mapping
    const cats = Array.isArray(data.wpCategorySlugs) ? data.wpCategorySlugs : [];
    if (cats.length === 1 && cats[0] === 'kitchen-appliances' && RECIPE_HINT.test(data.slug)) {
      data.wpCategorySlugs = ['recipes'];
      categoryFixes++;
      if (catFixExamples.length < 5) catFixExamples.push(data.slug);
      changed = true;
    }

    // 3. Refresh readingMinutes based on actual body word count
    const words = wordCount(data.html || '');
    const minutes = Math.max(1, Math.round(words / 220));
    if (minutes !== data.readingMinutes) {
      data.readingMinutes = minutes;
      wordCountFixes++;
      changed = true;
    }

    if (changed) {
      await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    }
  }

  // ---- Missing / extra reports ------------------------------------------
  const missingLocally = [...wpSlugs].filter((s) => !localSlugs.has(s));
  const extraLocally = [...localSlugs].filter((s) => wpSlugs.size && !wpSlugs.has(s));

  // ---- Refresh index.json -----------------------------------------------
  const index = [];
  for (const f of files) {
    const p = JSON.parse(await readFile(path.join(POSTS_DIR, f), 'utf8'));
    index.push({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      publishedAt: p.publishedAt,
      updatedAt: p.updatedAt,
      readingMinutes: p.readingMinutes,
      heroImage: p.heroImage ? { src: p.heroImage.src, alt: p.heroImage.alt } : null,
      wpCategorySlugs: p.wpCategorySlugs ?? [],
      author: p.author,
    });
  }
  index.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  await writeFile(INDEX_FILE, JSON.stringify(index, null, 2) + '\n', 'utf8');

  // ---- Report ------------------------------------------------------------
  console.log('');
  console.log('Repairs:');
  console.log(`  title entity fixes:    ${entityFixes}`);
  console.log(`  category re-tags:      ${categoryFixes}${catFixExamples.length ? ` (e.g. ${catFixExamples.join(', ')})` : ''}`);
  console.log(`  reading-time updates:  ${wordCountFixes}`);
  console.log('');
  if (missingLocally.length) {
    console.log(`Missing locally (${missingLocally.length}): ${missingLocally.join(', ')}`);
  } else if (wpSlugs.size) {
    console.log('No missing posts.');
  }
  if (extraLocally.length) {
    console.log(`Extra locally (${extraLocally.length}): ${extraLocally.slice(0, 5).join(', ')}${extraLocally.length > 5 ? '…' : ''}`);
  }
  console.log('');
  console.log('index.json rebuilt.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
