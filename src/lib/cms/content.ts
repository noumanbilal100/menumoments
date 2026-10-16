import { CATEGORIES, getCategory } from '@/data/taxonomy';
import { stripPastedMarkup } from '@/lib/clean-html';
import { commitChanges, listRepoDir, readRepoFile, type FileChange } from './store';

/**
 * Create / read / update / delete for posts and site pages.
 *
 * Published posts are `src/content/posts/<slug>.json` plus an entry in
 * `src/content/index.json`, which is what every listing on the site reads.
 * Drafts live in `src/content/drafts/` so nothing that reads the index ever
 * sees them. Site pages are `src/content/site-pages/<slug>.json` and carry
 * their own status.
 *
 * Note: `npm run migrate` regenerates posts and the index from the WordPress
 * export and would overwrite edits made here.
 */

export const POSTS_DIR = 'src/content/posts';
export const DRAFTS_DIR = 'src/content/drafts';
export const PAGES_DIR = 'src/content/site-pages';
const INDEX_FILE = 'src/content/index.json';
const UPLOADS_DIR = 'public/img/uploads';

export type Status = 'published' | 'draft';

export interface SeoFields {
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
}

/** On-disk shape of a post, identical to what the migration writes. */
export interface PostRecord {
  slug: string;
  title: string;
  excerpt: string;
  html: string;
  wpCategorySlugs: string[];
  heroImage: { src: string; alt: string; width?: number; height?: number } | null;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  author: { name: string; avatar: string | null };
  seo?: SeoFields & Record<string, string | undefined>;
}

export interface PageRecord {
  slug: string;
  title: string;
  lede?: string;
  html: string;
  status: Status;
  publishedAt: string;
  updatedAt?: string;
  seo?: SeoFields;
}

interface IndexEntry {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  heroImage: { src: string; alt: string } | null;
  wpCategorySlugs: string[];
  author: { name: string; avatar: string | null };
}

/** URL segments owned by routes, redirects or files, never usable as slugs. */
const RESERVED_SLUGS = new Set([
  'admin', 'api', 'blog', 'category', 'collections', 'search', 'shop', 'best-kitchen-gear',
  'about-us', 'contact', 'write-for-us', 'privacy-policy', 'terms-conditions', 'disclaimer',
  'feed', 'feed.xml', 'sitemap.xml', 'sitemap_index.xml', 'robots.txt', 'ads.txt',
  'wp-admin', 'wp-content', 'wp-json', 'img', '_next', 'favicon.ico',
]);

export class ValidationError extends Error {}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
    .replace(/-+$/g, '');
}

function nowStamp(): string {
  return new Date().toISOString().slice(0, 19);
}

/** "2026-02-11T13:41" from a datetime-local input → index format. */
export function toStamp(value: string | undefined): string {
  if (!value) return nowStamp();
  const m = value.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2})(?::(\d{2}))?)?/);
  if (!m) throw new ValidationError('Publish date is not a valid date.');
  return `${m[1]}T${m[2] ?? '00:00'}:${m[3] ?? '00'}`;
}

