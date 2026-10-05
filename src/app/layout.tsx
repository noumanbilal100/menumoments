import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { SITE, SITE_URL, ADSENSE_CLIENT } from '@/lib/env';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Marquee } from '@/components/marquee';
import { AdSenseLoader } from '@/components/adsense';
import { ConsentBanner } from '@/components/consent-banner';
import { SiteChrome } from '@/components/site-chrome';
import './globals.css';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
    description: SITE.description,
  },
  alternates: { canonical: SITE_URL },
  other: ADSENSE_CLIENT ? { 'google-adsense-account': ADSENSE_CLIENT } : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-char-500 focus:px-4 focus:py-2 focus:text-bone-50"
        >
          Skip to content
        </a>
        <SiteChrome
          top={
            <>
              <Marquee />
              <SiteHeader />
            </>
          }
          bottom={
            <>
              <SiteFooter />
              <AdSenseLoader />
              <ConsentBanner />
            </>
          }
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
