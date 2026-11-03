/**
 * Tells IndexNow engines (Bing, Yandex and others) about every URL in the sitemap.
 * ChatGPT search and Copilot lean on Bing's index, so this is the quick way in.
 *
 * Run after a deploy: npm run indexnow
 * The key file in public/ proves to the engines that this script speaks for the site.
 */
const HOST = 'menumoments.com';
const KEY = '396265fcb8f6c790eee05c608ea3dda6';
const SITEMAP = `https://${HOST}/sitemap_index.xml`;

const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
const fetchText = async (url) => (await fetch(url)).text();

const urlList = [];
for (const child of locs(await fetchText(SITEMAP))) urlList.push(...locs(await fetchText(child)));

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`Submitted ${urlList.length} URLs: ${res.status} ${res.statusText}`);
if (!res.ok) process.exit(1);
