#!/usr/bin/env node
/**
 * Turns amazon-images-replaced.json into a worklist for commissioning or
 * generating replacement product photography.
 *
 * The raw report has one row per placeholder, which over-counts: the same
 * mixer shows up in four different guides, and a few rows carry a full alt
 * description instead of a product name. This collapses them to the actual
 * distinct products and writes a Markdown checklist.
 *
 * Usage: node scripts/product-image-worklist.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'src', 'content', 'amazon-images-replaced.json');
const OUT = path.join(ROOT, 'PRODUCT-IMAGES-TODO.md');

/** Alt text on the microwave rows is a sentence, not a name. */
function tidyName(raw) {
  let s = raw
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/^\d+[.)]\s*/, '')
    .replace(/^(Our\s+)?(Top Pick|Best Overall|Best Budget|Runner[- ]Up)\s*:\s*/i, '')
    .replace(/\s*(Review|Reviewed)\b.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // "Toshiba black and stainless steel microwave oven with digital…" →
  // "Toshiba Microwave Oven"
  if (s.length > 60) {
    const brand = s.match(
      /^(Toshiba|Farberware|Chefman|Black\+?Decker|Commercial Chef|Nostalgia|Panasonic|Samsung|LG|Breville|Cuisinart|KitchenAid|Hamilton Beach|Ninja|Bosch|Vitamix|Oster|NutriBullet|Blendtec|Magic Bullet)/i,
    );
    const kind = s.match(
      /\b(microwave|air fryer|blender|stand mixer|coffee maker|popover pan|refrigerator|cooler|oven)\b/i,
    );
    if (brand && kind) {
      s = `${brand[1]} ${kind[1].replace(/\b\w/g, (c) => c.toUpperCase())}`;
    } else {
      s = s.slice(0, 58).replace(/[\s,]+\S*$/, '');
    }
  }
  return s;
}

/** Collapse near-identical names so one photo covers every guide using it. */
function key(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/(series|quart|qt|cup|can|cans|inch|watt|w)\d*/g, '')
    .slice(0, 34);
}

function prompt(name) {
  return `Clean product photograph of a ${name} on a plain white seamless background, soft even studio lighting, subtle shadow beneath, product centred and filling most of the frame, photorealistic, no text, no logos, no watermarks, no hands, 4:3`;
}

async function main() {
  const rows = JSON.parse(await readFile(REPORT, 'utf8'));

  const groups = new Map();
  for (const r of rows) {
    const name = tidyName(r.product);
    if (!name || name.toLowerCase() === 'product') continue;
    const k = key(name);
    if (!groups.has(k)) groups.set(k, { name, files: new Set(), posts: new Set() });
    const g = groups.get(k);
    if (name.length > g.name.length) g.name = name; // keep the fullest wording
    g.files.add(path.basename(r.now));
    g.posts.add(r.post);
  }

  const items = [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));

  const lines = [
    '# Product images to replace',
    '',
    `${items.length} distinct products across ${rows.length} placeholder slots —`,
    'several products appear in more than one guide, so one photo can cover',
    'all of its slots.',
    '',
    '## How to use this',
    '',
    '1. Generate or shoot a photo for each product below.',
    '2. Save it into `public/img/products/` using **every** filename listed',
    '   for that product (same image, copied under each name), as `.webp`',
    '   or `.jpg`.',
    '3. Say the word and the data files get pointed at the new extensions.',
    '',
    'A prompt that works for AI image tools is included with each entry.',
    '',
    '---',
    '',
  ];

  items.forEach((it, i) => {
    lines.push(`### ${i + 1}. ${it.name}`);
    lines.push('');
    lines.push(`Appears in: ${[...it.posts].join(', ')}`);
    lines.push('');
    lines.push('Save as:');
    for (const f of it.files) lines.push(`- \`public/img/products/${f}\``);
    lines.push('');
    lines.push('```');
    lines.push(prompt(it.name));
    lines.push('```');
    lines.push('');
  });

  await writeFile(OUT, lines.join('\n'), 'utf8');

  console.log(`distinct products: ${items.length}`);
  console.log(`placeholder slots: ${rows.length}`);
  console.log(`worklist:          ${OUT}`);
  console.log('');
  items.forEach((it, i) =>
    console.log(`  ${String(i + 1).padStart(2)}. ${it.name}${it.files.size > 1 ? `  (${it.files.size} slots)` : ''}`),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
