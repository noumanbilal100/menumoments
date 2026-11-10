import { readFileSync } from 'node:fs';

const CANONICAL_ORIGIN = 'https://menumoments.com';

/**
 * Retired post addresses and the post that replaced each: posts republished
 * under a longer slug, and duplicates merged into one. The admin's link check
 * (src/lib/internal-links.ts) reads the same file, so links to an old address
 * are pointed at the new one.
 */
const POST_REDIRECTS = JSON.parse(readFileSync(new URL('./src/data/post-redirects.json', import.meta.url), 'utf8'));

/** One hop to the canonical URL, trailing slash included. */
const toCanonicalOrigin = (has) => [
  { source: '/', has, destination: `${CANONICAL_ORIGIN}/`, permanent: true },
  { source: '/:path+', has, destination: `${CANONICAL_ORIGIN}/:path+/`, permanent: true },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  // Match WordPress URL structure: /hanky-panky-recipe/ (with trailing slash).
  // Preserves SEO — every URL Google already indexed keeps working.
  trailingSlash: true,
  experimental: {
    // Admin saves carry compressed images alongside the post.
    serverActions: { bodySizeLimit: '4.5mb' },
    // Cap workers so builds don't run the machine out of RAM. Adjust up
    // (e.g. 8) on a beefier CI box.
    cpus: 2,
    workerThreads: false,
  },
  images: {
    // Served as-is: on Cloudflare Workers, Next's optimizer would need the
    // paid Cloudflare Images service. Local images are already compressed
    // WebP; product shots load straight from Amazon's CDN.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'menumoments.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
      { protocol: 'https', hostname: 'i0.wp.com' },
      { protocol: 'https', hostname: 'i1.wp.com' },
      { protocol: 'https', hostname: 'i2.wp.com' },
      { protocol: 'https', hostname: 'secure.gravatar.com' },
    ],
  },
  async redirects() {
    return [
      // One canonical host for search engines.
      ...toCanonicalOrigin([{ type: 'host', value: 'www.menumoments.com' }]),
      // And one scheme. Cloudflare reports the visitor's scheme in this header;
      // if it is ever absent the rule simply doesn't fire, so it can't loop.
      ...toCanonicalOrigin([{ type: 'header', key: 'cf-visitor', value: '.*"scheme":"http".*' }]),
      // Legacy WordPress URLs
      { source: '/feed', destination: '/feed.xml', permanent: true },
      { source: '/feed/:path*', destination: '/feed.xml', permanent: true },
      { source: '/comments/feed', destination: '/feed.xml', permanent: true },
      { source: '/:slug/feed', destination: '/:slug/', permanent: true },
      { source: '/:slug/amp', destination: '/:slug/', permanent: true },
      { source: '/category/:slug/page/:n', destination: '/category/:slug/', permanent: true },
      { source: '/page/:n', destination: '/blog/', permanent: true },
      { source: '/blog/page/:n', destination: '/blog/', permanent: true },
      { source: '/tag/:slug', destination: '/blog/', permanent: true },
      { source: '/author/:slug', destination: '/about-us/', permanent: true },
      // Retired post addresses (republished or merged posts), from src/data/post-redirects.json
      ...Object.entries(POST_REDIRECTS).map(([from, to]) => ({ source: `/${from}`, destination: `/${to}/`, permanent: true })),
      { source: '/wp-admin/:path*', destination: '/', permanent: false },
      // The shop moved to a descriptive URL
      { source: '/shop', destination: '/best-kitchen-gear/', permanent: true },
    ];
  },
};

export default nextConfig;
