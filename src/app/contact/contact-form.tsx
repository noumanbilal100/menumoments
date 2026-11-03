'use client';

import { useState, type FormEvent } from 'react';
import { CONTACT_TOPICS, MAX_EMAIL_LENGTH, MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from '@/lib/contact';
import { SITE } from '@/lib/env';

type Status = 'idle' | 'sending' | 'sent' | 'failed';

const FIELD =
  'w-full rounded-xl border border-ink-500/15 bg-bone-100 px-4 py-3 text-sm outline-none focus:border-clay-500 dark:border-cream-50/15 dark:bg-ink-500';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus('sending');
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!res.ok) throw new Error(`Contact form returned ${res.status}`);
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  }

  if (status === 'sent') {
    return (
      <p role="status" className="not-prose mt-6 rounded-2xl border border-cream-200 bg-cream-50 p-6 dark:border-ink-500 dark:bg-ink-500">
        Thanks, your message has been sent. We&apos;ll reply to the email address you gave us.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="not-prose mt-6 grid gap-4">
      {/* Hidden from people; bots that fill every field give themselves away. */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">Your name</label>
        <input id="name" name="name" required maxLength={MAX_NAME_LENGTH} className={FIELD} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required maxLength={MAX_EMAIL_LENGTH} className={FIELD} />
      </div>
      <div>
        <label htmlFor="topic" className="mb-1 block text-sm font-medium">Topic</label>
        <select id="topic" name="topic" className={FIELD}>
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">Message</label>
        <textarea id="message" name="message" required rows={6} maxLength={MAX_MESSAGE_LENGTH} className={FIELD} />
      </div>
      {status === 'failed' && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          Your message didn&apos;t go through. Please try again, or email us at{' '}
          <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a>.
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="justify-self-start rounded-full bg-clay-500 px-6 py-3 text-sm font-medium text-white hover:bg-clay-600 disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
