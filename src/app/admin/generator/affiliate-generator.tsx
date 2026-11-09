'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, SECTIONS, type SectionKey } from '@/data/taxonomy';
import { savePostAction } from '@/app/admin/actions';
import { ContentForm } from '@/components/admin/content-form';
import { cardClass, inputClass, labelClass } from '@/components/admin/ui';
import { buildArticle, type BuiltArticle } from '@/lib/affiliate-generator/render';
import {
  masterPromptFor,
  readSection,
  sectionsFor,
  splitMasterReply,
  promptFor,
  type GuideData,
  type ReadResult,
  type OverviewData,
  type ReviewData,
  type WrapupData,
} from '@/lib/affiliate-generator/sections';
import {
  EMPTY_PRODUCT,
  EMPTY_SETUP,
  categoryFor,
  nounsFor,
  parseProductList,
  productProblems,
  senseUrl,
  type GenProduct,
  type GenSetup,
} from '@/lib/affiliate-generator/setup';

const STORAGE_KEY = 'mm-affiliate-generator';
const MAX_PRODUCTS = 20;

/** One prompt for the whole article, or one per section for long line-ups. */
type Mode = 'master' | 'sections';

interface Saved {
  setup: GenSetup;
  answers: Record<string, string>;
  touched: { nouns: boolean; category: boolean };
  mode?: Mode;
}

const smallButton =
  'rounded-lg border border-bone-200 px-3 py-1.5 text-xs font-medium text-char-300 hover:border-ember-500 hover:text-ember-500 disabled:opacity-40 dark:border-char-400 dark:text-bone-100';
const primaryButton =
  'rounded-lg bg-ember-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-600 disabled:cursor-not-allowed disabled:opacity-50';

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Older browsers, or a page without clipboard permission.
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
}

