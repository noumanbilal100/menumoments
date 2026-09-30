import Link from 'next/link';
import { categoryRows } from '@/lib/admin-stats';
import { SECTIONS, type SectionKey } from '@/data/taxonomy';

export const dynamic = 'force-dynamic';

export default function AdminCategoriesPage() {
  const rows = categoryRows();
  const bySection = new Map<SectionKey, typeof rows>();
  for (const r of rows) {
    const key = r.section as SectionKey;
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key)!.push(r);
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl">Categories</h1>
        <p className="mt-2 text-sm text-char-200">
          Post counts per category. &ldquo;No ads&rdquo; column tracks the{' '}
          <code className="rounded bg-bone-100 px-1 py-0.5 text-[11px] dark:bg-char-400">
            NO_ADS_CATEGORIES
          </code>{' '}
          set in <code>src/lib/ads.ts</code>.
        </p>
      </div>

      {[...bySection.entries()].map(([sectionKey, catRows]) => (
        <section key={sectionKey}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-char-200">
            {SECTIONS[sectionKey].name}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-bone-200 bg-bone-100 dark:border-char-500 dark:bg-char-500">
            <table className="min-w-full text-sm">
              <thead className="bg-bone-100 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-char-200 dark:bg-char-400">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Posts</th>
                  <th className="px-4 py-3 text-right">Informational</th>
                  <th className="px-4 py-3 text-right">Affiliate</th>
                  <th className="px-4 py-3">Ads state</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {catRows.map((c) => (
                  <tr
                    key={c.slug}
                    className="border-t border-bone-200 hover:bg-bone-50 dark:border-char-400 dark:hover:bg-char-400/50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-char-200">/{c.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{c.postCount}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600">
                      {c.informationalCount || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-char-200">
                      {c.affiliateCount || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {c.adsDisabled ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                          No ads (deny-list)
                        </span>
                      ) : c.informationalCount > 0 ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          Ads on
                        </span>
                      ) : (
                        <span className="rounded-full bg-bone-100 px-2 py-0.5 text-[10px] font-medium text-char-300 dark:bg-char-400 dark:text-bone-100">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.postCount > 0 && (
                        <Link
                          href={`/admin/posts?cat=${c.slug}`}
                          className="text-xs text-ember-500 hover:underline"
                        >
                          View posts →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-dashed border-bone-200 bg-bone-100 p-6 dark:border-char-500 dark:bg-char-500">
        <h3 className="font-display text-lg">Turn off ads for a category</h3>
        <p className="mt-2 text-sm text-char-300 dark:text-bone-100">
          Edit <code className="rounded bg-bone-100 px-1 py-0.5 text-[12px] dark:bg-char-400">src/lib/ads.ts</code>{' '}
          and add the slug to <code>NO_ADS_CATEGORIES</code>:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-char-500 p-4 text-xs text-bone-50 dark:bg-char-600">
{`export const NO_ADS_CATEGORIES = new Set<string>([
  'sponsored-content',
  'partner-posts',
]);`}
        </pre>
      </section>
    </div>
  );
}
