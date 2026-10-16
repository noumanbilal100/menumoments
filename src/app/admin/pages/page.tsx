import Link from 'next/link';
import { DeleteButton } from '@/components/admin/delete-button';
import { Badge, Icon, PageHeader, SectionTitle, cardClass } from '@/components/admin/ui';
import { listPages } from '@/lib/cms/content';
import { deletePageAction } from '../actions';

export const dynamic = 'force-dynamic';

const BUILT_IN = [
  { href: '/about-us/', title: 'About' },
  { href: '/contact/', title: 'Contact' },
  { href: '/write-for-us/', title: 'Write for us' },
  { href: '/privacy-policy/', title: 'Privacy policy' },
  { href: '/terms-conditions/', title: 'Terms & conditions' },
  { href: '/disclaimer/', title: 'Disclaimer' },
  { href: '/best-kitchen-gear/', title: 'Shop (best kitchen gear)' },
  { href: '/collections/', title: 'Collections' },
  { href: '/blog/', title: 'Blog' },
];

export default async function AdminPagesList({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { deleted } = await searchParams;
  const pages = await listPages();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pages"
        description="Standalone pages such as policies or landing pages. Each one lives at menumoments.com/<url>/."
        actions={
          <Link
            href="/admin/pages/new/"
            className="inline-flex items-center gap-2 rounded-lg bg-ember-500 px-4 py-2 text-sm font-medium text-white hover:bg-ember-600"
          >
            <Icon name="pages" />
            New page
          </Link>
        }
      />

      {deleted && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          Page /{deleted}/ deleted.
        </p>
      )}

      <section>
        <SectionTitle>Your pages</SectionTitle>
        <div className={`${cardClass} overflow-x-auto`}>
          {pages.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-medium">No pages yet</p>
              <p className="mt-1 text-sm text-char-200">Create one for a policy, a landing page or anything that is not a post.</p>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="border-b border-bone-200 text-left text-xs font-medium text-char-200 dark:border-char-400">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Updated</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-200 dark:divide-char-400">
                {pages.map((p) => (
                  <tr key={p.slug}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/pages/${p.slug}/edit/`} className="font-medium hover:text-ember-500">
                        {p.title}
                      </Link>
                      <p className="text-xs text-char-200">/{p.slug}/</p>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'draft' ? <Badge tone="warn">Draft</Badge> : <Badge tone="good">Published</Badge>}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-char-200 sm:table-cell">
                      {(p.updatedAt ?? p.publishedAt).slice(0, 10)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link href={`/admin/pages/${p.slug}/edit/`} className="text-xs text-ember-500 hover:underline">
                        Edit
                      </Link>
                      {p.status === 'published' && (
                        <>
                          {' · '}
                          <Link href={`/${p.slug}/`} target="_blank" className="text-xs text-ember-500 hover:underline">
                            View ↗
                          </Link>
                        </>
                      )}
                      {' · '}
                      <DeleteButton action={deletePageAction} slug={p.slug} name={p.title} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <SectionTitle>Built-in pages</SectionTitle>
        <p className="mb-3 text-xs text-char-200">
          These are part of the site&apos;s design and code, so they are changed by a developer rather than here.
        </p>
        <ul className={`${cardClass} divide-y divide-bone-200 dark:divide-char-400`}>
          {BUILT_IN.map((b) => (
            <li key={b.href} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{b.title}</span>
              <Link href={b.href} target="_blank" className="text-xs text-ember-500 hover:underline">
                View ↗
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
