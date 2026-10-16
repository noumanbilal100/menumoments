/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  // Match WordPress URL structure: /hanky-panky-recipe/ (with trailing slash).
  // Preserves SEO — every URL Google already indexed keeps working.
  trailingSlash: true,
  experimental: {
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
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.menumoments.com' }],
        destination: 'https://menumoments.com/:path*',
        permanent: true,
      },
      // Legacy WP feed and admin paths — send to home
      { source: '/feed', destination: '/', permanent: true },
      { source: '/feed/:path*', destination: '/', permanent: true },
      { source: '/wp-admin/:path*', destination: '/', permanent: false },
      // The shop moved to a descriptive URL
      { source: '/shop', destination: '/best-kitchen-gear/', permanent: true },
      // Fix a malformed legacy URL that exists in the sitemap
      {
        source: '/https-menumoments-com-topgolf-food-and-drink-menu',
        destination: '/topgolf-food-and-drink-menu',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
