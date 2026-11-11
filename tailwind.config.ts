import type { Config } from 'tailwindcss';

/**
 * Menu Moments — v10 "Logo" palette.
 *
 * Taken straight from the logo: charcoal (#1E2B2A) for the wordmark,
 * tomato red (#C8412B) for "MENU", the fork, spoon and plate, and the
 * amber (#F4B860) the footer logo uses on dark. White page, a barely
 * warm neutral for cards and bands.
 *
 *   bone   → white page + faint warm-neutral surfaces
 *   char   → logo charcoal for text and dark surfaces
 *   ember  → TOMATO RED (buttons, links, chips) — 4.9:1 on white
 *   saffron→ amber (badges, highlights; dark text on it, never white)
 *   moss   → sage (tags)
 *   berry  → dusty mauve (rare accent)
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Neutrals on white ──────────────────────────────────────────
        // The page is white, so the scale runs the other way from the
        // cream build: 50 is the page, 100 is the faint tint that lets
        // cards and banded sections read as separate surfaces.
        bone: {
          50: '#FFFFFF',   // page — clean white
          100: '#F8F6F3',  // card / banded surface — faint warm neutral
          200: '#E8E3DC',  // hairline / border
          300: '#D3CCC2',  // stronger divider
        },
        // Logo charcoal for text + dark surfaces ─────────────────────
        char: {
          50: '#D5DCDB',
          100: '#A3AFAD',
          200: '#5E6B69',  // muted (5.5:1 on white)
          300: '#34403F',  // body text
          400: '#1E2B2A',  // strong text
          500: '#1E2B2A',  // headings + dark section bg (logo charcoal)
          600: '#121A19',
        },
        // Signature — TOMATO RED (logo "MENU", fork, plate) ──────────
        ember: {
          50: '#FEF5EF',
          100: '#FCE7DB',
          200: '#F7CBB5',
          300: '#EC9883',
          400: '#DD6A51',
          500: '#C8412B',
          600: '#A93422',
          700: '#84291B',
        },
        // Amber (footer logo) — badges, highlights ───────────────────
        saffron: {
          50: '#FEF7EA',
          100: '#FCEBCB',
          200: '#F9D699',
          300: '#F4B860',
          400: '#E99E3C',
          500: '#8A5A12',  // amber text on light amber
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

        // Amazon's buy-button palette. Readers recognise this yellow as
        // "this takes me to a checkout", which is exactly what the
        // affiliate CTAs do — a red button reads as site navigation.
        amazon: {
          DEFAULT: '#FFD814',
          hover: '#F7CA00',
          border: '#FCD200',
          ink: '#0F1111',
        },

        // Legacy semantic aliases ────────────────────────────────────
        cream: {
          50: '#FFFFFF',
          100: '#F8F6F3',
          200: '#E8E3DC',
          300: '#D3CCC2',
        },
        clay: {
          50: '#FEF5EF',
          100: '#FCE7DB',
          200: '#F7CBB5',
          300: '#EC9883',
          400: '#DD6A51',
          500: '#C8412B',
          600: '#A93422',
          700: '#84291B',
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
          50: '#D5DCDB',
          100: '#A3AFAD',
          200: '#5E6B69',
          300: '#34403F',
          400: '#1E2B2A',
          500: '#1E2B2A',
          600: '#121A19',
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
        card: '0 1px 2px rgba(30, 43, 42, 0.05), 0 8px 24px -12px rgba(30, 43, 42, 0.14)',
        cardHover: '0 2px 4px rgba(30, 43, 42, 0.08), 0 24px 48px -20px rgba(30, 43, 42, 0.28)',
        embered: '0 12px 32px -14px rgba(200, 65, 43, 0.45)',
        buttered: '0 12px 40px -14px rgba(233, 158, 60, 0.45)',
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
