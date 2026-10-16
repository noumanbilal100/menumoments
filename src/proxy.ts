import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminCredentials, isAdminAuthorization } from '@/lib/admin-auth';

/**
 * Protect /admin/* routes with HTTP Basic Auth. Credentials come from
 * ADMIN_USER + ADMIN_PASSWORD env vars. If either is missing, admin is
 * refused entirely (safer than leaving it open by default). Server Actions
 * post to the page URL, so this also guards every admin save and delete.
 */
function lockdown(res: NextResponse): NextResponse {
  res.headers.set('Cache-Control', 'private, no-store');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export function proxy(req: NextRequest) {
  if (!adminCredentials()) {
    return lockdown(
      new NextResponse('Admin is disabled: ADMIN_USER / ADMIN_PASSWORD not set.', { status: 503 }),
    );
  }

  if (isAdminAuthorization(req.headers.get('authorization'))) {
    return lockdown(NextResponse.next());
  }

  return lockdown(
    new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Menu Moments Admin", charset="UTF-8"' },
    }),
  );
}

export const config = {
  matcher: ['/admin/:path*'],
};
