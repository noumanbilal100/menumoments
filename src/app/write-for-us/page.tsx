import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { SITE } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Write for us',
  description: 'Pitch a recipe, review or kitchen guide to Menu Moments.',
};

export default function WriteForUsPage() {
  return (
    <PageShell
      eyebrow="Contributors"
      title="Pitch us a story."
      lede="We pay for original recipes, tested reviews and expert kitchen advice from home cooks, chefs and food writers."
    >
      <h2>What we're looking for</h2>
      <ul>
        <li>
          <strong>Recipes.</strong> Original, tested three times. Family recipes with a story
          welcome.
        </li>
        <li>
          <strong>Kitchen skills.</strong> One clear technique, done well — knife work, sourdough,
          fermentation, canning.
        </li>
        <li>
          <strong>Buyers guides.</strong> Hands-on with 5+ products. Bring the receipts.
        </li>
        <li>
          <strong>Restaurant guides.</strong> Menu deep-dives, happy hours, regional food stories.
        </li>
      </ul>

      <h2>What we're not looking for</h2>
      <ul>
        <li>AI-generated content or spun articles.</li>
        <li>Roundups you haven't personally tested.</li>
        <li>Pieces already published elsewhere.</li>
      </ul>

      <h2>Rates & rights</h2>
      <p>
        Rates start at <strong>$150 for standard posts</strong> and $300+ for original recipes with
        photography. We buy first-web rights and hold exclusivity for 60 days. After that, you're
        free to republish with a credit link back.
      </p>

      <h2>How to pitch</h2>
      <ol>
        <li>Read a few recent pieces on the site so your pitch matches our tone.</li>
        <li>Email a 2&ndash;3 sentence pitch plus 1&ndash;2 clips or links to prior work.</li>
        <li>
          Send to <a href={`mailto:pitches@${SITE.email.split('@')[1]}`}>pitches@{SITE.email.split('@')[1]}</a> with the subject line
          "PITCH: [your headline]".
        </li>
      </ol>
      <p>
        Prefer a form? Use our <Link href="/contact">contact page</Link> and select "Contribute a
        post" as the topic.
      </p>
    </PageShell>
  );
}
