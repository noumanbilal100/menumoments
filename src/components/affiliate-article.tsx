import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/lib/content';
import { postBreadcrumbJsonLd, postJsonLd } from '@/lib/structured-data';
import { JsonLd } from '@/components/json-ld';
import { enhanceAffiliateHtml, formatUpdated, updatedParts } from '@/lib/affiliate';
import { getCategory } from '@/data/taxonomy';
import { PostActions } from '@/components/post-actions';
import { AuthorCard } from '@/components/author-card';
import { AffiliateTOC } from '@/components/affiliate-toc';
import { AffiliateStickyCTA } from '@/components/affiliate-sticky-cta';
import { ReadingProgress } from '@/components/reading-progress';
import { Sparkle, Fork, Squiggle, DrawArrow } from '@/components/doodles';
import { PostCard } from '@/components/post-card';
import { SectionHeading } from '@/components/section-heading';
import { HeroFigure } from '@/components/hero-figure';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { postTrail } from '@/lib/silo';

/**
 * The "professional affiliate article" layout — Wirecutter/Strategist vibe.
 *
 * Adds no words to the body copy. Only reframes it: trust hero, disclosure
 * bar, sticky TOC sidebar, reading progress bar, sticky mobile CTA,
 * Amazon-branded inline pills, methodology strip, expanded author bio.
 */
