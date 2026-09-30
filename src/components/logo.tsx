import Link from 'next/link';

/**
 * Editorial monogram: "MM" set in a stamped circle, with a small punctum
 * to signal a magazine mark rather than a food-blog badge. Uses currentColor
 * so it inherits from the header (light or dark).
 */
export function Logo({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Menu Moments — home"
      className={`group inline-flex items-center gap-3 ${className}`}
    >
      <span className="relative inline-flex h-10 w-10 items-center justify-center">
        <svg
          viewBox="0 0 40 40"
          width="40"
          height="40"
          aria-hidden="true"
          className="text-char-500 transition-transform duration-500 group-hover:rotate-[8deg] dark:text-cream-50"
        >
          <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <circle cx="20" cy="20" r="15.5" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4" />
          {/* Monogram MM */}
          <text
            x="20"
            y="24"
            textAnchor="middle"
            fontFamily="var(--font-display), Georgia, serif"
            fontSize="15"
            fontWeight="700"
            fontStyle="italic"
            fill="currentColor"
            letterSpacing="-1"
          >
            MM
          </text>
          {/* Punctum */}
          <circle cx="20" cy="33" r="0.9" fill="#C63A17" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.35rem] leading-none tracking-tight text-char-500 dark:text-cream-50">
            Menu <span className="italic text-ember-500">Moments</span>
          </span>
          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.25em] text-char-200">
            The food journal
          </span>
        </span>
      )}
    </Link>
  );
}
