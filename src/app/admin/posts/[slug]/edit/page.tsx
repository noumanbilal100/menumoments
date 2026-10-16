import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContentForm } from '@/components/admin/content-form';
import { DeleteButton } from '@/components/admin/delete-button';
import { Badge, PageHeader } from '@/components/admin/ui';
import { getCategory } from '@/data/taxonomy';
import { stripPastedMarkup } from '@/lib/clean-html';
import { loadPost } from '@/lib/cms/content';
import { deletePostAction, savePostAction } from '../../../actions';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { slug } = await params;
  const { saved } = await searchParams;
  const loaded = await loadPost(slug);
  if (!loaded) notFound();
  const { record, status } = loaded;

  const categories: string[] = [];
  for (const s of record.wpCategorySlugs) {
    const cat = getCategory(s);
    if (cat && !categories.includes(cat.slug)) categories.push(cat.slug);
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/posts/" className="text-xs text-ember-500 hover:underline">
        ← All posts
      </Link>
      <PageHeader
        title="Edit post"
        description={
          <span className="flex flex-wrap items-center gap-2">
            {status === 'draft' ? <Badge tone="warn">Draft</Badge> : <Badge tone="good">Published</Badge>}
            <span className="truncate">/{record.slug}/</span>
          </span>
        }
      />
      <ContentForm
        kind="post"
        isNew={false}
        action={savePostAction}
        liveUrl={status === 'published' ? `/${record.slug}/` : undefined}
        savedNotice={saved ? 'Post created.' : undefined}
        values={{
          slug: record.slug,
          title: record.title,
          html: stripPastedMarkup(record.html),
          status,
          excerpt: record.excerpt,
          publishedAt: record.publishedAt,
          author: record.author?.name,
          categories,
          heroImage: record.heroImage,
          seoTitle: record.seo?.seoTitle,
          metaDescription: record.seo?.metaDescription,
          focusKeyword: record.seo?.focusKeyword,
        }}
      />
      <section className="rounded-xl border border-red-200 p-5 dark:border-red-900">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">Delete this post</h2>
        <p className="mt-1 text-xs text-char-200">
          Removes the post from the site, the sitemap and every listing. To hide it for now, set its status to Draft
          instead.
        </p>
        <div className="mt-3">
          <DeleteButton action={deletePostAction} slug={record.slug} name={record.title} label="Delete post" />
        </div>
      </section>
    </div>
  );
}
