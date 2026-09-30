'use client';

import { useEffect, useState } from 'react';

/**
 * Mobile-only sticky footer bar that appears after the reader has scrolled
 * past the hero. Links to the article's #top-pick anchor (the first
 * affiliate anchor, tagged by enhanceAffiliateHtml).
 */
export function AffiliateStickyCTA({
  anchorId,
  label = 'See our top pick',
}: {
  anchorId?: string | null;
  label?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    function onScroll() {
      setVisible(window.scrollY > 600 && window.scrollY < document.documentElement.scrollHeight - window.innerHeight - 400);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  if (!anchorId || dismissed) return null;

  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-full border border-char-500/10 bg-char-500 px-4 py-2.5 text-bone-50 shadow-cardHover transition-all duration-300 lg:hidden print:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <a href={`#${anchorId}`} className="flex flex-1 items-center gap-3 text-sm font-medium">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ember-500 text-[11px] font-bold">
          ★
        </span>
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-ember-200">
            Skip to
          </span>
          <span className="block leading-tight">{label} →</span>
        </span>
      </a>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="grid h-7 w-7 place-items-center rounded-full text-bone-100/70 transition hover:bg-char-400 hover:text-bone-50"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
