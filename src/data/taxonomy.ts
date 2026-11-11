/**
 * Taxonomy for the rebranded Menu Moments.
 *
 * Categories are grouped into "sections" so the header nav can render a
 * two-level mega menu without every category becoming a top-level tab.
 *
 * `legacySlugs` maps old WordPress category slugs to the new one so any
 * inbound link at /easy-recipes/ still resolves.
 */

export type CategorySlug =
  // Tools
  | 'kitchen-calculators'
  // Recipes
  | 'recipes'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'desserts'
  | 'baking'
  | 'snacks'
  | 'appetizers'
  | 'drinks-and-beverages'
  // Lifestyle
  | 'healthy-eating'
  | 'meal-prep'
  | 'family-meals'
  | 'quick-and-easy-meals'
  | 'international-cuisine'
  | 'vegan-recipes'
  | 'vegetarian-recipes'
  // Kitchen know-how
  | 'kitchen-tips'
  | 'cooking-tips'
  | 'baking-tips'
  | 'kitchen-organization'
  | 'kitchen-cleaning'
  | 'home-diy'
  // Gear
  | 'kitchen-appliances'
  | 'cookware'
  | 'bakeware'
  | 'kitchen-gadgets'
  | 'knives-and-cutting-tools'
  | 'food-storage'
  // Planning & shopping
  | 'meal-planning'
  | 'grocery-guides'
  | 'ingredient-guides'
  | 'pet-food'
  // Reviews & buying guides
  | 'food-reviews'
  | 'product-reviews'
  | 'kitchen-product-reviews'
  | 'recipe-tools'
  | 'kitchen-gift-guides'
  | 'food-and-kitchen-comparisons'
  | 'best-kitchen-products'
  | 'amazon-kitchen-finds'
  | 'affiliate-product-guides';

export interface Category {
  slug: CategorySlug;
  name: string;
  section: SectionKey;
  description: string;
  legacySlugs?: string[];
}

export type SectionKey =
  | 'tools'
  | 'recipes'
  | 'lifestyle'
  | 'kitchen-tips'
  | 'gear'
  | 'planning'
  | 'reviews';

export const SECTIONS: Record<SectionKey, { name: string; tagline: string }> = {
  tools: { name: 'Tools', tagline: 'Calculators and converters' },
  recipes: { name: 'Recipes', tagline: 'From breakfast to dessert' },
  lifestyle: { name: 'Eat well', tagline: 'How to eat through the week' },
  'kitchen-tips': { name: 'Kitchen tips', tagline: 'Skills, cleaning, order' },
  gear: { name: 'Gear', tagline: 'What to cook with' },
  planning: { name: 'Plan & shop', tagline: 'Meals, groceries, ingredients' },
  reviews: { name: 'Reviews', tagline: 'What we recommend' },
};

