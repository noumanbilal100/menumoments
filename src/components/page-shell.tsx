import Link from 'next/link';

interface Props {
  eyebrow?: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}

export function PageShell({ eyebrow, title, lede, children }: Props) {
  return (
    <div>
      <header className="border-b border-cream-200 bg-cream-50 dark:border-ink-500 dark:bg-ink-600">
        <div className="mx-auto max-w-3xl px-6 pt-16 pb-12 lg:pt-24">
          {eyebrow && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-clay-500">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-display-xl text-ink-500 dark:text-cream-50">{title}</h1>
          {lede && <p className="mt-6 max-w-prose text-lg text-ink-300">{lede}</p>}
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="prose-article">{children}</div>
      </div>
    </div>
  );
}
