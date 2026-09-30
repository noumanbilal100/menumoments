import Link from 'next/link';

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = 'See all',
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-clay-500">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-display-md text-ink-500 dark:text-cream-50">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-clay-500 dark:text-cream-50"
        >
          {linkLabel}
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      )}
    </div>
  );
}
