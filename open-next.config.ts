import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

/**
 * Prerendered pages are served from Workers static assets. Revalidation is
 * not supported with this cache, which is fine here: content only changes
 * through a new build, and this needs no R2 bucket, queue or tag cache.
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
