import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPost } from '@/lib/content';
import { isAffiliateArticle } from '@/lib/affiliate';
import { shouldShowAds, NO_ADS_CATEGORIES } from '@/lib/ads';
import { getCategory } from '@/data/taxonomy';

export const dynamic = 'force-dynamic';

export default async function AdminPostDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const affiliate = isAffiliateArticle(post);
  const adsOn = shouldShowAds(post);

  const imgCount = (post.html.match(/<img\b/gi) ?? []).length;
  const localImgCount = (post.html.match(/src=["']\/img\//gi) ?? []).length;
  const externalImgCount = imgCount - localImgCount;
  const wordCount = post.html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/posts" className="text-xs text-ember-500 hover:underline">
          ← All posts
        </Link>
        <h1 className="mt-2 font-display text-3xl">{post.title}</h1>
        <p className="mt-1 text-sm text-char-200">/{post.slug}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Preview column ------------------------------------------- */}
        <div className="lg:col-span-2 space-y-6">
          {post.heroImage && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-bone-100">
              <Image
                src={post.heroImage.src}
                alt={post.heroImage.alt}
                fill
                sizes="800px"
                className="object-cover"
              />
            </div>
          )}
          {post.excerpt && (
            <p className="text-sm leading-relaxed text-char-300 dark:text-bone-100">
              {post.excerpt}
            </p>
          )}
          <div className="rounded-2xl border border-bone-200 bg-white p-4 dark:border-char-500 dark:bg-char-500">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-char-200">
              HTML preview (first 1000 chars)
            </p>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-char-300 dark:text-bone-100">
              {post.html.slice(0, 1000)}
              {post.html.length > 1000 && '…'}
            </pre>
          </div>
        </div>

        {/* Meta column ---------------------------------------------- */}
        <aside className="space-y-4">
          <Facts
            rows={[
              ['Kind', post.kind],
              ['Published', fmt(post.publishedAt)],
              ['Updated', fmt(post.updatedAt)],
              ['Reading', `${post.readingMinutes} min`],
              ['Words', wordCount.toLocaleString()],
              ['Author', post.author.name],
            ]}
          />

          <Card title="Categories">
            {post.categories.length === 0 ? (
              <p className="text-xs text-char-200">No categories assigned.</p>
            ) : (
              <ul className="space-y-1">
                {post.categories.map((slug) => {
                  const c = getCategory(slug);
                  const blocked = NO_ADS_CATEGORIES.has(slug);
                  return (
                    <li key={slug} className="flex items-center gap-2 text-xs">
                      <Link
                        href={`/admin/posts?cat=${slug}`}
                        className="text-char-300 hover:text-ember-500 dark:text-bone-100"
                      >
                        {c?.name ?? slug}
                      </Link>
                      {blocked && (
                        <span className="rounded-full bg-bone-100 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-char-300 dark:bg-char-400 dark:text-bone-100">
                          No ads
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="AdSense">
            <ul className="space-y-1 text-xs">
              <li className="flex justify-between">
                <span className="text-char-200">Detected as affiliate?</span>
                <span className={affiliate ? 'font-medium text-amber-600' : 'font-medium text-emerald-600'}>
                  {affiliate ? 'Yes' : 'No'}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-char-200">Ads will show?</span>
                <span className={adsOn ? 'font-medium text-emerald-600' : 'font-medium text-char-300'}>
                  {adsOn ? 'Yes' : 'No'}
                </span>
              </li>
            </ul>
          </Card>

          <Card title="Images">
            <ul className="space-y-1 text-xs">
              <li className="flex justify-between">
                <span className="text-char-200">Total &lt;img&gt; tags</span>
                <span className="font-medium">{imgCount}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-char-200">Local (/img/wp/…)</span>
                <span className="font-medium text-emerald-600">{localImgCount}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-char-200">External</span>
                <span
                  className={
                    externalImgCount === 0
                      ? 'font-medium text-emerald-600'
                      : 'font-medium text-amber-600'
                  }
                >
                  {externalImgCount}
                </span>
              </li>
            </ul>
          </Card>

          <Link
            href={`/${post.slug}`}
            target="_blank"
            className="block rounded-full bg-ember-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-ember-600"
          >
            Open on live site ↗
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-bone-200 bg-white p-4 dark:border-char-500 dark:bg-char-500">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-char-200">
        {title}
      </p>
      {children}
    </div>
  );
}

function Facts({ rows }: { rows: Array<[string, string | undefined]> }) {
  return (
    <div className="rounded-2xl border border-bone-200 bg-white p-4 dark:border-char-500 dark:bg-char-500">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-char-200">
        Facts
      </p>
      <dl className="grid grid-cols-2 gap-y-2 text-xs">
        {rows.map(([label, value]) => (
          <Fragment key={label}>
            <dt className="text-char-200">{label}</dt>
            <dd className="text-char-500 dark:text-bone-50">{value ?? '—'}</dd>
          </Fragment>
        ))}
      </dl>
    </div>
  );
}

function fmt(iso?: string): string | undefined {
  if (!iso) return undefined;
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
