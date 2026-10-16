import Link from 'next/link';
import { ContentForm } from '@/components/admin/content-form';
import { PageHeader } from '@/components/admin/ui';
import { savePageAction } from '../../actions';

export const dynamic = 'force-dynamic';

export default function NewSitePage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/pages/" className="text-xs text-ember-500 hover:underline">
        ← All pages
      </Link>
      <PageHeader title="New page" description="A standalone page such as a policy, landing page or contact info." />
      <ContentForm
        kind="page"
        isNew
        action={savePageAction}
        values={{ slug: '', title: '', html: '<p></p>', status: 'published' }}
      />
    </div>
  );
}