export const CATEGORIES: Category[] = [
  // Tools. First, so a tool's page always files under Tools however else it is tagged.
  { slug: 'kitchen-calculators', name: 'Kitchen calculators', section: 'tools', description: 'Free converters and calculators for the kitchen: butter, cups to grams, oven temperatures, meat temperatures and recipe scaling.' },

  // Recipes
  { slug: 'recipes', name: 'Recipes', section: 'recipes', description: 'The full recipe library — dinners, desserts, drinks and everything between.', legacySlugs: ['easy-recipes'] },
  { slug: 'breakfast', name: 'Breakfast', section: 'recipes', description: 'Slow weekend breakfasts and 10-minute weekday plates.' },
  { slug: 'lunch', name: 'Lunch', section: 'recipes', description: 'Bowls, sandwiches, salads and packable midday meals.' },
  { slug: 'dinner', name: 'Dinner', section: 'recipes', description: 'One-pans, sheet pans, slow-cookers and weeknight standbys.' },
  { slug: 'desserts', name: 'Desserts', section: 'recipes', description: 'Cakes, cookies, custards and everything sweet.' },
  { slug: 'baking', name: 'Baking', section: 'recipes', description: 'Breads, pastries and the science of a good bake.' },
  { slug: 'snacks', name: 'Snacks', section: 'recipes', description: 'Between-meal bites, sweet and savory.' },
  { slug: 'appetizers', name: 'Appetizers', section: 'recipes', description: 'Starters, dips and party plates.' },
  { slug: 'drinks-and-beverages', name: 'Drinks & Beverages', section: 'recipes', description: 'Cocktails, mocktails, coffees and cold brews.' },

  // Lifestyle
  { slug: 'healthy-eating', name: 'Healthy eating', section: 'lifestyle', description: 'Balanced plates without dogma.', legacySlugs: ['soft-food-diet'] },
  { slug: 'meal-prep', name: 'Meal prep', section: 'lifestyle', description: 'Cook once, eat all week.' },
  { slug: 'family-meals', name: 'Family meals', section: 'lifestyle', description: 'Recipes that please a whole table.' },
  { slug: 'quick-and-easy-meals', name: 'Quick & easy meals', section: 'lifestyle', description: '30 minutes or less, start to finish.' },
  { slug: 'international-cuisine', name: 'International cuisine', section: 'lifestyle', description: 'Dishes and techniques from around the world.' },
  { slug: 'vegan-recipes', name: 'Vegan recipes', section: 'lifestyle', description: 'Fully plant-based cooking.' },
  { slug: 'vegetarian-recipes', name: 'Vegetarian recipes', section: 'lifestyle', description: 'Meatless meals that satisfy.' },

  // Kitchen tips
  { slug: 'kitchen-tips', name: 'Kitchen tips', section: 'kitchen-tips', description: 'The little upgrades that make cooking easier.' },
  { slug: 'cooking-tips', name: 'Cooking tips', section: 'kitchen-tips', description: 'Method, timing, technique.', legacySlugs: ['cooking-tips'] },
  { slug: 'baking-tips', name: 'Baking tips', section: 'kitchen-tips', description: 'Ratios, temperatures, doughs that behave.' },
  { slug: 'kitchen-organization', name: 'Kitchen organization', section: 'kitchen-tips', description: 'Systems for pantries, drawers, counters.' },
  { slug: 'kitchen-cleaning', name: 'Kitchen cleaning', section: 'kitchen-tips', description: 'Keep it spotless without wrecking your finishes.' },
  { slug: 'home-diy', name: 'Natural home & DIY', section: 'kitchen-tips', description: 'Homemade soaps, balms and other natural recipes for the home.' },

  // Gear
  { slug: 'kitchen-appliances', name: 'Kitchen appliances', section: 'gear', description: 'From stand mixers to air fryers.', legacySlugs: ['kitchen-appliances', 'kitchen-equipment-guides'] },
  { slug: 'cookware', name: 'Cookware', section: 'gear', description: 'Pans, pots and everything on the stove.' },
  { slug: 'bakeware', name: 'Bakeware', section: 'gear', description: 'Sheets, tins and rings for the oven.' },
  { slug: 'kitchen-gadgets', name: 'Kitchen gadgets', section: 'gear', description: 'Small tools that earn their drawer.' },
  { slug: 'knives-and-cutting-tools', name: 'Knives & cutting tools', section: 'gear', description: 'Blades, boards and how to keep them sharp.' },
  { slug: 'food-storage', name: 'Food storage', section: 'gear', description: 'Containers, wraps and keeping food fresh.' },

  // Planning
  { slug: 'meal-planning', name: 'Meal planning', section: 'planning', description: 'Frameworks for a workable week of meals.' },
  { slug: 'grocery-guides', name: 'Grocery guides', section: 'planning', description: 'What to buy, where, and when.' },
  { slug: 'ingredient-guides', name: 'Ingredient guides', section: 'planning', description: 'Deep dives on the foods themselves.' },
  { slug: 'pet-food', name: 'Pet food', section: 'planning', description: 'What dogs, cats, chickens and other pets can safely eat.', legacySlugs: ['dog-food-guide'] },

  // Reviews
  { slug: 'food-reviews', name: 'Food reviews', section: 'reviews', description: 'Restaurants, chains and the dishes worth ordering.', legacySlugs: ['top-restaurant-menus', 'best-happy-hours', 'daily-specials'] },
  { slug: 'product-reviews', name: 'Product reviews', section: 'reviews', description: 'Honest, hands-on takes.' },
  { slug: 'kitchen-product-reviews', name: 'Kitchen product reviews', section: 'reviews', description: 'The tools we actually keep.' },
  { slug: 'recipe-tools', name: 'Recipe tools', section: 'reviews', description: 'Apps, timers, converters, calculators.' },
  { slug: 'kitchen-gift-guides', name: 'Kitchen gift guides', section: 'reviews', description: 'Presents for the cook in your life.' },
  { slug: 'food-and-kitchen-comparisons', name: 'Food & kitchen comparisons', section: 'reviews', description: 'Head-to-heads and versus posts.' },
  { slug: 'best-kitchen-products', name: 'Best kitchen products', section: 'reviews', description: 'Category winners across price ranges.' },
  { slug: 'amazon-kitchen-finds', name: 'Amazon kitchen finds', section: 'reviews', description: 'Under-the-radar buys worth the tab.' },
  { slug: 'affiliate-product-guides', name: 'Buying guides', section: 'reviews', description: 'Our top product picks, compared and ready to buy.' },
];

