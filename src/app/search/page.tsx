import type { Metadata } from 'next';
import { listRecentPosts } from '@/lib/content';
import { SearchClient } from './search-client';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search recipes, guides and reviews on Menu Moments.',
};

export default async function SearchPage() {
  const posts = await listRecentPosts(200);
  const index = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    categories: p.categories,
    kind: p.kind,
    hero: p.heroImage?.src,
    diet: p.recipe?.diet ?? [],
    minutes: (p.recipe?.prepMinutes ?? 0) + (p.recipe?.cookMinutes ?? 0),
  }));
  return (
    <div className="mx-auto max-w-wide px-6 pt-14 pb-24">
      <header className="mb-10 max-w-2xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-clay-500">
          Search
        </p>
        <h1 className="font-display text-display-xl text-ink-500 dark:text-cream-50">
          Find your next recipe.
        </h1>
        <p className="mt-4 text-lg text-ink-300">
          Search across every recipe, guide and review — filter by section, diet or total time.
        </p>
      </header>
      <SearchClient index={index} />
    </div>
  );
}
