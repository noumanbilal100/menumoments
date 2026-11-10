import Link from 'next/link';
import type { Crumb } from '@/lib/silo';

/** The visible breadcrumb; the last crumb is the current page and is not a link. */
export function Breadcrumbs({
  trail,
  className = 'mb-6 text-xs text-char-200',
  linkClassName = 'hover:text-ember-500',
}: {
  trail: Crumb[];
  className?: string;
  linkClassName?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={c.path} className={last ? 'truncate' : 'flex items-center gap-1.5'}>
              {last ? (
                <span aria-current="page">{c.name}</span>
              ) : (
                <>
                  <Link href={c.path} className={linkClassName}>
                    {c.name}
                  </Link>
                  <span aria-hidden>/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
