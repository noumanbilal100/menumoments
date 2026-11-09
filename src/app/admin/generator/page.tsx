import { PageHeader } from '@/components/admin/ui';
import { AffiliateGenerator } from './affiliate-generator';

export const dynamic = 'force-dynamic';

export default function GeneratorPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Affiliate post generator"
        description="Add the products, copy each prompt into ChatGPT, paste its replies back, and the buying guide builds itself."
      />
      <AffiliateGenerator />
    </div>
  );
}
