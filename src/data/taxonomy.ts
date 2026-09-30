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
  | 'recipes'
  | 'lifestyle'
  | 'kitchen-tips'
  | 'gear'
  | 'planning'
  | 'reviews';

export const SECTIONS: Record<SectionKey, { name: string; tagline: string }> = {
  recipes: { name: 'Recipes', tagline: 'From breakfast to dessert' },
  lifestyle: { name: 'Eat well', tagline: 'How to eat through the week' },
  'kitchen-tips': { name: 'Kitchen tips', tagline: 'Skills, cleaning, order' },
  gear: { name: 'Gear', tagline: 'What to cook with' },
  planning: { name: 'Plan & shop', tagline: 'Meals, groceries, ingredients' },
  reviews: { name: 'Reviews', tagline: 'What we recommend' },
};

export const CATEGORIES: Category[] = [
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
  { slug: 'healthy-eating', name: 'Healthy eating', section: 'lifestyle', description: 'Balanced plates without dogma.' },
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

  // Reviews
  { slug: 'food-reviews', name: 'Food reviews', section: 'reviews', description: 'Restaurants, chains and the dishes worth ordering.', legacySlugs: ['top-restaurant-menus', 'best-happy-hours', 'daily-specials', 'soft-food-diet'] },
  { slug: 'product-reviews', name: 'Product reviews', section: 'reviews', description: 'Honest, hands-on takes.' },
  { slug: 'kitchen-product-reviews', name: 'Kitchen product reviews', section: 'reviews', description: 'The tools we actually keep.' },
  { slug: 'recipe-tools', name: 'Recipe tools', section: 'reviews', description: 'Apps, timers, converters, calculators.' },
  { slug: 'kitchen-gift-guides', name: 'Kitchen gift guides', section: 'reviews', description: 'Presents for the cook in your life.' },
  { slug: 'food-and-kitchen-comparisons', name: 'Food & kitchen comparisons', section: 'reviews', description: 'Head-to-heads and versus posts.' },
  { slug: 'best-kitchen-products', name: 'Best kitchen products', section: 'reviews', description: 'Category winners across price ranges.' },
  { slug: 'amazon-kitchen-finds', name: 'Amazon kitchen finds', section: 'reviews', description: 'Under-the-radar buys worth the tab.' },
  { slug: 'affiliate-product-guides', name: 'Affiliate product guides', section: 'reviews', description: 'Long-form buyers guides.', legacySlugs: ['dog-food-guide'] },
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

export function isLegacyCategorySlug(slug: string): boolean {
  return byLegacy.has(slug) && !bySlug.has(slug as CategorySlug);
}
