import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, amazonUrl, type Product } from '@/data/products';
import { blockForPost } from '@/data/post-products';

const DEFAULT_EYEBROW = 'What we use';
const DEFAULT_TITLE = 'The kit that makes this easy';

/**
 * Affiliate product block rendered inside an article.
 *
 * Takes the post slug, looks up its block, and renders nothing at all when
 * there is none — so it can sit unconditionally in the post template.
 */
export function ProductRecommendations({ slug }: { slug: string }) {
  const block = blockForPost(slug);
  if (!block) return null;

  const items = block.asins
    .map((asin) => PRODUCTS.find((p) => p.asin === asin))
    .filter((p): p is Product => Boolean(p));
  if (!items.length) return null;

  const [lead, ...rest] = items;

  return (
    <section
      id="our-picks"
      className="not-prose my-14 scroll-mt-24 overflow-hidden rounded-2xl border border-bone-200 bg-bone-100 dark:border-char-500 dark:bg-char-500"
    >
      <div className="border-b border-bone-200 px-6 py-5 dark:border-char-400">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">
          {block.eyebrow ?? DEFAULT_EYEBROW}
        </p>
        <h2 className="mt-2 font-display text-2xl text-char-500 dark:text-bone-50">
          {block.title ?? DEFAULT_TITLE}
        </h2>
        {block.intro && (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-char-300 dark:text-bone-100">
            {block.intro}
          </p>
        )}
      </div>

      {/* Lead pick gets the wide treatment ------------------------------ */}
      <div className="flex flex-col gap-5 border-b border-bone-200 p-6 dark:border-char-400 sm:flex-row sm:items-center">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-white dark:bg-char-400 sm:w-52">
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
          <p className="mt-2 text-sm leading-relaxed text-char-300 dark:text-bone-100">
            {lead.review ?? lead.note}
          </p>
          <Highlights items={lead.highlights} />
          <a
            href={amazonUrl(lead.asin)}
            target="_blank"
            rel="sponsored nofollow noopener"
            className="mt-4 inline-flex items-center justify-center rounded-full border border-amazon-border bg-amazon px-5 py-2.5 text-sm font-semibold text-amazon-ink shadow-sm transition-colors hover:bg-amazon-hover"
          >
            Check price on Amazon
          </a>
        </div>
      </div>

      {/* The rest as a grid -------------------------------------------- */}
      {rest.length > 0 && (
        <div className="grid gap-px bg-bone-200 dark:bg-char-400 sm:grid-cols-2">
          {rest.map((p) => (
            <div key={p.asin} className="flex flex-col bg-bone-100 p-5 dark:bg-char-500">
              <div className="flex gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-white dark:bg-char-400">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="96px"
                    className="object-contain p-1.5"
                  />
                </div>
                <div className="min-w-0">
                  {p.verdict && (
                    <span className="inline-block rounded-full bg-ember-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ember-600 dark:bg-char-400 dark:text-ember-200">
                      {p.verdict}
                    </span>
                  )}
                  <h3 className="mt-1.5 font-medium leading-snug text-char-500 dark:text-bone-50">
                    {p.name}
                  </h3>
                </div>
              </div>
              {(p.review ?? p.note) && (
                <p className="mt-3 text-sm leading-relaxed text-char-300 dark:text-bone-100">
                  {p.review ?? p.note}
                </p>
              )}
              <Highlights items={p.highlights} />
              <div className="mt-auto pt-4">
                <a
                  href={amazonUrl(p.asin)}
                  target="_blank"
                  rel="sponsored nofollow noopener"
                  className="inline-flex items-center justify-center rounded-full border border-amazon-border bg-amazon px-4 py-2 text-xs font-semibold text-amazon-ink transition-colors hover:bg-amazon-hover"
                >
                  Check price on Amazon
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

function Highlights({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {items.map((h) => (
        <li
          key={h}
          className="rounded-md border border-bone-200 bg-white px-2 py-0.5 text-[11px] font-medium text-char-300 dark:border-char-400 dark:bg-char-400 dark:text-bone-100"
        >
          {h}
        </li>
      ))}
    </ul>
  );
}
