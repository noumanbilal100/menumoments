import type { Metadata } from 'next';
import Link from 'next/link';
import { PostCard } from '@/components/post-card';
import { TrendingList } from '@/components/trending-list';
import { CollectionCard } from '@/components/collection-card';
import { SectionHeading } from '@/components/section-heading';
import { listRecentPosts, getPost } from '@/lib/content';
import { SECTIONS, SectionKey } from '@/data/taxonomy';
import { liveCategoriesInSection } from '@/lib/category-map';
import { COLLECTIONS } from '@/data/collections';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'All posts',
  description: 'Every recipe, guide and review from Menu Moments.',
};

export default async function BlogIndex() {
  const posts = await listRecentPosts(60);
  const [featured, ...rest] = posts;
  const trending = posts.slice(1, 6);
  const feed = rest.slice(5);

  const collectionCovers = await Promise.all(
    COLLECTIONS.slice(0, 3).map(async (c) => {
      for (const s of c.postSlugs) {
        const p = await getPost(s);
        if (p?.heroImage) return { slug: c.slug, cover: p.heroImage.src };
      }
      return { slug: c.slug, cover: undefined };
    }),
  );
  const coverMap = new Map(collectionCovers.map((c) => [c.slug, c.cover]));

  return (
    <div className="mx-auto max-w-wide px-6 pt-14 pb-24">
      <header className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-clay-500">
            The blog
          </p>
          <h1 className="font-display text-display-xl text-ink-500 dark:text-cream-50">
            Everything, in one place.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-300">
            Browse the full library — Sunday bakes to weeknight one-pans, kitchen guides to
            restaurant menus. Filter by section or search below.
          </p>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border border-ink-500/20 bg-bone-100 px-4 py-2 text-sm font-medium transition hover:border-clay-500 hover:text-clay-500 dark:border-cream-50/20 dark:bg-ink-500"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" fill="none" />
            <path d="m17 17 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          Search &amp; filter
        </Link>
      </header>

      {/* Section chip nav ------------------------------------------- */}
      <nav aria-label="Sections" className="mb-14 flex flex-wrap gap-2 border-b border-cream-200 pb-6 dark:border-ink-500">
        <Link
          href="/blog"
          className="rounded-full bg-ink-500 px-4 py-1.5 text-sm font-medium text-cream-50"
        >
          All
        </Link>
        {(Object.keys(SECTIONS) as SectionKey[]).map((key) => {
          const firstCat = liveCategoriesInSection(key)[0];
          return (
            <Link
              key={key}
              href={`/category/${firstCat.slug}`}
              className="rounded-full border border-cream-200 px-4 py-1.5 text-sm font-medium text-ink-500 transition hover:border-clay-500 hover:text-clay-500 dark:border-ink-500 dark:text-cream-50"
            >
              {SECTIONS[key].name}
            </Link>
          );
        })}
        <Link
          href="/collections"
          className="rounded-full border border-clay-500 px-4 py-1.5 text-sm font-medium text-clay-500 transition hover:bg-clay-500 hover:text-white"
        >
          ★ Collections
        </Link>
      </nav>

      {/* Featured masthead ----------------------------------------- */}
      {featured && (
        <section className="mb-16 rounded-3xl border border-cream-200 bg-bone-100 p-6 shadow-card dark:border-ink-500 dark:bg-ink-500 lg:p-10">
          <PostCard post={featured} variant="featured" />
        </section>
      )}

      {/* Collections strip ----------------------------------------- */}
      <section className="mb-16">
        <SectionHeading eyebrow="Curated" title="Start with a collection" href="/collections" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.slice(0, 3).map((c) => (
            <CollectionCard key={c.slug} collection={c} cover={coverMap.get(c.slug)} />
          ))}
        </div>
      </section>

      {/* Feed + sidebar -------------------------------------------- */}
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <SectionHeading title="Latest" />
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
            {feed.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-10">
            <div className="rounded-2xl border border-cream-200 bg-cream-50 p-6 dark:border-ink-500 dark:bg-ink-500">
              <TrendingList posts={trending} />
            </div>
            <div className="rounded-2xl border border-cream-200 bg-bone-100 p-6 dark:border-ink-500 dark:bg-ink-500">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-clay-500">
                In your inbox
              </p>
              <p className="font-display text-lg leading-tight">
                One good recipe every Sunday.
              </p>
              <form className="mt-4 flex flex-col gap-2">
                <input
                  type="email"
                  required
                  placeholder="Email"
                  className="rounded-full border border-ink-500/15 bg-bone-100 px-4 py-2 text-sm outline-none focus:border-clay-500 dark:border-cream-50/15 dark:bg-ink-600"
                />
                <button
                  type="submit"
                  className="rounded-full bg-clay-500 px-4 py-2 text-sm font-medium text-white hover:bg-clay-600"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