const bySlug = new Map(CATEGORIES.map((c) => [c.slug, c]));
const byLegacy = new Map<string, Category>();
for (const c of CATEGORIES) for (const l of c.legacySlugs ?? []) byLegacy.set(l, c);

export function getCategory(slug: string): Category | undefined {
  return bySlug.get(slug as CategorySlug) ?? byLegacy.get(slug);
}

export function categoriesInSection(section: SectionKey): Category[] {
  return CATEGORIES.filter((c) => c.section === section);
}

/**
 * The silo: every section has one hub page at /category/<hub>/, which links
 * down to each category in the section and every post in it; categories link
 * up to their hub and across to their siblings; posts link up through their
 * breadcrumb and across to posts in the same silo. URLs stay flat (/<post>/),
 * so nothing that already ranks moves.
 *
 * Recipes and Kitchen tips already had a catch-all category, which doubles as
 * the hub. The other sections get a hub of their own.
 */
export interface SectionHub {
  slug: string;
  section: SectionKey;
  /** The H1 and the start of the title tag. */
  title: string;
  /** Lead paragraph under the H1. */
  intro: string;
}

export const SECTION_HUBS: Record<SectionKey, SectionHub> = {
  tools: {
    slug: 'kitchen-calculators',
    section: 'tools',
    title: 'Kitchen Calculators & Tools',
    intro:
      'Free kitchen converters and calculators: butter sticks to grams, cups to grams for flour and sugar, oven temperatures, safe meat temperatures and a recipe scaler. Each one works on your phone, right at the stove.',
  },
  recipes: {
    slug: 'recipes',
    section: 'recipes',
    title: 'Recipes',
    intro:
      'Every Menu Moments recipe in one place: weeknight dinners, breakfasts, desserts, bakes, snacks and drinks, each written so you can cook it the first time. Start with a meal below, or pick a category to narrow it down.',
  },
  lifestyle: {
    slug: 'eat-well',
    section: 'lifestyle',
    title: 'Eat Well',
    intro:
      'Healthy, quick, plant-based and international cooking: recipes and guides for eating well through a busy week, without rules you won’t keep.',
  },
  'kitchen-tips': {
    slug: 'kitchen-tips',
    section: 'kitchen-tips',
    title: 'Kitchen Tips',
    intro:
      'Practical how-tos for the kitchen: cooking technique, baking basics, cleaning, organizing and the small habits that make cooking easier every day.',
  },
  gear: {
    slug: 'kitchen-gear',
    section: 'gear',
    title: 'Kitchen Gear',
    intro:
      'Guides to the tools that do the work: appliances, cookware, bakeware, gadgets, knives and storage, with what to look for and how to look after them.',
  },
  planning: {
    slug: 'plan-and-shop',
    section: 'planning',
    title: 'Plan & Shop',
    intro: 'Ingredient guides, meal planning and grocery know-how, so you buy the right things and use them well.',
  },
  reviews: {
    slug: 'reviews',
    section: 'reviews',
    title: 'Reviews & Buying Guides',
    intro:
      'Restaurant menus and what to order, plus our buying guides and comparisons for kitchen products, so you know what is worth your money before you spend it.',
  },
};

const hubBySlug = new Map(Object.values(SECTION_HUBS).map((h) => [h.slug, h]));

/** The section hub at /category/<slug>/, if the slug is one. */
export function getSectionHub(slug: string): SectionHub | undefined {
  return hubBySlug.get(slug);
}

export function hubForSection(section: SectionKey): SectionHub {
  return SECTION_HUBS[section];
}

/**
 * Catch-all categories that stand for their whole section. A post filed in
 * one and in a more specific category of the same section ("Recipes" and
 * "Dinner") has the specific one as its main category, so its breadcrumb runs
 * Home › Recipes › Dinner › post.
 */
export function isGeneralCategory(slug: string): boolean {
  const hub = hubBySlug.get(slug);
  return Boolean(hub && bySlug.has(slug as CategorySlug));
}

export function isLegacyCategorySlug(slug: string): boolean {
  return byLegacy.has(slug) && !bySlug.has(slug as CategorySlug);
}
