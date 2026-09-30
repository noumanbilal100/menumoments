#!/usr/bin/env node
/**
 * Scan every migrated post for affiliate links and produce a report.
 *
 * Outputs:
 *   - src/content/affiliates.json   — machine-readable audit
 *
 * The report captures every outbound link that matches a known affiliate
 * network, along with the anchor text and the posts it appears in — so
 * you can verify nothing is lost in the migration and quickly find
 * everything that pays a commission.
 */

import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');
const OUT_FILE = path.join(ROOT, 'src', 'content', 'affiliates.json');

// Network → matcher (host or path substring, case-insensitive).
const NETWORKS = [
  { name: 'Amazon Associates', tests: [/amzn\.to/i, /amazon\.[a-z.]+\/(dp|gp\/product|exec\/obidos)/i, /amazon\.[a-z.]+\/[^"']*[?&]tag=/i] },
  { name: 'ShareASale', tests: [/shareasale(-analytics)?\.com/i] },
  { name: 'Awin', tests: [/awin\d?\.com/i, /prf\.hn/i] },
  { name: 'Impact.com', tests: [/impact\.com/i, /pxf\.io/i] },
  { name: 'CJ (Commission Junction)', tests: [/anrdoezrs\.net/i, /dpbolvw\.net/i, /kqzyfj\.com/i, /jdoqocy\.com/i, /tkqlhce\.com/i] },
  { name: 'Rakuten Advertising', tests: [/linksynergy\.com/i, /click\.linksynergy/i, /rakuten\.com/i] },
  { name: 'Skimlinks', tests: [/go\.skimresources\.com/i, /go\.redirectingat\.com/i] },
  { name: 'Magiclinks', tests: [/go\.magik\.ly/i] },
  { name: 'ClickBank', tests: [/hop\.clickbank\.net/i] },
  { name: 'Etsy', tests: [/etsy\.com\/[^"']*[?&](?:aff|utm_source)=/i] },
  { name: 'Walmart', tests: [/walmart\.com\/ip\/.+[?&](?:athAsset|wmlspartner)=/i] },
  { name: 'Target', tests: [/target\.com\/p\/.+[?&](?:afid|tgtref)=/i] },
];

function classify(url) {
  for (const n of NETWORKS) {
    if (n.tests.some((r) => r.test(url))) return n.name;
  }
  return null;
}

async function main() {
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.json'));
  const linkIndex = new Map(); // url → { url, network, count, posts: {slug, text}[] }

  for (const f of files) {
    const post = JSON.parse(await readFile(path.join(POSTS_DIR, f), 'utf8'));
    const html = post.html ?? '';
    for (const m of html.matchAll(/<a[^>]*\shref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      const url = m[1];
      const raw = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const network = classify(url);
      if (!network) continue;
      if (!linkIndex.has(url)) {
        linkIndex.set(url, { url, network, count: 0, posts: [] });
      }
      const entry = linkIndex.get(url);
      entry.count++;
      entry.posts.push({ slug: post.slug, text: raw.slice(0, 120) });
    }
  }

  const byNetwork = new Map();
  for (const link of linkIndex.values()) {
    if (!byNetwork.has(link.network)) byNetwork.set(link.network, []);
    byNetwork.get(link.network).push(link);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    totals: {
      uniqueLinks: linkIndex.size,
      totalOccurrences: [...linkIndex.values()].reduce((n, l) => n + l.count, 0),
      networks: byNetwork.size,
    },
    byNetwork: [...byNetwork.entries()]
      .sort(([, a], [, b]) => b.length - a.length)
      .map(([network, links]) => ({
        network,
        uniqueLinks: links.length,
        occurrences: links.reduce((n, l) => n + l.count, 0),
        postsAffected: new Set(links.flatMap((l) => l.posts.map((p) => p.slug))).size,
        links: links
          .sort((a, b) => b.count - a.count)
          .map((l) => ({
            url: l.url,
            occurrences: l.count,
            firstText: l.posts[0]?.text ?? '',
            posts: [...new Set(l.posts.map((p) => p.slug))],
          })),
      })),
  };

  await writeFile(OUT_FILE, JSON.stringify(summary, null, 2) + '\n', 'utf8');

  console.log(`Affiliate audit complete.`);
  console.log(`  networks:         ${summary.totals.networks}`);
  console.log(`  unique links:     ${summary.totals.uniqueLinks}`);
  console.log(`  total mentions:   ${summary.totals.totalOccurrences}`);
  for (const n of summary.byNetwork) {
    console.log(`  · ${n.network}: ${n.uniqueLinks} links, ${n.occurrences} mentions in ${n.postsAffected} posts`);
  }
  console.log(`  report:           ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
