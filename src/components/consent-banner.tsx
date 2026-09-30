'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'mm-consent-v1';

/**
 * Lightweight cookie/consent banner for AdSense + analytics. Non-blocking,
 * dismissible, remembers the choice in localStorage. This is intentionally
 * minimal — swap for a full CMP (Funding Choices, Cookiebot, OneTrust) when
 * scaling to EEA/UK volume, which AdSense requires for GDPR TCF compliance.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setVisible(true);
    } catch {
      // localStorage unavailable — don't render the banner rather than block reading.
    }
  }, []);

  function decide(choice: 'accept' | 'reject') {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice, at: new Date().toISOString() }),
      );
    } catch {
      // Ignore quota / private-mode errors.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-bone-200 bg-white/95 p-4 text-sm shadow-2xl backdrop-blur dark:border-char-500 dark:bg-char-500/95 md:p-5"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-char-300 dark:text-bone-100">
          We use cookies to serve ads and understand how the site is used. You can accept, or
          continue with only essential cookies.{' '}
          <a href="/privacy-policy" className="underline hover:text-ember-500">
            Learn more
          </a>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => decide('reject')}
            className="rounded-full border border-bone-200 px-4 py-2 text-xs font-medium text-char-300 hover:border-ember-500 hover:text-ember-500 dark:border-char-400 dark:text-bone-100"
          >
            Only essential
          </button>
          <button
            type="button"
            onClick={() => decide('accept')}
            className="rounded-full bg-ember-500 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-ember-600 hover:shadow-embered"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
