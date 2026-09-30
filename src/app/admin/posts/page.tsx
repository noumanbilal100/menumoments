import Link from 'next/link';
import { adminPostRows } from '@/lib/admin-stats';
import { CATEGORIES } from '@/data/taxonomy';

export const dynamic = 'force-dynamic';

interface SearchParams {
  q?: string;
  cat?: string;
  ads?: 'all' | 'on' | 'off';
  kind?: string;
  page?: string;
}

const PER_PAGE = 40;

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim().toLowerCase();
  const cat = sp.cat ?? '';
  const ads = sp.ads ?? 'all';
  const kind = sp.kind ?? '';
  const page = Math.max(1, Number(sp.page ?? 1));

  const all = adminPostRows();
  let filtered = all;

  if (q) filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || p.slug.includes(q));
  if (cat) filtered = filtered.filter((p) => p.categories.includes(cat));
  if (ads === 'on') filtered = filtered.filter((p) => p.showsAds);
  if (ads === 'off') filtered = filtered.filter((p) => !p.showsAds);
  if (kind) filtered = filtered.filter((p) => p.kind === kind);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const clampedPage = Math.min(page, totalPages);
  const rows = filtered.slice((clampedPage - 1) * PER_PAGE, clampedPage * PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">All posts</h1>
          <p className="mt-1 text-sm text-char-200">
            Showing <strong>{filtered.length}</strong> of {all.length} posts
            {q && ` matching "${q}"`}
            {cat && ` in ${cat}`}
          </p>
        </div>
      </div>

      {/* Filters ------------------------------------------------------ */}
      <form
        method="get"
        className="grid gap-3 rounded-2xl border border-bone-200 bg-white p-4 dark:border-char-500 dark:bg-char-500 sm:grid-cols-4"
      >
        <div className="sm:col-span-2">
          <label htmlFor="q" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-char-200">
            Search title / slug
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="e.g. hanky panky"
            className="mt-1 w-full rounded-lg border border-bone-200 bg-bone-50 px-3 py-2 text-sm outline-none focus:border-ember-500 dark:border-char-400 dark:bg-char-600"
          />
        </div>
        <div>
          <label htmlFor="cat" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-char-200">
            Category
          </label>
          <select
            id="cat"
            name="cat"
            defaultValue={cat}
            className="mt-1 w-full rounded-lg border border-bone-200 bg-bone-50 px-3 py-2 text-sm outline-none focus:border-ember-500 dark:border-char-400 dark:bg-char-600"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ads" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-char-200">
            Ads state
          </label>
          <select
            id="ads"
            name="ads"
            defaultValue={ads}
            className="mt-1 w-full rounded-lg border border-bone-200 bg-bone-50 px-3 py-2 text-sm outline-none focus:border-ember-500 dark:border-char-400 dark:bg-char-600"
          >
            <option value="all">All</option>
            <option value="on">Shows ads</option>
            <option value="off">No ads</option>
          </select>
        </div>
        <div className="sm:col-span-4 flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="rounded-full bg-ember-500 px-5 py-2 text-sm font-medium text-white hover:bg-ember-600"
          >
            Apply
          </button>
          <Link
            href="/admin/posts"
            className="rounded-full border border-bone-200 px-4 py-2 text-sm text-char-300 hover:border-ember-500 hover:text-ember-500 dark:border-char-400"
          >
            Reset
          </Link>
        </div>
      </form>

      {/* Table -------------------------------------------------------- */}
      <div className="overflow-x-auto rounded-2xl border border-bone-200 bg-white dark:border-char-500 dark:bg-char-500">
        <table className="min-w-full text-sm">
          <thead className="bg-bone-100 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-char-200 dark:bg-char-400">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Kind</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Reading</th>
              <th className="px-4 py-3">Ads</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-char-200">
                  No posts match your filters.
                </td>
              </tr>
            )}
            {rows.map((p) => (
              <tr
                key={p.slug}
                className="border-t border-bone-200 hover:bg-bone-50 dark:border-char-400 dark:hover:bg-char-400/50"
              >
                <td className="max-w-md px-4 py-3">
                  <Link
                    href={`/admin/posts/${p.slug}`}
                    className="font-medium text-char-500 hover:text-ember-500 dark:text-bone-50"
                  >
                    {p.title}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-char-200">/{p.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-bone-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-char-300 dark:bg-char-400 dark:text-bone-100">
                    {p.kind}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-char-300 dark:text-bone-100">
                  {p.primaryCategory ?? '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-char-200">
                  {fmt(p.publishedAt)}
                </td>
                <td className="px-4 py-3 text-xs text-char-200">{p.readingMinutes} min</td>
                <td className="px-4 py-3">
                  {p.showsAds ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      Shows
                    </span>
                  ) : (
                    <span className="rounded-full bg-bone-100 px-2 py-0.5 text-[10px] font-medium text-char-300 dark:bg-char-400 dark:text-bone-100">
                      {p.isAffiliate ? 'Affiliate' : 'Off'}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link
                    href={`/admin/posts/${p.slug}`}
                    className="text-xs text-ember-500 hover:underline"
                  >
                    View
                  </Link>
                  {' · '}
                  <Link
                    href={`/${p.slug}`}
                    target="_blank"
                    className="text-xs text-ember-500 hover:underline"
                  >
                    Open ↗
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination --------------------------------------------------- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-char-200">
            Page {clampedPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            {clampedPage > 1 && (
              <PageLink searchParams={sp} page={clampedPage - 1} label="← Prev" />
            )}
            {clampedPage < totalPages && (
              <PageLink searchParams={sp} page={clampedPage + 1} label="Next →" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PageLink({
  searchParams,
  page,
  label,
}: {
  searchParams: SearchParams;
  page: number;
  label: string;
}) {
  const usp = new URLSearchParams();
  if (searchParams.q) usp.set('q', searchParams.q);
  if (searchParams.cat) usp.set('cat', searchParams.cat);
  if (searchParams.ads && searchParams.ads !== 'all') usp.set('ads', searchParams.ads);
  if (searchParams.kind) usp.set('kind', searchParams.kind);
  usp.set('page', String(page));
  return (
    <Link
      href={`/admin/posts?${usp}`}
      className="rounded-full border border-bone-200 px-4 py-2 text-xs hover:border-ember-500 hover:text-ember-500 dark:border-char-400"
    >
      {label}
    </Link>
  );
}

function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
