import Link from 'next/link';
import type { Post } from '@/lib/content';
import { KITCHEN_TOOLS, type KitchenTool } from '@/data/tools';
import { postBreadcrumbJsonLd, postJsonLd } from '@/lib/structured-data';
import { postTrail } from '@/lib/silo';
import { JsonLd } from './json-ld';
import { Breadcrumbs } from './breadcrumbs';
import { ArticleBody, TOOLS } from './article-body';
import { ToolIcon } from './tools/ui';

/**
 * The layout for a kitchen tool's page: a short header, then the tool right
 * away, above the fold and above any ad, then the explanations, charts and
 * FAQ, then the other tools.
 *
 * `data-ads-after` tells the AdSense loader (components/adsense.tsx) to wait
 * until the reader has scrolled past the tool, so no ad loads ahead of it.
 */

/** The text's own "X calculator" heading, intro line and tool marker; the tool already sits at the top. */
function withoutToolBlock(html: string): string {
  const block = /<h2>[^<]*<\/h2>\s*<p>[\s\S]*?<\/p>\s*<div\b[^>]*data-mm-tool=["'][a-z0-9-]+["'][^>]*>\s*<\/div>/i;
  if (block.test(html)) return html.replace(block, '');
  return html.replace(/<div\b[^>]*data-mm-tool=["'][a-z0-9-]+["'][^>]*>\s*<\/div>/gi, '');
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
}

export function ToolArticle({ post, tool }: { post: Post; tool: KitchenTool }) {
  const Tool = TOOLS[tool.tool];
  const others = KITCHEN_TOOLS.filter((t) => t.slug !== post.slug);
  const updated = post.updatedAt ?? post.publishedAt;

  return (
    <article>
      <JsonLd data={postJsonLd(post)} />
      <JsonLd data={postBreadcrumbJsonLd(post)} />

      <header className="border-b border-ember-100 bg-gradient-to-b from-ember-50 to-bone-50 dark:border-char-500 dark:from-char-600 dark:to-char-600">
        <div className="mx-auto max-w-5xl px-4 pb-4 pt-5 sm:px-6 sm:pb-6 sm:pt-8 lg:pt-10">
          <Breadcrumbs trail={postTrail(post)} className="mb-3 text-xs text-char-200 sm:mb-4" hideCurrentOnMobile />
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ember-600 dark:text-ember-200">
            <ToolIcon name={tool.icon} className="h-4 w-4" />
            Free kitchen tool
          </p>
          <h1 className="mt-2 max-w-4xl font-display text-2xl leading-[1.18] text-char-500 dark:text-bone-50 sm:text-3xl md:text-[2.75rem]">{post.title}</h1>
          <p className="mt-3 hidden max-w-3xl text-base leading-relaxed text-char-200 sm:block md:text-lg">{post.excerpt}</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6" data-ads-after>
        {Tool ? <Tool /> : null}
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-14 pt-4 sm:px-6">
        <ArticleBody html={withoutToolBlock(post.html)} />
        <p className="mt-10 text-xs text-char-200">
          By {post.author.name} · Updated <time dateTime={updated}>{formatDate(updated)}</time>
        </p>
      </div>

      <section className="border-t border-bone-200 bg-bone-100/70 py-14 dark:border-char-500 dark:bg-char-500/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="font-display text-2xl text-char-500 dark:text-bone-50">More kitchen tools</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {others.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/${t.slug}/`}
                  className="group flex h-full items-center gap-4 rounded-2xl border border-bone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-ember-300 hover:shadow-card dark:border-char-400 dark:bg-char-600"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ember-50 text-ember-600 transition group-hover:bg-ember-500 group-hover:text-white dark:bg-char-500 dark:text-ember-200">
                    <ToolIcon name={t.icon} className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block font-semibold capitalize text-char-500 dark:text-bone-50">{t.name}</span>
                    <span className="text-sm text-char-200">{t.blurb}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/category/kitchen-calculators/" className="mt-6 inline-block text-sm font-semibold text-ember-600 hover:underline dark:text-ember-200">
            All kitchen tools →
          </Link>
        </div>
      </section>
    </article>
  );
}
