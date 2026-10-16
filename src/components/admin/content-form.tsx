'use client';

import Link from 'next/link';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { CATEGORIES, SECTIONS, type SectionKey } from '@/data/taxonomy';
import type { ActionState } from '@/app/admin/actions';
import { RichEditor, type RichEditorHandle } from './rich-editor';
import { compressImage, formatBytes } from './image-tools';
import { cardClass } from './ui';

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
  heroImage?: { src: string; alt: string; width?: number; height?: number } | null;
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
}

const input =
  'mt-1 w-full rounded-lg border border-bone-200 bg-bone-50 px-3 py-2 text-sm text-char-500 outline-none focus:border-ember-500 dark:border-char-400 dark:bg-char-600 dark:text-bone-50';
const label = 'text-xs font-medium text-char-300 dark:text-bone-100';

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
  const [hero, setHero] = useState(values.heroImage ?? null);
  const [heroFile, setHeroFile] = useState<{ file: File; url: string; width?: number; height?: number } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [clientError, setClientError] = useState('');

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
      form.set('heroFile', heroFile.file);
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
              <RichEditor initialHtml={values.html} handleRef={editor} onChange={() => setDirty(true)} />
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
              <input id="focusKeyword" name="focusKeyword" defaultValue={values.focusKeyword} className={input} />
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

          {kind === 'post' && (
            <div className={`${cardClass} space-y-3 p-5`}>
              <p className="text-sm font-semibold">Hero image</p>
              {heroPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroPreview} alt="" className="aspect-[16/9] w-full rounded-lg bg-bone-100 object-cover" />
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center rounded-lg border border-dashed border-bone-300 text-xs text-char-200 dark:border-char-400">
                  No hero image
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
              {heroFile && <p className="text-[11px] text-char-200">{formatBytes(heroFile.file.size)} · uploads when you save</p>}
              <div>
                <label htmlFor="heroAlt" className={label}>
                  Image description (alt text)
                </label>
                <input id="heroAlt" name="heroAlt" defaultValue={values.heroImage?.alt} className={input} />
              </div>
            </div>
          )}

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
                The site also files posts automatically from words in the title (for example
                &ldquo;recipe&rdquo; or &ldquo;menu&rdquo;).
              </p>
            </div>
          )}
        </aside>
      </div>
    </form>
  );
}
