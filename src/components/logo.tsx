import Image from 'next/image';
import Link from 'next/link';

const LOGOS = {
  header: { src: '/logo-header.webp', width: 359, height: 80, className: 'h-10 w-auto', preload: true },
  // The footer sits on a dark band, so it uses the light version.
  footer: { src: '/logo-footer.webp', width: 430, height: 96, className: 'h-12 w-auto', preload: false },
};

export function Logo({ variant = 'header', className = '' }: { variant?: keyof typeof LOGOS; className?: string }) {
  const { src, width, height, className: size, preload } = LOGOS[variant];
  return (
    <Link href="/" aria-label="Menu Moments — home" className={`inline-flex ${className}`}>
      <Image src={src} alt="Menu Moments" width={width} height={height} className={size} preload={preload} />
    </Link>
  );
}
