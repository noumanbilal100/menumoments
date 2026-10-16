import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContentForm } from '@/components/admin/content-form';
import { DeleteButton } from '@/components/admin/delete-button';
import { Badge, PageHeader } from '@/components/admin/ui';
import { loadPage } from '@/lib/cms/content';
import { deletePageAction, savePageAction } from '../../../actions';

export const dynamic = 'force-dynamic';

export default async function EditSitePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { slug } = await params;
  const { saved } = await searchParams;
  const page = await loadPage(slug);
  if (!page) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/pages/" className="text-xs text-ember-500 hover:underline">
        ← All pages
      </Link>
      <PageHeader
        title="Edit page"
        description={
          <span className="flex flex-wrap items-center gap-2">
            {page.status === 'draft' ? <Badge tone="warn">Draft</Badge> : <Badge tone="good">Published</Badge>}
            <span>/{page.slug}/</span>
          </span>
        }
      />
      <ContentForm
        kind="page"
        isNew={false}
        action={savePageAction}
        liveUrl={page.status === 'published' ? `/${page.slug}/` : undefined}
        savedNotice={saved ? 'Page created.' : undefined}
        values={{
          slug: page.slug,
          title: page.title,
          html: page.html,
          lede: page.lede,
          status: page.status,
          seoTitle: page.seo?.seoTitle,
          metaDescription: page.seo?.metaDescription,
          focusKeyword: page.seo?.focusKeyword,
        }}
      />
      <section className="rounded-xl border border-red-200 p-5 dark:border-red-900">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">Delete this page</h2>
        <p className="mt-1 text-xs text-char-200">Removes the page from the site and the sitemap.</p>
        <div className="mt-3">
          <DeleteButton action={deletePageAction} slug={page.slug} name={page.title} label="Delete page" />
        </div>
      </section>
    </div>
  );
}
