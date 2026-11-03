import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
import { PageShell } from '@/components/page-shell';
import { webPageJsonLd } from '@/lib/structured-data';
import { SITE } from '@/lib/env';
import { ContactForm } from './contact-form';

export const metadata: Metadata = pageMeta({
  title: `Contact ${SITE.name}`,
  description: `Story ideas, corrections or partnership requests? Get in touch with the ${SITE.name} team.`,
  path: '/contact/',
});

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Say hello."
      lede="Story ideas, product samples, corrections, partnership requests — we read everything."
    >
      <JsonLd
        data={webPageJsonLd('ContactPage', {
          name: `Contact ${SITE.name}`,
          description: `Get in touch with the ${SITE.name} team.`,
          path: '/contact/',
        })}
      />
      <div className="not-prose max-w-md">
        <a
          href={`mailto:${SITE.email}`}
          className="block rounded-2xl border border-cream-200 bg-cream-50 p-6 transition hover:border-clay-500 dark:border-ink-500 dark:bg-ink-500"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-clay-500">
            General
          </p>
          <p className="mt-2 font-display text-xl">{SITE.email}</p>
          <p className="mt-2 text-sm text-ink-300">
            Editorial questions, reader mail, and everything else.
          </p>
        </a>
      </div>

      <h2 className="mt-14">Send us a note</h2>
      <p>
        Prefer a form? Use the one below. We aim to reply within two business days.
      </p>

      <ContactForm />
    </PageShell>
  );
}
