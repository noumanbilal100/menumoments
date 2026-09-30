import type { Metadata } from 'next';
import { PageShell } from '@/components/page-shell';
import { SITE } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: `How ${SITE.name} handles your data.`,
};

export default function PrivacyPolicyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy policy"
      lede={`This policy explains what ${SITE.name} collects, why, and what you can do about it.`}
    >
      <p><em>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>

      <h2>What we collect</h2>
      <p>
        We collect the minimum needed to run the site: server logs (IP, user agent, referrer),
        newsletter emails you submit yourself, and anonymous analytics on which pages people read.
      </p>

      <h2>Cookies</h2>
      <p>
        We use cookies for essential site functions and for privacy-respecting analytics. If we
        ever add ads or third-party tracking, we'll add a consent banner so you can opt in.
      </p>

      <h2>Third-party services</h2>
      <ul>
        <li>Newsletter delivery via a third-party provider (your email is stored with them).</li>
        <li>Amazon Associates and other affiliate networks &mdash; see our <a href="/disclaimer">disclaimer</a>.</li>
        <li>Analytics for aggregate usage patterns only, never personal profiling.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You can request a copy of any personal data we hold about you, or ask us to delete it, by
        emailing <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Newsletter subscribers can
        unsubscribe with the link at the bottom of every email.
      </p>

      <h2>Children</h2>
      <p>The site is not directed at children under 13 and we don't knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>
        When we change this policy we'll update the date at the top. Material changes will also be
        announced in the newsletter.
      </p>
    </PageShell>
  );
}
