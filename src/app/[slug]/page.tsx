import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, permanentRedirect } from 'next/navigation';
import { getPost, listRecentPosts, allPostSlugs, relatedPosts, type Post } from '@/lib/content';
import type { PageRecord } from '@/lib/cms/content';
import { getCategory } from '@/data/taxonomy';
import { COLLECTIONS } from '@/data/collections';
import { PostCard } from '@/components/post-card';
import { SectionHeading } from '@/components/section-heading';
import { RecipeMetaBar, DietTag } from '@/components/recipe-meta';
import { PostActions, JumpToRecipe } from '@/components/post-actions';
import { AuthorCard } from '@/components/author-card';
import { TrendingList } from '@/components/trending-list';
import { CollectionCard } from '@/components/collection-card';
import { ReadingProgress } from '@/components/reading-progress';
import { Sparkle, Fork, Squiggle } from '@/components/doodles';
import { AffiliateArticle } from '@/components/affiliate-article';
import { hasAffiliateLinks, isAffiliateArticle } from '@/lib/affiliate';
import { AdSlot } from '@/components/ad-slot';
import { ProductRecommendations } from '@/components/product-recommendations';
import { PageShell } from '@/components/page-shell';
import { HeroFigure } from '@/components/hero-figure';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { guideCluster, insertMidArticle, readNextFor, readNextHtml } from '@/lib/read-next';
import { postTrail } from '@/lib/silo';
import { cleanPostHtml } from '@/lib/clean-html';
import { getSitePage, listSitePages } from '@/lib/site-pages';
import { getFreshPost, getFreshSitePage } from '@/lib/fresh-content';
import { blockForPost, splitBeforeHeading } from '@/data/post-products';
import { isAdFreePost, shouldShowAds } from '@/lib/ads';
import { absoluteUrl, imageFor, postBreadcrumbJsonLd, postJsonLd, sitePageJsonLd } from '@/lib/structured-data';
import { JsonLd } from '@/components/json-ld';
import { NewsletterForm } from '@/components/newsletter-form';
import { pageMeta } from '@/lib/seo';
import { ADSENSE_SLOTS } from '@/lib/env';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const pages = await listSitePages();
  return [...allPostSlugs(), ...pages.map((p) => p.slug)].map((slug) => ({ slug }));
}

/**
 * What lives at /<slug>/: a post or page from this build first, then one
 * published since the build was made, read from the repository until the
 * rebuild that includes it goes live (see src/lib/fresh-content.ts).
 */
