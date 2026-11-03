import { CONTACT_TOPICS, MAX_EMAIL_LENGTH, MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from '@/lib/contact';
import { SITE } from '@/lib/env';

/** The verified Email Routing inbox. wrangler.jsonc restricts the binding to it. */
const INBOX = 'menumomentsoutreach@gmail.com';
const SENDER = 'contact-form@menumoments.com';

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailBinding {
  send(message: {
    to: string;
    from: { email: string; name: string };
    replyTo: string;
    subject: string;
    text: string;
  }): Promise<unknown>;
}

async function emailBinding(): Promise<EmailBinding | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as { CONTACT_EMAIL?: EmailBinding }).CONTACT_EMAIL ?? null;
  } catch {
    return null;
  }
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  // Browsers mark requests sent from other sites; this form only posts from its own page.
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin') {
    return Response.json({ ok: false }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ ok: false }, { status: 400 });

  // Only bots fill the hidden field. They get a normal answer, so they don't adapt.
  if (text(body.website, 200)) return Response.json({ ok: true });

  const name = text(body.name, MAX_NAME_LENGTH);
  const email = text(body.email, MAX_EMAIL_LENGTH);
  const message = text(body.message, MAX_MESSAGE_LENGTH);
  const chosen = text(body.topic, 100);
  const topic = CONTACT_TOPICS.includes(chosen) ? chosen : CONTACT_TOPICS[0];
  if (!name || !message || !EMAIL_FORMAT.test(email)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const binding = await emailBinding();
  if (!binding) return Response.json({ ok: false }, { status: 503 });

  try {
    await binding.send({
      to: INBOX,
      from: { email: SENDER, name: `${SITE.name} contact form` },
      // Replying from the inbox goes straight to the visitor.
      replyTo: email,
      subject: `${topic}: message from ${name}`.replace(/[\r\n]+/g, ' '),
      text: `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}\n`,
    });
  } catch (error) {
    console.error('Contact form email failed', error);
    return Response.json({ ok: false }, { status: 502 });
  }
  return Response.json({ ok: true });
}
