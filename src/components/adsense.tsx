import Script from 'next/script';
import { ADSENSE_AUTO_ADS, ADSENSE_CLIENT } from '@/lib/env';

/**
 * Site-wide AdSense loader. Injected once from the root layout.
 * - Loads the AdSense JS library asynchronously.
 * - Enables Auto Ads when configured (Google auto-inserts placements).
 * - No-op when NEXT_PUBLIC_ADSENSE_CLIENT is not set.
 */
export function AdSenseLoader() {
  if (!ADSENSE_CLIENT) return null;
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
