'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { CATEGORIES, SECTIONS, SectionKey } from '@/data/taxonomy';

interface Item {
  slug: string;
  title: string;
  excerpt: string;
  categories: string[];
  kind: string;
  hero?: string;
  diet: string[];
  minutes: number;
}

const DIETS = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'keto', 'low-carb', 'quick'];
const TIMES: Array<{ label: string; max: number }> = [
  { label: 'Any time', max: 999 },
  { label: '≤ 30 min', max: 30 },
  { label: '≤ 60 min', max: 60 },
];

export function SearchClient({ index }: { index: Item[] }) {
  const [q, setQ] = useState('');
  const [section, setSection] = useState<SectionKey | 'all'>('all');
  const [diet, setDiet] = useState<string | 'all'>('all');
  const [time, setTime] = useState(0);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return index.filter((item) => {
      if (needle && !`${item.title} ${item.excerpt} ${item.categories.join(' ')}`.toLowerCase().includes(needle)) return false;
      if (section !== 'all') {
        const sectionCats = new Set(
          CATEGORIES.filter((c) => c.section === section).map((c) => c.slug),
        );
        if (!item.categories.some((c) => sectionCats.has(c as never))) return false;
      }
      if (diet !== 'all' && !item.diet.includes(diet)) return false;
      const maxTime = TIMES[time].max;
      if (maxTime < 999 && item.minutes > 0 && item.minutes > maxTime) return false;
      return true;
    });
  }, [q, section, diet, time, index]);

  return (
    <div>
      <div className="rounded-3xl border border-cream-200 bg-cream-50 p-6 dark:border-ink-500 dark:bg-ink-500">
        <label htmlFor="q" className="sr-only">Search</label>
        <div className="flex items-center gap-3 rounded-full border border-ink-500/15 bg-bone-100 px-5 py-3 dark:border-cream-50/15 dark:bg-ink-600">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" fill="none" />
            <path d="m17 17 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try 'sheet pan chicken' or 'stand mixer'"
            className="flex-1 border-0 bg-transparent text-base outline-none placeholder:text-ink-300"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              className="text-xs font-medium text-clay-500 hover:text-clay-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters -------------------------------------------------- */}
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <FilterGroup label="Section">
            <FilterChip active={section === 'all'} onClick={() => setSection('all')}>
              All
            </FilterChip>
            {(Object.keys(SECTIONS) as SectionKey[]).map((s) => (
              <FilterChip key={s} active={section === s} onClick={() => setSection(s)}>
                {SECTIONS[s].name}
              </FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label="Diet">
            <FilterChip active={diet === 'all'} onClick={() => setDiet('all')}>
              Any
            </FilterChip>
            {DIETS.map((d) => (
              <FilterChip key={d} active={diet === d} onClick={() => setDiet(d)}>
                {d.replace('-', ' ')}
              </FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label="Time">
            {TIMES.map((t, i) => (
              <FilterChip key={t.label} active={time === i} onClick={() => setTime(i)}>
                {t.label}
              </FilterChip>
            ))}
          </FilterGroup>
        </div>
      </div>

      <p className="mt-8 text-sm text-ink-300">
        {results.length} result{results.length === 1 ? '' : 's'}
      </p>

      {results.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-cream-200 p-10 text-center text-ink-300 dark:border-ink-500">
          Nothing matched. Try loosening a filter or a different search term.
        </p>
      ) : (
        <ul className="mt-6 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <li key={r.slug}>
              <Link href={`/${r.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-cream-100">
                  {r.hero && (
                    <Image
                      src={r.hero}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-clay-500">
                  {r.kind}
                </p>
                <p className="mt-1 line-clamp-2 font-display text-lg leading-tight text-ink-500 group-hover:text-clay-500 dark:text-cream-50">
                  {r.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-300">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition ${
        active
          ? 'border-clay-500 bg-clay-500 text-white'
          : 'border-ink-500/15 bg-bone-100 text-ink-500 hover:border-clay-500 hover:text-clay-500 dark:border-cream-50/15 dark:bg-ink-500 dark:text-cream-50'
      }`}
    >
      {children}
    </button>
  );
}
