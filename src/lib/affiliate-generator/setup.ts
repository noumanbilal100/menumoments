import { PRODUCTS } from '@/data/products';
import { PRODUCT_IMAGES } from '@/data/product-images';

/**
 * Inputs for the affiliate post generator: the topic plus the products the
 * editor supplies by hand. Everything ChatGPT writes is keyed to these
 * products by position, as [P1], [P2] and so on.
 */

export interface GenProduct {
  name: string;
  url: string;
  image: string;
  /** Anything the editor knows that ChatGPT should use: contents, size, material. */
  facts: string;
}

export interface GenSetup {
  keyword: string;
  singular: string;
  plural: string;
  category: string;
  notes: string;
  products: GenProduct[];
}

export const EMPTY_PRODUCT: GenProduct = { name: '', url: '', image: '', facts: '' };

export const EMPTY_SETUP: GenSetup = {
  keyword: '',
  singular: '',
  plural: '',
  category: '',
  notes: '',
  products: [{ ...EMPTY_PRODUCT }, { ...EMPTY_PRODUCT }, { ...EMPTY_PRODUCT }],
};

export function isUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

/** "best sushi making kits" → "sushi making kits" and "sushi making kit". */
export function nounsFor(keyword: string): { plural: string; singular: string } {
  const plural = keyword.trim().toLowerCase().replace(/^(the\s+)?(best|top(\s+\d+)?)\s+/, '').replace(/\s+(for|in|of|under)\s+.*$/, '');
  const singular = plural
    .replace(/knives$/, 'knife')
    .replace(/ies$/, 'y')
    .replace(/(ch|sh|x|ss)es$/, '$1')
    .replace(/([^s])s$/, '$1');
  return { plural, singular };
}

/** A sensible topic category from the words in the keyword; the editor can change it. */
export function categoryFor(keyword: string): string {
  const k = keyword.toLowerCase();
  if (/\bknife|knives|cutting board|sharpen/.test(k)) return 'knives-and-cutting-tools';
  if (/\bpan|pans|pot|pots|skillet|wok|cookware|dutch oven|griddle/.test(k)) return 'cookware';
  if (/\bbak(e|ing)|sheet|tin|mold|mould|ramekin/.test(k)) return 'bakeware';
  if (/\bcontainer|storage|jar|wrap|vacuum seal/.test(k)) return 'food-storage';
  if (/mixer|blender|fryer|microwave|maker|oven|toaster|fridge|refrigerator|kettle|cooker|dishwasher|processor|grill|juicer/.test(k)) {
    return 'kitchen-appliances';
  }
  return 'kitchen-gadgets';
}

function asinIn(url: string): string | undefined {
  return url.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i)?.[1]?.toUpperCase();
}

/** What a product link alone tells us: a name from Amazon's URL slug, and a photo if the ASIN is in the catalog. */
export function senseUrl(url: string): { name?: string; image?: string } {
  if (!isUrl(url)) return {};
  const asin = asinIn(url);
  const known = asin ? PRODUCTS.find((p) => p.asin === asin) : undefined;
  if (known) return { name: known.name, image: known.image };
  let name: string | undefined;
  try {
    const slug = new URL(url).pathname.match(/^\/([^/]+)\/(?:dp|gp\/product)\//)?.[1];
    if (slug && slug.includes('-')) name = decodeURIComponent(slug).replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  } catch {
    // Not a URL we can read; the editor types the name.
  }
  return { name, image: asin ? PRODUCT_IMAGES[asin] : undefined };
}

function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(url) || /media-amazon\.com|images-amazon\.com|ssl-images-amazon/i.test(url);
}

/** Pasted text in rows, columns or one field per line becomes products, in order. */
export function parseProductList(text: string): GenProduct[] {
  const products: GenProduct[] = [];
  let current: GenProduct = { ...EMPTY_PRODUCT };
  const flush = () => {
    if (current.name || current.url || current.image) products.push(current);
    current = { ...EMPTY_PRODUCT };
  };
  for (const line of text.split(/\r?\n/)) {
    const urls = line.match(/https?:\/\/[^\s|,"'<>]+/g) ?? [];
    const rest = urls
      .reduce((s, u) => s.replace(u, ' '), line)
      .split(/[|\t]/)
      .map((s) => s.replace(/^[\s\-–—•*#.:\d)]+|[\s\-–—,:]+$/g, '').trim())
      .filter((s) => s.length > 2 && !/^(product( name)?|name|link|url|image( url)?|affiliate( link)?|photo|title)$/i.test(s));
    for (const name of rest.slice(0, 1)) {
      if (current.name) flush();
      current.name = name;
    }
    for (const url of urls) {
      if (isImageUrl(url)) {
        if (current.image) flush();
        current.image = url;
      } else {
        if (current.url) flush();
        current.url = url;
      }
    }
  }
  flush();
  return products.map((p) => {
    const sensed = senseUrl(p.url);
    return { ...p, name: p.name || sensed.name || '', image: p.image || sensed.image || '' };
  });
}

/** The store named on buttons: "Amazon" for Amazon links, otherwise the site's own name. */
export function storeFor(url: string): string {
  if (/amzn\.to|amazon\./i.test(url)) return 'Amazon';
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').split('.')[0];
    return host.charAt(0).toUpperCase() + host.slice(1);
  } catch {
    return 'the store';
  }
}

export function productProblems(p: GenProduct): string[] {
  const problems: string[] = [];
  if (!p.name.trim()) problems.push('name');
  if (!isUrl(p.url)) problems.push('link');
  if (!isUrl(p.image)) problems.push('image');
  return problems;
}
