'use client';

import Link from 'next/link';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { CATEGORIES, SECTIONS, type SectionKey } from '@/data/taxonomy';
import type { ActionState } from '@/app/admin/actions';
import type { HeroImage } from '@/lib/cms/content';
import { RichEditor, type RichEditorHandle } from './rich-editor';
import { compressImage, extensionOf, formatBytes, renameFile, seoFileName } from './image-tools';
import { cardClass, inputClass as input, labelClass as label } from './ui';

/** Vercel rejects request bodies above 4.5 MB; leave room for the form. */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export interface ContentFormValues {
  slug: string;
  title: string;
  html: string;
  status: 'published' | 'draft';
  excerpt?: string;
  lede?: string;
  publishedAt?: string;
  author?: string;
  categories?: string[];
  heroImage?: HeroImage | null;
  /** Alt text to start with when there is no hero image yet. */
  heroAlt?: string;
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
}

function slugify(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

/** Words of a keyword that should show up in alt text; "best" and "for" don't count. */
function keywordWords(keyword: string): string[] {
  const skip = new Set(['best', 'top', 'the', 'a', 'an', 'for', 'and', 'of', 'in', 'on', 'to', 'with', 'under', 'vs']);
  return keyword
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !skip.has(w) && !/^\d+$/.test(w));
}

function mentions(text: string, keyword: string): boolean {
  const have = text.toLowerCase();
  const want = keywordWords(keyword);
  // "espresso machines" is found in "espresso machine": the last word may be singular.
  return want.length > 0 && want.every((w) => have.includes(w.replace(/(?:es|s)$/, '')));
}

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span aria-hidden className={ok ? 'text-emerald-600' : 'text-amber-600'}>
        {ok ? '✓' : '!'}
      </span>
      <span className={ok ? 'text-char-300 dark:text-bone-100' : 'text-amber-800 dark:text-amber-200'}>{children}</span>
    </li>
  );
}

function Counter({ value, max }: { value: string; max: number }) {
  const n = value.length;
  return (
    <span className={`text-[11px] ${n > max ? 'text-amber-600' : 'text-char-200'}`}>
      {n}/{max}
    </span>
  );
}

