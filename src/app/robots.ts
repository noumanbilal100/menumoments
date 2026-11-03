import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/env';

const PRIVATE_PATHS = ['/api/', '/admin/', '/_content/'];

/** Named as well as covered by "*", so a blanket AI block added upstream can't silently win. */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Amazonbot',
  'DuckAssistBot',
  'Meta-ExternalAgent',
  'MistralAI-User',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: PRIVATE_PATHS },
    ],
    // The URL Search Console already has from the WordPress/Yoast setup.
    sitemap: `${SITE_URL}/sitemap_index.xml`,
  };
}
