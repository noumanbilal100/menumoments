import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readContentFile } from '@/lib/content-files';

/**
 * Where admin edits are written.
 *
 * Content lives as JSON files in the repository and is bundled at build
 * time, so a live edit has to land in the repository: with GITHUB_TOKEN set,
 * every save is one commit to the deployed branch and the host rebuilds the
 * site from it. In local development without a token, files are written to
 * disk directly. Anywhere else without a token saving is refused: a deployed
 * Worker has no writable project filesystem.
 *
 * Paths are repository-relative with forward slashes, e.g.
 * "src/content/posts/my-post.json".
 */
export interface FileChange {
  path: string;
  /** New contents; null deletes the file. */
  content: string | Buffer | null;
}

export type StoreMode = 'github' | 'filesystem' | 'unconfigured';

export function storeMode(): StoreMode {
  if (process.env.GITHUB_TOKEN?.trim()) return 'github';
  if (process.env.NODE_ENV === 'development') return 'filesystem';
  return 'unconfigured';
}

export class StoreNotConfiguredError extends Error {
  constructor() {
    super(
      'Saving is not set up on this deployment. Add a GITHUB_TOKEN environment variable (a GitHub token with write access to the repository) and redeploy.',
    );
  }
}

// ---------------------------------------------------------------------------
// GitHub driver
// ---------------------------------------------------------------------------

function githubTarget(): { repo: string; branch: string; token: string } {
  const token = process.env.GITHUB_TOKEN?.trim() ?? '';
  const repo = process.env.GITHUB_REPO?.trim() ?? '';
  const branch = process.env.GITHUB_BRANCH?.trim() || 'main';
  if (!repo) throw new Error('GITHUB_REPO is not set (expected "owner/name").');
  return { repo, branch, token };
}

async function gh<T>(urlPath: string, init: RequestInit & { raw?: boolean } = {}): Promise<T> {
  const { repo, token } = githubTarget();
  const res = await fetch(`https://api.github.com/repos/${repo}${urlPath}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: init.raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (init.raw && res.status === 404) return null as T;
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`GitHub ${init.method ?? 'GET'} ${urlPath} failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  return (init.raw ? await res.text() : await res.json()) as T;
}

async function githubRead(file: string): Promise<string | null> {
  const { branch } = githubTarget();
  return gh<string | null>(`/contents/${encodeURI(file)}?ref=${encodeURIComponent(branch)}`, { raw: true });
}

async function githubList(dir: string): Promise<string[]> {
  const { branch } = githubTarget();
  const { repo, token } = githubTarget();
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${encodeURI(dir)}?ref=${encodeURIComponent(branch)}`,
    {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    },
  );
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub list ${dir} failed (${res.status})`);
  const items = (await res.json()) as { name: string; type: string }[];
  return items.filter((i) => i.type === 'file').map((i) => i.name);
}

async function githubCommit(changes: FileChange[], message: string): Promise<string> {
  const { branch } = githubTarget();
  for (let attempt = 0; attempt < 3; attempt++) {
    const ref = await gh<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
    const head = await gh<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`);

    const tree = [];
    for (const c of changes) {
      if (c.content === null) {
        tree.push({ path: c.path, mode: '100644', type: 'blob', sha: null });
      } else if (Buffer.isBuffer(c.content)) {
        const blob = await gh<{ sha: string }>('/git/blobs', {
          method: 'POST',
          body: JSON.stringify({ content: c.content.toString('base64'), encoding: 'base64' }),
        });
        tree.push({ path: c.path, mode: '100644', type: 'blob', sha: blob.sha });
      } else {
        tree.push({ path: c.path, mode: '100644', type: 'blob', content: c.content });
      }
    }

    const newTree = await gh<{ sha: string }>('/git/trees', {
      method: 'POST',
      body: JSON.stringify({ base_tree: head.tree.sha, tree }),
    });
    const commit = await gh<{ sha: string }>('/git/commits', {
      method: 'POST',
      body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
    });
    try {
      await gh(`/git/refs/heads/${branch}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });
      return commit.sha;
    } catch (err) {
      // Someone else moved the branch between our read and write: rebuild
      // the commit on the new head.
      if (attempt === 2) throw err;
    }
  }
  throw new Error('Could not update the branch.');
}

// ---------------------------------------------------------------------------
// Filesystem driver
// ---------------------------------------------------------------------------

// Local development only; kept out of build tracing on purpose.
const root = () => /* turbopackIgnore: true */ process.cwd();

async function fsRead(file: string): Promise<string | null> {
  try {
    return await readFile(path.join(/* turbopackIgnore: true */ root(), file), 'utf8');
  } catch {
    // On a Worker, published content is only reachable through the mirror.
    return file.startsWith('src/content/') ? readContentFile(file.slice('src/content/'.length)) : null;
  }
}

async function fsList(dir: string): Promise<string[]> {
  try {
    return await readdir(path.join(/* turbopackIgnore: true */ root(), dir));
  } catch {
    return [];
  }
}

async function fsCommit(changes: FileChange[]): Promise<string> {
  for (const c of changes) {
    const abs = path.join(/* turbopackIgnore: true */ root(), c.path);
    if (c.content === null) {
      await unlink(abs).catch(() => undefined);
    } else {
      await mkdir(path.dirname(abs), { recursive: true });
      await writeFile(abs, c.content);
    }
  }
  return 'local';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Current contents of a repository file, or null when it does not exist. */
export async function readRepoFile(file: string): Promise<string | null> {
  const mode = storeMode();
  if (mode === 'github') return githubRead(file);
  return fsRead(file);
}

/** File names directly inside a repository directory. */
export async function listRepoDir(dir: string): Promise<string[]> {
  return storeMode() === 'github' ? githubList(dir) : fsList(dir);
}

/** Apply all changes together; returns the commit sha (or "local"). */
export async function commitChanges(changes: FileChange[], message: string): Promise<string> {
  const mode = storeMode();
  if (mode === 'unconfigured') throw new StoreNotConfiguredError();
  if (mode === 'github') return githubCommit(changes, message);
  return fsCommit(changes);
}
