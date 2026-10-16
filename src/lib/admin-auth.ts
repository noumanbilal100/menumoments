import { timingSafeEqual } from 'node:crypto';

/**
 * HTTP Basic Auth for the admin. Credentials come from ADMIN_USER and
 * ADMIN_PASSWORD; both are trimmed because a stray space or newline pasted
 * into a hosting dashboard is the most common reason a correct password is
 * rejected.
 */
export function adminCredentials(): { user: string; pass: string } | null {
  const user = process.env.ADMIN_USER?.trim();
  const pass = process.env.ADMIN_PASSWORD?.trim();
  return user && pass ? { user, pass } : null;
}

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

/** True when the Authorization header carries the admin credentials. */
export function isAdminAuthorization(header: string | null | undefined): boolean {
  const expected = adminCredentials();
  if (!expected || !header) return false;
  const creds = parseBasic(header);
  return Boolean(creds && safeEqual(creds.user, expected.user) && safeEqual(creds.pass, expected.pass));
}
