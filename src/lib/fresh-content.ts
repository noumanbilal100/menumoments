import { cache } from 'react';
import type { Post } from './content';
import type { PageRecord } from './cms/content';
import { listRepoDirForPage, readRepoFileForPage } from './cms/store';
import { postFromFile, type PostFile } from './local-content';

/**
 * Posts and pages published in the admin after the running build.
 *
 * Every save commits to GitHub and starts a rebuild of the site, which takes
 * a couple of minutes, and longer when several saves queue up behind each
 * other. Until the rebuild that includes it goes live, a new post's address
 * would answer 404. Instead its page is read straight from the repository, so
 * it works the moment it is published; the homepage, categories and sitemaps
 * catch up with the rebuild.
 *
 * Only addresses the build does not know reach this, and the folder listing
 * is kept for half a minute, so the many made-up addresses bots try cost one
 * GitHub request per folder every 30 seconds, not one each. (GitHub lists up
 * to 1,000 files per folder; past that, a new post simply waits for its
 * rebuild as before.)
 *
 * Only settled values are kept between requests: a Worker must not hand one
 * request's pending fetch to another.
 */

const TTL_MS = 30_000;
const POSTS_DIR = 'src/content/posts';
const PAGES_DIR = 'src/content/site-pages';

const listings = new Map<string, { at: number; names: Set<string> | null }>();
const records = new Map<string, { at: number; value: unknown }>();

async function namesIn(dir: string): Promise<Set<string> | null> {
  const hit = listings.get(dir);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.names;
  const list = await listRepoDirForPage(dir);
  const names = list ? new Set(list) : null;
  listings.set(dir, { at: Date.now(), names });
  return names;
}

async function fileIn<T>(dir: string, slug: string): Promise<T | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) return null;
  const key = `${dir}/${slug}.json`;
  const hit = records.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T | null;

  let value: T | null = null;
  if ((await namesIn(dir))?.has(`${slug}.json`)) {
    const raw = await readRepoFileForPage(key);
    try {
      value = raw ? (JSON.parse(raw) as T) : null;
    } catch {
      value = null;
    }
  }
  // Old entries go, so made-up addresses don't pile up in memory.
  if (records.size > 200) for (const [k, v] of records) if (Date.now() - v.at >= TTL_MS) records.delete(k);
  records.set(key, { at: Date.now(), value });
  return value;
}

/** A published post the running build doesn't have yet. Drafts live in another folder and are never read here. */
export const getFreshPost = cache(async (slug: string): Promise<Post | null> => {
  const file = await fileIn<PostFile>(POSTS_DIR, slug);
  return file?.slug === slug && file.html ? postFromFile(file) : null;
});

/** A published admin page the running build doesn't have yet. */
export const getFreshSitePage = cache(async (slug: string): Promise<PageRecord | null> => {
  const page = await fileIn<PageRecord>(PAGES_DIR, slug);
  return page?.slug === slug && page.status === 'published' ? page : null;
});
