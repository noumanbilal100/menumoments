'use client';

import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT } from '@/lib/env';

type Format = 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';

interface Props {
  /** Numeric slot ID from AdSense → Ads → Ad units. */
  slot: string;
  /** AdSense format hint. */
  format?: Format;
  /** Ad unit layout for in-article/matched-content units. */
  layout?: string;
  layoutKey?: string;
  /** Full-width responsive behavior. */
  responsive?: boolean;
  /** Extra className for the wrapper. */
  className?: string;
  /** Optional inline label above the ad (transparency for readers). */
  label?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Manual AdSense ad unit. Renders an `<ins class="adsbygoogle" …>` node and
 * pushes it to the queue after mount. Silently no-ops when either the site
 * client or this slot's ID is missing, so screens stay clean during dev.
 */
export function AdSlot({
  slot,
  format = 'auto',
  layout,
  layoutKey,
  responsive = true,
  className,
  label = 'Advertisement',
}: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not ready yet — will retry on next mount.
    }
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot) return null;

  return (
    <div className={`ad-slot my-8 ${className ?? ''}`}>
      {label && (
        <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-char-200/70">
          {label}
        </p>
      )}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-ad-layout-key={layoutKey}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
