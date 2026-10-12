import Link from 'next/link';
import { adminPostRows, adminSnapshot } from '@/lib/admin-stats';
import { Badge, Icon, PageHeader, SectionTitle, StatCard, cardClass } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const s = await adminSnapshot();
  const recent = adminPostRows()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 8);

  const total = Math.max(1, s.totalPosts);
  const seoComplete = s.postsWithSeo === s.totalPosts;
  const heroComplete = s.postsWithoutHero === 0;
  const adsShare = s.adsOnCount / total;
  const attention = s.postsWithoutHeroList.length + s.postsWithoutSeo.length + s.productPhotoGaps.length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description={`${s.totalPosts} posts published between ${fmt(s.oldestPublishedAt)} and ${fmt(s.latestPublishedAt)}.`}
        actions={
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-2 rounded-lg bg-ember-500 px-4 py-2 text-sm font-medium text-white hover:bg-ember-600"
          >
            <Icon name="posts" />
            Browse posts
          </Link>
        }
      />

      <section aria-label="Content">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total posts"
            value={s.totalPosts}
            sub={`${Math.round(s.totalReadingMinutes / 60)}h of reading time`}
            icon={<Icon name="posts" />}
          />
          <StatCard
            label="Categories"
            value={s.totalCategories}
            sub={`${s.totalSections} sections · ${s.totalPages} static pages`}
            icon={<Icon name="categories" />}
          />
          <StatCard
            label="SEO metadata"
            value={`${Math.round((s.postsWithSeo / total) * 100)}%`}
            tone={seoComplete ? 'good' : 'warn'}
            progress={s.postsWithSeo / total}
            sub={`${s.postsWithSeo} of ${s.totalPosts} posts have Yoast / Rank Math data`}
            icon={<Icon name="seo" />}
          />
          <StatCard
            label="Hero images"
            value={`${Math.round((s.postsWithHero / total) * 100)}%`}
            tone={heroComplete ? 'good' : 'warn'}
            progress={s.postsWithHero / total}
            sub={heroComplete ? 'Every post has a hero image' : `${s.postsWithoutHero} posts missing one`}
            icon={<Icon name="images" />}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className={`${cardClass} p-5 lg:col-span-2`} aria-label="Advertising">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Advertising</h2>
              <p className="mt-1 text-xs text-char-200">
                AdSense runs on every post except the buying guides on the no-ads list.
              </p>
            </div>
            {s.adsEnabled ? <Badge tone="good">AdSense connected</Badge> : <Badge tone="warn">AdSense not set</Badge>}
          </div>

          <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-bone-200 dark:bg-char-400">
            <div className="h-full bg-emerald-500" style={{ width: `${adsShare * 100}%` }} />
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="flex items-center gap-2 text-xs text-char-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Ads on
              </dt>
              <dd className="mt-1 text-xl font-semibold">{s.adsOnCount}</dd>
              <p className="text-xs text-char-200">posts showing ads</p>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-xs text-char-200">
                <span className="h-2 w-2 rounded-full bg-char-100" /> Ads off
              </dt>
              <dd className="mt-1 text-xl font-semibold">{s.adsOffCount}</dd>
              <p className="text-xs text-char-200">buying guides earning by affiliate links</p>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-xs text-char-200">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Blocked categories
              </dt>
              <dd className="mt-1 text-xl font-semibold">{s.noAdsCategoryCount}</dd>
              <p className="text-xs text-char-200">on the deny-list</p>
            </div>
          </dl>
          {s.adsEnabled && (
            <p className="mt-4 border-t border-bone-200 pt-3 text-xs text-char-200 dark:border-char-400">
              Publisher ID <span className="font-mono text-char-300 dark:text-bone-100">{s.adsClient}</span>
            </p>
          )}
        </section>

        <section className={`${cardClass} p-5`} aria-label="Shortcuts">
          <h2 className="text-sm font-semibold">Shortcuts</h2>
          <ul className="mt-3 space-y-1">
            {[
              { href: '/admin/posts', label: 'Search and filter posts', icon: 'posts' as const },
              { href: '/admin/categories', label: 'Category counts and ad state', icon: 'categories' as const },
              { href: '/admin/images', label: 'Image health check', icon: 'images' as const },
              { href: '/best-kitchen-gear/', label: 'Open the shop page', icon: 'external' as const },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-char-300 hover:bg-bone-100 hover:text-ember-600 dark:text-bone-100 dark:hover:bg-char-400"
                >
                  <Icon name={l.icon} />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-label="Needs attention">
        <SectionTitle
          aside={attention === 0 ? <Badge tone="good">All clear</Badge> : <Badge tone="warn">{attention} to fix</Badge>}
        >
          Needs attention
        </SectionTitle>
        <div className="grid gap-4 lg:grid-cols-3">
          <AttentionList
            title="Broken product links"
            hint="The link opens a dead or different Amazon listing, so the product keeps a placeholder photo."
            empty="Every product link has its photo."
            items={s.productPhotoGaps.map((g) => ({
              key: `${g.slug}-${g.asin || g.product}`,
              href: `/admin/posts/${g.slug}`,
              primary: g.product,
              secondary: `${g.asin || 'no ASIN'} · ${g.title}`,
            }))}
          />
          <AttentionList
            title="Missing hero image"
            hint="Shown without a lead photo on the site and in social shares."
            empty="Every post has a hero image."
            items={s.postsWithoutHeroList.map((p) => ({
              key: p.slug,
              href: `/admin/posts/${p.slug}`,
              primary: p.title,
              secondary: `/${p.slug}`,
            }))}
          />
          <AttentionList
            title="Missing SEO metadata"
            hint="No Yoast / Rank Math title or description, so search results fall back to the post title and excerpt."
            empty="Every post has SEO metadata."
            items={s.postsWithoutSeo.map((p) => ({
              key: p.slug,
              href: `/admin/posts/${p.slug}`,
              primary: p.title,
              secondary: `/${p.slug}`,
            }))}
          />
        </div>
      </section>

      <section aria-label="Recent posts">
        <SectionTitle
          aside={
            <Link href="/admin/posts" className="text-xs font-medium text-ember-500 hover:underline">
              View all
            </Link>
          }
        >
          Recently published
        </SectionTitle>
        <div className={`${cardClass} overflow-x-auto`}>
          <table className="min-w-full text-sm">
            <thead className="border-b border-bone-200 text-left text-xs font-medium text-char-200 dark:border-char-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="hidden px-4 py-3 sm:table-cell">Category</th>
                <th className="hidden px-4 py-3 sm:table-cell">Published</th>
                <th className="px-4 py-3">Ads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-200 dark:divide-char-400">
              {recent.map((p) => (
                <tr key={p.slug} className="hover:bg-bone-100/70 dark:hover:bg-char-400/40">
                  <td className="max-w-md px-4 py-3">
                    <Link
                      href={`/admin/posts/${p.slug}`}
                      className="line-clamp-2 font-medium hover:text-ember-500 sm:line-clamp-1"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-char-300 dark:text-bone-100 sm:table-cell">
                    {p.primaryCategory ?? '—'}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-char-200 sm:table-cell">
                    {fmt(p.publishedAt)}
                  </td>
                  <td className="px-4 py-3">
                    {p.showsAds ? (
                      <Badge tone="good">Shows</Badge>
                    ) : (
                      <Badge>Off</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AttentionList({
  title,
  hint,
  empty,
  items,
}: {
  title: string;
  hint: string;
  empty: string;
  items: { key: string; href: string; primary: string; secondary: string }[];
}) {
  return (
    <div className={`${cardClass} flex min-w-0 flex-col p-5`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge tone={items.length ? 'warn' : 'good'}>{items.length}</Badge>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-char-200">{hint}</p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">{empty}</p>
      ) : (
        <ul className="mt-3 max-h-72 divide-y divide-bone-200 overflow-y-auto dark:divide-char-400">
          {items.map((i) => (
            <li key={i.key}>
              <Link href={i.href} className="block py-2.5 hover:text-ember-500">
                <span className="line-clamp-2 text-sm font-medium">{i.primary}</span>
                <span className="mt-0.5 block truncate text-xs text-char-200">{i.secondary}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
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
