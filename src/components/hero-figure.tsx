import Image from 'next/image';

export interface HeroFigureImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  title?: string;
  caption?: string;
}

/**
 * The featured image at the top of a post or page. A caption sits under it in
 * a <figcaption>, which Google reads together with the picture.
 */
export function HeroFigure({ image, aspectRatio = '16 / 9' }: { image: HeroFigureImage; aspectRatio?: string }) {
  return (
    <figure className="mx-auto max-w-5xl px-6 pt-8">
      <div className="zoom-parent relative overflow-hidden rounded-3xl bg-bone-100 shadow-cardHover" style={{ aspectRatio }}>
        <Image
          src={image.src}
          alt={image.alt}
          title={image.title || undefined}
          fill
          sizes="(min-width: 1024px) 1000px, 100vw"
          className="object-cover"
          preload
        />
      </div>
      {image.caption && <figcaption className="mt-3 text-center text-sm text-char-200">{image.caption}</figcaption>}
    </figure>
  );
}
