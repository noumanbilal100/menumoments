import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { SITE, SITE_URL, ADSENSE_CLIENT } from '@/lib/env';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Marquee } from '@/components/marquee';
import { AdSenseLoader } from '@/components/adsense';
import { ConsentBanner } from '@/components/consent-banner';
import { SiteChrome } from '@/components/site-chrome';
import { DEFAULT_SOCIAL_IMAGE, HOME_TITLE, TITLE_TEMPLATE } from '@/lib/seo';
import { AD_FREE_PAGES, isAdFreePost } from '@/lib/ads';
import { allListedPosts } from '@/lib/content';
import './globals.css';

/** Buying guides and the pages with nothing to read: AdSense never loads there. */
const AD_FREE_PATHS = [...AD_FREE_PAGES, ...allListedPosts().filter(isAdFreePost).map((p) => `/${p.slug}/`)];

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
    default: HOME_TITLE,
    template: TITLE_TEMPLATE,
  },
  description: SITE.description,
  // Each page sets its own canonical. One set here would point them all at the homepage.
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
    description: SITE.description,
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  verification: { google: 'jU81E-AAancEqk9T4n3MggiN33tgfHHOQHeTbuTRdWc' },
  other: ADSENSE_CLIENT ? { 'google-adsense-account': ADSENSE_CLIENT } : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        <link rel="alternate" type="application/rss+xml" title={SITE.name} href="/feed.xml" />
        {/* Reveal hides blocks until its script runs; without JS they must still show. */}
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: '[data-reveal]{opacity:1;transform:none}' }} />
        </noscript>
      </head>
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
              <AdSenseLoader adFreePaths={AD_FREE_PATHS} />
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
