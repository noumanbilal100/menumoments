import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Reads a file under src/content/ at runtime.
 *
 * Node hosts read it from disk. Cloudflare Workers have no project
 * filesystem, so there the copy that scripts/export-content.mjs mirrors into
 * public/_content/ is fetched through the static-assets binding instead.
 */
const CONTENT_ROOT = path.join(process.cwd(), 'src', 'content');

interface AssetsBinding {
  fetch(input: URL | string): Promise<Response>;
}

async function fromAssets(rel: string): Promise<string | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext({ async: true });
    const assets = (env as unknown as { ASSETS?: AssetsBinding }).ASSETS;
    if (!assets) return null;
    const res = await assets.fetch(new URL(`/_content/${rel}`, 'https://assets.local'));
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

export async function readContentFile(rel: string): Promise<string | null> {
  if (rel.includes('..')) return null;
  try {
    return await readFile(path.join(CONTENT_ROOT, rel), 'utf8');
  } catch {
    return fromAssets(rel);
  }
}
