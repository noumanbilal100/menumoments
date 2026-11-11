'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ADSENSE_AUTO_ADS, ADSENSE_CLIENT } from '@/lib/env';

/**
 * Site-wide AdSense loader, injected once from the root layout.
 *
 * Auto Ads place themselves wherever the script runs, so keeping ads off the
 * buying guides means never loading the script there. A page is ad-free when
 * its address is on the list the layout passes in (buying guides, policy
 * pages, the shop), or when it carries a `data-no-ads` marker, which covers a
 * guide published since the build.
 *
 * Once loaded the script stays for the life of the document, so moving to an
 * ad-free page has to be a full page load: links to those pages load in full,
 * and arriving any other way (Back, a guide not yet on the list) reloads.
 *
 * The script waits for the page to finish loading and the browser to go idle,
 * so ads never compete with the article for the first paint.
 */

const SCRIPT_ID = 'adsense-lib';

function normalise(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}

function isAdFreePath(pathname: string, adFree: Set<string>): boolean {
  return pathname.startsWith('/admin') || adFree.has(normalise(pathname));
}

function loadAdSense() {
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(script);
  if (ADSENSE_AUTO_ADS) {
    const w = window as unknown as { adsbygoogle?: unknown[] };
    (w.adsbygoogle = w.adsbygoogle || []).push({ google_ad_client: ADSENSE_CLIENT, enable_page_level_ads: true });
  }
}

/** After the load event and once the browser is idle (or two seconds, whichever is first). */
function whenSettled(run: () => void): () => void {
  let cancelled = false;
  const go = () => {
    if (cancelled) return;
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o: { timeout: number }) => number }).requestIdleCallback;
    if (idle) idle(() => !cancelled && run(), { timeout: 2000 });
    else setTimeout(() => !cancelled && run(), 1);
  };
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener('load', go);
  };
}

export function AdSenseLoader({ adFreePaths }: { adFreePaths: string[] }) {
  const pathname = usePathname() ?? '/';

  useEffect(() => {
    if (!ADSENSE_CLIENT) return;
    const adFree = new Set(adFreePaths);
    const blocked = isAdFreePath(pathname, adFree) || Boolean(document.querySelector('[data-no-ads]'));
    if (blocked) {
      // Ads loaded by an earlier page would carry on here; only a fresh load clears them.
      if (document.getElementById(SCRIPT_ID)) window.location.reload();
      return;
    }
    // A tool page puts the tool first: ads wait until the reader has scrolled past it.
    const gate = document.querySelector('[data-ads-after]');
    if (gate && !document.getElementById(SCRIPT_ID) && 'IntersectionObserver' in window) {
      let stop = () => {};
      const watch = new IntersectionObserver((entries) => {
        if (entries.some((e) => !e.isIntersecting && e.boundingClientRect.bottom < 0)) {
          watch.disconnect();
          stop = whenSettled(loadAdSense);
        }
      });
      watch.observe(gate);
      return () => {
        watch.disconnect();
        stop();
      };
    }
    return whenSettled(loadAdSense);
  }, [pathname, adFreePaths]);

  // Links to ad-free pages load in full, so ads from this page don't follow the reader there.
  useEffect(() => {
    if (!ADSENSE_CLIENT) return;
    const adFree = new Set(adFreePaths);
    const onClick = (e: MouseEvent) => {
      if (!document.getElementById(SCRIPT_ID)) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !isAdFreePath(url.pathname, adFree)) return;
      e.preventDefault();
      e.stopPropagation();
      window.location.assign(url.href);
    };
    // Capture phase, so this runs before the router turns the click into an in-app navigation.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [adFreePaths]);

  return null;
}
