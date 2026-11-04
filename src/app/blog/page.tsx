import type { Metadata } from 'next';
import Link from 'next/link';
import { PostCard } from '@/components/post-card';
import { TrendingList } from '@/components/trending-list';
import { CollectionCard } from '@/components/collection-card';
import { SectionHeading } from '@/components/section-heading';
import { allListedPosts, listRecentPosts, getPost } from '@/lib/content';
import { CATEGORIES, SECTIONS, SectionKey } from '@/data/taxonomy';
import { liveCategoriesInSection } from '@/lib/category-map';
import { COLLECTIONS } from '@/data/collections';
import { pageMeta } from '@/lib/seo';
import { collectionJsonLd } from '@/lib/structured-data';
import { JsonLd } from '@/components/json-ld';
import { NewsletterForm } from '@/components/newsletter-form';

const TITLE = 'All Recipes, Kitchen Guides & Food Reviews';
const DESCRIPTION =
  'Browse every recipe, kitchen guide, gear review and restaurant menu on Menu Moments, from the newest posts to the full archive.';

export const revalidate = 3600;

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: '/blog/' });

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

  // Plain links to every post, so nothing is more than a couple of clicks from the homepage.
  const everyPost = allListedPosts();
  const archive = CATEGORIES.map((category) => ({
    category,
    posts: everyPost.filter((p) => p.categories[0] === category.slug),
  })).filter((group) => group.posts.length > 0);

  return (
    <div className="mx-auto max-w-wide px-6 pt-14 pb-24">
      <JsonLd data={collectionJsonLd({ name: TITLE, description: DESCRIPTION, path: '/blog/', posts })} />
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
              <NewsletterForm
                id="blog-newsletter"
                placeholder="Email"
                className="mt-4 flex flex-col gap-2"
                inputClassName="rounded-full border border-ink-500/15 bg-bone-100 px-4 py-2 text-sm outline-none focus:border-clay-500 dark:border-cream-50/15 dark:bg-ink-600"
                buttonClassName="rounded-full bg-clay-500 px-4 py-2 text-sm font-medium text-white hover:bg-clay-600"
              />
            </div>
          </div>
        </aside>
      </div>

      <section id="archive" className="mt-24 border-t border-cream-200 pt-14 dark:border-ink-500">
        <h2 className="font-display text-display-md text-ink-500 dark:text-cream-50">The full archive</h2>
        <p className="mt-3 max-w-xl text-ink-300">All {everyPost.length} posts, grouped by category.</p>
        <div className="mt-10 gap-10 md:columns-2 lg:columns-3">
          {archive.map(({ category, posts: inCategory }) => (
            <div key={category.slug} className="mb-10 break-inside-avoid">
              <h3 className="font-display text-xl text-ink-500 dark:text-cream-50">
                <Link href={`/category/${category.slug}`} className="hover:text-clay-500">
                  {category.name}
                </Link>
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {inCategory.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/${p.slug}`} className="text-ink-300 hover:text-clay-500">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
