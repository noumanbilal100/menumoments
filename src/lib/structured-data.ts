import type { Post } from './content';
import { getCategory } from '@/data/taxonomy';
import { SITE, SITE_URL } from './env';
import { decodeEntities, extractRecipe } from './recipe-extract';

/**
 * Schema.org markup for a post, following Google's structured data rules:
 *
 * - Every post is an Article unless it is verifiably a recipe. Menu pages and
 *   buying guides are not Reviews: a Review needs a rating and must cover one
 *   specific item, not a category or a list.
 * - Recipe facts come only from text on the page. post.recipe holds estimates
 *   derived from the category, which must never be published as data.
 */

function absolute(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** Stored stamps carry no zone, and Google assumes its own when one is missing. */
function withZone(iso?: string): string | undefined {
  if (!iso) return undefined;
  return /(?:z|[+-]\d\d:?\d\d)$/i.test(iso) ? iso : `${iso}+00:00`;
}

function isoMinutes(minutes: number): string {
  return `PT${minutes}M`;
}

function imageFor(post: Post): string | undefined {
  if (post.heroImage?.src) return absolute(post.heroImage.src);
  const inBody = post.html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1];
  return inBody ? absolute(decodeEntities(inBody)) : undefined;
}

function authorOf(post: Post): Record<string, string> {
  // Posts are credited to the publication; Google wants Organization for brands.
  return post.author.name === SITE.name
    ? { '@type': 'Organization', name: SITE.name, url: `${SITE_URL}/` }
    : { '@type': 'Person', name: post.author.name };
}

export function postJsonLd(post: Post): Record<string, unknown> {
  const url = `${SITE_URL}/${post.slug}/`;
  const name = decodeEntities(post.title);
  const description = decodeEntities(post.excerpt);
  const image = imageFor(post);
  const section = post.categories[0] ? getCategory(post.categories[0])?.name : undefined;
  const common = {
    '@context': 'https://schema.org',
    description,
    image,
    datePublished: withZone(post.publishedAt),
    dateModified: withZone(post.updatedAt ?? post.publishedAt),
    author: authorOf(post),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  // Google requires an image on Recipe, so a post without one stays an Article.
  const recipe = post.kind === 'recipe' && image ? extractRecipe(post.html, name) : null;
  if (!recipe) {
    return {
      ...common,
      '@type': 'Article',
      headline: name,
      articleSection: section,
      publisher: { '@type': 'Organization', name: SITE.name, url: `${SITE_URL}/` },
    };
  }

  const { prepMinutes: prep, cookMinutes: cook, totalMinutes: total, servings } = recipe;
  const hasBoth = prep !== undefined && cook !== undefined;
  return {
    ...common,
    '@type': 'Recipe',
    name,
    recipeCategory: section,
    keywords: post.seo?.focusKeyword,
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.steps.map((s) => ({ '@type': 'HowToStep', ...s })),
    // Google only accepts cookTime alongside prepTime.
    prepTime: hasBoth ? isoMinutes(prep) : undefined,
    cookTime: hasBoth ? isoMinutes(cook) : undefined,
    totalTime: total !== undefined ? isoMinutes(total) : hasBoth ? isoMinutes(prep + cook) : undefined,
    recipeYield: servings ? `${servings} servings` : undefined,
  };
}

/** JSON for a <script> tag; body text is included, so "<" must not close the tag. */
export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
