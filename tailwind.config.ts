import type { Config } from 'tailwindcss';

/**
 * Menu Moments — v8 "Verdigris" palette.
 *
 * Warm oat cream base. Deep teal as the signature accent (vintage
 * bistro tile, French chef's kitchen). Butter yellow, sage-eucalyptus,
 * and dusty mauve as supporting notes. Zero orange, zero red — a
 * confident, editorial palette that doesn't lean on the food-blog
 * defaults.
 *
 *   bone   → warm oat cream page + crisp white cards
 *   char   → warm charcoal for text and dark surfaces
 *   ember  → DEEP TEAL (buttons, chips, links)
 *   saffron→ butter yellow (highlights)
 *   moss   → sage-eucalyptus (tags)
 *   berry  → dusty mauve rose (rare accent — no red)
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Warm oat neutrals ──────────────────────────────────────────
        bone: {
          50: '#F5EFE0',   // page — warm oat cream
          100: '#FFFFFF',  // elevated card
          200: '#E3D8BE',  // hairline / border
          300: '#C6B78F',  // stronger divider
        },
        // Warm charcoal for text + dark surfaces ─────────────────────
        char: {
          50: '#D4CBB8',
          100: '#A69C8F',
          200: '#6E655E',  // muted
          300: '#3A342E',  // body text
          400: '#231F1B',  // strong text
          500: '#231F1B',  // headings + dark section bg
          600: '#0F0D0B',
        },
        // Signature — DEEP TEAL ──────────────────────────────────────
        ember: {
          50: '#EEF6F5',
          100: '#D3E8E6',
          200: '#A2CDC9',
          300: '#6FADA8',
          400: '#458F89',
          500: '#2E7373',
          600: '#1F5757',
          700: '#153E3E',
        },
        // Butter yellow — highlights, ratings ────────────────────────
        saffron: {
          50: '#FCF8E4',
          100: '#F8EFC5',
          200: '#F1E094',
          300: '#E5D268',
          400: '#D2B944',
          500: '#A99628',
        },
        // Sage-eucalyptus — tags, freshness ──────────────────────────
        moss: {
          50: '#EDF2E8',
          100: '#D6E1CC',
          200: '#B4C7A5',
          300: '#98B18F',
          400: '#78976D',
          500: '#5A7550',
        },
        // Dusty mauve rose — rare pop (no red vibe) ──────────────────
        berry: {
          50: '#F5EBEF',
          100: '#E8D2DA',
          200: '#D2ACBA',
          300: '#B78D9E',
          400: '#966B7E',
          500: '#6F4B5D',
        },

        // Legacy semantic aliases ────────────────────────────────────
        cream: {
          50: '#F5EFE0',
          100: '#FFFFFF',
          200: '#E3D8BE',
          300: '#C6B78F',
        },
        clay: {
          50: '#EEF6F5',
          100: '#D3E8E6',
          200: '#A2CDC9',
          300: '#6FADA8',
          400: '#458F89',
          500: '#2E7373',
          600: '#1F5757',
          700: '#153E3E',
        },
        sage: {
          50: '#EDF2E8',
          100: '#D6E1CC',
          200: '#B4C7A5',
          300: '#98B18F',
          400: '#78976D',
          500: '#5A7550',
          600: '#3F5638',
        },
        ink: {
          50: '#D4CBB8',
          100: '#A69C8F',
          200: '#6E655E',
          300: '#3A342E',
          400: '#231F1B',
          500: '#231F1B',
          600: '#0F0D0B',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '0.98', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2rem, 4.5vw, 3.75rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.625rem, 3vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      maxWidth: {
        prose: '68ch',
        wide: '1280px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(35, 31, 27, 0.05), 0 8px 24px -12px rgba(35, 31, 27, 0.14)',
        cardHover: '0 2px 4px rgba(35, 31, 27, 0.08), 0 24px 48px -20px rgba(46, 115, 115, 0.30)',
        embered: '0 12px 40px -14px rgba(46, 115, 115, 0.50)',
        buttered: '0 12px 40px -14px rgba(210, 185, 68, 0.45)',
        mauved: '0 12px 40px -14px rgba(150, 107, 126, 0.40)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translate3d(0, 24px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        'draw-in': {
          '0%': { strokeDasharray: '0 1000' },
          '100%': { strokeDasharray: '1000 0' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 700ms cubic-bezier(0.22, 0.61, 0.36, 1) both',
        'fade-in': 'fade-in 500ms ease-out both',
        'scale-in': 'scale-in 500ms cubic-bezier(0.22, 0.61, 0.36, 1) both',
        marquee: 'marquee 40s linear infinite',
        'marquee-fast': 'marquee 22s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 4s ease-in-out infinite',
        wiggle: 'wiggle 3s ease-in-out infinite',
        'draw-in': 'draw-in 2s ease-out both',
        blob: 'blob 18s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