async function contentAt(slug: string): Promise<{ post: Post } | { page: PageRecord } | null> {
  const post = await getPost(slug);
  if (post) return { post };
  const page = await getSitePage(slug);
  if (page) return { page };
  const freshPost = await getFreshPost(slug);
  if (freshPost) return { post: freshPost };
  const freshPage = await getFreshSitePage(slug);
  return freshPage ? { page: freshPage } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await contentAt(slug);
  if (!found) return {};
  if ('page' in found) {
    const { page } = found;
    return {
      ...pageMeta({
        title: page.seo?.seoTitle || page.title,
        description: page.seo?.metaDescription || page.lede || page.title,
        path: `/${slug}/`,
        image: page.heroImage?.src ? absoluteUrl(page.heroImage.src) : undefined,
      }),
      keywords: page.seo?.focusKeyword ? [page.seo.focusKeyword] : undefined,
    };
  }
  const { post } = found;
  const seo = post.seo ?? {};
  const category = post.categories[0] ? getCategory(post.categories[0]) : undefined;
  return {
    ...pageMeta({
      title: decodeEntities(seo.seoTitle) ?? post.title,
      description: decodeEntities(seo.metaDescription) ?? post.excerpt,
      path: `/${slug}/`,
      canonical: seo.canonical,
      image: imageFor(post),
      socialTitle: decodeEntities(seo.ogTitle),
      socialDescription: decodeEntities(seo.ogDescription),
      article: {
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: [post.author.name],
        section: category?.name,
      },
    }),
    keywords: seo.focusKeyword ? [seo.focusKeyword] : undefined,
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
  if (asCategory) permanentRedirect(`/category/${asCategory.slug}/`);

  const found = await contentAt(slug);
  if (!found) notFound();
  if ('page' in found) {
    const { page } = found;
    return (
      <>
        <JsonLd data={sitePageJsonLd(page)} />
        <span data-no-ads hidden />
        <PageShell title={page.title} lede={page.lede} hero={page.heroImage ? <HeroFigure image={page.heroImage} /> : undefined}>
          <div dangerouslySetInnerHTML={{ __html: cleanPostHtml(page.html, page.title) }} />
        </PageShell>
      </>
    );
  }
  const { post } = found;

  const primaryCat = post.categories[0] ? getCategory(post.categories[0]) : undefined;
  const secondaryCats = post.categories
    .slice(1, 4)
    .map((s) => getCategory(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const trending = await listRecentPosts(6);
  const relatedFiltered = relatedPosts(post);
  const trendingFiltered = trending.filter((t) => t.slug !== post.slug).slice(0, 5);

  // Buying guides / reviews get a dedicated Wirecutter-style layout.
  if (isAffiliateArticle(post)) {
    // The guide lists every post on its topic; the related grid then shows other posts, not the same ones again.
    const cluster = guideCluster(post);
    const inCluster = new Set(cluster?.posts.map((p) => p.slug) ?? []);
    const related = relatedPosts(post, 12)
      .filter((r) => !inCluster.has(r.slug))
      .slice(0, 6);
    return (
      <>
        <span data-no-ads hidden />
        <AffiliateArticle post={post} related={related} cluster={cluster} />
      </>
    );
  }

  const relatedCollections = COLLECTIONS.filter((c) => c.postSlugs.includes(post.slug)).slice(0, 2);
  const news = newsletterCopy(post.kind);
  const kindText = kindLabel(post.kind);
  const adsOn = shouldShowAds(post);
  // "Read next" in the middle of the text: in-silo posts the page doesn't already link.
  const readNext = await readNextFor(post, new Set(relatedFiltered.map((r) => r.slug)));
  const bodyHtml = insertMidArticle(post.html, readNextHtml(readNext));
  const productAnchor = blockForPost(post.slug)?.beforeHeading;
  const productSplit = productAnchor ? splitBeforeHeading(bodyHtml, productAnchor) : null;

  return (
    <article>
      {isAdFreePost(post) && <span data-no-ads hidden />}
      <ReadingProgress />
      <JsonLd data={postJsonLd(post)} />
      <JsonLd data={postBreadcrumbJsonLd(post)} />

      {/* Article header ---------------------------------------------- */}
      <header className="relative overflow-hidden border-b border-bone-200 dark:border-char-500">
        <div className="pointer-events-none absolute -right-6 top-16 hidden text-ember-200 md:block">
          <Fork size={90} className="animate-float" />
        </div>
        <div className="mx-auto max-w-4xl px-6 pt-14 pb-10 lg:pt-20">
          <Breadcrumbs trail={postTrail(post)} />

          {/* Single friendly kind chip + primary category — no more
              redundant repeat of the breadcrumb category. */}
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-ember-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white shadow-embered">
            <Sparkle size={11} />
            {kindText}
            {primaryCat && <span className="opacity-80">· {primaryCat.name}</span>}
          </div>

          <div>
            <h1 className="font-display text-display-lg text-char-500 dark:text-bone-50">
              {post.title}
            </h1>
            <Squiggle className="mt-4 text-ember-300" />
            {post.excerpt && (
              <p className="mt-6 max-w-prose text-lg leading-relaxed text-char-200">
                {post.excerpt}
              </p>
            )}
          </div>

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
            {post.updatedAt && post.updatedAt.slice(0, 10) !== post.publishedAt.slice(0, 10) && (
              <>
                <div className="hidden h-8 w-px bg-bone-200 dark:bg-char-400 md:block" />
                <span className="text-xs">
                  Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
                </span>
              </>
            )}
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
      {post.heroImage && <HeroFigure image={post.heroImage} />}

      {/* Body + right rail ------------------------------------------ */}
      <div className="mx-auto max-w-wide px-6 py-14">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            {hasAffiliateLinks(post.html) && (
              <p className="mb-8 rounded-xl border border-bone-200 bg-ember-50 px-4 py-3 text-xs text-char-300 dark:border-char-500 dark:bg-char-500 dark:text-bone-100/80">
                <strong className="font-semibold text-char-500 dark:text-bone-50">Disclosure:</strong>{' '}
                Menu Moments earns a commission on qualifying purchases through some of the links
                below.{' '}
                <Link href="/disclaimer" className="underline underline-offset-2 hover:text-ember-500">
                  Read the full policy →
                </Link>
              </p>
            )}
            {adsOn && ADSENSE_SLOTS.inArticleTop && (
              <AdSlot slot={ADSENSE_SLOTS.inArticleTop} format="auto" className="mt-0 mb-10" />
            )}

            {productSplit ? (
              <>
                <div className="prose-article" dangerouslySetInnerHTML={{ __html: productSplit[0] }} />
                <ProductRecommendations slug={post.slug} />
                <div
                  className="prose-article prose-continued"
                  dangerouslySetInnerHTML={{ __html: productSplit[1] }}
                />
              </>
            ) : (
              <>
                <div className="prose-article" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                <ProductRecommendations slug={post.slug} />
              </>
            )}

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

            <section className="relative my-14 overflow-hidden rounded-2xl border border-bone-200 bg-gradient-to-br from-ember-50 via-bone-100 to-ember-100 p-6 dark:border-char-500 dark:from-char-500 dark:via-char-400 dark:to-char-500 md:p-8">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">
                <Sparkle size={12} /> {news.eyebrow}
              </p>
              <h3 className="mt-2 max-w-lg font-display text-2xl leading-tight text-char-500 dark:text-bone-50">
                {news.title}
              </h3>
              <NewsletterForm
                id="post-newsletter"
                placeholder="you@yourinbox.com"
                className="mt-5 flex flex-col gap-2 sm:flex-row sm:max-w-md"
                inputClassName="flex-1 rounded-full border border-char-500/15 bg-bone-100 px-5 py-2.5 text-sm outline-none focus:border-ember-500 dark:border-bone-50/15 dark:bg-char-600"
                buttonClassName="rounded-full bg-ember-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-ember-600 hover:shadow-embered"
              />
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
                    {relatedFiltered.slice(0, 3).map((r) => (
                      <PostCard key={r.slug} post={r} variant="compact" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Related grid: the three the sidebar doesn't show ----------- */}
      {relatedFiltered.length > 3 && (
        <section className="border-t border-bone-200 bg-bone-100/60 py-16 dark:border-char-500 dark:bg-char-500/50">
          <div className="mx-auto max-w-wide px-6">
            <SectionHeading
              eyebrow="Keep reading"
              title="You might also like"
              href={primaryCat ? `/category/${primaryCat.slug}` : '/blog'}
            />
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {relatedFiltered.slice(3).map((r) => (
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
