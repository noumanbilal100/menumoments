'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'mm.saved-posts';

export function PostActions({ slug, title }: { slug: string; title: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setSaved(list.includes(slug));
    } catch {}
  }, [slug]);

  function toggleSaved() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(next.includes(slug));
    } catch {}
  }

  function print() {
    if (typeof window !== 'undefined') window.print();
  }

  function share() {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
  }

  return (
    <div className="not-prose flex flex-wrap items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={toggleSaved}
        aria-pressed={saved}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
          saved
            ? 'border-clay-500 bg-clay-500 text-white'
            : 'border-ink-500/15 bg-bone-100 text-ink-500 hover:border-clay-500 hover:text-clay-500 dark:border-cream-50/15 dark:bg-ink-500 dark:text-cream-50'
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} aria-hidden="true">
          <path stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" d="M5 3h14v18l-7-4-7 4V3z" />
        </svg>
        {saved ? 'Saved' : 'Save'}
      </button>
      <button
        type="button"
        onClick={print}
        className="inline-flex items-center gap-2 rounded-full border border-ink-500/15 bg-bone-100 px-4 py-2 text-sm font-medium text-ink-500 transition hover:border-clay-500 hover:text-clay-500 dark:border-cream-50/15 dark:bg-ink-500 dark:text-cream-50"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path stroke="currentColor" strokeWidth="1.6" d="M6 9V3h12v6M6 18h12v3H6v-3z" />
          <rect x="3" y="9" width="18" height="9" stroke="currentColor" strokeWidth="1.6" fill="none" />
        </svg>
        Print
      </button>
      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-2 rounded-full border border-ink-500/15 bg-bone-100 px-4 py-2 text-sm font-medium text-ink-500 transition hover:border-clay-500 hover:text-clay-500 dark:border-cream-50/15 dark:bg-ink-500 dark:text-cream-50"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.6 10.5 15.4 6.5M8.6 13.5 15.4 17.5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        Share
      </button>
    </div>
  );
}

export function JumpToRecipe() {
  return (
    <a
      href="#recipe"
      className="not-prose inline-flex items-center gap-2 rounded-full bg-clay-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-clay-600 print:hidden"
    >
      Jump to recipe
      <span aria-hidden>↓</span>
    </a>
  );
}
