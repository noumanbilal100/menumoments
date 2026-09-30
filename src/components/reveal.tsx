'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Wrap a block in <Reveal> to make it fade-and-rise into view once,
 * powered by IntersectionObserver. Uses the CSS attribute selector
 * `[data-reveal="in"]` from globals.css so the animation itself
 * lives in CSS, not JS.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || inView) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setTimeout(() => setInView(true), delay);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, inView]);

  const Element = Tag as unknown as React.ElementType;
  return (
    <Element
      ref={ref as never}
      data-reveal={inView ? 'in' : 'out'}
      className={className}
    >
      {children}
    </Element>
  );
}
