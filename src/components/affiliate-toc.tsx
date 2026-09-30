'use client';

import { useEffect, useRef, useState } from 'react';
import type { HeadingRef } from '@/lib/affiliate';

/**
 * Collapsible "In this guide" panel. Closed by default on every screen —
 * shows just a compact toggle pill. Clicking expands the list; clicking a
 * link, ESC, or clicking outside the panel closes it again. When open,
 * the currently-visible section is highlighted via IntersectionObserver.
 */
export function AffiliateTOC({ headings }: { headings: HeadingRef[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Scroll-spy — only runs while there are any headings.
  useEffect(() => {
    if (!headings.length) return;
    const nodes = headings
      .map((h) => document.getElementById(h.id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 },
    );
    for (const n of nodes) obs.observe(n);
    return () => obs.disconnect();
  }, [headings]);

  // Close on click-outside + escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!headings.length) return null;

  return (
    <nav aria-label="Guide contents" className="mb-8 lg:mb-0" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="affiliate-toc-panel"
        className="group flex w-full items-center justify-between gap-3 rounded-full border border-bone-200 bg-bone-100 px-4 py-2.5 text-left transition-colors hover:border-ember-300 hover:bg-ember-50 dark:border-char-500 dark:bg-char-500 dark:hover:bg-char-400"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-ember-100 text-ember-500 transition-colors group-hover:bg-ember-500 group-hover:text-white">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M2 2h8M2 6h8M2 10h5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">
              In this guide
            </span>
            <span className="block text-sm font-medium text-char-500 dark:text-bone-50">
              {headings.length} section{headings.length === 1 ? '' : 's'}
            </span>
          </span>
        </span>
        <span
          className={`text-ember-500 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path
              d="M3 5l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>
      </button>

      <div
        id="affiliate-toc-panel"
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <ol className="rounded-2xl border border-bone-200 bg-bone-100 p-3 text-sm shadow-card dark:border-char-500 dark:bg-char-500">
            {headings.map((h) => {
              const isActive = h.id === active;
              return (
                <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
                  <a
                    href={`#${h.id}`}
                    onClick={() => setOpen(false)}
                    className={`flex gap-2 border-l-2 py-1.5 pl-3 transition-colors ${
                      isActive
                        ? 'border-ember-500 text-ember-500'
                        : 'border-bone-200 text-char-200 hover:border-ember-300 hover:text-char-500 dark:border-char-400 dark:hover:text-bone-100'
                    }`}
                  >
                    <span className="line-clamp-2 leading-snug">{h.text}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </nav>
  );
}