function plainText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[#a-z0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function readingMinutesFor(html: string): number {
  const words = plainText(html).split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function excerptFrom(html: string): string {
  const text = plainText(html);
  if (text.length <= 220) return text;
  return `${text.slice(0, 220).replace(/\s+\S*$/, '')}…`;
}

/**
 * Strips what must never be stored in an article: scripts, inline event
 * handlers and javascript: URLs — plus foreign classes from pasted content.
 */
export function sanitizeHtml(html: string): string {
  return stripPastedMarkup(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1=$2#$2')
    .trim();
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function clean(value: FormDataEntryValue | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function seoFrom(form: FormData): SeoFields | undefined {
  const seo: SeoFields = {
    seoTitle: clean(form.get('seoTitle')) || undefined,
    metaDescription: clean(form.get('metaDescription')) || undefined,
    focusKeyword: clean(form.get('focusKeyword')) || undefined,
  };
  return Object.values(seo).some(Boolean) ? seo : undefined;
}

async function readJson<T>(file: string): Promise<T | null> {
  const raw = await readRepoFile(file);
  return raw ? (JSON.parse(raw) as T) : null;
}

async function readIndex(): Promise<IndexEntry[]> {
  return (await readJson<IndexEntry[]>(INDEX_FILE)) ?? [];
}

function indexEntryFor(p: PostRecord): IndexEntry {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    publishedAt: p.publishedAt,
    updatedAt: p.updatedAt,
    readingMinutes: p.readingMinutes,
    heroImage: p.heroImage ? { src: p.heroImage.src, alt: p.heroImage.alt } : null,
    wpCategorySlugs: p.wpCategorySlugs,
    author: p.author,
  };
}

function sortIndex(entries: IndexEntry[]): IndexEntry[] {
  return [...entries].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

async function slugTaken(slug: string): Promise<string | null> {
  if (RESERVED_SLUGS.has(slug)) return 'is used by a built-in page';
  if (getCategory(slug)) return 'is a category URL';
  if ((await readIndex()).some((e) => e.slug === slug)) return 'is already used by a post';
  if (await readRepoFile(`${DRAFTS_DIR}/${slug}.json`)) return 'is already used by a draft';
  if (await readRepoFile(`${PAGES_DIR}/${slug}.json`)) return 'is already used by a page';
  return null;
}

function validSlug(slug: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 2 || slug.length > 100) {
    throw new ValidationError('URL slug may only contain lowercase letters, numbers and hyphens.');
  }
  return slug;
}

// ---------------------------------------------------------------------------
// Uploads
// ---------------------------------------------------------------------------

const IMAGE_TYPES: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/avif': 'avif',
};
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

/** Turns an uploaded File into a repository change plus its public URL. */
async function uploadChange(file: File, baseName: string): Promise<{ change: FileChange; url: string }> {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new ValidationError(`${file.name || 'Image'}: only WebP, JPEG, PNG, GIF or AVIF images can be uploaded.`);
  if (file.size > MAX_IMAGE_BYTES) throw new ValidationError(`${file.name || 'Image'} is larger than 3 MB.`);
  const now = new Date();
  const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
  const name = `${slugify(baseName) || 'image'}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return {
    change: { path: `${UPLOADS_DIR}/${folder}/${name}`, content: Buffer.from(await file.arrayBuffer()) },
    url: `/img/uploads/${folder}/${name}`,
  };
}

/**
 * Body images added in the editor arrive as files named `image:<id>` and are
 * referenced in the HTML as `src="pending:<id>"` until they have a path.
 */
async function resolvePendingImages(html: string, form: FormData, slug: string): Promise<{ html: string; changes: FileChange[] }> {
  const changes: FileChange[] = [];
  let out = html;
  for (const [key, value] of form.entries()) {
    if (!key.startsWith('image:') || !(value instanceof File) || value.size === 0) continue;
    const id = key.slice(6);
    if (!out.includes(`pending:${id}`)) continue;
    const { change, url } = await uploadChange(value, slug);
    changes.push(change);
    out = out.split(`pending:${id}`).join(url);
  }
  if (/pending:[a-z0-9-]+/i.test(out)) throw new ValidationError('An image in the content did not upload. Remove it and add it again.');
  return { html: out, changes };
}

async function heroFrom(
  form: FormData,
  slug: string,
  title: string,
): Promise<{ hero: PostRecord['heroImage']; changes: FileChange[] }> {
  const alt = clean(form.get('heroAlt')) || title;
  const file = form.get('heroFile');
  if (file instanceof File && file.size > 0) {
    const { change, url } = await uploadChange(file, `${slug}-hero`);
    return { hero: { src: url, alt }, changes: [change] };
  }
  const src = clean(form.get('heroSrc'));
  if (!src) return { hero: null, changes: [] };
  if (!src.startsWith('/img/')) throw new ValidationError('Hero image must be an uploaded image or a site path starting with /img/.');
  const width = Number(form.get('heroWidth')) || undefined;
  const height = Number(form.get('heroHeight')) || undefined;
  return { hero: { src, alt, ...(width ? { width } : {}), ...(height ? { height } : {}) }, changes: [] };
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export interface LoadedPost {
  record: PostRecord;
  status: Status;
}

export async function loadPost(slug: string): Promise<LoadedPost | null> {
  const published = await readJson<PostRecord>(`${POSTS_DIR}/${slug}.json`);
  if (published) return { record: published, status: 'published' };
  const draft = await readJson<PostRecord>(`${DRAFTS_DIR}/${slug}.json`);
  return draft ? { record: draft, status: 'draft' } : null;
}

export async function listDrafts(): Promise<PostRecord[]> {
  const names = (await listRepoDir(DRAFTS_DIR)).filter((n) => n.endsWith('.json'));
  const drafts = await Promise.all(names.map((n) => readJson<PostRecord>(`${DRAFTS_DIR}/${n}`)));
  return drafts
    .filter((d): d is PostRecord => Boolean(d))
    .sort((a, b) => (b.updatedAt ?? b.publishedAt).localeCompare(a.updatedAt ?? a.publishedAt));
}

/**
 * Creates (when `existing` is null) or updates a post from the editor form.
 * Moving between draft and published moves the file and the index entry.
 */
export async function savePost(form: FormData, existing: LoadedPost | null): Promise<{ slug: string; status: Status }> {
  const title = clean(form.get('title'));
  if (!title) throw new ValidationError('Title is required.');
  if (title.length > 200) throw new ValidationError('Title is longer than 200 characters.');

  const slug = existing ? existing.record.slug : validSlug(clean(form.get('slug')) || slugify(title));
  if (!existing) {
    const taken = await slugTaken(slug);
    if (taken) throw new ValidationError(`The URL /${slug}/ ${taken}.`);
  }

  const status: Status = form.get('status') === 'draft' ? 'draft' : 'published';
  const rawHtml = clean(form.get('html'));
  if (!plainText(rawHtml) && !/<img\b/i.test(rawHtml)) throw new ValidationError('Content is empty.');

  const body = await resolvePendingImages(sanitizeHtml(rawHtml), form, slug);
  const hero = await heroFrom(form, slug, title);

  const categories = form
    .getAll('categories')
    .map(String)
    .filter((c) => CATEGORIES.some((cat) => cat.slug === c));

  const previousSeo = existing?.record.seo ?? {};
  const seoInput = seoFrom(form);
  const seo = { ...previousSeo, seoTitle: undefined, metaDescription: undefined, focusKeyword: undefined, ...seoInput };
  const seoClean = Object.fromEntries(Object.entries(seo).filter(([, v]) => Boolean(v))) as PostRecord['seo'];

  const record: PostRecord = {
    slug,
    title,
    excerpt: clean(form.get('excerpt')) || excerptFrom(body.html),
    html: body.html,
    wpCategorySlugs: categories,
    heroImage: hero.hero,
    publishedAt: toStamp(clean(form.get('publishedAt')) || existing?.record.publishedAt),
    updatedAt: existing ? nowStamp() : undefined,
    readingMinutes: readingMinutesFor(body.html),
    author: { name: clean(form.get('author')) || existing?.record.author.name || 'Menu Moments', avatar: existing?.record.author.avatar ?? null },
    ...(seoClean && Object.keys(seoClean).length ? { seo: seoClean } : {}),
  };
  if (!record.updatedAt) delete record.updatedAt;

  const changes: FileChange[] = [...body.changes, ...hero.changes];
  const index = await readIndex();
  const withoutThis = index.filter((e) => e.slug !== slug);

  if (status === 'published') {
    changes.push({ path: `${POSTS_DIR}/${slug}.json`, content: json(record) });
    changes.push({ path: INDEX_FILE, content: json(sortIndex([...withoutThis, indexEntryFor(record)])) });
    if (existing?.status === 'draft') changes.push({ path: `${DRAFTS_DIR}/${slug}.json`, content: null });
  } else {
    changes.push({ path: `${DRAFTS_DIR}/${slug}.json`, content: json(record) });
    if (existing?.status === 'published') {
      changes.push({ path: `${POSTS_DIR}/${slug}.json`, content: null });
      changes.push({ path: INDEX_FILE, content: json(withoutThis) });
    }
  }

  const verb = !existing ? 'Add' : existing.status !== status ? (status === 'published' ? 'Publish' : 'Unpublish') : 'Update';
  await commitChanges(changes, `Admin: ${verb} ${status === 'draft' ? 'draft' : 'post'} "${title}"`);
  return { slug, status };
}

export async function deletePost(slug: string): Promise<void> {
  const loaded = await loadPost(validSlug(slug));
  if (!loaded) throw new ValidationError('That post no longer exists.');
  const changes: FileChange[] =
    loaded.status === 'draft'
      ? [{ path: `${DRAFTS_DIR}/${slug}.json`, content: null }]
      : [
          { path: `${POSTS_DIR}/${slug}.json`, content: null },
          { path: INDEX_FILE, content: json((await readIndex()).filter((e) => e.slug !== slug)) },
        ];
  await commitChanges(changes, `Admin: Delete ${loaded.status === 'draft' ? 'draft' : 'post'} "${loaded.record.title}"`);
}

// ---------------------------------------------------------------------------
// Site pages
// ---------------------------------------------------------------------------

export async function loadPage(slug: string): Promise<PageRecord | null> {
  return readJson<PageRecord>(`${PAGES_DIR}/${slug}.json`);
}

export async function listPages(): Promise<PageRecord[]> {
  const names = (await listRepoDir(PAGES_DIR)).filter((n) => n.endsWith('.json'));
  const pages = await Promise.all(names.map((n) => readJson<PageRecord>(`${PAGES_DIR}/${n}`)));
  return pages.filter((p): p is PageRecord => Boolean(p)).sort((a, b) => a.title.localeCompare(b.title));
}

export async function savePage(form: FormData, existing: PageRecord | null): Promise<{ slug: string }> {
  const title = clean(form.get('title'));
  if (!title) throw new ValidationError('Title is required.');
  const slug = existing ? existing.slug : validSlug(clean(form.get('slug')) || slugify(title));
  if (!existing) {
    const taken = await slugTaken(slug);
    if (taken) throw new ValidationError(`The URL /${slug}/ ${taken}.`);
  }
  const rawHtml = clean(form.get('html'));
  if (!plainText(rawHtml) && !/<img\b/i.test(rawHtml)) throw new ValidationError('Content is empty.');
  const body = await resolvePendingImages(sanitizeHtml(rawHtml), form, slug);

  const record: PageRecord = {
    slug,
    title,
    ...(clean(form.get('lede')) ? { lede: clean(form.get('lede')) } : {}),
    html: body.html,
    status: form.get('status') === 'draft' ? 'draft' : 'published',
    publishedAt: existing?.publishedAt ?? nowStamp(),
    ...(existing ? { updatedAt: nowStamp() } : {}),
    ...(seoFrom(form) ? { seo: seoFrom(form) } : {}),
  };
  await commitChanges(
    [...body.changes, { path: `${PAGES_DIR}/${slug}.json`, content: json(record) }],
    `Admin: ${existing ? 'Update' : 'Add'} page "${title}"`,
  );
  return { slug };
}

export async function deletePage(slug: string): Promise<void> {
  const page = await loadPage(validSlug(slug));
  if (!page) throw new ValidationError('That page no longer exists.');
  await commitChanges([{ path: `${PAGES_DIR}/${slug}.json`, content: null }], `Admin: Delete page "${page.title}"`);
}
