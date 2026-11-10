import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { PostCard } from '@/components/post-card';
import { TrendingList } from '@/components/trending-list';
import { CollectionCard } from '@/components/collection-card';
import { SectionHeading } from '@/components/section-heading';
import {
  CATEGORIES,
  SECTIONS,
  SECTION_HUBS,
  getCategory,
  getSectionHub,
  isLegacyCategorySlug,
  type Category,
  type SectionKey,
} from '@/data/taxonomy';
import { COLLECTIONS } from '@/data/collections';
import { isIndexableCategory, liveCategoriesInSection } from '@/lib/category-map';
import { listPostsInCategory, listPostsInSection, getPost } from '@/lib/content';
import { SITE } from '@/lib/env';
import { pageMeta } from '@/lib/seo';
import { breadcrumbJsonLd, collectionJsonLd } from '@/lib/structured-data';
import { categoryTrail } from '@/lib/silo';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const revalidate = 3600;

/** Cards are heavy, so a big category lists the rest as plain links. */
const CARD_LIMIT = 60;

const SECTION_TITLE: Record<SectionKey, string> = {
  recipes: 'Recipes & Ideas',
  lifestyle: 'Recipes & Ideas',
  'kitchen-tips': 'Practical Guides & How-Tos',
  gear: 'Guides & Buying Advice',
  planning: 'Guides & Ideas',
  reviews: 'Guides & Honest Takes',
};

/** Title tags of the section hubs; Recipes keeps the one it already ranks with. */
const HUB_TITLE: Record<SectionKey, string> = {
  recipes: 'All Recipes: Dinners, Desserts & More',
  lifestyle: 'Eat Well: Healthy, Quick & Plant-Based Recipes',
  'kitchen-tips': 'Kitchen Tips: Practical Guides & How-Tos',
  gear: 'Kitchen Gear: Appliance, Cookware & Tool Guides',
  planning: 'Plan & Shop: Ingredient and Meal Planning Guides',
  reviews: 'Reviews & Buying Guides: Menus and Kitchen Picks',
};

function categoryTitle(cat: Category): string {
  if (cat.slug === 'affiliate-product-guides') return 'Buying Guides: Top Kitchen Product Picks';
  if (/recipes/i.test(cat.name)) return `${cat.name} & Meal Ideas`;
  return `${cat.name}: ${SECTION_TITLE[cat.section]}`;
}

/**
 * What a /category/ address lists: one category, or a section hub, the top of
 * a silo, which lists every post in its section and links to each category.
 */
interface Listing {
  slug: string;
  name: string;
  section: SectionKey;
  description: string;
  hub: boolean;
  title: string;
}

function listingFor(slug: string): Listing | undefined {
  const hub = getSectionHub(slug);
  if (hub) {
    return { slug: hub.slug, name: hub.title, section: hub.section, description: hub.intro, hub: true, title: HUB_TITLE[hub.section] };
  }
  const cat = getCategory(slug);
  if (!cat) return undefined;
  return { slug: cat.slug, name: cat.name, section: cat.section, description: cat.description, hub: false, title: categoryTitle(cat) };
}

async function postsFor(listing: Listing) {
  return listing.hub ? listPostsInSection(listing.section) : listPostsInCategory(listing.slug, Infinity);
}

export async function generateStaticParams() {
  const hubs = Object.values(SECTION_HUBS).map((h) => h.slug);
  return [...new Set([...CATEGORIES.map((c) => c.slug), ...hubs])].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = listingFor(slug);
  if (!listing) return {};
  const posts = await postsFor(listing);
  return pageMeta({
    title: listing.title,
    description: listing.hub
      ? listing.description
      : `${listing.description} Browse our latest ${listing.name.toLowerCase()} on ${SITE.name}.`,
    path: `/category/${listing.slug}/`,
    image: posts[0]?.heroImage?.src,
    noindex: listing.hub ? posts.length < 3 : !isIndexableCategory(listing.slug),
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const listing = listingFor(slug);
  if (!listing) notFound();
  if (!listing.hub && isLegacyCategorySlug(slug)) permanentRedirect(`/category/${listing.slug}/`);
  const cat = listing;

  const everyPost = await postsFor(listing);
  const posts = everyPost.slice(0, CARD_LIMIT);
  const morePosts = everyPost.slice(CARD_LIMIT);
  const [featured, second, ...rest] = posts;
  const trending = posts.slice(0, 6).filter((p) => p.slug !== featured?.slug).slice(0, 5);
  const sectionCategories = liveCategoriesInSection(cat.section).filter((c) => c.slug !== cat.slug);
  const siblings = listing.hub ? [] : sectionCategories;
  // A hub links down to every category in its section, with how much is in each.
  const children = listing.hub
    ? await Promise.all(
        sectionCategories
          .filter((c) => isIndexableCategory(c.slug))
          .map(async (c) => ({ category: c, count: (await listPostsInCategory(c.slug, Infinity)).length })),
      )
    : [];
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
      <JsonLd
        data={collectionJsonLd({
          name: cat.name,
          description: cat.description,
          path: `/category/${cat.slug}/`,
          posts: everyPost,
        })}
      />
      <JsonLd data={breadcrumbJsonLd(categoryTrail(cat))} />
      {/* Category header -------------------------------------------- */}
      <header className="border-b border-cream-200 bg-cream-50 dark:border-ink-500 dark:bg-ink-600">
        <div className="mx-auto max-w-wide px-6 pt-16 pb-12 lg:pt-24">
          <Breadcrumbs trail={categoryTrail(cat)} className="mb-6 text-xs text-ink-300" linkClassName="hover:text-clay-500" />

          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-clay-500">
            {listing.hub ? 'All of' : SECTIONS[cat.section].name} {listing.hub ? SECTIONS[cat.section].name.toLowerCase() : ''} ·{' '}
            {everyPost.length} {everyPost.length === 1 ? 'post' : 'posts'}
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

      {children.length > 0 && (
        <section className="mx-auto max-w-wide px-6 pt-14" aria-labelledby="hub-categories">
          <h2 id="hub-categories" className="font-display text-2xl text-ink-500 dark:text-cream-50">
            Browse {cat.name.toLowerCase()} by category
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map(({ category: c, count }) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-cream-200 bg-bone-100 p-5 transition hover:border-clay-500 dark:border-ink-500 dark:bg-ink-500"
                >
                  <span className="font-display text-lg text-ink-500 dark:text-cream-50">{c.name}</span>
                  <span className="mt-1 text-sm text-ink-300">{c.description}</span>
                  <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-clay-500">
                    {count} {count === 1 ? 'post' : 'posts'} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

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
                {morePosts.length > 0 && (
                  <div className="mt-16">
                    <h2 className="font-display text-2xl text-ink-500 dark:text-cream-50">
                      More {cat.name.toLowerCase()}
                    </h2>
                    <ul className="mt-5 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                      {morePosts.map((p) => (
                        <li key={p.slug}>
                          <Link href={`/${p.slug}`} className="text-ink-500 hover:text-clay-500 dark:text-cream-50">
                            {p.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