export function ContentForm({
  kind,
  values,
  isNew,
  action,
  liveUrl,
  savedNotice,
}: {
  kind: 'post' | 'page';
  values: ContentFormValues;
  isNew: boolean;
  action: (prev: ActionState | null, form: FormData) => Promise<ActionState>;
  liveUrl?: string;
  savedNotice?: string;
}) {
  const [state, dispatch, pending] = useActionState(action, null);
  const editor = useRef<RichEditorHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [seoTitle, setSeoTitle] = useState(values.seoTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(values.metaDescription ?? '');
  const [focusKeyword, setFocusKeyword] = useState(values.focusKeyword ?? '');
  const [hero, setHero] = useState(values.heroImage ?? null);
  const [heroFile, setHeroFile] = useState<{ file: File; url: string; width?: number; height?: number } | null>(null);
  const [heroAlt, setHeroAlt] = useState(values.heroImage?.alt ?? values.heroAlt ?? '');
  const [heroFileName, setHeroFileName] = useState<string | null>(null);
  const [bodyImages, setBodyImages] = useState({ total: 0, missingAlt: 0 });
  const [bodyTick, setBodyTick] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [clientError, setClientError] = useState('');

  // Alt text of the images in the content, recounted shortly after each edit.
  useEffect(() => {
    const timer = setTimeout(() => {
      const tags = (editor.current?.getHtml() ?? values.html).match(/<img\b[^>]*>/gi) ?? [];
      const missingAlt = tags.filter((t) => {
        const m = t.match(/\balt=(?:"([^"]*)"|'([^']*)')/i);
        return !(m?.[1] ?? m?.[2] ?? '').trim();
      }).length;
      setBodyImages({ total: tags.length, missingAlt });
    }, 400);
    return () => clearTimeout(timer);
  }, [bodyTick, values.html]);

  const heroName = heroFileName ?? seoFileName(heroAlt.trim() || focusKeyword || title);

  useEffect(() => {
    if (state?.ok) setDirty(false);
  }, [state]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    const save = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener('keydown', save);
    return () => window.removeEventListener('keydown', save);
  }, []);

  function submit(form: FormData) {
    setClientError('');
    const html = editor.current?.getHtml() ?? '';
    form.set('html', html);
    let bytes = 0;
    for (const [id, file] of editor.current?.pendingFiles() ?? []) {
      form.append(`image:${id}`, file);
      bytes += file.size;
    }
    if (heroFile) {
      // Saved under the SEO file name shown in the form.
      form.set('heroFile', renameFile(heroFile.file, heroName));
      if (heroFile.width) form.set('heroWidth', String(heroFile.width));
      if (heroFile.height) form.set('heroHeight', String(heroFile.height));
      bytes += heroFile.file.size;
    }
    if (bytes > MAX_UPLOAD_BYTES) {
      setClientError(
        `New images add up to ${formatBytes(bytes)}; one save can carry about 4 MB. Save with fewer new images, then add the rest.`,
      );
      return;
    }
    startTransition(() => dispatch(form));
  }

  async function pickHero(file: File | undefined) {
    if (!file) return;
    const small = await compressImage(file);
    setHeroFile({ ...small, url: URL.createObjectURL(small.file) });
    setHeroFileName(null);
    setDirty(true);
  }

  const heroPreview = heroFile?.url ?? hero?.src;
  const sectionKeys = Object.keys(SECTIONS) as SectionKey[];
  const message = clientError || state?.message || savedNotice;
  const messageOk = !clientError && (state ? state.ok : Boolean(savedNotice));

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        submit(new FormData(e.currentTarget));
      }}
      onChange={() => setDirty(true)}
      className="space-y-6"
    >
      {!isNew && <input type="hidden" name="existingSlug" value={values.slug} />}

      {message && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm ${
            messageOk
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
              : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column -------------------------------------------------- */}
        <div className="min-w-0 space-y-5">
          <div>
            <label htmlFor="title" className={label}>
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              maxLength={200}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder={kind === 'post' ? 'e.g. Easy Banana Bread Recipe' : 'e.g. Shipping policy'}
              className={`${input} text-lg font-semibold`}
            />
          </div>

          <div>
            <label htmlFor="slug" className={label}>
              URL
            </label>
            <div className="mt-1 flex items-center overflow-hidden rounded-lg border border-bone-200 bg-bone-100 text-sm dark:border-char-400 dark:bg-char-400">
              <span className="whitespace-nowrap px-3 text-char-200">menumoments.com/</span>
              <input
                id="slug"
                name="slug"
                value={slug}
                readOnly={!isNew}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                className="min-w-0 flex-1 bg-bone-50 px-2 py-2 text-char-500 outline-none read-only:bg-bone-100 read-only:text-char-300 dark:bg-char-600 dark:text-bone-50 dark:read-only:bg-char-400"
              />
              <span className="px-2 text-char-200">/</span>
            </div>
            {!isNew && (
              <p className="mt-1 text-[11px] text-char-200">
                The URL is fixed once created, so links and Google rankings keep working.
              </p>
            )}
          </div>

          <div>
            <p className={label}>Content</p>
            <div className="mt-1">
              <RichEditor
                initialHtml={values.html}
                handleRef={editor}
                onChange={() => {
                  setDirty(true);
                  setBodyTick((n) => n + 1);
                }}
              />
            </div>
          </div>

          {kind === 'post' ? (
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="excerpt" className={label}>
                  Excerpt
                </label>
                <span className="text-[11px] text-char-200">Leave empty to use the opening lines</span>
              </div>
              <textarea id="excerpt" name="excerpt" rows={3} defaultValue={values.excerpt} className={input} />
            </div>
          ) : (
            <div>
              <label htmlFor="lede" className={label}>
                Intro line under the title
              </label>
              <textarea id="lede" name="lede" rows={2} defaultValue={values.lede} className={input} />
            </div>
          )}

          <fieldset className={`${cardClass} space-y-4 p-5`}>
            <legend className="sr-only">Search engine settings</legend>
            <p className="text-sm font-semibold">Search engine (SEO)</p>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="seoTitle" className={label}>
                  SEO title
                </label>
                <Counter value={seoTitle} max={60} />
              </div>
              <input
                id="seoTitle"
                name="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title}
                className={input}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="metaDescription" className={label}>
                  Meta description
                </label>
                <Counter value={metaDescription} max={160} />
              </div>
              <textarea
                id="metaDescription"
                name="metaDescription"
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label htmlFor="focusKeyword" className={label}>
                Focus keyword
              </label>
              <input
                id="focusKeyword"
                name="focusKeyword"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                className={input}
              />
            </div>
            <div>
              <p className={label}>Image SEO</p>
              <ul className="mt-1.5 space-y-1 text-xs">
                <Check ok={Boolean(heroPreview)}>
                  {heroPreview ? 'Featured image added' : 'Add a featured image: it shows in Google, Discover and when the page is shared'}
                </Check>
                {heroPreview && (
                  <Check ok={heroAlt.trim().length >= 10 && heroAlt.trim() !== title.trim()}>
                    {heroAlt.trim().length >= 10 && heroAlt.trim() !== title.trim()
                      ? 'Featured image has its own alt text'
                      : 'Describe the featured image in its alt text, rather than repeating the title'}
                  </Check>
                )}
                {heroPreview && focusKeyword.trim() && (
                  <Check ok={mentions(heroAlt, focusKeyword)}>
                    {mentions(heroAlt, focusKeyword)
                      ? 'Focus keyword is in the featured image alt text'
                      : `Work “${focusKeyword.trim()}” into the featured image alt text, if it fits`}
                  </Check>
                )}
                {heroFile && (
                  <Check ok={heroName.length > 3}>
                    File name: {heroName || 'image'}
                    {extensionOf(heroFile.file)}
                  </Check>
                )}
                {bodyImages.total > 0 && (
                  <Check ok={bodyImages.missingAlt === 0}>
                    {bodyImages.missingAlt === 0
                      ? `All ${bodyImages.total} image${bodyImages.total === 1 ? '' : 's'} in the content have alt text`
                      : `${bodyImages.missingAlt} of ${bodyImages.total} images in the content have no alt text. Click one in the editor to add it.`}
                  </Check>
                )}
              </ul>
            </div>
            <div className="rounded-lg border border-bone-200 bg-white p-3 dark:border-char-400 dark:bg-char-600">
              <p className="text-[11px] text-char-200">Google preview</p>
              <p className="mt-1 truncate text-[15px] text-[#1a0dab] dark:text-[#8ab4f8]">{seoTitle || title || 'Title'}</p>
              <p className="truncate text-xs text-emerald-700">menumoments.com/{slug || 'url'}/</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-char-300 dark:text-bone-100">
                {metaDescription || 'Add a meta description to control the text Google shows.'}
              </p>
            </div>
          </fieldset>
        </div>

        {/* Side column -------------------------------------------------- */}
        <aside className="space-y-5">
          <div className={`${cardClass} space-y-4 p-5 xl:sticky xl:top-20`}>
            <div>
              <label htmlFor="status" className={label}>
                Status
              </label>
              <select id="status" name="status" defaultValue={values.status} className={input}>
                <option value="published">Published — visible on the site</option>
                <option value="draft">Draft — hidden from the site</option>
              </select>
            </div>
            {kind === 'post' && (
              <>
                <div>
                  <label htmlFor="publishedAt" className={label}>
                    Publish date
                  </label>
                  <input
                    id="publishedAt"
                    name="publishedAt"
                    type="datetime-local"
                    defaultValue={values.publishedAt?.slice(0, 16)}
                    className={input}
                  />
                </div>
                <div>
                  <label htmlFor="author" className={label}>
                    Author
                  </label>
                  <input id="author" name="author" defaultValue={values.author ?? 'Menu Moments'} className={input} />
                </div>
              </>
            )}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-ember-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ember-600 disabled:opacity-60"
            >
              {pending ? 'Saving…' : isNew ? `Create ${kind}` : 'Save changes'}
            </button>
            <p className="text-center text-[11px] text-char-200">Ctrl + S also saves</p>
            {liveUrl && (
              <Link href={liveUrl} target="_blank" className="block text-center text-xs font-medium text-ember-500 hover:underline">
                View on site ↗
              </Link>
            )}
          </div>

          <div className={`${cardClass} space-y-3 p-5`}>
            <div>
              <p className="text-sm font-semibold">Featured image</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-char-200">
                Shown at the top of the {kind}, in Google results and Discover, and when it is shared.
              </p>
            </div>
            {heroPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroPreview} alt="" className="aspect-[16/9] w-full rounded-lg bg-bone-100 object-cover" />
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center rounded-lg border border-dashed border-bone-300 text-xs text-char-200 dark:border-char-400">
                No featured image
              </div>
            )}
            {!heroFile && hero && (
              <>
                <input type="hidden" name="heroSrc" value={hero.src} />
                {hero.width && <input type="hidden" name="heroWidth" value={hero.width} />}
                {hero.height && <input type="hidden" name="heroHeight" value={hero.height} />}
              </>
            )}
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer rounded-lg border border-bone-200 px-3 py-2 text-center text-xs font-medium text-char-300 hover:border-ember-500 hover:text-ember-500 dark:border-char-400 dark:text-bone-100">
                {heroPreview ? 'Replace' : 'Upload image'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    void pickHero(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
              {heroPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setHero(null);
                    setHeroFile(null);
                    setDirty(true);
                  }}
                  className="rounded-lg border border-bone-200 px-3 py-2 text-xs text-char-300 hover:border-amber-500 hover:text-amber-600 dark:border-char-400 dark:text-bone-100"
                >
                  Remove
                </button>
              )}
            </div>
            {heroFile && (
              <p className="text-[11px] text-char-200">
                {formatBytes(heroFile.file.size)}
                {heroFile.width && heroFile.height ? ` · ${heroFile.width}×${heroFile.height}px` : ''} · uploads when you save
                {heroFile.width && heroFile.width < 1200 ? '. Google Discover prefers images at least 1200px wide.' : ''}
              </p>
            )}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="heroAlt" className={label}>
                  Alt text
                </label>
                <Counter value={heroAlt} max={125} />
              </div>
              <textarea
                id="heroAlt"
                name="heroAlt"
                rows={2}
                value={heroAlt}
                onChange={(e) => setHeroAlt(e.target.value)}
                placeholder="What the picture shows, e.g. Three espresso machines on a kitchen counter"
                className={input}
              />
            </div>
            <div>
              <label htmlFor="heroTitle" className={label}>
                Title (optional, shown on hover)
              </label>
              <input id="heroTitle" name="heroTitle" defaultValue={values.heroImage?.title} className={input} />
            </div>
            <div>
              <label htmlFor="heroCaption" className={label}>
                Caption (optional, shown under the image)
              </label>
              <input id="heroCaption" name="heroCaption" defaultValue={values.heroImage?.caption} className={input} />
            </div>
            {heroFile && (
              <div>
                <label htmlFor="heroFileName" className={label}>
                  File name
                </label>
                <div className="mt-1 flex items-center overflow-hidden rounded-lg border border-bone-200 bg-bone-100 text-sm dark:border-char-400 dark:bg-char-400">
                  <input
                    id="heroFileName"
                    value={heroName}
                    onChange={(e) => setHeroFileName(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                    className="min-w-0 flex-1 bg-bone-50 px-3 py-2 text-char-500 outline-none dark:bg-char-600 dark:text-bone-50"
                  />
                  <span className="px-2 text-char-200">{extensionOf(heroFile.file) || '.webp'}</span>
                </div>
                <p className="mt-1 text-[11px] text-char-200">Made from the alt text unless you change it.</p>
              </div>
            )}
          </div>

          {kind === 'post' && (
            <div className={`${cardClass} p-5`}>
              <p className="text-sm font-semibold">Categories</p>
              <div className="mt-3 max-h-80 space-y-4 overflow-y-auto pr-1">
                {sectionKeys.map((key) => (
                  <div key={key}>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-char-200">{SECTIONS[key].name}</p>
                    <div className="mt-1.5 space-y-1">
                      {CATEGORIES.filter((c) => c.section === key).map((c) => (
                        <label key={c.slug} className="flex items-center gap-2 text-sm text-char-300 dark:text-bone-100">
                          <input
                            type="checkbox"
                            name="categories"
                            value={c.slug}
                            defaultChecked={values.categories?.includes(c.slug)}
                            className="h-4 w-4 accent-ember-500"
                          />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-char-200">
                The highest ticked category in this list is the post&apos;s main one. If you tick
                none, the site files the post from words in its title.
              </p>
            </div>
          )}
        </aside>
      </div>
    </form>
  );
}
