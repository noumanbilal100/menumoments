import { MAX_EMAIL_LENGTH } from '@/lib/contact';
import { SITE, SITE_URL } from '@/lib/env';
import { EMAIL_FORMAT, emailOwner, formText, isCrossSite } from '@/lib/owner-email';

export async function POST(request: Request) {
  if (isCrossSite(request)) return Response.json({ ok: false }, { status: 403 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ ok: false }, { status: 400 });

  // Only bots fill the hidden field. They get a normal answer, so they don't adapt.
  if (formText(body.website, 200)) return Response.json({ ok: true });

  const email = formText(body.email, MAX_EMAIL_LENGTH);
  if (!EMAIL_FORMAT.test(email)) return Response.json({ ok: false }, { status: 400 });

  const page = formText(body.page, 300);
  const signedUpOn = /^\/\S*$/.test(page) ? `\n\nSigned up on: ${SITE_URL}${page}` : '';

  const status = await emailOwner({
    from: { email: 'newsletter@menumoments.com', name: `${SITE.name} newsletter` },
    replyTo: email,
    subject: `New subscriber: ${email}`,
    text: `${email} just subscribed to the ${SITE.name} newsletter.${signedUpOn}\n`,
  });
  return Response.json({ ok: status === 200 }, { status });
}
