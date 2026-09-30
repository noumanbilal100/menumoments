# Menu Moments — Next.js rebuild

A modern, editorial rebuild of [menumoments.com](https://menumoments.com), moving off WordPress onto Next.js 15 while preserving every legacy URL.

## Tech stack

- **Next.js 15** (App Router, React 19, Server Components, ISR)
- **TypeScript** everywhere
- **Tailwind CSS** with a custom brand token system + dark mode
- **`next/image`** for optimized imagery
- **WordPress REST API** as the source of truth during transition
- **MDX-ready** for post-migration authoring

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment

Set in `.env.local`:

| Variable | Default | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://menumoments.com` | Canonical origin |
| `WORDPRESS_API_URL` | `https://menumoments.com/wp-json/wp/v2` | Legacy WP as headless CMS |
| `CONTENT_SOURCE` | `wordpress` | `wordpress` \| `mdx` \| `hybrid` |
| `REVALIDATE_SECONDS` | `3600` | ISR cache TTL for post/list fetches |

## Content strategy

The site reads posts from the legacy WordPress REST API by default, so every one of the ~155 existing posts renders on the new frontend on day one — no data migration required. Over time, posts can be rewritten and moved into MDX files under `src/content/`. Set `CONTENT_SOURCE=hybrid` to prefer MDX where present and fall back to WP.

If a URL is on the legacy list ([src/data/legacy-posts.ts](src/data/legacy-posts.ts)) but WP is unreachable or the post has been deleted, the site returns a "we're refreshing this" placeholder rather than a 404 — protecting SEO while content is rebuilt.

## URL preservation

Old WordPress URLs continue to work exactly as before:

| WP URL | New behaviour |
| --- | --- |
| `/hanky-panky-recipe/` | Post — served by `app/[slug]/page.tsx` |
| `/easy-recipes/` | 308 redirect → `/category/recipes` |
| `/kitchen-equipment-guides/` | 308 redirect → `/category/kitchen-appliances` |
| `/feed/` | Redirect → `/` (new feed lives at `/feed.xml`) |
| `/https-menumoments-com-topgolf-food-and-drink-menu` | 308 redirect → `/topgolf-food-and-drink-menu` (fixes a malformed URL in the WP sitemap) |

Legacy category → new category mapping is in [src/data/taxonomy.ts](src/data/taxonomy.ts) (`legacySlugs`).

## Information architecture

The new taxonomy is organized in six sections, each with its own set of categories — this is what powers the mega menu and the sitemap.

- **Recipes** — recipes, breakfast, lunch, dinner, desserts, baking, snacks, appetizers, drinks & beverages
- **Eat well** — healthy eating, meal prep, family meals, quick & easy, international, vegan, vegetarian
- **Kitchen tips** — kitchen tips, cooking tips, baking tips, organization, cleaning
- **Gear** — appliances, cookware, bakeware, gadgets, knives, food storage
- **Plan & shop** — meal planning, grocery guides, ingredient guides
- **Reviews** — food, product, kitchen product, recipe tools, gift guides, comparisons, best-of, Amazon finds, affiliate guides

Add or reorder categories in [src/data/taxonomy.ts](src/data/taxonomy.ts) — every menu, footer link, and sitemap entry updates automatically.

## Design system

Brand palette (all defined as CSS variables and Tailwind tokens):

- **Cream** — background family, warm off-whites
- **Clay** — signature terracotta accent (headline emphasis, buttons, links)
- **Sage** — secondary accent for tags and callouts
- **Ink** — text and dark-mode surfaces

Typography: [Fraunces](https://fonts.google.com/specimen/Fraunces) for display (headlines, magazine feel) + [Inter](https://fonts.google.com/specimen/Inter) for UI. Loaded via `next/font/google`.

Dark mode: opt-in via `data-theme="dark"` on `<html>`; also follows `prefers-color-scheme` when unset.

## Page inventory

| Route | File |
| --- | --- |
| Home | [src/app/page.tsx](src/app/page.tsx) |
| Blog index | [src/app/blog/page.tsx](src/app/blog/page.tsx) |
| Post (master template) | [src/app/[slug]/page.tsx](src/app/[slug]/page.tsx) |
| Category archive (master template) | [src/app/category/[slug]/page.tsx](src/app/category/[slug]/page.tsx) |
| About | [src/app/about-us/page.tsx](src/app/about-us/page.tsx) |
| Contact | [src/app/contact/page.tsx](src/app/contact/page.tsx) |
| Write for us | [src/app/write-for-us/page.tsx](src/app/write-for-us/page.tsx) |
| Privacy policy | [src/app/privacy-policy/page.tsx](src/app/privacy-policy/page.tsx) |
| Terms | [src/app/terms-conditions/page.tsx](src/app/terms-conditions/page.tsx) |
| Disclaimer | [src/app/disclaimer/page.tsx](src/app/disclaimer/page.tsx) |
| RSS | [src/app/feed.xml/route.ts](src/app/feed.xml/route.ts) |
| Sitemap | [src/app/sitemap.ts](src/app/sitemap.ts) |
| robots.txt | [src/app/robots.ts](src/app/robots.ts) |
| 404 | [src/app/not-found.tsx](src/app/not-found.tsx) |

## Deployment

Any Node host works. The recommended path is [Vercel](https://vercel.com):

```bash
npx vercel --prod
```

Set the environment variables from `.env.example` in your Vercel project. DNS: point `menumoments.com` at the Vercel deployment when you're ready to cut over.

Because the frontend pulls from the legacy WP install, you can run this side-by-side on a staging domain first (e.g. `next.menumoments.com`) with zero risk to production.

## Roadmap after launch

1. **Ship the frontend**, keep WP as headless CMS.
2. **Redirect DNS** when ready — every legacy URL already resolves.
3. **Author new posts** either in WP (still works) or as MDX files (once you switch `CONTENT_SOURCE=mdx`).
4. **Retire WordPress** — export posts to MDX, add them under `src/content/`, and turn off the WP install.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run typecheck` — TypeScript check
- `npm run lint` — ESLint

## License

All rights reserved &copy; Menu Moments.
