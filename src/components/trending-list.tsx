import Link from 'next/link';
import type { Post } from '@/lib/content';
import { getCategory } from '@/data/taxonomy';

export function TrendingList({ posts, title = 'Trending now' }: { posts: Post[]; title?: string }) {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-clay-500">
        {title}
      </p>
      <ol className="space-y-4">
        {posts.map((p, i) => {
          const cat = p.categories[0] ? getCategory(p.categories[0]) : undefined;
          return (
            <li key={p.slug}>
              <Link href={`/${p.slug}`} className="group flex gap-4">
                <span className="font-display text-3xl leading-none text-clay-200 group-hover:text-clay-500">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  {cat && (
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-clay-500">
                      {cat.name}
                    </p>
                  )}
                  <p className="mt-0.5 line-clamp-2 font-display text-sm leading-tight text-ink-500 group-hover:text-clay-500 dark:text-cream-50">
                    {p.title}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
