import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/lib/content';
import { getCategory } from '@/data/taxonomy';

type Variant = 'default' | 'featured' | 'compact' | 'wide';

export function PostCard({ post, variant = 'default' }: { post: Post; variant?: Variant }) {
  const primary = post.categories[0];
  const cat = primary ? getCategory(primary) : undefined;

  if (variant === 'featured') return <Featured post={post} category={cat?.name} />;
  if (variant === 'compact') return <Compact post={post} category={cat?.name} />;
  if (variant === 'wide') return <Wide post={post} category={cat?.name} />;
  return <Default post={post} category={cat?.name} />;
}

function CategoryTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">
      {children}
    </span>
  );
}

function ReadingMeta({ minutes, date }: { minutes: number; date: string }) {
  return (
    <p className="text-xs text-char-200">
      <time dateTime={date}>{formatDate(date)}</time> &middot; {minutes} min read
    </p>
  );
}

function Default({ post, category }: { post: Post; category?: string }) {
  return (
    <article className="group">
      <Link href={`/${post.slug}`} className="block">
        <div className="zoom-parent relative aspect-[4/3] overflow-hidden rounded-2xl bg-bone-100">
          {post.heroImage ? (
            <Image
              src={post.heroImage.src}
              alt={post.heroImage.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <Placeholder />
          )}
          <span className="absolute right-3 top-3 flex h-8 w-8 translate-y-2 items-center justify-center rounded-full bg-bone-100/95 text-char-500 opacity-0 shadow-card transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            →
          </span>
        </div>
        <div className="mt-4">
          {category && <CategoryTag>{category}</CategoryTag>}
          <h3 className="mt-2 font-display text-xl leading-snug tracking-tight text-char-500 transition-colors group-hover:text-ember-500 dark:text-bone-50">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-char-200">{post.excerpt}</p>
          )}
          <div className="mt-3">
            <ReadingMeta minutes={post.readingMinutes} date={post.publishedAt} />
          </div>
        </div>
      </Link>
    </article>
  );
}

function Featured({ post, category }: { post: Post; category?: string }) {
  return (
    <article className="group grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
      <Link href={`/${post.slug}`} className="block">
        <div className="zoom-parent relative aspect-[5/4] overflow-hidden rounded-2xl bg-bone-100 lg:aspect-[4/3]">
          {post.heroImage ? (
            <Image
              src={post.heroImage.src}
              alt={post.heroImage.alt}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <Placeholder />
          )}
        </div>
      </Link>
      <div>
        {category && <CategoryTag>{category}</CategoryTag>}
        <h2 className="mt-3 font-display text-display-lg text-char-500 dark:text-bone-50">
          <Link href={`/${post.slug}`} className="transition-colors hover:text-ember-500">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="mt-4 max-w-prose text-base text-char-200 md:text-lg">{post.excerpt}</p>
        )}
        <div className="mt-6 flex items-center gap-3 text-sm text-char-200">
          <span>By {post.author.name}</span>
          <span aria-hidden>&middot;</span>
          <ReadingMeta minutes={post.readingMinutes} date={post.publishedAt} />
        </div>
      </div>
    </article>
  );
}

function Compact({ post, category }: { post: Post; category?: string }) {
  return (
    <article className="group flex gap-4">
      <Link
        href={`/${post.slug}`}
        className="zoom-parent relative block aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-bone-100 sm:w-28"
      >
        {post.heroImage ? (
          <Image
            src={post.heroImage.src}
            alt={post.heroImage.alt}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <Placeholder small />
        )}
      </Link>
      <div className="min-w-0">
        {category && <CategoryTag>{category}</CategoryTag>}
        <h4 className="mt-1 line-clamp-2 font-display text-base leading-snug text-char-500 transition-colors group-hover:text-ember-500 dark:text-bone-50">
          <Link href={`/${post.slug}`}>{post.title}</Link>
        </h4>
        <p className="mt-1 text-xs text-char-200">{post.readingMinutes} min read</p>
      </div>
    </article>
  );
}

function Wide({ post, category }: { post: Post; category?: string }) {
  return (
    <article className="group grid gap-6 border-b border-bone-200 pb-8 md:grid-cols-[1fr_1.5fr] md:items-center dark:border-char-500">
      <Link href={`/${post.slug}`} className="block">
        <div className="zoom-parent relative aspect-[4/3] overflow-hidden rounded-xl bg-bone-100">
          {post.heroImage ? (
            <Image
              src={post.heroImage.src}
              alt={post.heroImage.alt}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          ) : (
            <Placeholder />
          )}
        </div>
      </Link>
      <div>
        {category && <CategoryTag>{category}</CategoryTag>}
        <h3 className="mt-2 font-display text-2xl leading-tight text-char-500 transition-colors group-hover:text-ember-500 dark:text-bone-50">
          <Link href={`/${post.slug}`}>{post.title}</Link>
        </h3>
        {post.excerpt && <p className="mt-3 max-w-prose text-sm text-char-200 md:text-base">{post.excerpt}</p>}
        <div className="mt-4">
          <ReadingMeta minutes={post.readingMinutes} date={post.publishedAt} />
        </div>
      </div>
    </article>
  );
}

function Placeholder({ small = false }: { small?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bone-100 via-ember-50 to-saffron-50">
      <svg
        width={small ? '28' : '64'}
        height={small ? '28' : '64'}
        viewBox="0 0 40 40"
        aria-hidden="true"
        className="text-ember-200"
      >
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1" fill="none" />
        <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}
