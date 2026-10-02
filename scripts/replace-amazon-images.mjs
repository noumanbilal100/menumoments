#!/usr/bin/env node
/**
 * Replaces Amazon-hosted product photos with branded placeholders.
 *
 * The migration pulled product shots straight off Amazon's CDN (their
 * filenames still carry the -ac-sl#### signature). Amazon's Operating
 * Agreement only permits product images obtained through approved Program
 * Content — in practice the Product Advertising API, since the SiteStripe
 * image embeds were discontinued in December 2023. Self-hosting scraped
 * images is a violation, so they come out.
 *
 * Rather than deleting the <img> and leaving a hole, each one becomes a
 * generated SVG carrying the product name taken from the original alt
 * text. The surrounding affiliate link is untouched, so the layout and the
 * click-through both survive.
 *
 * Writes src/content/amazon-images-replaced.json listing what changed, so
 * real photography can be dropped in later.
 *
 * Usage:
 *   node scripts/replace-amazon-images.mjs
 *   node scripts/replace-amazon-images.mjs --dry-run
 */

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');
const OUT_DIR = path.join(ROOT, 'public', 'img', 'products');
const REPORT = path.join(ROOT, 'src', 'content', 'amazon-images-replaced.json');

const DRY = process.argv.includes('--dry-run');

/** Amazon CDN filenames keep their rendition suffix: -AC-SL1500, -AC-UX300… */
const AMAZON_IMAGE = /-ac-(sl|ux|uy|us|ul)\d+/i;

function slugify(s) {
  return (
    s
      .toLowerCase()
      .replace(/^\d+[.)]\s*/, '')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'product'
  );
}

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Break a product name onto at most three centred lines. */
function wrap(text, perLine = 22, maxLines = 3) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > perLine && line) {
      lines.push(line.trim());
      line = w;
      if (lines.length === maxLines) break;
    } else {
      line += ' ' + w;
    }
  }
  if (lines.length < maxLines && line.trim()) lines.push(line.trim());
  return lines.slice(0, maxLines);
}

function placeholderSvg(name) {
  const clean = name.replace(/^\d+[.)]\s*/, '').trim();
  const lines = wrap(clean);
  const startY = 150 - (lines.length - 1) * 15;
  const text = lines
    .map(
      (l, i) =>
        `<text x="200" y="${startY + i * 30}" text-anchor="middle" font-family="Georgia, serif" font-size="21" fill="#231F1B">${escapeXml(l)}</text>`,
    )
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300" role="img" aria-label="${escapeXml(clean)}">
  <rect width="400" height="300" fill="#F7F9F9"/>
  <rect x="10" y="10" width="380" height="280" fill="none" stroke="#E3E9E9" stroke-width="1.5"/>
  <circle cx="200" cy="72" r="24" fill="none" stroke="#2E7373" stroke-width="1.5"/>
  <text x="200" y="80" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-style="italic" fill="#2E7373">MM</text>
  ${text}
  <text x="200" y="258" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" letter-spacing="2.5" fill="#6E655E">MENU MOMENTS</text>
</svg>
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.json'));

  const report = [];
  let postsChanged = 0;
  let imagesReplaced = 0;
  const seen = new Map();

  for (const f of files) {
    const file = path.join(POSTS_DIR, f);
    const data = JSON.parse(await readFile(file, 'utf8'));
    const before = data.html ?? '';
    let html = before;
    let perPost = 0;

    // Swap the src on any <img> whose file came from Amazon, keeping alt.
    html = html.replace(
      /<img\b([^>]*?)src=(["'])([^"']+)\2([^>]*?)>/gi,
      (tag, pre, q, src, post) => {
        if (!AMAZON_IMAGE.test(src)) return tag;
        const altMatch = `${pre} ${post}`.match(/alt=(["'])([^"']*)\1/i);
        const name = (altMatch?.[2] ?? '').trim() || 'Product';
        const slug = slugify(name);
        let outName = seen.get(name);
        if (!outName) {
          outName = `${slug}.svg`;
          let n = 2;
          while ([...seen.values()].includes(outName)) outName = `${slug}-${n++}.svg`;
          seen.set(name, outName);
        }
        perPost++;
        report.push({ post: data.slug, product: name, was: src, now: `/img/products/${outName}` });
        return tag.replace(src, `/img/products/${outName}`);
      },
    );

    // The hero can be an Amazon shot too.
    if (data.heroImage?.src && AMAZON_IMAGE.test(data.heroImage.src)) {
      const name = data.heroImage.alt || data.title;
      const outName = `${slugify(name)}-hero.svg`;
      seen.set(`${name}::hero`, outName);
      report.push({
        post: data.slug,
        product: name,
        was: data.heroImage.src,
        now: `/img/products/${outName}`,
        hero: true,
      });
      if (!DRY) data.heroImage.src = `/img/products/${outName}`;
      perPost++;
    }

    if (html !== before || perPost) {
      postsChanged++;
      imagesReplaced += perPost;
      if (!DRY) {
        data.html = html;
        await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
      }
    }
  }

  if (!DRY) {
    const written = new Set();
    for (const r of report) {
      const outPath = path.join(OUT_DIR, path.basename(r.now));
      if (written.has(outPath)) continue;
      await writeFile(outPath, placeholderSvg(r.product), 'utf8');
      written.add(outPath);
    }
    await writeFile(REPORT, JSON.stringify(report, null, 2) + '\n', 'utf8');
  }

  console.log(`posts changed:     ${postsChanged}`);
  console.log(`images replaced:   ${imagesReplaced}`);
  console.log(`placeholders made: ${new Set(report.map((r) => r.now)).size}`);
  if (!DRY) console.log(`report:            ${REPORT}`);
  else console.log('\n(dry run — nothing written)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
