import type { Post } from './content';
import { getCategory } from '@/data/taxonomy';
import { SITE, SITE_URL } from './env';
import { decodeEntities, extractRecipe } from './recipe-extract';
import { postTrail } from './silo';

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

export const absoluteUrl = absolute;

/** Stored stamps carry no zone, and Google assumes its own when one is missing. */
function withZone(iso?: string): string | undefined {
  if (!iso) return undefined;
  return /(?:z|[+-]\d\d:?\d\d)$/i.test(iso) ? iso : `${iso}+00:00`;
}

function isoMinutes(minutes: number): string {
  return `PT${minutes}M`;
}

export function imageFor(post: Post): string | undefined {
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

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const PUBLISHER = {
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE.name,
  url: `${SITE_URL}/`,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/menumoments-logo.png`, width: 2088, height: 616 },
};

/** Who publishes the site. Goes on the homepage, which Google reads this from. */
export function siteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { ...PUBLISHER, description: SITE.description, email: SITE.email },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE.name,
        description: SITE.description,
        inLanguage: 'en-US',
        publisher: { '@id': ORGANIZATION_ID },
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: decodeEntities(item.name),
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Home › section hub › category › post, the same trail the page shows. */
export function postBreadcrumbJsonLd(post: Post): Record<string, unknown> {
  return breadcrumbJsonLd(postTrail(post));
}

/** A page whose job is to list other pages: a category, collection or the archive. */
export function collectionJsonLd(page: {
  name: string;
  description: string;
  path: string;
  posts?: Pick<Post, 'slug' | 'title'>[];
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}${page.path}`,
    url: `${SITE_URL}${page.path}`,
    name: decodeEntities(page.name),
    description: decodeEntities(page.description),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: page.posts?.length
      ? {
          '@type': 'ItemList',
          numberOfItems: page.posts.length,
          itemListElement: page.posts.slice(0, 30).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}/${p.slug}/`,
            name: decodeEntities(p.title),
          })),
        }
      : undefined,
  };
}

export function webPageJsonLd(
  type: 'AboutPage' | 'ContactPage',
  page: { name: string; description: string; path: string },
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${SITE_URL}${page.path}`,
    url: `${SITE_URL}${page.path}`,
    name: page.name,
    description: page.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/** A page made in the admin; its featured image is named as the page's main picture. */
export function sitePageJsonLd(page: {
  slug: string;
  title: string;
  lede?: string;
  seo?: { metaDescription?: string };
  heroImage?: { src: string; alt: string; width?: number; height?: number; caption?: string } | null;
}): Record<string, unknown> {
  const url = `${SITE_URL}/${page.slug}/`;
  const hero = page.heroImage;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url,
    name: decodeEntities(page.title),
    description: page.seo?.metaDescription || page.lede || undefined,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': ORGANIZATION_ID },
    primaryImageOfPage: hero?.src
      ? {
          '@type': 'ImageObject',
          url: absolute(hero.src),
          contentUrl: absolute(hero.src),
          width: hero.width,
          height: hero.height,
          caption: hero.caption || hero.alt,
        }
      : undefined,
  };
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
      publisher: PUBLISHER,
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
