'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/data/products';

type Sort = 'featured' | 'picks' | 'az';

function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function ShopCatalog({
  products,
  categories,
  buyUrls,
}: {
  products: Product[];
  categories: string[];
  /** Affiliate URL per ASIN, built on the server so the tag lives in one place. */
  buyUrls: Record<string, string>;
}) {
  const [category, setCategory] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('featured');

  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    const match = categories.find((c) => categorySlug(c) === fromHash);
    if (match) setCategory(match);
  }, [categories]);

  function pickCategory(next: string) {
    setCategory(next);
    const hash = next === 'all' ? '' : `#${categorySlug(next)}`;
    window.history.replaceState(null, '', `${window.location.pathname}${hash}`);
  }

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.note ?? '').toLowerCase().includes(q)),
    );
    if (sort === 'picks') list = [...list].sort((a, b) => Number(!a.verdict) - Number(!b.verdict));
    if (sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, category, query, sort]);

  return (
    <div id="catalog" className="scroll-mt-20">
      {/* Toolbar --------------------------------------------------------- */}
      <div className="rounded-2xl border border-bone-200 bg-white p-3 dark:border-char-400 dark:bg-char-500 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5" role="tablist" aria-label="Categories">
            <Chip active={category === 'all'} onClick={() => pickCategory('all')} count={products.length}>
              All products
            </Chip>
            {categories.map((c) => (
              <Chip key={c} active={category === c} onClick={() => pickCategory(c)} count={counts.get(c) ?? 0}>
                {c}
              </Chip>
            ))}
          </div>
          <div className="flex shrink-0 gap-2">
            <label className="relative flex-1 lg:w-64 lg:flex-none">
              <span className="sr-only">Search products</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-char-200"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full rounded-full border border-bone-200 bg-bone-100 py-2 pl-9 pr-3 text-sm text-char-500 outline-none placeholder:text-char-200 focus:border-ember-500 dark:border-char-400 dark:bg-char-500 dark:text-bone-50"
              />
            </label>
            <label className="shrink-0">
              <span className="sr-only">Sort products</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-full rounded-full border border-bone-200 bg-bone-100 px-3 py-2 text-sm text-char-300 outline-none focus:border-ember-500 dark:border-char-400 dark:bg-char-500 dark:text-bone-100"
              >
                <option value="featured">Featured</option>
                <option value="picks">Editor&apos;s picks first</option>
                <option value="az">Name A–Z</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-char-200" aria-live="polite">
        Showing <span className="font-semibold text-char-500 dark:text-bone-50">{visible.length}</span>{' '}
        {visible.length === 1 ? 'product' : 'products'}
        {category !== 'all' && <> in {category}</>}
        {query.trim() && <> matching &ldquo;{query.trim()}&rdquo;</>}
      </p>

      {/* Grid ------------------------------------------------------------ */}
      {visible.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <li key={p.asin}>
              <ProductCard product={p} buyUrl={buyUrls[p.asin]} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-bone-300 px-6 py-16 text-center dark:border-char-400">
          <p className="font-display text-xl text-char-500 dark:text-bone-50">Nothing matches that search</p>
          <p className="mt-2 text-sm text-char-200">Try a different word, or browse all products.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              pickCategory('all');
            }}
            className="mt-5 rounded-full bg-ember-500 px-5 py-2 text-sm font-medium text-white hover:bg-ember-600"
          >
            Show all products
          </button>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? 'border-char-500 bg-char-500 text-white dark:border-bone-50 dark:bg-bone-50 dark:text-char-600'
          : 'border-bone-200 bg-white text-char-300 hover:border-char-300 dark:border-char-400 dark:bg-char-500 dark:text-bone-100'
      }`}
    >
      {children}
      <span className={`text-xs ${active ? 'opacity-70' : 'text-char-200'}`}>{count}</span>
    </button>
  );
}

function ProductCard({ product: p, buyUrl }: { product: Product; buyUrl: string }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-bone-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-cardHover dark:border-char-400 dark:bg-char-500">
      <a
        href={buyUrl}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="relative block aspect-square overflow-hidden bg-white"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={p.image}
          alt=""
          fill
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 30vw, 45vw"
          className="object-contain p-5 transition-transform duration-500 group-hover:scale-105 sm:p-7"
        />
        {p.verdict && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-ember-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white sm:left-3 sm:top-3 sm:px-2.5 sm:py-1">
            {p.verdict}
          </span>
        )}
      </a>

      <div className="flex flex-1 flex-col border-t border-bone-200 p-3 dark:border-char-400 sm:p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-char-200 sm:text-[11px]">
          {p.category}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-char-500 dark:text-bone-50 sm:text-base">
          <a href={buyUrl} target="_blank" rel="sponsored nofollow noopener" className="hover:text-ember-500">
            {p.name}
          </a>
        </h3>
        {p.note && (
          <div className="mt-1.5 hidden sm:block">
            <p className="line-clamp-2 text-sm leading-relaxed text-char-200">{p.note}</p>
          </div>
        )}
        {p.highlights && p.highlights.length > 0 && (
          <ul className="mt-2.5 hidden flex-wrap gap-1 sm:flex">
            {p.highlights.map((h) => (
              <li
                key={h}
                className="rounded-md bg-bone-100 px-1.5 py-0.5 text-[11px] font-medium text-char-300 dark:bg-char-400 dark:text-bone-100"
              >
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-3 sm:pt-4">
          <a
            href={buyUrl}
            target="_blank"
            rel="sponsored nofollow noopener"
            className="flex w-full items-center justify-center gap-1.5 rounded-full border border-amazon-border bg-amazon px-3 py-2 text-xs font-semibold text-amazon-ink shadow-sm transition-colors hover:bg-amazon-hover sm:py-2.5 sm:text-sm"
          >
            View on Amazon
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <Link
            href={`/${p.guide}/`}
            className="mt-2 block text-center text-xs text-char-200 underline-offset-2 hover:text-ember-500 hover:underline"
          >
            Read our review
          </Link>
        </div>
      </div>
    </article>
  );
}
