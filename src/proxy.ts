import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protect /admin/* routes with HTTP Basic Auth. Credentials come from
 * ADMIN_USER + ADMIN_PASSWORD env vars. If either is missing, admin is
 * refused entirely (safer than leaving it open by default).
 *
 * Env values are trimmed because a stray space or newline pasted into a
 * hosting dashboard is the most common reason a correct password is rejected.
 */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) {
    timingSafeEqual(ba, ba);
    return false;
  }
  return timingSafeEqual(ba, bb);
}

function parseBasic(header: string): { user: string; pass: string } | null {
  if (!/^basic /i.test(header)) return null;
  try {
    const decoded = Buffer.from(header.slice(6).trim(), 'base64').toString('utf8');
    const idx = decoded.indexOf(':');
    if (idx === -1) return null;
    return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) };
  } catch {
    return null;
  }
}

function lockdown(res: NextResponse): NextResponse {
  res.headers.set('Cache-Control', 'private, no-store');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export function proxy(req: NextRequest) {
  const user = process.env.ADMIN_USER?.trim();
  const pass = process.env.ADMIN_PASSWORD?.trim();
  if (!user || !pass) {
    return lockdown(
      new NextResponse('Admin is disabled: ADMIN_USER / ADMIN_PASSWORD not set.', { status: 503 }),
    );
  }

  const creds = parseBasic(req.headers.get('authorization') ?? '');
  if (creds && safeEqual(creds.user, user) && safeEqual(creds.pass, pass)) {
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
