import type { Metadata } from 'next';
import { COLLECTIONS } from '@/data/collections';
import { CollectionCard } from '@/components/collection-card';
import { getPost } from '@/lib/content';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Curated roundups from the Menu Moments editors — weeknight dinners, cozy baking, kitchen upgrades and more.',
};

export default async function CollectionsIndex() {
  const covers = await Promise.all(
    COLLECTIONS.map(async (c) => {
      for (const s of c.postSlugs) {
        const p = await getPost(s);
        if (p?.heroImage) return { slug: c.slug, cover: p.heroImage.src };
      }
      return { slug: c.slug, cover: undefined };
    }),
  );
  const coverMap = new Map(covers.map((c) => [c.slug, c.cover]));

  return (
    <div className="mx-auto max-w-wide px-6 pt-16 pb-24">
      <header className="mb-14 max-w-2xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-clay-500">
          Editor-curated
        </p>
        <h1 className="font-display text-display-xl text-ink-500 dark:text-cream-50">
          Collections.
        </h1>
        <p className="mt-5 text-lg text-ink-300">
          The lists we come back to — weeknight dinners we actually cook, the baking projects
          worth heating the oven for, the kitchen gear that earns its counter space.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((c) => (
          <CollectionCard key={c.slug} collection={c} cover={coverMap.get(c.slug)} />
        ))}
      </div>
    </div>
  );
}
