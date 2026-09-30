import imageFailures from '@/content/image-failures.json';

export const dynamic = 'force-dynamic';

interface Failure {
  url: string;
  error: string;
}

// Hardcoded from the last migration run — avoids importing the 570KB map file.
// Update by re-running `npm run migrate:images` and reading the summary line.
const CACHED_IMAGE_COUNT = 3684;

export default function AdminImagesPage() {
  const failures = imageFailures as Failure[];
  const total = CACHED_IMAGE_COUNT;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Images</h1>
        <p className="mt-2 text-sm text-char-200">
          Snapshot of the local image cache built by{' '}
          <code className="rounded bg-bone-100 px-1 py-0.5 text-[11px] dark:bg-char-400">
            scripts/download-images.mjs
          </code>
          .
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-bone-200 bg-bone-100 p-5 dark:border-char-500 dark:bg-char-500">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-char-200">
            Total cached
          </p>
          <p className="mt-2 font-display text-3xl">{total.toLocaleString()}</p>
          <p className="mt-1 text-xs text-char-200">files under /public/img/wp/</p>
        </div>
        <div className="rounded-2xl border border-bone-200 bg-bone-100 p-5 dark:border-char-500 dark:bg-char-500">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-char-200">
            Failed downloads
          </p>
          <p
            className={`mt-2 font-display text-3xl ${
              failures.length === 0 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {failures.length}
          </p>
          <p className="mt-1 text-xs text-char-200">
            {failures.length === 0 ? 'all clean' : 'see below'}
          </p>
        </div>
        <div className="rounded-2xl border border-bone-200 bg-bone-100 p-5 dark:border-char-500 dark:bg-char-500">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-char-200">
            Storage
          </p>
          <p className="mt-2 font-display text-3xl">≈134 MB</p>
          <p className="mt-1 text-xs text-char-200">shipped with the deploy</p>
        </div>
      </div>

      {failures.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-char-200">
            Failed images ({failures.length})
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-bone-200 bg-bone-100 dark:border-char-500 dark:bg-char-500">
            <table className="min-w-full text-sm">
              <thead className="bg-bone-100 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-char-200 dark:bg-char-400">
                <tr>
                  <th className="px-4 py-3">URL</th>
                  <th className="px-4 py-3">Error</th>
                </tr>
              </thead>
              <tbody>
                {failures.map((f) => (
                  <tr
                    key={f.url}
                    className="border-t border-bone-200 dark:border-char-400"
                  >
                    <td className="max-w-md truncate px-4 py-3 text-xs">
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-ember-500 hover:underline"
                      >
                        {f.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-xs text-char-200">{f.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-dashed border-bone-200 bg-bone-100 p-6 dark:border-char-500 dark:bg-char-500">
        <h3 className="font-display text-lg">Re-run image download</h3>
        <p className="mt-2 text-sm text-char-300 dark:text-bone-100">
          Retry failed downloads or pull new WP images:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-char-500 p-4 text-xs text-bone-50 dark:bg-char-600">
{`npm run migrate:images`}
        </pre>
      </section>
    </div>
  );
}
