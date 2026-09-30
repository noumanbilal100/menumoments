import Link from 'next/link';
import Image from 'next/image';
import { PostCard } from '@/components/post-card';
import { SectionHeading } from '@/components/section-heading';
import { TrendingList } from '@/components/trending-list';
import { CollectionCard } from '@/components/collection-card';
import { Reveal } from '@/components/reveal';
import { Counter } from '@/components/counter';
import {
  Whisk,
  Olive,
  Chili,
  CoffeeBean,
  Croissant,
  Fork,
  Squiggle,
  Sparkle,
  DrawArrow,
  QuoteMark,
} from '@/components/doodles';
import { listPostsInCategory, listRecentPosts, getPost, allPostSlugs } from '@/lib/content';
import { CATEGORIES, SECTIONS, SectionKey, categoriesInSection } from '@/data/taxonomy';
import { COLLECTIONS } from '@/data/collections';
import { SITE } from '@/lib/env';

export const revalidate = 3600;

export default async function HomePage() {
  const [recent, dinners, gear, reviews, breakfast, desserts] = await Promise.all([
    listRecentPosts(20),
    listPostsInCategory('dinner', 4),
    listPostsInCategory('kitchen-appliances', 5),
    listPostsInCategory('food-reviews', 6),
    listPostsInCategory('breakfast', 4),
    listPostsInCategory('desserts', 4),
  ]);

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

  const [feature, second, ...others] = recent;
  const trendingList = recent.slice(2, 7);
  const moreToRead = recent.slice(7, 16);

  const sectionCovers = await Promise.all(
    (Object.keys(SECTIONS) as SectionKey[]).map(async (key) => {
      const cat = categoriesInSection(key)[0];
      const posts = await listPostsInCategory(cat.slug, 1);
      return { key, cover: posts[0]?.heroImage?.src };
    }),
  );
  const sectionCoverMap = new Map(sectionCovers.map((s) => [s.key, s.cover]));

  return (
    <div>
      {/* Masthead ---------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-bone-200/60 dark:border-char-500">
        {/* Warm floating blobs — bring sunlit warmth into the hero */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-16 h-96 w-96 rounded-full bg-ember-100 opacity-70 blur-3xl animate-blob" />
          <div className="absolute -top-16 right-0 h-80 w-80 rounded-full bg-saffron-200 opacity-60 blur-3xl animate-blob [animation-delay:4s]" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-berry-100 opacity-50 blur-3xl animate-blob [animation-delay:8s]" />
        </div>
        {/* Corner flourish */}
        <div className="pointer-events-none absolute -right-8 top-16 hidden text-ember-300 lg:block">
          <Whisk size={140} className="animate-float" />
        </div>
        <div className="pointer-events-none absolute -left-4 bottom-24 hidden text-moss-300 md:block">
          <Olive size={100} className="animate-float [animation-delay:1s]" />
        </div>

        <div className="mx-auto max-w-wide px-6 pt-12 pb-16 lg:pt-16 lg:pb-24">
          <Reveal>
            <div className="mb-10 grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-end">
              <div>
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-ember-200 bg-bone-100/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500 dark:bg-char-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember-500" />
                  {seasonLabel()} · Issue {issueNumber()}
                </p>
                <h1 className="font-display text-display-xl text-char-500 dark:text-bone-50">
                  Cook with confidence.
                  <span className="relative inline-block">
                    <span className="italic text-gradient-warm">Eat with pleasure.</span>
                    <Squiggle className="absolute -bottom-2 left-0 hidden text-ember-300 md:block" />
                  </span>
                </h1>
              </div>
              <p className="max-w-md text-lg leading-relaxed text-char-200 md:justify-self-end">
                {SITE.description}
              </p>
            </div>
          </Reveal>

          {/* Dual hero */}
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            {feature && (
              <Reveal delay={100}>
                <Link
                  href={`/${feature.slug}`}
                  className="zoom-parent group relative block overflow-hidden rounded-3xl bg-char-500 text-bone-50 shadow-card"
                >
                  <div className="relative aspect-[16/10] w-full lg:aspect-[16/11]">
                    {feature.heroImage ? (
                      <Image
                        src={feature.heroImage.src}
                        alt={feature.heroImage.alt}
                        fill
                        priority
                        sizes="(min-width: 1024px) 60vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-ember-300 to-ember-600" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-char-600 via-char-600/40 to-transparent" />
                    <div className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full bg-ember-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                      <Sparkle size={12} /> This week's cover
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-8 lg:p-10">
                    <h2 className="max-w-2xl font-display text-3xl leading-[1.05] md:text-4xl lg:text-5xl">
                      {feature.title}
                    </h2>
                    {feature.excerpt && (
                      <p className="mt-4 max-w-xl text-sm text-bone-100/80 md:text-base">
                        {feature.excerpt}
                      </p>
                    )}
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                      Read the story
                      <DrawArrow className="text-ember-300 transition-transform duration-500 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )}
            <div className="flex flex-col gap-6">
              {second && (
                <Reveal delay={200}>
                  <Link
                    href={`/${second.slug}`}
                    className="zoom-parent group relative block overflow-hidden rounded-2xl border border-bone-200 bg-bone-100 dark:border-char-500 dark:bg-char-400"
                  >
                    <div className="relative aspect-[16/10]">
                      {second.heroImage && (
                        <Image
                          src={second.heroImage.src}
                          alt={second.heroImage.alt}
                          fill
                          sizes="(min-width: 1024px) 30vw, 100vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="p-5">
                      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ember-500">
                        <Fork size={12} /> Editor's pick
                      </p>
                      <p className="mt-1 font-display text-lg leading-tight text-char-500 group-hover:text-ember-500 dark:text-bone-50">
                        {second.title}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              )}
              <Reveal delay={300}>
                <div className="rounded-2xl border border-bone-200 bg-bone-100 p-5 dark:border-char-500 dark:bg-char-400">
                  <TrendingList posts={trendingList.slice(0, 5)} title="Trending this week" />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* By the numbers — real numbers only, derived at build time --- */}
      <section className="border-b border-bone-200 bg-bone-100 dark:border-char-500 dark:bg-char-400">
        <div className="mx-auto grid max-w-wide grid-cols-2 gap-6 px-6 py-14 md:grid-cols-4">
          {[
            { n: allPostSlugs().length, label: 'Recipes & guides', icon: <Fork size={22} /> },
            { n: CATEGORIES.length, label: 'Categories', icon: <Whisk size={22} /> },
            { n: COLLECTIONS.length, label: 'Curated collections', icon: <Croissant size={22} /> },
            { n: reviews.length + gear.length, label: 'Reviews & guides', icon: <CoffeeBean size={22} /> },
          ].map((s) => (
            <Reveal key={s.label} className="text-center">
              <div className="text-ember-500">{s.icon}</div>
              <p className="mt-2 font-display text-4xl text-char-500 dark:text-bone-50">
                <Counter to={s.n} />
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-char-200">
                {s.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Collections ------------------------------------------------ */}
      <section className="relative mx-auto max-w-wide px-6 py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Editor-curated"
            title="Start with a collection"
            href="/collections"
            linkLabel="All collections"
          />
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.slice(0, 3).map((c, i) => (
            <Reveal key={c.slug} delay={i * 100}>
              <CollectionCard collection={c} cover={coverMap.get(c.slug)} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Section tile strip ----------------------------------------- */}
      <section className="relative overflow-hidden border-y border-bone-200 bg-bone-100/60 dark:border-char-500 dark:bg-char-400/50">
        <div className="pointer-events-none absolute -right-16 top-20 hidden text-saffron-200 lg:block">
          <Chili size={160} className="animate-wiggle" />
        </div>
        <div className="mx-auto max-w-wide px-6 py-20">
          <Reveal>
            <SectionHeading eyebrow="Explore" title="Wherever your appetite starts" />
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {(Object.keys(SECTIONS) as SectionKey[]).map((key, i) => {
              const s = SECTIONS[key];
              const firstCat = categoriesInSection(key)[0];
              const cover = sectionCoverMap.get(key);
              const count = CATEGORIES.filter((c) => c.section === key).length;
              return (
                <Reveal key={key} delay={i * 60}>
                  <Link
                    href={`/category/${firstCat.slug}`}
                    className="zoom-parent group relative block aspect-square overflow-hidden rounded-2xl bg-char-500"
                  >
                    {cover && (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover opacity-70 transition duration-700 group-hover:opacity-90"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-char-600/95 via-char-600/50 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-bone-50">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ember-200">
                        {count} categories
                      </p>
                      <p className="mt-0.5 font-display text-xl leading-tight">{s.name}</p>
                    </div>
                    <span className="absolute right-3 top-3 flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-bone-100/95 text-char-500 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      →
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Weeknight dinners + gear rail ------------------------------ */}
      <section className="mx-auto max-w-wide px-6 py-20">
        <div className="grid gap-16 lg:grid-cols-[2fr_1fr]">
          <div>
            <Reveal>
              <SectionHeading
                eyebrow="On the table tonight"
                title="Weeknight dinners"
                href="/category/dinner"
              />
            </Reveal>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {dinners.slice(0, 4).map((p, i) => (
                <Reveal key={p.slug} delay={i * 80}>
                  <PostCard post={p} />
                </Reveal>
              ))}
            </div>
          </div>
          <aside>
            <Reveal>
              <div className="mb-8">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-ember-500">
                  <Whisk size={14} /> Gear
                </p>
                <h2 className="font-display text-display-md">Kitchen essentials</h2>
                <p className="mt-2 text-sm text-char-200">
                  The tools we've tested, use daily, and would replace tomorrow.
                </p>
              </div>
            </Reveal>
            <div className="space-y-6">
              {gear.slice(0, 5).map((p, i) => (
                <Reveal key={p.slug} delay={i * 60}>
                  <PostCard post={p} variant="compact" />
                </Reveal>
              ))}
            </div>
            <Link
              href="/category/kitchen-appliances"
              className="cta-underline mt-6 inline-flex items-center gap-1 text-sm font-medium text-ember-500 hover:text-ember-600"
            >
              All gear guides →
            </Link>
          </aside>
        </div>
      </section>

      {/* Editor's letter with pull quote --------------------------- */}
      <section className="relative overflow-hidden border-y border-bone-200 bg-ember-50 py-24 dark:border-char-500 dark:bg-char-500">
        <div className="pointer-events-none absolute -left-8 top-8 text-ember-200">
          <QuoteMark size={140} />
        </div>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-ember-500">
              <Fork size={12} /> From the editor
            </p>
            <p className="font-display text-2xl leading-snug text-char-500 dark:text-bone-50 md:text-[2rem]">
              &ldquo;We started this magazine because most cooking sites either treat you like
              you've never turned on a stove, or expect a working knowledge of Escoffier. We're
              trying to be the friend who cooks <span className="italic text-ember-500">with</span>{' '}
              you.&rdquo;
            </p>
            <p className="mt-6 text-sm uppercase tracking-[0.2em] text-char-200">
              &mdash; {SITE.author}, editor
            </p>
            <div className="mx-auto mt-4 text-ember-300">
              <Squiggle />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Breakfast + Desserts split -------------------------------- */}
      <section className="mx-auto max-w-wide px-6 py-20">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <Reveal>
              <SectionHeading eyebrow="Sunrise" title="For breakfast" href="/category/breakfast" />
            </Reveal>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {breakfast.slice(0, 2).map((p, i) => (
                <Reveal key={p.slug} delay={i * 100}>
                  <PostCard post={p} />
                </Reveal>
              ))}
            </div>
          </div>
          <div>
            <Reveal>
              <SectionHeading eyebrow="Sweet endings" title="For dessert" href="/category/desserts" />
            </Reveal>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {desserts.slice(0, 2).map((p, i) => (
                <Reveal key={p.slug} delay={i * 100}>
                  <PostCard post={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Food reviews dark section --------------------------------- */}
      <section className="relative overflow-hidden border-t border-bone-200 bg-char-500 py-24 text-bone-50 dark:border-char-500 dark:bg-char-600">
        <div className="pointer-events-none absolute -right-8 top-16 text-ember-500/20">
          <Chili size={180} />
        </div>
        <div className="mx-auto max-w-wide px-6">
          <Reveal>
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-ember-300">
                  <Sparkle size={12} /> Food reviews
                </p>
                <h2 className="font-display text-display-md">Menus, deals and honest takes</h2>
                <p className="mt-3 max-w-xl text-bone-100/70">
                  Happy hours, daily specials and full menu deep-dives on the chains we all love
                  (and the ones we won't return to).
                </p>
              </div>
              <Link
                href="/category/food-reviews"
                className="cta-underline text-sm font-medium text-ember-200 hover:text-white"
              >
                All food reviews →
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 6).map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <div className="group border-b border-bone-50/10 pb-6">
                  <Link href={`/${p.slug}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ember-300">
                      Restaurant guide
                    </p>
                    <h3 className="mt-2 font-display text-xl leading-snug transition-colors group-hover:text-ember-200">
                      {p.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-bone-100/70">{p.excerpt}</p>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* More posts -------------------------------------------------- */}
      <section className="mx-auto max-w-wide px-6 py-20">
        <Reveal>
          <SectionHeading eyebrow="More to read" title="Keep browsing" href="/blog" />
        </Reveal>
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {moreToRead.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 100}>
              <PostCard post={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Newsletter -------------------------------------------------- */}
      <section className="relative overflow-hidden border-t border-bone-200 bg-gradient-to-br from-ember-50 via-bone-100 to-ember-100 dark:border-char-500 dark:from-char-400 dark:via-char-500 dark:to-char-500">
        <div className="pointer-events-none absolute -top-16 -left-12 h-72 w-72 rounded-full bg-saffron-200/60 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-ember-100/70 blur-3xl animate-blob [animation-delay:6s]" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <Reveal>
            <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-saffron-500">
              <CoffeeBean size={12} /> Weekly, worth opening
            </p>
            <h2 className="font-display text-display-md text-char-500">
              One really good recipe,
              <br />
              <span className="italic text-ember-500">straight to your inbox.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-char-300">
              Plus a kitchen shortcut, a product we're loving, and a link worth clicking. No spam,
              unsubscribe in one click.
            </p>
            <form className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full border border-char-500/15 bg-bone-100 p-1.5">
              <label htmlFor="hero-newsletter" className="sr-only">Email</label>
              <input
                id="hero-newsletter"
                type="email"
                placeholder="you@yourinbox.com"
                className="flex-1 border-0 bg-transparent px-4 text-sm outline-none placeholder:text-char-200"
                required
              />
              <button
                type="submit"
                className="rounded-full bg-char-500 px-5 py-2.5 text-sm font-medium text-bone-50 transition-all hover:bg-ember-500 hover:shadow-embered"
              >
                Subscribe →
              </button>
            </form>
            <p className="mt-4 text-xs text-char-200">
              Free. One email a week. Unsubscribe anytime.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function seasonLabel(): string {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'Spring';
  if (m >= 5 && m <= 7) return 'Summer';
  if (m >= 8 && m <= 10) return 'Fall';
  return 'Winter';
}

function issueNumber(): string {
  const year = new Date().getFullYear();
  const week = Math.ceil(
    ((new Date().getTime() - new Date(year, 0, 1).getTime()) / 86400000 +
      new Date(year, 0, 1).getDay() +
      1) /
      7,
  );
  return `${String(week).padStart(2, '0')}/${year}`;
}
