#!/usr/bin/env node
/**
 * Prepares content for hosts without a filesystem at runtime.
 *
 * Cloudflare Workers cannot read project files at runtime, so before every
 * build this script:
 *   1. mirrors the published post bodies into public/_content/posts/, where
 *      src/lib/content-files.ts fetches them through the static-assets
 *      binding when node:fs is unavailable;
 *   2. writes src/content/.generated/post-meta.json — the per-post facts the
 *      admin dashboard needs (SEO metadata present, product photos still on a
 *      placeholder) — so it reads one small file instead of all 258 posts.
 *
 * Drafts are never mirrored: everything under public/ is publicly readable.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const postsDir = path.join(root, 'src', 'content', 'posts');
const pagesDir = path.join(root, 'src', 'content', 'pages');
const generatedDir = path.join(root, 'src', 'content', '.generated');
const mirrorDir = path.join(root, 'public', '_content');

const productImages = fs.readFileSync(path.join(root, 'src', 'data', 'product-images.ts'), 'utf8');
const photographedAsins = new Set([...productImages.matchAll(/^\s+([A-Z0-9]{10}):\s*'/gm)].map((m) => m[1]));

fs.rmSync(mirrorDir, { recursive: true, force: true });
fs.mkdirSync(path.join(mirrorDir, 'posts'), { recursive: true });
fs.mkdirSync(path.join(mirrorDir, '.generated'), { recursive: true });
fs.mkdirSync(generatedDir, { recursive: true });

const ANCHOR_IMG = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>\s*<img\b[^>]*\bsrc=["']\/img\/products\/[^"']+["'][^>]*>/gi;

const meta = [];
for (const name of fs.readdirSync(postsDir).filter((n) => n.endsWith('.json'))) {
  const raw = fs.readFileSync(path.join(postsDir, name), 'utf8');
  fs.writeFileSync(path.join(mirrorDir, 'posts', name), raw);
  const post = JSON.parse(raw);

  const gaps = [];
  const seen = new Set();
  for (const m of String(post.html ?? '').matchAll(ANCHOR_IMG)) {
    const asin = m[1].match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1] ?? '';
    if (asin && photographedAsins.has(asin)) continue;
    const product = (m[0].match(/\balt=["']([^"']*)["']/i)?.[1] ?? '').replace(/^\d+\.\s*/, '');
    const key = asin || product;
    if (seen.has(key)) continue;
    seen.add(key);
    gaps.push({ product: product || 'Unnamed product', asin });
  }

  meta.push({ slug: post.slug, hasSeo: Boolean(post.seo), productPhotoGaps: gaps });
}

const pageCount = fs.existsSync(pagesDir) ? fs.readdirSync(pagesDir).filter((n) => n.endsWith('.json')).length : 0;
const out = `${JSON.stringify({ pageCount, posts: meta }, null, 2)}\n`;
fs.writeFileSync(path.join(generatedDir, 'post-meta.json'), out);
fs.writeFileSync(path.join(mirrorDir, '.generated', 'post-meta.json'), out);

console.log(`export-content: mirrored ${meta.length} posts, ${meta.reduce((n, p) => n + p.productPhotoGaps.length, 0)} photo gaps, ${pageCount} legacy pages`);
