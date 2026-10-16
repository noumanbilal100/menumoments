import Link from 'next/link';
import { ContentForm } from '@/components/admin/content-form';
import { PageHeader } from '@/components/admin/ui';
import { savePostAction } from '../../actions';

export const dynamic = 'force-dynamic';

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/posts/" className="text-xs text-ember-500 hover:underline">
        ← All posts
      </Link>
      <PageHeader title="New post" description="Write, add images, pick categories, then publish or keep it as a draft." />
      <ContentForm
        kind="post"
        isNew
        action={savePostAction}
        values={{
          slug: '',
          title: '',
          html: '<p></p>',
          status: 'published',
          publishedAt: new Date().toISOString().slice(0, 16),
          author: 'Menu Moments',
          categories: [],
          heroImage: null,
        }}
      />
    </div>
  );
}
