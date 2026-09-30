import Link from 'next/link';
import Image from 'next/image';
import type { Collection } from '@/data/collections';
import { Sparkle } from './doodles';

export function CollectionCard({
  collection,
  cover,
}: {
  collection: Collection;
  cover?: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl shadow-card transition-shadow duration-500 hover:shadow-cardHover">
      <Link href={`/collections/${collection.slug}`} className="zoom-parent block">
        <div className="relative aspect-[5/4] w-full bg-gradient-to-br from-ember-200 to-saffron-100">
          {cover && (
            <Image
              src={cover}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-char-600/95 via-char-600/50 to-char-600/10" />
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-bone-100/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ember-500">
            <Sparkle size={10} /> Collection
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 text-bone-50">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-200">
              {collection.postSlugs.length} recipes
            </p>
            <h3 className="font-display text-2xl leading-tight transition-transform duration-500 group-hover:-translate-y-0.5">
              {collection.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-bone-100/80">{collection.subtitle}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-ember-200 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              Open the collection →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
