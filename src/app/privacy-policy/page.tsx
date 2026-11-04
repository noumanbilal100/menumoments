import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { PageShell } from '@/components/page-shell';
import { SITE } from '@/lib/env';

export const metadata: Metadata = pageMeta({
  title: 'Privacy Policy',
  description: `How ${SITE.name} handles your data, cookies and advertising.`,
  path: '/privacy-policy/',
});

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
        newsletter sign-ups and contact messages you submit yourself, and anonymous analytics on
        which pages people read.
      </p>

      <h2>Cookies</h2>
      <p>
        We use cookies for essential site functions and for privacy-respecting analytics. If we
        ever add ads or third-party tracking, we'll add a consent banner so you can opt in.
      </p>

      <h2>Third-party services</h2>
      <ul>
        <li>Cloudflare, which carries contact form messages and newsletter sign-ups to our inbox.</li>
        <li>Amazon Associates and other affiliate networks &mdash; see our <a href="/disclaimer/">disclaimer</a>.</li>
        <li>Analytics for aggregate usage patterns only, never personal profiling.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You can request a copy of any personal data we hold about you, or ask us to delete it, by
        emailing <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Newsletter subscribers can
        unsubscribe by emailing the same address.
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
