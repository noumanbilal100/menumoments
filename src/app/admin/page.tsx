import Link from 'next/link';
import { adminSnapshot } from '@/lib/admin-stats';

export const dynamic = 'force-dynamic';

function StatCard({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'default' | 'good' | 'warn' | 'muted';
}) {
  const toneClass =
    tone === 'good'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'warn'
        ? 'text-amber-600 dark:text-amber-400'
        : tone === 'muted'
          ? 'text-char-200'
          : 'text-char-500 dark:text-bone-50';
  return (
    <div className="rounded-2xl border border-bone-200 bg-white p-5 dark:border-char-500 dark:bg-char-500">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-char-200">{label}</p>
      <p className={`mt-2 font-display text-3xl ${toneClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-char-200">{sub}</p>}
    </div>
  );
}

export default async function AdminOverview() {
  const s = await adminSnapshot();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl">Overview</h1>
        <p className="mt-2 text-sm text-char-200">
          Snapshot of your migrated content and AdSense wiring.
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-char-200">
          Content
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total posts" value={s.totalPosts} />
          <StatCard label="Categories" value={s.totalCategories} sub={`${s.totalSections} sections`} />
          <StatCard label="Static pages" value={s.totalPages} sub="from WP export" />
          <StatCard
            label="Posts with SEO"
            value={`${s.postsWithSeo} / ${s.totalPosts}`}
            tone={s.postsWithSeo === s.totalPosts ? 'good' : 'warn'}
            sub="Yoast / Rank Math meta"
          />
          <StatCard label="Reading time" value={`${Math.round(s.totalReadingMinutes / 60)}h`} sub={`${s.totalReadingMinutes} min total`} />
          <StatCard
            label="With hero image"
            value={`${s.postsWithHero} / ${s.totalPosts}`}
            tone={s.postsWithoutHero > 0 ? 'warn' : 'good'}
            sub={s.postsWithoutHero > 0 ? `${s.postsWithoutHero} missing` : 'all set'}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-char-200">
          Ads
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="AdSense"
            value={s.adsEnabled ? 'Connected' : 'Not set'}
            tone={s.adsEnabled ? 'good' : 'warn'}
            sub={s.adsEnabled ? s.adsClient : 'set NEXT_PUBLIC_ADSENSE_CLIENT'}
          />
          <StatCard
            label="Ads on posts"
            value={s.informationalCount}
            tone="good"
            sub="informational articles"
          />
          <StatCard
            label="Ads skipped"
            value={s.affiliateCount}
            tone="muted"
            sub="affiliate / buying guides"
          />
          <StatCard
            label="Blocked categories"
            value={s.noAdsCategoryCount}
            sub="NO_ADS_CATEGORIES set"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-char-200">
          Timeline
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Newest post"
            value={fmt(s.latestPublishedAt)}
            sub={s.latestPublishedAt ?? '—'}
          />
          <StatCard
            label="Oldest post"
            value={fmt(s.oldestPublishedAt)}
            sub={s.oldestPublishedAt ?? '—'}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-bone-200 bg-white p-6 dark:border-char-500 dark:bg-char-500">
        <h3 className="font-display text-lg">Quick actions</h3>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/admin/posts" className="text-ember-500 hover:underline">
              → Browse all {s.totalPosts} posts
            </Link>
          </li>
          <li>
            <Link href="/admin/categories" className="text-ember-500 hover:underline">
              → See per-category counts and ads state
            </Link>
          </li>
          <li>
            <Link href="/admin/images" className="text-ember-500 hover:underline">
              → Image health check
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}

function fmt(iso: string | null): string {
  if (!iso) return '—';
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
