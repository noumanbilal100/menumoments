'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { ADSENSE_AUTO_ADS, ADSENSE_CLIENT } from '@/lib/env';
import { isProductReview } from '@/data/product-reviews';

/**
 * Site-wide AdSense loader, injected once from the root layout.
 *
 * It has to be route-aware. Auto Ads inject themselves wherever the script
 * runs, so gating only the manual <AdSlot /> components would still leave
 * Google placing ads on the buying guides. The script is therefore not
 * rendered at all on those routes, or anywhere under /admin.
 *
 * No-op when NEXT_PUBLIC_ADSENSE_CLIENT is unset.
 */
export function AdSenseLoader() {
  const pathname = usePathname() ?? '';

  if (!ADSENSE_CLIENT) return null;

  const slug = pathname.replace(/^\/+|\/+$/g, '');
  if (isProductReview(slug)) return null;
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <Script
        id="adsense-lib"
        async
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        crossOrigin="anonymous"
      />
      {ADSENSE_AUTO_ADS && (
        <Script id="adsense-auto" strategy="afterInteractive">
          {`(adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "${ADSENSE_CLIENT}",
            enable_page_level_ads: true
          });`}
        </Script>
      )}
    </>
  );
}
