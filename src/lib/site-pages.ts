import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { readContentFile } from './content-files';
import type { PageRecord } from './cms/content';

/**
 * Published site pages created in the admin. They render at /<slug>/
 * through the post route when no post owns the slug.
 *
 * scripts/export-content.mjs collects the published ones into a single
 * generated file before every build, so this works the same on Node hosts
 * and on Cloudflare Workers, and drafts never reach public assets. In local
 * development the folder is read directly so new pages show up at once.
 */
async function devPages(): Promise<PageRecord[] | null> {
  if (process.env.NODE_ENV !== 'development') return null;
  const dir = path.join(process.cwd(), 'src', 'content', 'site-pages');
  try {
    const names = (await readdir(dir)).filter((n) => n.endsWith('.json'));
    return Promise.all(names.map(async (n) => JSON.parse(await readFile(path.join(dir, n), 'utf8')) as PageRecord));
  } catch {
    return null;
  }
}

export async function listSitePages(): Promise<PageRecord[]> {
  let pages = await devPages();
  if (!pages) {
    const raw = await readContentFile('.generated/site-pages.json');
    try {
      pages = raw ? (JSON.parse(raw) as PageRecord[]) : [];
    } catch {
      pages = [];
    }
  }
  return pages.filter((p) => p.status === 'published');
}

export async function getSitePage(slug: string): Promise<PageRecord | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  return (await listSitePages()).find((p) => p.slug === slug) ?? null;
}
