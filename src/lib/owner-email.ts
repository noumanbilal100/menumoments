/** The verified Email Routing inbox hello@ forwards to. wrangler.jsonc restricts the binding to it. */
const INBOX = 'menumomentsoutreach@gmail.com';

export const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    return (env as unknown as { OWNER_EMAIL?: EmailBinding }).OWNER_EMAIL ?? null;
  } catch {
    return null;
  }
}

/** Emails the site owner through Cloudflare, free because the inbox is verified. Returns the HTTP status to answer with. */
export async function emailOwner(message: {
  from: { email: string; name: string };
  /** Replying from the inbox goes straight to this address. */
  replyTo: string;
  subject: string;
  text: string;
}): Promise<number> {
  const binding = await emailBinding();
  if (!binding) return 503;
  try {
    await binding.send({
      ...message,
      to: INBOX,
      subject: message.subject.replace(/[\r\n]+/g, ' '),
    });
    return 200;
  } catch (error) {
    console.error('Owner email failed', error);
    return 502;
  }
}

/** Browsers mark requests sent from other sites; these forms only post from their own pages. */
export function isCrossSite(request: Request): boolean {
  const fetchSite = request.headers.get('sec-fetch-site');
  return Boolean(fetchSite && fetchSite !== 'same-origin');
}

export function formText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
