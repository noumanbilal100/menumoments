import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { COLLECTIONS, getCollection } from '@/data/collections';
import { getPost } from '@/lib/content';
import { PostCard } from '@/components/post-card';
import { getCategory } from '@/data/taxonomy';
import { SITE_URL } from '@/lib/env';

export const revalidate = 3600;

export async function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const col = getCollection(slug);
  if (!col) return {};
  return {
    title: col.title,
    description: col.subtitle,
    alternates: { canonical: `${SITE_URL}/collections/${col.slug}` },
    openGraph: {
      title: col.title,
      description: col.subtitle,
      type: 'article',
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const col = getCollection(slug);
  if (!col) notFound();

  const posts = (
    await Promise.all(col.postSlugs.map((s) => getPost(s)))
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const category = col.categorySlug ? getCategory(col.categorySlug) : undefined;
  const hero = col.hero ?? posts.find((p) => p.heroImage)?.heroImage?.src;

  return (
    <div>
      {/* Hero -------------------------------------------------------- */}
      <header className="relative overflow-hidden border-b border-cream-200 bg-ink-500 text-cream-50 dark:border-ink-500">
        {hero && (
          <div className="absolute inset-0">
            <Image
              src={hero}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink-500/80 via-ink-500/70 to-ink-500" />
          </div>
        )}
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-clay-100">
            Collection · {posts.length} recipes
          </p>
          <h1 className="font-display text-display-xl">{col.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-cream-100/90">{col.subtitle}</p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream-200/80">{col.intro}</p>
          {category && (
            <Link
              href={`/category/${category.slug}`}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-cream-50/25 px-4 py-2 text-sm font-medium hover:border-clay-100 hover:text-clay-100"
            >
              More {category.name.toLowerCase()} →
            </Link>
          )}
        </div>
      </header>

      {/* Numbered feed ------------------------------------------------ */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <ol className="space-y-14">
          {posts.map((p, i) => (
            <li key={p.slug} className="group grid gap-8 md:grid-cols-[minmax(0,1fr)_1.4fr] md:items-center">
              <Link href={`/${p.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-cream-100">
                {p.heroImage ? (
                  <Image
                    src={p.heroImage.src}
                    alt={p.heroImage.alt}
                    fill
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : null}
                <span className="absolute left-4 top-4 rounded-full bg-bone-100/95 px-3 py-1 font-display text-lg leading-none text-ink-500">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </Link>
              <div>
                {p.categories[0] && (
                  <p className="text-xs font-semibold uppercase tracking-widest text-clay-500">
                    {getCategory(p.categories[0])?.name}
                  </p>
                )}
                <h2 className="mt-2 font-display text-3xl leading-tight text-ink-500 group-hover:text-clay-500 dark:text-cream-50">
                  <Link href={`/${p.slug}`}>{p.title}</Link>
                </h2>
                {p.excerpt && (
                  <p className="mt-3 line-clamp-3 text-ink-300">{p.excerpt}</p>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-ink-300">
                  {p.recipe?.prepMinutes !== undefined && p.recipe?.cookMinutes !== undefined && (
                    <span>
                      {(p.recipe.prepMinutes ?? 0) + (p.recipe.cookMinutes ?? 0)} min total
                    </span>
                  )}
                  {p.recipe?.servings && <span>Serves {p.recipe.servings}</span>}
                  <span>{p.readingMinutes} min read</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Other collections ------------------------------------------ */}
      <section className="border-t border-cream-200 bg-cream-100/60 py-16 dark:border-ink-500 dark:bg-ink-500/50">
        <div className="mx-auto max-w-wide px-6">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-display-md">More collections</h2>
            <Link href="/collections" className="text-sm font-medium text-clay-500 hover:text-clay-600">
              All collections →
            </Link>
          </div>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {COLLECTIONS.filter((c) => c.slug !== col.slug)
              .slice(0, 3)
              .map((c) => (
                <PreviewCollection key={c.slug} slug={c.slug} title={c.title} count={c.postSlugs.length} />
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

async function PreviewCollection({ slug, title, count }: { slug: string; title: string; count: number }) {
  const col = getCollection(slug);
  if (!col) return null;
  let cover: string | undefined;
  for (const s of col.postSlugs) {
    const p = await getPost(s);
    if (p?.heroImage) {
      cover = p.heroImage.src;
      break;
    }
  }
  return (
    <Link href={`/collections/${slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream-100">
        {cover && (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-500/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-cream-50">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-clay-100">
            Collection · {count} recipes
          </p>
          <p className="mt-1 font-display text-xl leading-tight">{title}</p>
        </div>
      </div>
    </Link>
  );
}
