import { ADSENSE_CLIENT } from '@/lib/env';

export const dynamic = 'force-static';

/**
 * /ads.txt — authorizes Google AdSense to sell ads for this domain.
 * Format is fixed by IAB: `<domain>, <publisher id>, <relationship>, <cert>`.
 * Google's certification authority ID is a public constant.
 */
export function GET() {
  const pub = ADSENSE_CLIENT.replace(/^ca-/, '');
  const body = pub
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : '# ads.txt disabled: NEXT_PUBLIC_ADSENSE_CLIENT not set.\n';
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
