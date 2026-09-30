import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-clay-500">404</p>
      <h1 className="font-display text-display-lg text-ink-500 dark:text-cream-50">
        This page didn't rise.
      </h1>
      <p className="mt-4 max-w-md text-ink-300">
        The URL you followed doesn't match anything on Menu Moments. Try one of these instead:
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-clay-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-clay-600"
        >
          Home
        </Link>
        <Link
          href="/blog"
          className="rounded-full border border-ink-500/20 px-5 py-2.5 text-sm font-medium hover:border-clay-500 hover:text-clay-500"
        >
          All posts
        </Link>
        <Link
          href="/category/recipes"
          className="rounded-full border border-ink-500/20 px-5 py-2.5 text-sm font-medium hover:border-clay-500 hover:text-clay-500"
        >
          Recipes
        </Link>
      </div>
    </div>
  );
}
