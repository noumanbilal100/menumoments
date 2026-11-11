'use client';

import type { ReactNode } from 'react';
import type { ToolIconName } from '@/data/tools';

/**
 * The shared look of the kitchen tools: a teal title band, large inputs,
 * pill toggles for units, and result tiles with the main answer picked out.
 */

export type { ToolIconName };

export function ToolIcon({ name, className = 'h-6 w-6' }: { name: ToolIconName; className?: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {name === 'butter' && (
        <g {...common}>
          <path d="M3.5 9.5 8 6h12.5v8.5L16 18H3.5z" />
          <path d="M3.5 9.5H16V18M16 9.5l4.5-3.5" />
          <path d="M7 9.5V18M10.5 9.5V18" />
        </g>
      )}
      {name === 'cup' && (
        <g {...common}>
          <path d="M5 5h11v12.5A2.5 2.5 0 0 1 13.5 20h-6A2.5 2.5 0 0 1 5 17.5z" />
          <path d="M16 8h1.5a2.5 2.5 0 0 1 0 5H16" />
          <path d="M8 9h3M8 12h3M8 15h3" />
        </g>
      )}
      {name === 'thermometer' && (
        <g {...common}>
          <path d="M10 4a2 2 0 0 1 4 0v10.3a4 4 0 1 1-4 0z" />
          <path d="M12 9v7" />
          <path d="M17 6h2M17 9h2M17 12h2" />
        </g>
      )}
      {name === 'scale' && (
        <g {...common}>
          <path d="M4 7h9M4 12h6M4 17h9" />
          <path d="M18 4v16M15.5 6.5 18 4l2.5 2.5M15.5 17.5 18 20l2.5-2.5" />
        </g>
      )}
      {name === 'airfryer' && (
        <g {...common}>
          <path d="M6 4h12a2 2 0 0 1 2 2v12.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5V6a2 2 0 0 1 2-2z" />
          <path d="M4 12.5h16" />
          <path d="M10 16h4" />
          <circle cx="12" cy="8.2" r="1.6" />
        </g>
      )}
      {name === 'oven' && (
        <g {...common}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
          <path d="M3.5 8h17" />
          <rect x="7" y="11" width="10" height="6.5" rx="1" />
          <path d="M7 5.8h.01M10 5.8h.01M13 5.8h.01" />
        </g>
      )}
    </svg>
  );
}

export function ToolShell({
  icon,
  title,
  subtitle,
  footnote,
  children,
}: {
  icon: ToolIconName;
  title: string;
  subtitle: string;
  footnote?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      data-mm-tool-shell
      className="my-5 overflow-hidden rounded-3xl sm:my-8 border border-bone-200 bg-bone-50 shadow-[0_24px_60px_-28px_rgba(30,43,42,0.40)] dark:border-char-400 dark:bg-char-600"
    >
      <div className="flex items-center gap-4 border-b-4 border-ember-500 bg-char-500 px-5 py-4 text-white md:px-7 md:py-5">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-saffron-300 text-char-500">
          <ToolIcon name={icon} className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-xl leading-tight md:text-2xl">{title}</p>
          <p className="mt-0.5 text-sm text-white/75">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-6 p-5 md:p-7">{children}</div>
      {footnote && (
        <div className="border-t border-bone-200 bg-bone-100 px-5 py-3 text-xs leading-relaxed text-char-200 dark:border-char-500 dark:bg-char-500 dark:text-bone-100 md:px-7">
          {footnote}
        </div>
      )}
    </section>
  );
}

export function Field({ label, htmlFor, children, className = '' }: { label: string; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-char-200 dark:text-bone-100">
          {label}
        </label>
      ) : (
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-char-200 dark:text-bone-100">{label}</p>
      )}
      {children}
    </div>
  );
}

export const bigInput =
  'w-full rounded-2xl border border-bone-300 bg-white px-4 py-3 font-display text-3xl tabular-nums text-char-500 outline-none transition focus:border-ember-500 focus:ring-4 focus:ring-ember-500/15 dark:border-char-400 dark:bg-char-500 dark:text-bone-50';

export const selectInput =
  'w-full rounded-2xl border border-bone-300 bg-white px-4 py-3.5 text-base font-medium text-char-500 outline-none transition focus:border-ember-500 focus:ring-4 focus:ring-ember-500/15 dark:border-char-400 dark:bg-char-500 dark:text-bone-50';

/** Pill toggles, for a handful of choices such as units. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1 rounded-2xl bg-bone-100 p-1.5 dark:bg-char-500">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              active
                ? 'bg-char-500 text-white shadow-sm'
                : 'text-char-300 hover:bg-white hover:text-ember-600 dark:text-bone-100 dark:hover:bg-char-400'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Small shortcut buttons ("1 cup", "350°F"). */
export function Presets({ items, onPick }: { items: { label: string; key: string }[]; onPick: (key: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-char-200 dark:text-bone-100">Quick picks</span>
      {items.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onPick(p.key)}
          className="rounded-full border border-ember-100 bg-ember-50 px-3 py-1 text-xs font-semibold text-ember-600 transition hover:border-ember-500 hover:bg-white dark:border-char-400 dark:bg-char-500 dark:text-ember-200"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/** The answers. The first tile is the main one and stands out. */
export function Results({ items, columns = 3 }: { items: { value: string; label: string }[]; columns?: 2 | 3 }) {
  return (
    <ul className={`grid gap-3 sm:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : ''}`} aria-live="polite">
      {items.map((r, i) => (
        <li
          key={r.label}
          className={
            i === 0
              ? 'rounded-2xl bg-ember-500 px-5 py-4 text-white shadow-embered'
              : 'rounded-2xl border border-bone-200 bg-bone-100 px-5 py-4 text-char-500 dark:border-char-500 dark:bg-char-500 dark:text-bone-50'
          }
        >
          <span className="block font-display text-3xl leading-tight tabular-nums">{r.value}</span>
          <span className={`mt-1 block text-xs font-semibold uppercase tracking-wider ${i === 0 ? 'text-white/80' : 'text-char-200 dark:text-bone-100'}`}>
            {r.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
