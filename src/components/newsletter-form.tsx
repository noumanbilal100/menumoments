'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MAX_EMAIL_LENGTH } from '@/lib/contact';
import { SITE } from '@/lib/env';

interface Props {
  id: string;
  placeholder: string;
  buttonLabel?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  errorClassName?: string;
}

/** The sign-up form every newsletter box uses; each place supplies its own styling. */
export function NewsletterForm({
  id,
  placeholder,
  buttonLabel = 'Subscribe',
  className,
  inputClassName,
  buttonClassName,
  errorClassName = 'mt-2 text-xs text-red-700',
}: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'failed'>('idle');
  const [subscribed, setSubscribed] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setStatus('sending');
    try {
      const res = await fetch('/api/subscribe/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, page: window.location.pathname }),
      });
      if (!res.ok) throw new Error(`Subscribe returned ${res.status}`);
      form.reset();
      setStatus('idle');
      setSubscribed(String(fields.email));
    } catch {
      setStatus('failed');
    }
  }

  return (
    <>
      <form onSubmit={submit} className={className}>
        <label htmlFor={id} className="sr-only">Email address</label>
        {/* Hidden from people; bots that fill every field give themselves away. */}
        <div aria-hidden="true" className="absolute left-[-9999px]">
          <input name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <input
          id={id}
          name="email"
          type="email"
          required
          maxLength={MAX_EMAIL_LENGTH}
          placeholder={placeholder}
          className={inputClassName}
        />
        <button type="submit" disabled={status === 'sending'} className={`${buttonClassName} disabled:opacity-60`}>
          {status === 'sending' ? 'Subscribing…' : buttonLabel}
        </button>
      </form>
      {status === 'failed' && (
        <p role="alert" className={errorClassName}>
          That didn&apos;t go through. Please try again in a moment.
        </p>
      )}
      {subscribed && <SubscribedDialog email={subscribed} onClose={() => setSubscribed(null)} />}
    </>
  );
}

function SubscribedDialog({ email, onClose }: { email: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const done = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
    // showModal() focuses the first control, which is the close button.
    done.current?.focus();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="subscribed-title"
      onClose={onClose}
      // A click on the dialog itself, not its contents, landed on the backdrop.
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current.close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md animate-fade-in rounded-3xl border-0 bg-white p-0 text-left font-sans text-char-500 shadow-cardHover backdrop:bg-char-600/60 backdrop:backdrop-blur-sm"
    >
      <div className="relative px-6 pb-7 pt-9 text-center sm:px-9">
        <button
          type="button"
          aria-label="Close"
          onClick={() => dialog.current?.close()}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-char-200 transition hover:bg-bone-100 hover:text-char-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ember-500 text-white">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <p id="subscribed-title" className="mt-5 font-display text-3xl leading-tight">
          You&apos;re on the list!
        </p>
        <p className="mt-3 text-sm leading-relaxed text-char-300">
          Thanks for subscribing to {SITE.name}. We&apos;ll send new recipes and kitchen tips to{' '}
          <strong className="break-words font-semibold text-char-500">{email}</strong>.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            ref={done}
            type="button"
            onClick={() => dialog.current?.close()}
            className="rounded-full bg-ember-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-ember-600"
          >
            Done
          </button>
          <Link
            href="/category/recipes"
            onClick={() => dialog.current?.close()}
            className="rounded-full border border-bone-300 px-6 py-2.5 text-sm font-medium text-char-500 transition hover:border-ember-500 hover:text-ember-500"
          >
            Browse recipes
          </Link>
        </div>
        <p className="mt-5 text-xs text-char-200">
          Changed your mind? Email{' '}
          <a href={`mailto:${SITE.email}`} className="underline underline-offset-2 hover:text-ember-500">
            {SITE.email}
          </a>{' '}
          and we&apos;ll take you off.
        </p>
      </div>
    </dialog>
  );
}
