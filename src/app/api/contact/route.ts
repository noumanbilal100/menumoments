import { CONTACT_TOPICS, MAX_EMAIL_LENGTH, MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from '@/lib/contact';
import { SITE } from '@/lib/env';
import { EMAIL_FORMAT, emailOwner, formText, isCrossSite } from '@/lib/owner-email';

export async function POST(request: Request) {
  if (isCrossSite(request)) return Response.json({ ok: false }, { status: 403 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ ok: false }, { status: 400 });

  // Only bots fill the hidden field. They get a normal answer, so they don't adapt.
  if (formText(body.website, 200)) return Response.json({ ok: true });

  const name = formText(body.name, MAX_NAME_LENGTH);
  const email = formText(body.email, MAX_EMAIL_LENGTH);
  const message = formText(body.message, MAX_MESSAGE_LENGTH);
  const chosen = formText(body.topic, 100);
  const topic = CONTACT_TOPICS.includes(chosen) ? chosen : CONTACT_TOPICS[0];
  if (!name || !message || !EMAIL_FORMAT.test(email)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const status = await emailOwner({
    from: { email: 'contact-form@menumoments.com', name: `${SITE.name} contact form` },
    replyTo: email,
    subject: `${topic}: message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}\n`,
  });
  return Response.json({ ok: status === 200 }, { status });
}
