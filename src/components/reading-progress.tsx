'use client';

import { useEffect, useState } from 'react';

/**
 * Thin ember-colored progress bar pinned to the top of the viewport.
 * Fills as the reader scrolls through the article. Ignores the header/hero
 * — measurement starts at 0 at page load and hits 100% at the bottom.
 */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let ticking = false;
    function update() {
      const scrollTop = window.scrollY;
      const max =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setPct(max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0);
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent"
    >
      <div
        style={{ transform: `scaleX(${pct / 100})` }}
        className="h-full origin-left bg-gradient-to-r from-ember-500 via-ember-400 to-saffron-300 transition-transform duration-100 ease-out"
      />
    </div>
  );
}
