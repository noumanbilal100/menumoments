import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { getPost, listPostsInCategory, listRecentPosts, allPostSlugs } from '@/lib/content';
import { getCategory } from '@/data/taxonomy';
import { COLLECTIONS } from '@/data/collections';
import { PostCard } from '@/components/post-card';
import { SectionHeading } from '@/components/section-heading';
import { RecipeMetaBar, DietTag } from '@/components/recipe-meta';
import { PostActions, JumpToRecipe } from '@/components/post-actions';
import { AuthorCard } from '@/components/author-card';
import { TrendingList } from '@/components/trending-list';
import { CollectionCard } from '@/components/collection-card';
import { Reveal } from '@/components/reveal';
import { ReadingProgress } from '@/components/reading-progress';
import { Sparkle, Fork, Squiggle } from '@/components/doodles';
import { AffiliateArticle } from '@/components/affiliate-article';
import { isAffiliateArticle } from '@/lib/affiliate';
import { AdSlot } from '@/components/ad-slot';
import { shouldShowAds } from '@/lib/ads';
import { ADSENSE_SLOTS, SITE_URL } from '@/lib/env';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return allPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const seo = post.seo ?? {};
  const title = decodeEntities(seo.seoTitle) ?? post.title;
  const description = decodeEntities(seo.metaDescription) ?? post.excerpt;
  const ogTitle = decodeEntities(seo.ogTitle) ?? title;
  const ogDescription = decodeEntities(seo.ogDescription) ?? description;
  return {
    title,
    description,
    keywords: seo.focusKeyword ? [seo.focusKeyword] : undefined,
    alternates: { canonical: seo.canonical || `${SITE_URL}/${slug}/` },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: post.heroImage ? [{ url: post.heroImage.src }] : undefined,
    },
  };
}

function decodeEntities(s?: string): string | undefined {
  if (!s) return undefined;
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&nbsp;/g, ' ');
}

/** Friendly display label for the derived post `kind`. */
function kindLabel(kind: string): string {
  switch (kind) {
    case 'recipe':
      return 'Recipe';
    case 'tip':
      return 'Kitchen tip';
    case 'roundup':
      return 'Guide';
    case 'review':
      return 'Review';
    default:
      return 'Guide';
  }
}

