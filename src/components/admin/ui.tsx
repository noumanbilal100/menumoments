import type { ReactNode } from 'react';

export const cardClass =
  'rounded-xl border border-bone-200 bg-bone-50 shadow-[0_1px_2px_rgba(15,13,11,0.04)] dark:border-char-400 dark:bg-char-500';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-char-200">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold tracking-tight">{children}</h2>
      {aside}
    </div>
  );
}

type Tone = 'neutral' | 'good' | 'warn' | 'muted';

const TONE_TEXT: Record<Tone, string> = {
  neutral: 'text-char-500 dark:text-bone-50',
  good: 'text-emerald-600 dark:text-emerald-400',
  warn: 'text-amber-600 dark:text-amber-400',
  muted: 'text-char-200',
};

const TONE_BAR: Record<Tone, string> = {
  neutral: 'bg-ember-500',
  good: 'bg-emerald-500',
  warn: 'bg-amber-500',
  muted: 'bg-char-100',
};

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = 'neutral',
  progress,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  tone?: Tone;
  /** 0–1 fill for a thin progress bar under the figure. */
  progress?: number;
}) {
  return (
    <div className={`${cardClass} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-char-200">{label}</p>
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ember-50 text-ember-500 dark:bg-char-400 dark:text-ember-300">
            {icon}
          </span>
        )}
      </div>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${TONE_TEXT[tone]}`}>{value}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bone-200 dark:bg-char-400">
          <div
            className={`h-full rounded-full ${TONE_BAR[tone]}`}
            style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }}
          />
        </div>
      )}
      {sub && <p className="mt-2 text-xs text-char-200">{sub}</p>}
    </div>
  );
}

export function Badge({
  children,
  tone = 'muted',
}: {
  children: ReactNode;
  tone?: 'good' | 'warn' | 'muted' | 'info';
}) {
  const cls = {
    good: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-900/30 dark:text-emerald-300',
    warn: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300',
    info: 'bg-ember-50 text-ember-600 ring-ember-500/15 dark:bg-ember-700/30 dark:text-ember-200',
    muted: 'bg-bone-100 text-char-300 ring-char-200/20 dark:bg-char-400 dark:text-bone-100',
  }[tone];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${cls}`}
    >
      {children}
    </span>
  );
}

/** Inline 20px stroke icons so the admin has no icon-library dependency. */
const ICON_PATHS = {
  overview: 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  posts: 'M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6',
  categories: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  images: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9.5h.01',
  seo: 'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4',
  clock: 'M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z',
  ads: 'M4 6h16v12H4zM8 10h8M8 14h5',
  pages: 'M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18',
} as const;

export type IconName = keyof typeof ICON_PATHS;

export function Icon({ name, className = 'h-4 w-4' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
