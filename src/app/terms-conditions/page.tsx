import type { Metadata } from 'next';
import { PageShell } from '@/components/page-shell';
import { SITE } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Terms & conditions',
  description: `The terms for using ${SITE.name}.`,
};

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Terms & conditions"
      lede="The plain-English rules of the road for using this site."
    >
      <p><em>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>

      <h2>Use of the site</h2>
      <p>
        You may read, share and link to anything on {SITE.name} for personal, non-commercial use.
        Please don't republish full articles or recipes without written permission.
      </p>

      <h2>User content</h2>
      <p>
        Comments and submissions represent the views of their authors, not {SITE.name}. By posting
        you grant us a non-exclusive licence to display your submission on the site. We reserve
        the right to moderate.
      </p>

      <h2>Recipes</h2>
      <p>
        Recipes are provided for informational purposes. Ingredient substitutions, allergen
        management and food safety are your responsibility. See the <a href="/disclaimer">disclaimer</a> for more.
      </p>

      <h2>Affiliate links</h2>
      <p>
        Some links earn us a commission at no cost to you. This does not influence our editorial
        opinion &mdash; see our <a href="/disclaimer">disclaimer</a>.
      </p>

      <h2>Liability</h2>
      <p>
        We do our best to keep the site accurate, but content is provided "as is" without warranty.
        {SITE.name} is not liable for outcomes from applying advice on the site.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws applicable to the site's operator's jurisdiction.</p>
    </PageShell>
  );
}