export function AffiliateGenerator() {
  const [setup, setSetup] = useState<GenSetup>(EMPTY_SETUP);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState({ nouns: false, category: false });
  const [mode, setMode] = useState<Mode>('master');
  const [loaded, setLoaded] = useState(false);
  const [bulk, setBulk] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [built, setBuilt] = useState<{ article: BuiltArticle; key: number } | null>(null);
  const editorAnchor = useRef<HTMLDivElement>(null);

  // Work in progress survives a refresh or a closed tab.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Saved | null;
      if (saved?.setup) {
        setSetup(saved.setup);
        setAnswers(saved.answers ?? {});
        setTouched(saved.touched ?? { nouns: true, category: true });
        setMode(saved.mode ?? 'master');
      }
    } catch {
      // Nothing usable saved.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ setup, answers, touched, mode } satisfies Saved));
    } catch {
      // Storage full or blocked; the work just isn't kept across reloads.
    }
  }, [setup, answers, touched, mode, loaded]);

  const sections = useMemo(() => sectionsFor(setup), [setup]);
  const masterReply = answers.master ?? '';
  const masterParts = useMemo(() => splitMasterReply(masterReply), [masterReply]);
  const results = useMemo(
    () =>
      Object.fromEntries(
        sections.map((s) => [s.id, readSection(s, (mode === 'master' ? masterParts[s.kind] : answers[s.id]) ?? '', setup)]),
      ) as Record<string, ReadResult>,
    [sections, answers, masterParts, mode, setup],
  );
  const overviewResult = results.overview?.value;

  // Part 1's reply names any product the editor left unnamed; the later prompts need those names.
  useEffect(() => {
    if (overviewResult?.kind !== 'overview') return;
    const picks = overviewResult.data.picks;
    if (!setup.products.some((p, i) => !p.name.trim() && picks[i + 1]?.name)) return;
    setSetup((s) => ({
      ...s,
      products: s.products.map((p, i) => (p.name.trim() || !picks[i + 1]?.name ? p : { ...p, name: picks[i + 1].name })),
    }));
  }, [overviewResult, setup.products]);
  const unnamed = setup.products.some((p) => !p.name.trim());
  const productIssues = setup.products.map(productProblems);
  const setupProblems = [
    ...(!setup.keyword.trim() ? ['Add the main keyword.'] : []),
    ...(!setup.singular.trim() || !setup.plural.trim() ? ['Fill in what is being compared.'] : []),
    ...(setup.products.length < 2 ? ['Add at least two products.'] : []),
    ...productIssues.flatMap((p, i) => (p.length ? [`Product ${i + 1} needs a ${p.join(', ')}.`] : [])),
  ];
  const missingRequired = sections.filter((s) => s.required && !results[s.id]?.value);
  const canBuild = !setupProblems.length && !missingRequired.length && !unnamed;

  function update(patch: Partial<GenSetup>) {
    setSetup((s) => ({ ...s, ...patch }));
  }

  function setKeyword(keyword: string) {
    setSetup((s) => ({
      ...s,
      keyword,
      ...(touched.nouns ? {} : nounsFor(keyword)),
      ...(touched.category ? {} : { category: keyword.trim() ? categoryFor(keyword) : '' }),
    }));
  }

  function setProduct(index: number, patch: Partial<GenProduct>) {
    setSetup((s) => ({
      ...s,
      products: s.products.map((p, i) => {
        if (i !== index) return p;
        const next = { ...p, ...patch };
        if (patch.url !== undefined) {
          const sensed = senseUrl(patch.url);
          if (!next.name.trim() && sensed.name) next.name = sensed.name;
          if (!next.image.trim() && sensed.image) next.image = sensed.image;
        }
        return next;
      }),
    }));
  }

  function moveProduct(index: number, by: number) {
    setSetup((s) => {
      const products = [...s.products];
      const target = index + by;
      if (target < 0 || target >= products.length) return s;
      [products[index], products[target]] = [products[target], products[index]];
      return { ...s, products };
    });
  }

  function addFromList() {
    const found = parseProductList(bulk);
    if (!found.length) return;
    setSetup((s) => {
      const kept = s.products.filter((p) => p.name.trim() || p.url.trim() || p.image.trim());
      return { ...s, products: [...kept, ...found].slice(0, MAX_PRODUCTS) };
    });
    setBulk('');
  }

  async function copyPrompt(id: string, text: string) {
    await copyText(text);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
  }

  function build() {
    const value = <K extends 'overview' | 'guide' | 'wrapup'>(id: string, kind: K) => {
      const v = results[id]?.value;
      return v && v.kind === kind ? v.data : null;
    };
    const reviews: Record<number, ReviewData> = {};
    for (const s of sections) {
      const v = results[s.id]?.value;
      if (v?.kind === 'reviews') Object.assign(reviews, v.data);
    }
    const article = buildArticle(setup, {
      overview: value('overview', 'overview') as OverviewData,
      guide: value('guide', 'guide') as GuideData | null,
      reviews,
      wrapup: value('wrapup', 'wrapup') as WrapupData | null,
    });
    setBuilt({ article, key: Date.now() });
    setTimeout(() => editorAnchor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function startOver() {
    if (!window.confirm('Clear the products and every pasted reply, and start a new article?')) return;
    setSetup(EMPTY_SETUP);
    setAnswers({});
    setTouched({ nouns: false, category: false });
    setBuilt(null);
  }

  const sectionKeys = Object.keys(SECTIONS) as SectionKey[];

  return (
    <div className="space-y-6">
      {/* 1. Topic ---------------------------------------------------------- */}
      <section className={`${cardClass} space-y-4 p-5`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">1. Topic</h2>
          <button type="button" onClick={startOver} className={smallButton}>
            Start a new article
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="gen-keyword" className={labelClass}>
              Main keyword
            </label>
            <input
              id="gen-keyword"
              value={setup.keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. best sushi making kits"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="gen-plural" className={labelClass}>
              What is being compared (plural)
            </label>
            <input
              id="gen-plural"
              value={setup.plural}
              onChange={(e) => {
                setTouched((t) => ({ ...t, nouns: true }));
                update({ plural: e.target.value });
              }}
              placeholder="sushi making kits"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="gen-singular" className={labelClass}>
              One of them (singular)
            </label>
            <input
              id="gen-singular"
              value={setup.singular}
              onChange={(e) => {
                setTouched((t) => ({ ...t, nouns: true }));
                update({ singular: e.target.value });
              }}
              placeholder="sushi making kit"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="gen-category" className={labelClass}>
              Topic category
            </label>
            <select
              id="gen-category"
              value={setup.category}
              onChange={(e) => {
                setTouched((t) => ({ ...t, category: true }));
                update({ category: e.target.value });
              }}
              className={inputClass}
            >
              <option value="">None</option>
              {sectionKeys.map((key) => (
                <optgroup key={key} label={SECTIONS[key].name}>
                  {CATEGORIES.filter((c) => c.section === key).map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-char-200">Buying guides and Best kitchen products are added automatically.</p>
          </div>
          <div>
            <label htmlFor="gen-notes" className={labelClass}>
              Notes for ChatGPT (optional)
            </label>
            <textarea
              id="gen-notes"
              rows={2}
              value={setup.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="e.g. Readers are beginners. Mention that kits with ingredients make good gifts."
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* 2. Products ------------------------------------------------------- */}
      <section className={`${cardClass} space-y-4 p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">2. Products, best first</h2>
          <p className="text-xs text-char-200">
            Only the link and image are needed; ChatGPT fills in missing names. Product 1 is your top pick.
          </p>
        </div>

        <details className="rounded-lg border border-dashed border-bone-300 p-3 dark:border-char-400">
          <summary className="cursor-pointer text-xs font-medium text-ember-500">Paste a whole list at once</summary>
          <p className="mt-2 text-[11px] leading-relaxed text-char-200">
            One product per line, or name, link and image on separate lines, in any order. Spreadsheet rows work too. Links
            and image addresses are told apart automatically.
          </p>
          <textarea
            rows={5}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder={'DELAMU 20-in-1 Sushi Making Kit | https://amzn.to/... | https://m.media-amazon.com/images/I/....jpg'}
            className={`${inputClass} font-mono text-xs`}
          />
          <button type="button" onClick={addFromList} disabled={!bulk.trim()} className={`${smallButton} mt-2`}>
            Add these products
          </button>
        </details>

        <ol className="space-y-3">
          {setup.products.map((p, i) => (
            <li key={i} className="rounded-lg border border-bone-200 p-3 dark:border-char-400">
              <div className="flex gap-3">
                <div className="flex w-20 shrink-0 flex-col items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-ember-500 text-xs font-semibold text-white">{i + 1}</span>
                  {p.image.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="h-16 w-16 rounded-md bg-white object-contain ring-1 ring-bone-200" />
                  ) : (
                    <span className="grid h-16 w-16 place-items-center rounded-md border border-dashed border-bone-300 text-[10px] text-char-200">
                      No image
                    </span>
                  )}
                </div>
                <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-2">
                  <input
                    aria-label={`Product ${i + 1} link`}
                    value={p.url}
                    onChange={(e) => setProduct(i, { url: e.target.value.trim() })}
                    placeholder="Affiliate link (https://amzn.to/...)"
                    className={`${inputClass} mt-0`}
                  />
                  <input
                    aria-label={`Product ${i + 1} image address`}
                    value={p.image}
                    onChange={(e) => setProduct(i, { image: e.target.value.trim() })}
                    placeholder="Image address (https://m.media-amazon.com/...)"
                    className={`${inputClass} mt-0`}
                  />
                  <input
                    aria-label={`Product ${i + 1} name`}
                    value={p.name}
                    onChange={(e) => setProduct(i, { name: e.target.value })}
                    placeholder="Product name (optional: ChatGPT fills it in from the link)"
                    className={`${inputClass} mt-0 md:col-span-2`}
                  />
                  <textarea
                    aria-label={`Product ${i + 1} known facts`}
                    rows={1}
                    value={p.facts}
                    onChange={(e) => setProduct(i, { facts: e.target.value })}
                    placeholder="Known facts for ChatGPT (optional): what's included, size, material…"
                    className={`${inputClass} mt-0 md:col-span-2`}
                  />
                  {productIssues[i].length > 0 && (p.url || p.image || p.name) && (
                    <p className="text-[11px] text-amber-600 md:col-span-2">Needs a {productIssues[i].join(', ')}.</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button type="button" aria-label="Move up" onClick={() => moveProduct(i, -1)} disabled={i === 0} className={smallButton}>
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    onClick={() => moveProduct(i, 1)}
                    disabled={i === setup.products.length - 1}
                    className={smallButton}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => update({ products: setup.products.filter((_, j) => j !== i) })}
                    className={smallButton}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => update({ products: [...setup.products, { ...EMPTY_PRODUCT }] })}
          disabled={setup.products.length >= MAX_PRODUCTS}
          className={smallButton}
        >
          + Add product
        </button>
      </section>

      {/* 3. Prompts -------------------------------------------------------- */}
      <section className={`${cardClass} space-y-4 p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">3. Write it with ChatGPT</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-char-200">
              {mode === 'master'
                ? 'Copy the master prompt into a new ChatGPT chat with web search on, then paste its whole reply below. If ChatGPT stops halfway, type “continue” in ChatGPT and paste that reply underneath the first one in the same box.'
                : 'Start with part 1. For each part: copy the prompt, paste it into a new ChatGPT chat with web search on, then paste ChatGPT’s whole reply in the box.'}{' '}
              If you change the products later, copy the prompt again.
            </p>
          </div>
          <div className="flex rounded-lg border border-bone-200 p-0.5 dark:border-char-400" role="group" aria-label="Prompt style">
            {(['master', 'sections'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  mode === m ? 'bg-char-500 text-white dark:bg-bone-50 dark:text-char-600' : 'text-char-300 dark:text-bone-100'
                }`}
              >
                {m === 'master' ? 'One master prompt' : 'Section by section'}
              </button>
            ))}
          </div>
        </div>
        {setupProblems.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            Finish steps 1 and 2 first: {setupProblems.slice(0, 3).join(' ')}
            {setupProblems.length > 3 ? ` (+${setupProblems.length - 3} more)` : ''}
          </div>
        )}
        {mode === 'master' ? (
          <div className="space-y-3 rounded-lg border border-bone-200 p-4 dark:border-char-400">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Master prompt</p>
                <p className="mt-0.5 text-xs text-char-200">The whole article in one go: intro, quick picks, buying guide, every review, FAQs and verdict.</p>
              </div>
              <button
                type="button"
                onClick={() => void copyPrompt('master', masterPromptFor(setup))}
                disabled={setupProblems.length > 0}
                className={primaryButton}
              >
                {copied === 'master' ? 'Copied ✓' : 'Copy master prompt'}
              </button>
            </div>
            <textarea
              aria-label="ChatGPT reply to the master prompt"
              rows={masterReply ? 10 : 4}
              value={masterReply}
              onChange={(e) => setAnswers((a) => ({ ...a, master: e.target.value }))}
              placeholder="Paste ChatGPT’s whole reply here, and any “continue” replies underneath it"
              className={`${inputClass} font-mono text-xs`}
            />
            {masterReply.trim() && !Object.keys(masterParts).length && (
              <p className="text-[11px] text-red-700 dark:text-red-300">
                No === parts found. Paste ChatGPT’s whole reply, including lines such as === OVERVIEW ===.
              </p>
            )}
            {masterReply.trim() && Object.keys(masterParts).length > 0 && (
              <ul className="space-y-2">
                {sections.map((s) => (
                  <li key={s.id} className="rounded-md bg-bone-100/70 px-3 py-2 dark:bg-char-400/40">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium">
                        {s.title}
                        {!s.required && <span className="ml-1.5 font-normal text-char-200">optional</span>}
                      </span>
                      <StatusChip result={results[s.id]} hasText={Boolean(masterParts[s.kind]?.trim())} />
                    </div>
                    {!masterParts[s.kind]?.trim() && s.required && (
                      <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
                        Not in the reply yet. If ChatGPT stopped early, type “continue” and paste its next reply underneath.
                      </p>
                    )}
                    <Messages result={results[s.id]} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <ol className="space-y-4">
            {sections.map((s, i) => {
              const r = results[s.id];
              const answer = answers[s.id] ?? '';
              const needsNames = s.kind !== 'overview' && unnamed;
              return (
                <li key={s.id} className="rounded-lg border border-bone-200 p-4 dark:border-char-400">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {i + 1}. {s.title}
                        {!s.required && <span className="ml-2 text-[11px] font-normal text-char-200">optional</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-char-200">{s.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusChip result={r} hasText={Boolean(answer.trim())} />
                      <button
                        type="button"
                        onClick={() => void copyPrompt(s.id, promptFor(s, setup))}
                        disabled={setupProblems.length > 0 || needsNames}
                        className={primaryButton}
                      >
                        {copied === s.id ? 'Copied ✓' : 'Copy prompt'}
                      </button>
                    </div>
                  </div>
                  {needsNames && !setupProblems.length && (
                    <p className="mt-2 text-[11px] text-char-200">
                      Paste the reply to part 1 first. It fills in the product names this prompt needs.
                    </p>
                  )}
                  <textarea
                    aria-label={`ChatGPT reply for ${s.title}`}
                    rows={answer ? 6 : 3}
                    value={answer}
                    onChange={(e) => setAnswers((a) => ({ ...a, [s.id]: e.target.value }))}
                    placeholder="Paste ChatGPT’s reply here"
                    className={`${inputClass} mt-3 font-mono text-xs`}
                  />
                  <Messages result={r} />
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* 4. Build ---------------------------------------------------------- */}
      <section className={`${cardClass} space-y-3 p-5`}>
        <h2 className="text-sm font-semibold">4. Build the post</h2>
        {canBuild ? (
          <p className="text-xs text-char-200">
            Everything needed is in.
            {sections.some((s) => !s.required && !results[s.id]?.value) &&
              ' The optional parts you skipped will simply be left out of the article.'}
          </p>
        ) : (
          <p className="text-xs text-char-200">
            {setupProblems.length
              ? 'Finish the topic and products first.'
              : missingRequired.length
                ? `Still needed: ${missingRequired.map((s) => s.title).join(', ')}.`
                : 'Some products still have no name. Type them in step 2.'}
          </p>
        )}
        <button type="button" onClick={build} disabled={!canBuild} className={primaryButton}>
          {built ? 'Rebuild the post' : 'Build the post'}
        </button>
      </section>

      <div ref={editorAnchor} />
      {built && (
        <section className="space-y-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
            The post is ready below. Add a featured image, check the content and categories, then press Create post.
          </div>
          <ContentForm
            key={built.key}
            kind="post"
            isNew
            action={savePostAction}
            values={{
              slug: built.article.slug,
              title: built.article.title,
              html: built.article.html,
              status: 'published',
              publishedAt: new Date().toISOString().slice(0, 16),
              author: 'Menu Moments',
              categories: built.article.categories,
              heroImage: null,
              heroAlt: built.article.heroAlt,
              excerpt: built.article.excerpt,
              seoTitle: built.article.seoTitle,
              metaDescription: built.article.metaDescription,
              focusKeyword: built.article.focusKeyword,
            }}
          />
        </section>
      )}
    </div>
  );
}

function StatusChip({ result, hasText }: { result: ReadResult | undefined; hasText: boolean }) {
  const state = result?.value ? 'ready' : hasText ? 'problem' : 'waiting';
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
        state === 'ready'
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
          : state === 'problem'
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            : 'bg-bone-100 text-char-300 dark:bg-char-400 dark:text-bone-100'
      }`}
    >
      {state === 'ready' ? '✓ Ready' : state === 'problem' ? 'Needs a fix' : 'Waiting for reply'}
    </span>
  );
}

function Messages({ result }: { result: ReadResult | undefined }) {
  return (
    <>
      {result?.errors.length ? (
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-[11px] text-red-700 dark:text-red-300">
          {result.errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
      {result?.warnings.length ? (
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-[11px] text-amber-700 dark:text-amber-300">
          {result.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