/** Newsletter copy that adapts to what the reader just finished. */
function newsletterCopy(kind: string): { eyebrow: string; title: string; sub: string } {
  if (kind === 'recipe') {
    return {
      eyebrow: 'Enjoyed this recipe?',
      title: 'One great recipe. Every Sunday. In your inbox.',
      sub: 'Weekly. No spam. Unsubscribe in one click.',
    };
  }
  if (kind === 'tip') {
    return {
      eyebrow: 'Enjoyed this tip?',
      title: 'A weekly hit of kitchen know-how.',
      sub: 'Tips, techniques and small upgrades — every Sunday.',
    };
  }
  return {
    eyebrow: 'Enjoyed this?',
    title: 'A recipe, a tip and a link worth clicking — every Sunday.',
    sub: 'Free. Weekly. Unsubscribe anytime.',
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const asCategory = getCategory(slug);
  if (asCategory) redirect(`/category/${asCategory.slug}`);

  const post = await getPost(slug);
  if (!post) notFound();

  const primaryCat = post.categories[0] ? getCategory(post.categories[0]) : undefined;
  const secondaryCats = post.categories
    .slice(1, 4)
    .map((s) => getCategory(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const [related, trending] = await Promise.all([
    primaryCat ? listPostsInCategory(primaryCat.slug, 6) : Promise.resolve([]),
    listRecentPosts(6),
  ]);
  const relatedFiltered = related.filter((r) => r.slug !== post.slug).slice(0, 3);
  const trendingFiltered = trending.filter((t) => t.slug !== post.slug).slice(0, 5);

  // Buying guides / reviews get a dedicated Wirecutter-style layout.
  if (isAffiliateArticle(post)) {
    return <AffiliateArticle post={post} related={relatedFiltered} />;
  }

  const relatedCollections = COLLECTIONS.filter((c) => c.postSlugs.includes(post.slug)).slice(0, 2);
  const news = newsletterCopy(post.kind);
  const kindText = kindLabel(post.kind);
  const adsOn = shouldShowAds(post);

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': post.kind === 'recipe' ? 'Recipe' : 'Article',
    headline: post.title,
    name: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Person', name: post.author.name },
    image: post.heroImage?.src,
    mainEntityOfPage: `${SITE_URL}/${post.slug}`,
    articleSection: primaryCat?.name,
  };
  if (post.kind === 'recipe' && post.recipe) {
    jsonLd.prepTime = post.recipe.prepMinutes ? `PT${post.recipe.prepMinutes}M` : undefined;
    jsonLd.cookTime = post.recipe.cookMinutes ? `PT${post.recipe.cookMinutes}M` : undefined;
    jsonLd.totalTime =
      post.recipe.prepMinutes || post.recipe.cookMinutes
        ? `PT${(post.recipe.prepMinutes ?? 0) + (post.recipe.cookMinutes ?? 0)}M`
        : undefined;
    jsonLd.recipeYield = post.recipe.servings ? `${post.recipe.servings} servings` : undefined;
    if (post.recipe.diet?.length) jsonLd.suitableForDiet = post.recipe.diet.join(', ');
  }

  return (
    <article>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Article header ---------------------------------------------- */}
      <header className="relative overflow-hidden border-b border-bone-200 dark:border-char-500">
        <div className="pointer-events-none absolute -right-6 top-16 hidden text-ember-200 md:block">
          <Fork size={90} className="animate-float" />
        </div>
        <div className="mx-auto max-w-4xl px-6 pt-14 pb-10 lg:pt-20">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-char-200">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-ember-500">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              {primaryCat && (
                <>
                  <li>
                    <Link href={`/category/${primaryCat.slug}`} className="hover:text-ember-500">
                      {primaryCat.name}
                    </Link>
                  </li>
                  <li aria-hidden>/</li>
                </>
              )}
              <li className="truncate">{post.title}</li>
            </ol>
          </nav>

          {/* Single friendly kind chip + primary category — no more
              redundant repeat of the breadcrumb category. */}
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-ember-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white shadow-embered">
            <Sparkle size={11} />
            {kindText}
            {primaryCat && <span className="opacity-80">· {primaryCat.name}</span>}
          </div>

          <Reveal>
            <h1 className="font-display text-display-lg text-char-500 dark:text-bone-50">
              {post.title}
            </h1>
            <Squiggle className="mt-4 text-ember-300" />
            {post.excerpt && (
              <p className="mt-6 max-w-prose text-lg leading-relaxed text-char-200">
                {post.excerpt}
              </p>
            )}
          </Reveal>

          {post.recipe?.diet && post.recipe.diet.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.recipe.diet.map((d) => (
                <DietTag key={d} tag={d} />
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-bone-200 pt-6 text-sm text-char-200 dark:border-char-400">
            <div className="flex items-center gap-3">
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-white dark:ring-char-500"
                />
              ) : (
                <span className="grid h-11 w-11 place-items-center rounded-full bg-ember-100 font-display text-lg text-ember-500">
                  {post.author.name[0]}
                </span>
              )}
              <div>
                <p className="font-medium text-char-500 dark:text-bone-50">
                  By {post.author.name}
                </p>
                <p className="text-xs">Menu Moments editorial</p>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-bone-200 dark:bg-char-400 md:block" />
            <time dateTime={post.publishedAt} className="text-xs">
              {formatDate(post.publishedAt)}
            </time>
            <div className="hidden h-8 w-px bg-bone-200 dark:bg-char-400 md:block" />
            <span className="text-xs">{post.readingMinutes} min read</span>
            {secondaryCats.length > 0 && (
              <>
                <div className="hidden h-8 w-px bg-bone-200 dark:bg-char-400 md:block" />
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-char-200">Filed in</span>
                  {secondaryCats.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/category/${c.slug}`}
                      className="rounded-full border border-bone-200 px-2.5 py-0.5 text-char-300 hover:border-ember-500 hover:text-ember-500 dark:border-char-400 dark:text-bone-100"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {post.kind === 'recipe' && <JumpToRecipe />}
            <PostActions slug={post.slug} title={post.title} />
          </div>
        </div>
      </header>

      {/* Hero image -------------------------------------------------- */}
      {post.heroImage && (
        <div className="mx-auto max-w-5xl px-6 pt-8">
          <Reveal>
            <div className="zoom-parent relative aspect-[16/9] overflow-hidden rounded-3xl bg-bone-100 shadow-cardHover">
              <Image
                src={post.heroImage.src}
                alt={post.heroImage.alt}
                fill
                sizes="(min-width: 1024px) 1000px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </Reveal>
        </div>
      )}

      {/* Body + right rail ------------------------------------------ */}
      <div className="mx-auto max-w-wide px-6 py-14">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            {adsOn && ADSENSE_SLOTS.inArticleTop && (
              <AdSlot slot={ADSENSE_SLOTS.inArticleTop} format="auto" className="mt-0 mb-10" />
            )}

            <div className="prose-article" dangerouslySetInnerHTML={{ __html: post.html }} />

            {adsOn && ADSENSE_SLOTS.inArticleMid && (
              <AdSlot
                slot={ADSENSE_SLOTS.inArticleMid}
                format="fluid"
                layout="in-article"
                className="my-10"
              />
            )}

            {post.recipe && (
              <section id="recipe" className="scroll-mt-24">
                <RecipeMetaBar recipe={post.recipe} />
              </section>
            )}

            {relatedCollections.length > 0 && (
              <section className="my-14">
                <SectionHeading eyebrow="From the collection" title="This piece appears in" />
                <div className="grid gap-6 md:grid-cols-2">
                  {relatedCollections.map((c) => (
                    <CollectionCard key={c.slug} collection={c} />
                  ))}
                </div>
              </section>
            )}

            <AuthorCard author={post.author} />

            {adsOn && ADSENSE_SLOTS.inArticleBottom && (
              <AdSlot slot={ADSENSE_SLOTS.inArticleBottom} format="auto" className="my-10" />
            )}

            <section className="relative my-14 overflow-hidden rounded-2xl border border-bone-200 bg-gradient-to-br from-saffron-100 via-ember-50 to-berry-50 p-6 dark:border-char-500 dark:from-char-500 dark:via-char-400 dark:to-char-500 md:p-8">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">
                <Sparkle size={12} /> {news.eyebrow}
              </p>
              <h3 className="mt-2 max-w-lg font-display text-2xl leading-tight text-char-500 dark:text-bone-50">
                {news.title}
              </h3>
              <form className="mt-5 flex flex-col gap-2 sm:flex-row sm:max-w-md">
                <label htmlFor="post-newsletter" className="sr-only">
                  Email
                </label>
                <input
                  id="post-newsletter"
                  type="email"
                  required
                  placeholder="you@yourinbox.com"
                  className="flex-1 rounded-full border border-char-500/15 bg-bone-100 px-5 py-2.5 text-sm outline-none focus:border-ember-500 dark:border-bone-50/15 dark:bg-char-600"
                />
                <button
                  type="submit"
                  className="rounded-full bg-ember-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-ember-600 hover:shadow-embered"
                >
                  Subscribe
                </button>
              </form>
              <p className="mt-3 text-xs text-char-200">{news.sub}</p>
            </section>
          </div>

          {/* Right rail -------------------------------------------- */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-10">
              {trendingFiltered.length > 0 && (
                <div className="rounded-2xl border border-bone-200 bg-bone-100 p-5 dark:border-char-500 dark:bg-char-500">
                  <TrendingList posts={trendingFiltered} />
                </div>
              )}
              {adsOn && ADSENSE_SLOTS.sidebar && (
                <AdSlot slot={ADSENSE_SLOTS.sidebar} format="auto" className="my-0" />
              )}
              {relatedFiltered.length > 0 && (
                <div>
                  <p className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">
                    <span className="inline-block h-1 w-6 bg-ember-500" />
                    More {primaryCat?.name?.toLowerCase() ?? 'from the blog'}
                  </p>
                  <div className="space-y-6">
                    {relatedFiltered.map((r) => (
                      <PostCard key={r.slug} post={r} variant="compact" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Related grid (mobile only — desktop has sidebar) ---------- */}
      {relatedFiltered.length > 0 && (
        <section className="border-t border-bone-200 bg-bone-100/60 py-16 dark:border-char-500 dark:bg-char-500/50 lg:hidden">
          <div className="mx-auto max-w-wide px-6">
            <SectionHeading
              eyebrow="Keep reading"
              title={`More from ${primaryCat?.name ?? 'the blog'}`}
              href={primaryCat ? `/category/${primaryCat.slug}` : '/blog'}
            />
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
              {relatedFiltered.map((r) => (
                <PostCard key={r.slug} post={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}
