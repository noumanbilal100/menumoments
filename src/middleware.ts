import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protect /admin/* routes with HTTP Basic Auth. Credentials come from
 * ADMIN_USER + ADMIN_PASSWORD env vars. If either is missing, admin is
 * refused entirely (safer than leaving it open by default).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) {
    return new NextResponse('Admin is disabled: ADMIN_USER / ADMIN_PASSWORD not set.', {
      status: 503,
    });
  }

  const header = req.headers.get('authorization') ?? '';
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const idx = decoded.indexOf(':');
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      if (u === user && p === pass) return NextResponse.next();
    } catch {
      // fall through to 401
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Menu Moments Admin", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};
