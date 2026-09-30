'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Number-count-up animation. Fires once when the element enters view.
 * Used for stat blocks — "12,000 subscribers", "155 recipes tested".
 */
export function Counter({
  to,
  duration = 1400,
  format = (n: number) => n.toLocaleString(),
  className = '',
}: {
  to: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started || !ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started) {
            setStarted(true);
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(Math.round(to * eased));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration, started]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
