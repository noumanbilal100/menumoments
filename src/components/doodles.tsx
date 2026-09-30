/**
 * Editorial line-art food doodles. Each one is a single-color, currentColor SVG
 * so it inherits the surrounding text color and can be scaled anywhere.
 *
 * These read as hand-drawn accents throughout the site — the small
 * "flourish" that keeps a magazine layout from feeling too corporate.
 */

interface Props {
  size?: number;
  className?: string;
}

const base = 'inline-block align-middle';

export function Whisk({ size = 20, className = '' }: Props) {
  return (
    <svg
      className={`${base} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path d="M20 4v16M20 34v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 22c0 5 3.5 10 8 10s8-5 8-10c0-1-2-2-8-2s-8 1-8 2z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 22c1 5 3 10 6 10M26 22c-1 5-3 10-6 10M13 26c2 0 5 1 7 1s5-1 7-1" stroke="currentColor" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

export function Olive({ size = 20, className = '' }: Props) {
  return (
    <svg
      className={`${base} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path d="M8 20c4-8 20-8 24 0-4 8-20 8-24 0z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 18c2-1 8-1 12 0M14 22c2 1 8 1 12 0" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="20" cy="20" r="2.5" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function Chili({ size = 20, className = '' }: Props) {
  return (
    <svg
      className={`${base} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 30c8 0 20-6 22-18 0-1-2-1-4 1-2 2-4 6-8 8-6 3-14 5-10 9z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M30 12c2-2 4-4 4-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function CoffeeBean({ size = 20, className = '' }: Props) {
  return (
    <svg
      className={`${base} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="20" cy="20" rx="8" ry="14" transform="rotate(-25 20 20)" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 10c4 6 8 14 12 20" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
    </svg>
  );
}

export function Croissant({ size = 20, className = '' }: Props) {
  return (
    <svg
      className={`${base} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 26c4-14 22-14 28 0-4-2-8-2-14 0-6 2-10 2-14 0z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M12 22c2-1 5-1 8-1s6 0 8 1" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function Fork({ size = 20, className = '' }: Props) {
  return (
    <svg
      className={`${base} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 4v14c0 3 3 4 6 4s6-1 6-4V4M18 4v10M22 4v10M20 22v14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Sparkle({ size = 16, className = '' }: Props) {
  return (
    <svg
      className={`${base} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2v6M12 16v6M2 12h6M16 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M18.4 5.6l-4.2 4.2M9.8 14.2l-4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Squiggle({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="120"
      height="12"
      viewBox="0 0 120 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 6c4-4 8-4 12 0s8 4 12 0 8-4 12 0 8 4 12 0 8-4 12 0 8 4 12 0 8-4 12 0 8 4 12 0 8-4 12 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** A long, hand-drawn arrow — great for "read more" flourishes. */
export function DrawArrow({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="60" height="14" viewBox="0 0 60 14" fill="none" aria-hidden="true">
      <path d="M2 7c14-4 30-4 52 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M48 2l6 5-6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Overlapping quotation marks for pull quotes. */
export function QuoteMark({ size = 40, className = '' }: Props) {
  return (
    <svg
      className={`${base} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 26c0-8 4-14 10-16M22 26c0-8 4-14 10-16M8 28c-2 0-4-2-4-5s2-5 4-5 4 2 4 5-2 5-4 5zM22 28c-2 0-4-2-4-5s2-5 4-5 4 2 4 5-2 5-4 5z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}
