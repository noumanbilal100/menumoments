import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, amazonUrl } from '@/data/products';
import { productsForPost } from '@/data/post-products';

/**
 * Affiliate product block rendered inside an article.
 *
 * Takes the post slug, looks up its ASINs, and renders nothing at all when
 * there are none — so it can sit unconditionally in the post template.
 */
export function ProductRecommendations({ slug }: { slug: string }) {
  const asins = productsForPost(slug);
  if (!asins.length) return null;

  const items = asins
    .map((asin) => PRODUCTS.find((p) => p.asin === asin))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (!items.length) return null;

  const [lead, ...rest] = items;

  return (
    <section className="not-prose my-14 overflow-hidden rounded-2xl border border-bone-200 bg-bone-100 dark:border-char-500 dark:bg-char-500">
      <div className="border-b border-bone-200 px-6 py-5 dark:border-char-400">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">
          What we use
        </p>
        <h2 className="mt-2 font-display text-2xl text-char-500 dark:text-bone-50">
          The kit that makes this easy
        </h2>
      </div>

      {/* Lead pick gets the wide treatment ------------------------------ */}
      <div className="flex flex-col gap-5 border-b border-bone-200 p-6 dark:border-char-400 sm:flex-row sm:items-center">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-bone-50 dark:bg-char-400 sm:w-52">
          <Image
            src={lead.image}
            alt={lead.name}
            fill
            sizes="(min-width: 640px) 208px, 90vw"
            className="object-contain p-2"
          />
        </div>
        <div className="min-w-0 flex-1">
          {lead.verdict && (
            <span className="inline-block rounded-full bg-ember-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
              {lead.verdict}
            </span>
          )}
          <h3 className="mt-2.5 font-display text-xl leading-snug text-char-500 dark:text-bone-50">
            {lead.name}
          </h3>
          {lead.note && <p className="mt-2 text-sm text-char-200">{lead.note}</p>}
          <a
            href={amazonUrl(lead.asin)}
            target="_blank"
            rel="sponsored nofollow noopener"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-ember-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-ember-600 hover:shadow-embered"
          >
            Check price on Amazon
          </a>
        </div>
      </div>

      {/* The rest as a compact row ------------------------------------- */}
      {rest.length > 0 && (
        <div className="grid gap-px bg-bone-200 dark:bg-char-400 sm:grid-cols-2">
          {rest.map((p) => (
            <div key={p.asin} className="flex gap-4 bg-bone-100 p-5 dark:bg-char-500">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-bone-50 dark:bg-char-400">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="80px"
                  className="object-contain p-1.5"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium leading-snug text-char-500 dark:text-bone-50">
                  {p.name}
                </h3>
                {p.note && <p className="mt-1 text-xs text-char-200">{p.note}</p>}
                <a
                  href={amazonUrl(p.asin)}
                  target="_blank"
                  rel="sponsored nofollow noopener"
                  className="mt-2 inline-block text-sm font-medium text-ember-500 hover:text-ember-600"
                >
                  Check price →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="px-6 py-4 text-xs leading-relaxed text-char-200">
        These are affiliate links — we earn a commission if you buy, at no extra cost to you. It
        never changes what we recommend.{' '}
        <Link href="/disclaimer/" className="underline hover:text-ember-500">
          Full disclosure
        </Link>
        .
      </p>
    </section>
  );
}
