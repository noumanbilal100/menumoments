import type { Metadata } from 'next';
import { PageShell } from '@/components/page-shell';
import { SITE } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with the ${SITE.name} team.`,
};

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Say hello."
      lede="Story ideas, product samples, corrections, partnership requests — we read everything."
    >
      <div className="not-prose grid gap-6 md:grid-cols-2">
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
        <a
          href={`mailto:partnerships@${SITE.email.split('@')[1]}`}
          className="block rounded-2xl border border-cream-200 bg-cream-50 p-6 transition hover:border-clay-500 dark:border-ink-500 dark:bg-ink-500"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-clay-500">
            Partnerships
          </p>
          <p className="mt-2 font-display text-xl">
            partnerships@{SITE.email.split('@')[1]}
          </p>
          <p className="mt-2 text-sm text-ink-300">
            Sponsorships, sponsored posts, affiliate programs.
          </p>
        </a>
      </div>

      <h2 className="mt-14">Send us a note</h2>
      <p>
        Prefer a form? Use the one below. We aim to reply within two business days.
      </p>

      <form
        action="mailto:hello@menumoments.com"
        method="post"
        encType="text/plain"
        className="not-prose mt-6 grid gap-4"
      >
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">Your name</label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-xl border border-ink-500/15 bg-bone-100 px-4 py-3 text-sm outline-none focus:border-clay-500 dark:border-cream-50/15 dark:bg-ink-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-ink-500/15 bg-bone-100 px-4 py-3 text-sm outline-none focus:border-clay-500 dark:border-cream-50/15 dark:bg-ink-500"
          />
        </div>
        <div>
          <label htmlFor="topic" className="mb-1 block text-sm font-medium">Topic</label>
          <select
            id="topic"
            name="topic"
            className="w-full rounded-xl border border-ink-500/15 bg-bone-100 px-4 py-3 text-sm outline-none focus:border-clay-500 dark:border-cream-50/15 dark:bg-ink-500"
          >
            <option>General question</option>
            <option>Correction / update</option>
            <option>Contribute a post</option>
            <option>Product sample / review</option>
            <option>Advertising</option>
          </select>
        </div>
        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium">Message</label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            className="w-full rounded-xl border border-ink-500/15 bg-bone-100 px-4 py-3 text-sm outline-none focus:border-clay-500 dark:border-cream-50/15 dark:bg-ink-500"
          />
        </div>
        <button
          type="submit"
          className="justify-self-start rounded-full bg-clay-500 px-6 py-3 text-sm font-medium text-white hover:bg-clay-600"
        >
          Send message
        </button>
      </form>
    </PageShell>
  );
}
