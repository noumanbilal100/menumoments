import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { PostCard } from '@/components/post-card';
import { TrendingList } from '@/components/trending-list';
import { CollectionCard } from '@/components/collection-card';
import { SectionHeading } from '@/components/section-heading';
import {
  CATEGORIES,
  SECTIONS,
  getCategory,
  isLegacyCategorySlug,
} from '@/data/taxonomy';
import { COLLECTIONS } from '@/data/collections';
import { liveCategoriesInSection } from '@/lib/category-map';
import { listPostsInCategory, getPost } from '@/lib/content';
import { SITE_URL } from '@/lib/env';

export const revalidate = 3600;

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return {};
  return {
    title: cat.name,
    description: cat.description,
    alternates: { canonical: `${SITE_URL}/category/${cat.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const cat = getCategory(slug);
  if (!cat) notFound();
  if (isLegacyCategorySlug(slug)) redirect(`/category/${cat.slug}`);

  const posts = await listPostsInCategory(cat.slug, 60);
  const [featured, second, ...rest] = posts;
  const trending = posts.slice(0, 6).filter((p) => p.slug !== featured?.slug).slice(0, 5);
  const siblings = liveCategoriesInSection(cat.section).filter((c) => c.slug !== cat.slug);
  const relatedCollections = COLLECTIONS.filter(
    (c) => c.categorySlug === cat.slug || c.postSlugs.some((s) => posts.find((p) => p.slug === s)),
  ).slice(0, 3);

  const collectionCovers = await Promise.all(
    relatedCollections.map(async (c) => {
      for (const s of c.postSlugs) {
        const p = await getPost(s);
        if (p?.heroImage) return { slug: c.slug, cover: p.heroImage.src };
      }
      return { slug: c.slug, cover: undefined };
    }),
  );
  const coverMap = new Map(collectionCovers.map((c) => [c.slug, c.cover]));

  return (
    <div>
      {/* Category header -------------------------------------------- */}
      <header className="border-b border-cream-200 bg-cream-50 dark:border-ink-500 dark:bg-ink-600">
        <div className="mx-auto max-w-wide px-6 pt-16 pb-12 lg:pt-24">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink-300">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-clay-500">Home</Link></li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/blog" className="hover:text-clay-500">
                  {SECTIONS[cat.section].name}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-ink-500 dark:text-cream-100">{cat.name}</li>
            </ol>
          </nav>

          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-clay-500">
            {SECTIONS[cat.section].name} · {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
          <h1 className="font-display text-display-xl text-ink-500 dark:text-cream-50">
            {cat.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-300">{cat.description}</p>

          {siblings.length > 0 && (
            <nav aria-label="Related categories" className="mt-8 flex flex-wrap gap-2">
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  href={`/category/${s.slug}`}
                  className="rounded-full border border-cream-200 bg-bone-100 px-3 py-1.5 text-sm font-medium text-ink-500 transition hover:border-clay-500 hover:text-clay-500 dark:border-ink-500 dark:bg-ink-500 dark:text-cream-50"
                >
                  {s.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {posts.length === 0 ? (
        <section className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="font-display text-2xl">This section is just getting started.</p>
          <p className="mt-3 text-ink-300">
            We're publishing new pieces to {cat.name.toLowerCase()} weekly.{' '}
            <Link href="/blog" className="text-clay-500 underline">Browse everything else</Link> in the meantime.
          </p>
        </section>
      ) : (
        <>
          {featured && (
            <section className="mx-auto max-w-wide px-6 pt-16">
              <div className="rounded-3xl border border-cream-200 bg-bone-100 p-6 shadow-card dark:border-ink-500 dark:bg-ink-500 lg:p-10">
                <PostCard post={featured} variant="featured" />
              </div>
            </section>
          )}

          {relatedCollections.length > 0 && (
            <section className="mx-auto max-w-wide px-6 pt-20">
              <SectionHeading
                eyebrow="Curated for you"
                title={`${cat.name} collections`}
                href="/collections"
              />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedCollections.map((c) => (
                  <CollectionCard key={c.slug} collection={c} cover={coverMap.get(c.slug)} />
                ))}
              </div>
            </section>
          )}

          <section className="mx-auto max-w-wide px-6 py-20">
            <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div>
                <SectionHeading title={`All ${cat.name.toLowerCase()}`} />
                <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
                  {[second, ...rest]
                    .filter((p): p is NonNullable<typeof p> => Boolean(p))
                    .map((p) => (
                      <PostCard key={p.slug} post={p} />
                    ))}
                </div>
              </div>
              <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-10">
                  {trending.length > 0 && (
                    <div className="rounded-2xl border border-cream-200 bg-cream-50 p-6 dark:border-ink-500 dark:bg-ink-500">
                      <TrendingList posts={trending} title={`Top in ${cat.name.toLowerCase()}`} />
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
