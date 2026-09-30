#!/usr/bin/env node
/**
 * WordPress WXR (XML export) → local content merger.
 *
 * Consumes `wp-export.xml` (produced by WP Admin → Tools → Export → All content)
 * and enriches what the REST-API migration already wrote:
 *
 *   1. Yoast SEO meta (description, focus keyword, title override) → posts JSON
 *   2. WP Recipe Maker (and common recipe-schema) meta → posts JSON `recipeMeta`
 *   3. Manually-written excerpts (WP `<excerpt:encoded>`) override auto excerpts
 *   4. Static pages (post_type=page) → `src/content/pages/<slug>.json`
 *
 * Non-destructive: only fills fields that are missing or explicitly enriched.
 * Idempotent: safe to re-run.
 *
 * Usage:
 *   node scripts/merge-wp-export.mjs
 *   node scripts/merge-wp-export.mjs path/to/other-export.xml
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');
const PAGES_DIR = path.join(ROOT, 'src', 'content', 'pages');
const XML_FILE = path.resolve(ROOT, process.argv[2] ?? 'wp-export.xml');

// Yoast SEO keys we care about.
const YOAST_KEYS = {
  _yoast_wpseo_metadesc: 'metaDescription',
  _yoast_wpseo_focuskw: 'focusKeyword',
  _yoast_wpseo_title: 'seoTitle',
  _yoast_wpseo_canonical: 'canonical',
  _yoast_wpseo_opengraph_title: 'ogTitle',
  _yoast_wpseo_opengraph_description: 'ogDescription',
};

// Rank Math (alternative to Yoast) keys.
const RANKMATH_KEYS = {
  rank_math_description: 'metaDescription',
  rank_math_focus_keyword: 'focusKeyword',
  rank_math_title: 'seoTitle',
};

// WP Recipe Maker + common recipe plugin keys (there are many; we grab the
// popular ones and store the raw string for reference).
const RECIPE_KEYS = new Set([
  'wprm_recipe',
  'wprm_recipe_type',
  'wprm_recipe_summary',
  'wprm_recipe_prep_time',
  'wprm_recipe_cook_time',
  'wprm_recipe_total_time',
  'wprm_recipe_servings',
  'wprm_recipe_calories',
  'wprm_recipe_ingredients',
  'wprm_recipe_instructions',
  'mv_create_recipetype',
  'mv_create_prepTime',
  'mv_create_cookTime',
  'mv_create_servings',
]);

// -------------------------------------------------------------------------

async function main() {
  if (!existsSync(XML_FILE)) {
    console.error(`✗ XML file not found: ${XML_FILE}`);
    console.error(`  Place your WordPress export at "wp-export.xml" in the project root,`);
    console.error(`  or pass a path: node scripts/merge-wp-export.mjs path/to/file.xml`);
    process.exit(1);
  }

  console.log(`Reading ${XML_FILE}`);
  const xml = await readFile(XML_FILE, 'utf8');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
    parseTagValue: false,
    trimValues: true,
  });
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];

  console.log(`  ${list.length} items in export`);

  let postsEnriched = 0;
  let pagesWritten = 0;
  let seoFound = 0;
  let recipeFound = 0;
  let excerptOverrides = 0;
  const missingPosts = [];

  await mkdir(PAGES_DIR, { recursive: true });

  for (const item of list) {
    const postType = valueOf(item['wp:post_type']);
    const status = valueOf(item['wp:status']);
    const slug = valueOf(item['wp:post_name']);
    if (!slug || status !== 'publish') continue;

    const meta = normalizeMeta(item['wp:postmeta']);
    const seo = extractSeo(meta);
    const recipeMeta = extractRecipeMeta(meta);
    const manualExcerpt = readCdata(item['excerpt:encoded']).trim();

    if (postType === 'page') {
      const page = {
        slug,
        title: readCdata(item.title),
        html: readCdata(item['content:encoded']),
        excerpt: manualExcerpt,
        publishedAt: valueOf(item['wp:post_date_gmt']) || valueOf(item['wp:post_date']),
        updatedAt: valueOf(item['wp:post_modified_gmt']) || valueOf(item['wp:post_modified']),
        seo,
      };
      await writeFile(
        path.join(PAGES_DIR, `${slug}.json`),
        JSON.stringify(page, null, 2) + '\n',
        'utf8',
      );
      pagesWritten++;
      continue;
    }

    if (postType !== 'post') continue;

    const postFile = path.join(POSTS_DIR, `${slug}.json`);
    if (!existsSync(postFile)) {
      missingPosts.push(slug);
      continue;
    }

    const post = JSON.parse(await readFile(postFile, 'utf8'));
    let changed = false;

    if (Object.keys(seo).length) {
      post.seo = { ...(post.seo ?? {}), ...seo };
      seoFound++;
      changed = true;
    }

    if (Object.keys(recipeMeta).length) {
      post.recipeMeta = { ...(post.recipeMeta ?? {}), ...recipeMeta };
      recipeFound++;
      changed = true;
    }

    // Prefer a manually-written excerpt over the REST auto-generated one.
    // Only override if the manual excerpt is materially different.
    if (manualExcerpt && manualExcerpt !== post.excerpt) {
      post.excerpt = manualExcerpt;
      excerptOverrides++;
      changed = true;
    }

    if (changed) {
      await writeFile(postFile, JSON.stringify(post, null, 2) + '\n', 'utf8');
      postsEnriched++;
    }
  }

  console.log('');
  console.log(`  posts enriched:    ${postsEnriched}`);
  console.log(`    · SEO fields:    ${seoFound}`);
  console.log(`    · recipe meta:   ${recipeFound}`);
  console.log(`    · excerpts:      ${excerptOverrides}`);
  console.log(`  pages written:     ${pagesWritten}  → src/content/pages/`);
  if (missingPosts.length) {
    console.log(`  slugs in XML not in local store: ${missingPosts.length}`);
    console.log(`    (probably drafts, or new posts — re-run npm run migrate:text)`);
  }

  // Refresh the index so any excerpt changes show up in listings.
  await refreshIndex();
  console.log('  index.json refreshed');
  console.log('Done.');
}

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

function valueOf(node) {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return valueOf(node[0]);
  if (node.__cdata != null) return String(node.__cdata);
  if (node['#text'] != null) return String(node['#text']);
  return '';
}

function readCdata(node) {
  return valueOf(node);
}

function normalizeMeta(pm) {
  if (!pm) return {};
  const arr = Array.isArray(pm) ? pm : [pm];
  const out = {};
  for (const m of arr) {
    const key = valueOf(m['wp:meta_key']);
    const val = valueOf(m['wp:meta_value']);
    if (!key) continue;
    out[key] = val;
  }
  return out;
}

function extractSeo(meta) {
  const out = {};
  for (const [wpKey, ourKey] of Object.entries(YOAST_KEYS)) {
    const v = meta[wpKey];
    if (v) out[ourKey] = v;
  }
  for (const [wpKey, ourKey] of Object.entries(RANKMATH_KEYS)) {
    const v = meta[wpKey];
    if (v && !out[ourKey]) out[ourKey] = v;
  }
  return out;
}

function extractRecipeMeta(meta) {
  const out = {};
  for (const [k, v] of Object.entries(meta)) {
    if (!RECIPE_KEYS.has(k)) continue;
    if (!v) continue;
    // WPRM stores JSON blobs; try to parse.
    if (k === 'wprm_recipe' && v.trim().startsWith('{')) {
      try {
        out.wprm = JSON.parse(v);
        continue;
      } catch {
        /* fall through */
      }
    }
    out[k] = v;
  }
  return out;
}

async function refreshIndex() {
  const INDEX_FILE = path.join(ROOT, 'src', 'content', 'index.json');
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.json'));
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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