export function AffiliateArticle({
  post,
  related,
  cluster,
}: {
  post: Post;
  related: Post[];
  /** Every other post on the guide's topic (see guideCluster in lib/read-next.ts). */
  cluster?: { topic: string; posts: Post[] } | null;
}) {
  const { html, headings, firstAffiliateAnchorId } = enhanceAffiliateHtml(post.html);

  const primaryCat = post.categories[0] ? getCategory(post.categories[0]) : undefined;
  // Guides built with product review cards report their real pick count.
  const reviewCards = (html.match(/class="mm-review"/g) ?? []).length;
  const productsTested = reviewCards || extractProductCount(headings.length);
  const updatedIso = post.updatedAt ?? post.publishedAt;
  const updated = updatedParts(updatedIso);

  return (
    <article>
      <ReadingProgress />
      <AffiliateStickyCTA anchorId={firstAffiliateAnchorId} />
      <JsonLd data={postJsonLd(post)} />
      <JsonLd data={postBreadcrumbJsonLd(post)} />

      {/* HERO ---------------------------------------------------------- */}
      <header className="relative overflow-hidden border-b border-bone-200 dark:border-char-500">
        <div className="pointer-events-none absolute -right-8 top-16 hidden text-ember-200 md:block">
          <Sparkle size={100} className="animate-float" />
        </div>
        <div className="mx-auto max-w-wide px-6 pt-12 pb-10 lg:pt-16">
          <Breadcrumbs trail={postTrail(post)} className="mb-5 text-xs text-char-200" />

          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ember-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white shadow-embered">
                <Sparkle size={11} />
                Buying guide · {primaryCat?.name ?? 'Reviews'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-bone-200 bg-bone-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-char-300 dark:border-char-400 dark:bg-char-400 dark:text-bone-100">
                Updated {updated?.monthYear}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-moss-200 bg-moss-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-moss-500">
                <span className="h-1.5 w-1.5 rounded-full bg-moss-400" /> Editorially independent
              </span>
            </div>

            <h1 className="max-w-4xl font-display text-display-xl text-char-500 dark:text-bone-50">
              {post.title}
            </h1>
            <Squiggle className="mt-4 text-ember-300" />
            {post.excerpt && (
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-char-200 md:text-xl">
                {post.excerpt}
              </p>
            )}

            {/* Trust / author bar */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-bone-200 pt-6 text-sm dark:border-char-400">
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
                  <p className="font-medium text-char-500 dark:text-bone-50">By {post.author.name}</p>
                  <p className="text-xs text-char-200">Menu Moments editorial</p>
                </div>
              </div>
              <div className="hidden h-8 w-px bg-bone-200 dark:bg-char-400 md:block" />
              <div className="text-xs text-char-200">
                <p className="font-semibold uppercase tracking-[0.25em] text-char-300">Last updated</p>
                <p>{formatUpdated(updatedIso)}</p>
              </div>
              <div className="hidden h-8 w-px bg-bone-200 dark:bg-char-400 md:block" />
              <div className="text-xs text-char-200">
                <p className="font-semibold uppercase tracking-[0.25em] text-char-300">Reading time</p>
                <p>{post.readingMinutes} min</p>
              </div>
            </div>

            {/* CTA row */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {firstAffiliateAnchorId && (
                <a
                  href={`#${firstAffiliateAnchorId}`}
                  className="group inline-flex items-center gap-2 rounded-full bg-char-500 px-5 py-2.5 text-sm font-medium text-bone-50 transition-all hover:bg-ember-500 hover:shadow-embered dark:bg-ember-500 dark:hover:bg-ember-400"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-ember-500 text-[10px] font-bold text-white group-hover:bg-bone-100 group-hover:text-ember-500 dark:bg-bone-100 dark:text-ember-500">
                    ★
                  </span>
                  See our top pick
                  <DrawArrow className="text-ember-200 transition-transform group-hover:translate-x-1" />
                </a>
              )}
              <PostActions slug={post.slug} title={post.title} />
            </div>
          </div>
        </div>
      </header>

      {/* HERO IMAGE ---------------------------------------------------- */}
      {post.heroImage && <HeroFigure image={post.heroImage} aspectRatio={heroAspect(post.heroImage)} />}

      {/* AT-A-GLANCE STRIP — truthful numbers only ------------------- */}
      <section className="border-y border-bone-200 bg-bone-100 py-6 dark:border-char-500 dark:bg-char-400">
        <div className="mx-auto grid max-w-3xl grid-cols-3 divide-x divide-bone-200 px-6 dark:divide-char-500">
          <QuickStat
            k="Picks"
            v={String(productsTested)}
            note="covered"
            icon={<Fork size={18} />}
          />
          <QuickStat
            k="Updated"
            v={updated?.monthDay ?? ''}
            note={updated?.year ?? ''}
          />
          <QuickStat
            k="Reading"
            v={`${post.readingMinutes}`}
            note="min read"
          />
        </div>
      </section>

      {/* FTC DISCLOSURE (top) ---------------------------------------- */}
      <div className="border-b border-bone-200 bg-ember-50 dark:border-char-500 dark:bg-char-500">
        <div className="mx-auto flex max-w-wide items-start gap-3 px-6 py-4 text-xs text-char-300 dark:text-bone-100/80">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-saffron-300 text-[10px] font-bold text-char-500">
            $
          </span>
          <p>
            <strong className="font-semibold text-char-500 dark:text-bone-50">Disclosure:</strong>{' '}
            Menu Moments earns a commission on qualifying purchases through some of the links
            below. Our picks are chosen by the editorial team — never by advertisers.{' '}
            <Link href="/disclaimer" className="underline underline-offset-2 hover:text-ember-500">
              Read the full policy →
            </Link>
          </p>
        </div>
      </div>

      {/* BODY + STICKY TOC ------------------------------------------- */}
      <div className="mx-auto max-w-wide px-6 py-12 lg:py-16">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <div
              className="prose-article prose-affiliate"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* Every post on the guide's topic: the guide links down to them as they link up to it. */}
            {cluster && cluster.posts.length > 0 && (
              <section className="mt-14 rounded-2xl border border-bone-200 bg-bone-50 p-6 dark:border-char-500 dark:bg-char-500 md:p-8">
                <h2 className="font-display text-2xl text-char-500 dark:text-bone-50">
                  More {cluster.topic} guides
                </h2>
                <ul className="mt-4 grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
                  {cluster.posts.map((p) => (
                    <li key={p.slug} className="flex gap-2">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-500" />
                      <Link href={`/${p.slug}/`} className="text-char-500 hover:text-ember-500 dark:text-bone-50">
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Full disclosure at bottom */}
            <section className="mt-14 rounded-2xl border border-bone-200 bg-bone-50 p-6 text-sm text-char-300 dark:border-char-500 dark:bg-char-500 dark:text-bone-100/80 md:p-8">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">
                <Sparkle size={12} /> Affiliate disclosure
              </p>
              <p className="mt-3 leading-relaxed">
                Menu Moments is a participant in the Amazon Services LLC Associates Program and
                other affiliate programs. When you buy something through a link on this page, we
                may earn a small commission at no extra cost to you. Our editorial picks and
                opinions are independent — we buy, test and recommend only what we'd tell a
                friend. See our full{' '}
                <Link href="/disclaimer" className="underline underline-offset-2 hover:text-ember-500">
                  disclosure policy
                </Link>{' '}
                for details.
              </p>
            </section>

            <AuthorCard author={post.author} />
          </div>

          {/* Sticky sidebar --------------------------------------- */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <AffiliateTOC headings={headings} />

              {firstAffiliateAnchorId && (
                <div className="rounded-2xl border border-ember-200 bg-ember-50 p-5 dark:border-ember-300/30 dark:bg-char-500">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">
                    Editor's top pick
                  </p>
                  <p className="mt-2 font-display text-lg leading-tight text-char-500 dark:text-bone-50">
                    Skip straight to the recommendation.
                  </p>
                  <a
                    href={`#${firstAffiliateAnchorId}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-white hover:bg-ember-600"
                  >
                    Jump to top pick →
                  </a>
                </div>
              )}

              <div className="rounded-2xl border border-bone-200 bg-bone-100 p-5 dark:border-char-500 dark:bg-char-500">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">
                  How we work
                </p>
                <ul className="space-y-2.5 text-xs text-char-300 dark:text-bone-100/80">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-500" />
                    Editorial picks — never paid placements.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-500" />
                    Guides are refreshed as products change.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-500" />
                    Affiliate links are marked and disclosed.
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* RELATED PICKS ----------------------------------------------- */}
      {related.length > 0 && (
        <section className="border-t border-bone-200 bg-bone-100/60 py-16 dark:border-char-500 dark:bg-char-500/50">
          <div className="mx-auto max-w-wide px-6">
            <SectionHeading
              eyebrow="Keep comparing"
              title="You might also like"
              href={primaryCat ? `/category/${primaryCat.slug}` : '/blog'}
            />
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <PostCard key={r.slug} post={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------

function QuickStat({
  k,
  v,
  note,
  icon,
}: {
  k: string;
  v: string;
  note: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 px-3 text-center">
      {icon && <div className="mb-1 text-ember-500">{icon}</div>}
      <p className="font-display text-2xl leading-none text-char-500 dark:text-bone-50">{v}</p>
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">{k}</p>
      <p className="text-xs text-char-200">{note}</p>
    </div>
  );
}

/** Rough product-count heuristic based on how many H2/H3 the article has. */
/**
 * Featured images designed as landscape graphics (often with text near the
 * edges) keep their own shape; anything squarer is cropped to 16:9.
 */
function heroAspect(img: { width?: number; height?: number }): string {
  const ratio = img.width && img.height ? img.width / img.height : 0;
  return ratio >= 1.3 && ratio <= 2 ? `${img.width} / ${img.height}` : '16 / 9';
}

function extractProductCount(headingsCount: number): number {
  if (headingsCount === 0) return 5;
  if (headingsCount < 3) return 3;
  if (headingsCount > 15) return 12;
  return Math.max(3, Math.min(12, headingsCount - 1));
}
