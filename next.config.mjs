const CANONICAL_ORIGIN = 'https://menumoments.com';

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
      // Posts that were republished under a longer slug
      {
        source: '/can-chickens-eat-oranges-a-guide-for-backyard-chickens',
        destination: '/can-chickens-eat-oranges-safe-backyard-chicken-food-guide/',
        permanent: true,
      },
      {
        source: '/how-to-poach-an-egg-in-the-microwave',
        destination: '/how-to-poach-an-egg-in-the-microwave-in-1-minute/',
        permanent: true,
      },
      {
        source: '/are-microwaves-bad-for-you',
        destination: '/are-microwaves-bad-for-you-the-truth-about-microwave-radiation-cooking-and-food-safety/',
        permanent: true,
      },
      { source: '/wp-admin/:path*', destination: '/', permanent: false },
      // The shop moved to a descriptive URL
      { source: '/shop', destination: '/best-kitchen-gear/', permanent: true },
      // Fix a malformed legacy URL that exists in the sitemap
      {
        source: '/https-menumoments-com-topgolf-food-and-drink-menu',
        destination: '/topgolf-food-and-drink-menu/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
