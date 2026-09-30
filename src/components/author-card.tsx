import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/env';

export function AuthorCard({ author }: { author: { name: string; avatar?: string } }) {
  return (
    <aside className="not-prose my-14 rounded-2xl border border-cream-200 bg-cream-50 p-6 dark:border-ink-500 dark:bg-ink-500 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="shrink-0">
          {author.avatar ? (
            <Image
              src={author.avatar}
              alt={author.name}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-clay-100 font-display text-3xl text-clay-500">
              {author.name[0]}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-clay-500">
            About the author
          </p>
          <p className="mt-1 font-display text-2xl text-ink-500 dark:text-cream-50">{author.name}</p>
          <p className="mt-2 max-w-prose text-sm text-ink-300 md:text-base">
            {author.name === SITE.author
              ? `${SITE.author} founded ${SITE.name} to make good food less intimidating. A home cook first, she's spent the last decade testing recipes and hunting down the best kitchen gear so you don't have to.`
              : `${author.name} writes for ${SITE.name} on recipes, technique and the kitchen gear worth owning.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/about-us" className="font-medium text-clay-500 hover:text-clay-600">
              Read our story →
            </Link>
            <Link href="/write-for-us" className="font-medium text-ink-300 hover:text-clay-500">
              Write for us
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
