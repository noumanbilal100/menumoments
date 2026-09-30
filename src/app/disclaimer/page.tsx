import type { Metadata } from 'next';
import { PageShell } from '@/components/page-shell';
import { SITE } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: `${SITE.name} — affiliate, editorial and nutrition disclaimer.`,
};

export default function DisclaimerPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Disclaimer"
      lede="Where the money comes from and where our advice ends."
    >
      <h2>Affiliate disclosure</h2>
      <p>
        {SITE.name} participates in the Amazon Services LLC Associates Program and other affiliate
        networks. When you buy through links on the site, we may earn a small commission at no
        additional cost to you.
      </p>
      <p>
        We only link to products we've used, tested or would recommend to a friend. Editorial
        decisions are never influenced by commission rates.
      </p>

      <h2>Editorial independence</h2>
      <p>
        Sponsored posts, if any, are clearly labelled. Product samples do not guarantee coverage
        or a favourable review.
      </p>

      <h2>Nutrition and health</h2>
      <p>
        Recipes and nutrition estimates are for general information only and are not medical
        advice. Consult a qualified professional for questions about diet, allergies or medical
        conditions.
      </p>

      <h2>Restaurant and menu information</h2>
      <p>
        Menus, prices, deals and hours can change without notice. Please confirm details directly
        with the restaurant before travelling.
      </p>
    </PageShell>
  );
}
