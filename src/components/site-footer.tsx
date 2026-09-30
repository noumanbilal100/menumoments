import Link from 'next/link';
import { Logo } from './logo';
import { SECTIONS, SectionKey, categoriesInSection } from '@/data/taxonomy';
import { SITE } from '@/lib/env';
import { Squiggle, Whisk, CoffeeBean, Sparkle } from './doodles';

const FOOTER_SECTIONS: SectionKey[] = ['recipes', 'lifestyle', 'gear', 'reviews'];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-bone-200 bg-char-500 text-bone-100 dark:border-char-500 dark:bg-char-600">
      <div className="pointer-events-none absolute -right-8 top-8 text-ember-500/20">
        <Whisk size={140} />
      </div>
      <div className="pointer-events-none absolute -left-4 bottom-16 text-saffron-300/20">
        <CoffeeBean size={100} />
      </div>

      <div className="relative mx-auto max-w-wide px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2.6fr]">
          <div>
            <div className="[&_span]:text-bone-50">
              <Logo />
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-bone-100/80">
              {SITE.description}
            </p>

            <form className="mt-6 flex max-w-sm items-center gap-2 rounded-full border border-bone-100/20 bg-char-400 p-1.5">
              <label htmlFor="newsletter" className="sr-only">Email address</label>
              <input
                id="newsletter"
                type="email"
                required
                placeholder="Recipes in your inbox"
                className="flex-1 border-0 bg-transparent px-3 text-sm outline-none placeholder:text-bone-100/50"
              />
              <button
                type="submit"
                className="rounded-full bg-ember-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-ember-600 hover:shadow-embered"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-xs text-bone-100/50">Weekly. Unsubscribe with one click.</p>

            <div className="mt-8 flex items-center gap-2 text-ember-200">
              <Sparkle size={14} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">
                Editorial · Recipes · Reviews
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {FOOTER_SECTIONS.map((s) => (
              <div key={s}>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-300">
                  {SECTIONS[s].name}
                </p>
                <ul className="space-y-2 text-sm">
                  {categoriesInSection(s)
                    .slice(0, 6)
                    .map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/category/${c.slug}`}
                          className="cta-underline text-bone-100/80 hover:text-ember-200"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex justify-center text-ember-300/60">
          <Squiggle />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-bone-100/10 pt-8 text-sm text-bone-100/70 md:flex-row md:items-center">
          <p>&copy; {new Date().getFullYear()} {SITE.name}. Recipes tested. Opinions honest.</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li><Link href="/about-us" className="cta-underline hover:text-ember-200">About</Link></li>
            <li><Link href="/contact" className="cta-underline hover:text-ember-200">Contact</Link></li>
            <li><Link href="/write-for-us" className="cta-underline hover:text-ember-200">Write for us</Link></li>
            <li><Link href="/collections" className="cta-underline hover:text-ember-200">Collections</Link></li>
            <li><Link href="/privacy-policy" className="cta-underline hover:text-ember-200">Privacy</Link></li>
            <li><Link href="/terms-conditions" className="cta-underline hover:text-ember-200">Terms</Link></li>
            <li><Link href="/disclaimer" className="cta-underline hover:text-ember-200">Disclaimer</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
