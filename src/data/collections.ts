/**
 * Curated collections — the roundups that food blogs live on for SEO
 * ("36 Healthy Fall Dinners", "20 Best Cozy Fall Baking Recipes").
 * Each collection lists the post slugs in reader order plus a rich
 * editorial intro. Add to this file whenever the editor wants to run
 * a new roundup.
 */
export interface Collection {
  slug: string;
  title: string;
  subtitle: string;
  hero?: string;
  intro: string;
  season?: 'spring' | 'summer' | 'fall' | 'winter' | 'any';
  categorySlug?: string; // primary tie for related routing
  postSlugs: string[];
}

export const COLLECTIONS: Collection[] = [
  {
    slug: 'weeknight-dinners',
    title: '25 Weeknight Dinners We Actually Cook',
    subtitle: 'On the table in under an hour, without any special equipment.',
    intro:
      "This is the working list we keep pinned in our own kitchens — the dinners that come together with a single pan, one grocery run, and the ingredients most of us already own. Some are 30 minutes flat; a few slow-cook themselves while you handle everything else. All are the kind of thing you cook once, then again next Tuesday.",
    season: 'any',
    categorySlug: 'dinner',
    postSlugs: [
      'big-mac-bowl-recipe',
      'ina-garten-chicken-marsala',
      'easy-sloppy-joe-recipe-3-ingredients',
      'cast-iron-skillet-chicken',
      'beef-tips-crock-pot-recipe',
      'easy-crockpot-chicken-and-stuffing-recipe-quick-delicious-for-busy-days',
      '10-best-crockpot-chicken-soup-recipes',
      'popeyes-recipe-for-red-beans',
      'delicious-meatloaf-recipes-without-breadcrumbs-easy-moist-meatloaf-ideas',
      'authentic-cin-chili-recipe-a-true-taste-of-texas-comfort-food',
    ],
  },
  {
    slug: 'cozy-baking',
    title: 'The Cozy Baking Collection',
    subtitle: 'Sweet, slow, and worth heating the oven for.',
    intro:
      "Weekend bakes for the days you want the whole house to smell like warm butter. From a genuinely moist banana bread to Amish applesauce cake and Dubai pistachio chocolate bars, these are the projects we make when we have an afternoon and a good playlist.",
    season: 'fall',
    categorySlug: 'baking',
    postSlugs: [
      'moist-banana-bread-a-classic-easy-banana-bread-recipe',
      'amish-applesauce-cake-recipe-moist-old-fashioned-cake-with-raisins-and-walnuts',
      'dubai-chocolate-bar-recipe-easy-pistachio-chocolate-bars',
      'ezekiel-bread-recipe',
      'gluten-free-carrot-cake-recipe',
      'squid-game-cookie-recipe',
      'auntie-annes-pretzel-recipe',
      'gipfeli-recipe',
      'festive-shamrock-and-gold-macarons-recipe-for-st-patricks-day',
    ],
  },
  {
    slug: 'kitchen-upgrades-2026',
    title: 'The Kitchen Upgrades Worth It in 2026',
    subtitle: 'Buying guides for the gear we actually keep.',
    intro:
      "We've tested a lot of appliances so you don't have to. This is the shortlist — the stand mixers, microwaves, pans, and beverage fridges that earn their counter space. Every recommendation comes from real, in-kitchen use.",
    season: 'any',
    categorySlug: 'kitchen-appliances',
    postSlugs: [
      'best-stand-mixer-for-beginners-top-kitchenaid-cuisinart-reviewed',
      'best-stand-mixer-for-bread-dough',
      'stand-mixer-for-cakes-what-to-look-for-best-stand-mixer-buying-guide',
      'stand-mixer-buying-guide-how-to-choose-the-best-stand-mixer-for-baking-cooking',
      'stand-mixer-vs-hand-mixer-which-one-is-right-for-your-baking-needs',
      'best-microwaves-top-ovens-reviewed-for-every-kitchen',
      'best-beverage-refrigerator',
      'best-popover-pans-bake-perfect-popovers-every-time',
      'how-to-clean-stainless-steel-pans-ultimate-guide-to-sparkling-stainless-steel-cookware',
    ],
  },
  {
    slug: 'happy-hours-worth-going',
    title: 'The Happy Hours Worth Leaving the House For',
    subtitle: 'Menus, timing and the deals that actually deliver.',
    intro:
      'A guided tour of the best chain and neighborhood happy hours in the country. Timings, snacks under $8, drink specials, and honest takes on which places actually deliver on the promise.',
    categorySlug: 'food-reviews',
    postSlugs: [
      'applebees-happy-hour-menu-delights-times-and-specials-explained',
      'outback-steakhouse-happy-hour-times-deals-and-menu-specials',
      'texas-roadhouse-happy-hour-deals-best-times-menus-and-prices-to-enjoy',
      'tgi-fridays-happy-hour-deals-unbeatable-prices-on-food-and-drinks',
      'longhorn-steakhouse-happy-hour-menu-steak-restaurant',
      'pinchers-happy-hour-menu',
      'ihop-happy-hour-menu-unbeatable-offers-on-drinks-snacks-and-meals',
      'unmatched-happy-hour-specials-at-herbs-and-rye-las-vegas-indulge-in-craft-cocktails-steaks',
    ],
  },
  {
    slug: 'quick-and-easy',
    title: '20 Meals in 20 Minutes or Less',
    subtitle: "For nights when you just don't have it in you.",
    intro:
      "Everyone needs a stack of these. Fast, low-lift, minimal cleanup — the meals that stand between you and a delivery app on a rough Tuesday. Most take one pan and pantry staples.",
    season: 'any',
    categorySlug: 'quick-and-easy-meals',
    postSlugs: [
      'easy-sloppy-joe-recipe-3-ingredients',
      'quick-recipe-jalbiteworldfood-flavor-packed-global-fusion-in-20-minutes',
      '5-ingredient-breakfast-hand-pies-recipe',
      'fried-chicken-fries-recipe',
      'italian-hoagie-recipe',
      'pancake-recipe-without-milk',
      'frozen-green-bean-recipes',
      'how-long-to-cook-chicken-breast-in-air-fryer-juicy-easy-air-fryer-chicken-recipes',
    ],
  },
  {
    slug: 'plant-based',
    title: 'The Plant-Based Playlist',
    subtitle: 'Fully vegan and vegetarian recipes that satisfy.',
    intro:
      'No lectures, no compromises — just plant-based meals we cook because they taste good. Casseroles, comfort food, and every kind of good weeknight bowl.',
    season: 'any',
    categorySlug: 'vegan-recipes',
    postSlugs: [
      'vegan-casserole-dish-recipes',
      'vegan-casserole-recipes',
      'vegan-crockpot-recipes',
      'chickpea-flour-recipes',
      'kosher-for-pesach-sushi-recipe-easy-passover-sushi-guide-with-vegetarian-options',
      'juicing-recipes',
    ],
  },
];

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
