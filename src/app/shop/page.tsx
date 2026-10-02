import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS, PRODUCT_CATEGORIES, amazonUrl, type Product } from '@/data/products';
import { SectionHeading } from '@/components/section-heading';
import { Reveal } from '@/components/reveal';
import { SITE_URL } from '@/lib/env';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'The kitchen gear we recommend',
  description:
    'Every appliance and tool Menu Moments recommends, in one place — with links to the full review behind each pick.',
  alternates: { canonical: `${SITE_URL}/shop/` },
};

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-bone-200 bg-bone-100 transition-shadow hover:shadow-cardHover dark:border-char-500 dark:bg-char-500">
      <div className="relative aspect-[4/3] bg-bone-50 dark:bg-char-400">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          className="object-contain p-3"
        />
        {product.verdict && (
          <span className="absolute left-3 top-3 rounded-full bg-ember-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
            {product.verdict}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-char-200">
          {product.category}
        </p>
        <h3 className="mt-2 font-display text-lg leading-snug text-char-500 dark:text-bone-50">
          {product.name}
        </h3>
        {product.note && (
          <p className="mt-2 text-sm leading-relaxed text-char-200">{product.note}</p>
        )}

        <div className="mt-5 flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
          <a
            href={amazonUrl(product.asin)}
            target="_blank"
            rel="sponsored nofollow noopener"
            className="inline-flex flex-1 items-center justify-center rounded-full border border-amazon-border bg-amazon px-4 py-2.5 text-sm font-semibold text-amazon-ink shadow-sm transition-colors hover:bg-amazon-hover"
          >
            Check price on Amazon
          </a>
          <Link
            href={`/${product.guide}/`}
            className="inline-flex items-center justify-center rounded-full border border-bone-200 px-4 py-2.5 text-sm text-char-300 hover:border-ember-500 hover:text-ember-500 dark:border-char-400 dark:text-bone-100"
          >
            Read review
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ShopPage() {
  return (
    <div>
      <header className="border-b border-bone-200 dark:border-char-500">
        <div className="mx-auto max-w-wide px-6 pt-14 pb-10 lg:pt-20">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">
              Tried, tested, kept
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-display-lg text-char-500 dark:text-bone-50">
              The kitchen gear we recommend
            </h1>
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-char-200">
              Everything here earned its place in a real kitchen. Each pick links to the full
              review, so you can read the reasoning before you spend anything.
            </p>
          </Reveal>

          <nav aria-label="Product categories" className="mt-8 flex flex-wrap gap-2">
            {PRODUCT_CATEGORIES.map((c) => (
              <a
                key={c}
                href={`#${c.toLowerCase().replace(/\s+/g, '-')}`}
                className="rounded-full border border-bone-200 px-3.5 py-1.5 text-xs text-char-300 hover:border-ember-500 hover:text-ember-500 dark:border-char-400 dark:text-bone-100"
              >
                {c}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-wide px-6 py-14">
        {PRODUCT_CATEGORIES.map((category) => {
          const items = PRODUCTS.filter((p) => p.category === category);
          return (
            <section
              key={category}
              id={category.toLowerCase().replace(/\s+/g, '-')}
              className="mb-16 scroll-mt-24"
            >
              <SectionHeading eyebrow="Category" title={category} />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p, i) => (
                  <Reveal key={p.asin} delay={i * 70}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}

        <section className="rounded-2xl border border-bone-200 bg-bone-100 p-6 text-sm leading-relaxed text-char-200 dark:border-char-500 dark:bg-char-500 md:p-8">
          <p>
            <strong className="text-char-500 dark:text-bone-50">How we make money.</strong>{' '}
            Menu Moments is a participant in the Amazon Services LLC Associates Program. The links
            above are affiliate links, which means we earn a commission if you buy — at no extra
            cost to you. It never changes what we recommend; everything here is something we would
            tell a friend to buy. See our{' '}
            <Link href="/disclaimer/" className="underline hover:text-ember-500">
              full disclosure
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
