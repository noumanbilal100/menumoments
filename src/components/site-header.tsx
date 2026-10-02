'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from './logo';
import { SECTIONS, SectionKey } from '@/data/taxonomy';
import { liveCategoriesInSection } from '@/lib/category-map';

const NAV_SECTIONS: SectionKey[] = [
  'recipes',
  'lifestyle',
  'kitchen-tips',
  'gear',
  'planning',
  'reviews',
];

export function SiteHeader() {
  const [open, setOpen] = useState<SectionKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream-50/85 backdrop-blur-md dark:border-ink-500 dark:bg-ink-600/85">
      <div className="mx-auto flex max-w-wide items-center justify-between gap-4 px-6 py-4">
        <Logo />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-sm font-medium">
            {NAV_SECTIONS.map((key) => (
              <li
                key={key}
                onMouseEnter={() => setOpen(key)}
                onMouseLeave={() => setOpen(null)}
                className="relative"
              >
                <button
                  className="nav-link py-2 text-ink-500 hover:text-clay-500 dark:text-cream-50"
                  onClick={() => setOpen(open === key ? null : key)}
                  aria-expanded={open === key}
                >
                  {SECTIONS[key].name}
                </button>
                {open === key && <MegaMenu section={key} onNavigate={() => setOpen(null)} />}
              </li>
            ))}
            <li>
              <Link
                href="/collections"
                className="nav-link py-2 text-clay-500 hover:text-clay-600"
              >
                Collections
              </Link>
            </li>
            <li>
              <Link href="/shop" className="nav-link py-2 text-clay-500 hover:text-clay-600">
                Shop
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-500/15 text-ink-500 transition hover:border-clay-500 hover:text-clay-500 dark:border-cream-50/15 dark:text-cream-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" fill="none" />
              <path d="m17 17 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </Link>
          <Link
            href="/write-for-us"
            className="hidden rounded-full border border-ink-500/20 px-4 py-2 text-sm font-medium text-ink-500 transition hover:border-clay-500 hover:text-clay-500 dark:border-cream-50/20 dark:text-cream-50 lg:inline-flex"
          >
            Write for us
          </Link>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-500/15 lg:hidden"
          >
            <span className="sr-only">Toggle menu</span>
            <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
              <path d={mobileOpen ? 'M2 2 L16 12 M16 2 L2 12' : 'M0 1 H18 M0 7 H18 M0 13 H18'} stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-cream-200 bg-cream-50 lg:hidden dark:border-ink-500 dark:bg-ink-600">
          <div className="mx-auto max-w-wide px-6 py-6">
            <Link
              href="/search"
              onClick={() => setMobileOpen(false)}
              className="mb-4 flex items-center gap-3 rounded-full border border-ink-500/15 bg-bone-100 px-4 py-3 text-sm dark:border-cream-50/15 dark:bg-ink-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" fill="none" />
                <path d="m17 17 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              <span className="text-ink-300">Search recipes, guides &amp; reviews</span>
            </Link>
            {NAV_SECTIONS.map((key) => (
              <details key={key} className="border-b border-cream-200 py-3 dark:border-ink-500">
                <summary className="flex cursor-pointer items-center justify-between font-display text-lg">
                  {SECTIONS[key].name}
                  <span className="text-clay-500">+</span>
                </summary>
                <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {liveCategoriesInSection(key).map((c) => (
                    <li key={c.slug}>
                      <Link
                        onClick={() => setMobileOpen(false)}
                        href={`/category/${c.slug}`}
                        className="block rounded-md px-2 py-1.5 hover:bg-cream-100 dark:hover:bg-ink-500"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            <div className="mt-6 flex flex-col gap-2 text-sm">
              <Link onClick={() => setMobileOpen(false)} href="/shop" className="rounded-md px-2 py-2 text-clay-500">
                ★ Shop
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/collections" className="rounded-md px-2 py-2 text-clay-500">
                ★ Collections
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/blog" className="rounded-md px-2 py-2">All posts</Link>
              <Link onClick={() => setMobileOpen(false)} href="/about-us" className="rounded-md px-2 py-2">About</Link>
              <Link onClick={() => setMobileOpen(false)} href="/contact" className="rounded-md px-2 py-2">Contact</Link>
              <Link onClick={() => setMobileOpen(false)} href="/write-for-us" className="rounded-md px-2 py-2">Write for us</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MegaMenu({ section, onNavigate }: { section: SectionKey; onNavigate: () => void }) {
  const cats = liveCategoriesInSection(section);
  return (
    <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
      <div className="w-[680px] rounded-2xl border border-cream-200 bg-bone-100 p-6 shadow-cardHover dark:border-ink-500 dark:bg-ink-600">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <p className="font-display text-lg">{SECTIONS[section].name}</p>
            <p className="mt-0.5 text-xs text-ink-300">{SECTIONS[section].tagline}</p>
          </div>
          <Link
            href={`/category/${cats[0].slug}`}
            onClick={onNavigate}
            className="text-xs font-medium text-clay-500 hover:text-clay-600"
          >
            See all {cats.length} →
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
          {cats.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/category/${c.slug}`}
                onClick={onNavigate}
                className="group flex items-baseline justify-between rounded-md px-2 py-1.5 text-sm hover:bg-cream-100 dark:hover:bg-ink-500"
              >
                <span className="font-medium text-ink-500 group-hover:text-clay-500 dark:text-cream-50">
                  {c.name}
                </span>
                <span className="text-clay-500 opacity-0 transition group-hover:opacity-100">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
