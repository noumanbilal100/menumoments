import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS, PRODUCT_CATEGORIES, amazonUrl } from '@/data/products';
import { ShopCatalog } from '@/components/shop-catalog';
import { SITE_URL } from '@/lib/env';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Shop the kitchen gear we recommend',
  description:
    'Every appliance and tool Menu Moments recommends, in one place — browse by category, compare our picks, and buy on Amazon.',
  alternates: { canonical: `${SITE_URL}/shop/` },
};

const TRUST = [
  {
    title: 'Hand-picked',
    body: 'Every product comes from one of our guides',
    icon: 'M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z',
  },
  {
    title: 'Checkout on Amazon',
    body: 'Pay with your own Amazon account',
    icon: 'M6 7h12l-1 13H7zM9 7a3 3 0 016 0',
  },
  {
    title: 'Delivery & returns',
    body: 'Handled by Amazon, not by us',
    icon: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z',
  },
  {
    title: 'Read before you buy',
    body: 'Each pick links to its full review',
    icon: 'M4 5h7v14H4zM13 5h7v14h-7z',
  },
];

const STEPS = [
  { n: '1', title: 'Pick what fits', body: 'Filter by category or search, and read the review behind any product.' },
  { n: '2', title: 'Check today’s price', body: 'Prices change daily, so the button takes you to the live Amazon listing.' },
  { n: '3', title: 'Buy on Amazon', body: 'Checkout, delivery and returns all happen on Amazon. We never see your payment details.' },
];

export default function ShopPage() {
  const heroPicks = PRODUCTS.filter((p) => p.verdict === 'Top pick' || p.verdict === 'Best overall').slice(0, 4);
  const buyUrls = Object.fromEntries(PRODUCTS.map((p) => [p.asin, amazonUrl(p.asin)]));

  return (
    <div className="bg-bone-50 dark:bg-char-600">
      {/* Hero ---------------------------------------------------------- */}
      <section className="border-b border-bone-200 bg-gradient-to-b from-ember-50 to-bone-50 dark:border-char-500 dark:from-char-500 dark:to-char-600">
        <div className="mx-auto grid max-w-wide items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember-500">
              The Menu Moments shop
            </p>
            <h1 className="mt-4 max-w-xl font-display text-display-lg text-char-500 dark:text-bone-50">
              Kitchen gear we recommend
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-char-300 dark:text-bone-100">
              {PRODUCTS.length} appliances and tools from our reviews and guides, in one place. Compare
              them here, then buy on Amazon.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#catalog"
                className="rounded-full bg-char-500 px-6 py-3 text-sm font-semibold text-white hover:bg-char-600 dark:bg-bone-50 dark:text-char-600"
              >
                Browse all products
              </a>
              <Link
                href="/category/product-reviews/"
                className="rounded-full border border-char-500/20 bg-white/60 px-6 py-3 text-sm font-semibold text-char-500 hover:border-char-500 dark:border-bone-50/30 dark:bg-transparent dark:text-bone-50"
              >
                Read the reviews
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {heroPicks.map((p, i) => (
              <a
                key={p.asin}
                href={buyUrls[p.asin]}
                target="_blank"
                rel="sponsored nofollow noopener"
                className={`group relative overflow-hidden rounded-2xl border border-bone-200 bg-white p-3 shadow-card transition hover:-translate-y-0.5 hover:shadow-cardHover dark:border-char-400 ${
                  i % 2 === 1 ? 'sm:translate-y-6' : ''
                }`}
              >
                <div className="relative aspect-square">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    priority={i < 2}
                    sizes="(min-width: 1024px) 260px, 45vw"
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2 truncate text-xs font-medium text-char-300">{p.name}</p>
                <span className="absolute left-3 top-3 rounded-full bg-ember-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                  {p.verdict}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip --------------------------------------------------- */}
      <section className="border-b border-bone-200 dark:border-char-500">
        <ul className="mx-auto grid max-w-wide grid-cols-2 gap-x-6 gap-y-5 px-4 py-6 sm:px-6 lg:grid-cols-4">
          {TRUST.map((t) => (
            <li key={t.title} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ember-50 text-ember-500 dark:bg-char-500 dark:text-ember-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
                  <path d={t.icon} />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-char-500 dark:text-bone-50">{t.title}</p>
                <p className="text-xs leading-snug text-char-200">{t.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Catalogue ----------------------------------------------------- */}
      <section className="mx-auto max-w-wide px-4 pb-16 pt-8 sm:px-6">
        <ShopCatalog products={PRODUCTS} categories={PRODUCT_CATEGORIES} buyUrls={buyUrls} />
      </section>

      {/* How it works -------------------------------------------------- */}
      <section className="border-t border-bone-200 bg-bone-100 dark:border-char-500 dark:bg-char-500">
        <div className="mx-auto max-w-wide px-4 py-14 sm:px-6">
          <h2 className="font-display text-display-md text-char-500 dark:text-bone-50">How buying works</h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-2xl border border-bone-200 bg-white p-6 dark:border-char-400 dark:bg-char-600">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amazon font-semibold text-amazon-ink">
                  {s.n}
                </span>
                <h3 className="mt-4 font-semibold text-char-500 dark:text-bone-50">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-char-200">{s.body}</p>
              </li>
            ))}
          </ol>

          <p className="mt-10 max-w-3xl text-sm leading-relaxed text-char-200">
            <strong className="text-char-500 dark:text-bone-50">How we make money.</strong> Menu Moments
            is a participant in the Amazon Services LLC Associates Program. The links on this page are
            affiliate links, which means we earn a commission if you buy — at no extra cost to you. It
            never changes what we recommend. See our{' '}
            <Link href="/disclaimer/" className="underline hover:text-ember-500">
              full disclosure
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
