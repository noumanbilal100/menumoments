/**
 * The full list of URLs that existed on the WordPress site as of the
 * migration snapshot. Every one of these must resolve on the new site
 * (either to imported content or to a "coming soon" placeholder) to
 * protect existing SEO.
 *
 * Each entry maps to the categories the post belongs to on the NEW site.
 * If empty, the post inherits "recipes" or "food-reviews" by keyword rule
 * in `src/lib/legacy-map.ts`.
 */

export interface LegacyPost {
  slug: string;
  categories?: string[];
}

export const LEGACY_POSTS: LegacyPost[] = [
  // Recipes — savory
  { slug: 'hanky-panky-recipe', categories: ['recipes', 'appetizers'] },
  { slug: 'fried-chicken-fries-recipe', categories: ['recipes', 'snacks', 'quick-and-easy-meals'] },
  { slug: 'juicing-recipes', categories: ['recipes', 'drinks-and-beverages', 'healthy-eating'] },
  { slug: 'big-mac-bowl-recipe', categories: ['recipes', 'lunch', 'meal-prep'] },
  { slug: '5-ingredient-breakfast-hand-pies-recipe', categories: ['recipes', 'breakfast'] },
  { slug: 'vegan-casserole-dish-recipes', categories: ['recipes', 'vegan-recipes', 'dinner'] },
  { slug: 'squash-blossom-recipe', categories: ['recipes', 'appetizers'] },
  { slug: 'shit-on-a-shingle-recipe', categories: ['recipes', 'breakfast'] },
  { slug: 'popeyes-recipe-for-red-beans', categories: ['recipes', 'dinner'] },
  { slug: 'mockmosa-recipe', categories: ['recipes', 'drinks-and-beverages'] },
  { slug: 'mcgriddle-recipe', categories: ['recipes', 'breakfast'] },
  { slug: 'pan-frying-chicken', categories: ['recipes', 'cooking-tips', 'dinner'] },
  { slug: 'low-histamine-recipes', categories: ['recipes', 'healthy-eating'] },
  { slug: 'italian-hoagie-recipe', categories: ['recipes', 'lunch'] },
  { slug: 'gluten-free-stuffing-recipe', categories: ['recipes', 'healthy-eating'] },
  { slug: 'ina-garten-chicken-marsala', categories: ['recipes', 'dinner'] },
  { slug: 'gluten-free-crock-pot-recipes', categories: ['recipes', 'healthy-eating', 'dinner'] },
  { slug: 'gluten-free-carrot-cake-recipe', categories: ['recipes', 'desserts', 'baking'] },
  { slug: 'dash-ice-cream-maker-recipes', categories: ['recipes', 'desserts'] },
  { slug: 'braised-mock-chuck-recipe', categories: ['recipes', 'dinner'] },
  { slug: 'beef-tips-crock-pot-recipe', categories: ['recipes', 'dinner'] },
  { slug: 'baby-puree-recipes', categories: ['recipes', 'family-meals'] },
  { slug: 'recipes-with-crab-apple-jelly', categories: ['recipes', 'ingredient-guides'] },
  { slug: 'pancake-recipe-without-milk', categories: ['recipes', 'breakfast'] },
  { slug: 'vegan-casserole-recipes', categories: ['recipes', 'vegan-recipes', 'dinner'] },
  { slug: 'million-dollar-bacon-recipe', categories: ['recipes', 'breakfast'] },
  { slug: 'ezekiel-bread-recipe', categories: ['recipes', 'baking'] },
  { slug: 'auntie-annes-pretzel-recipe', categories: ['recipes', 'snacks', 'baking'] },
  { slug: 'adobo-sauce-recipe', categories: ['recipes', 'ingredient-guides'] },
  { slug: 'vegan-crockpot-recipes', categories: ['recipes', 'vegan-recipes', 'dinner'] },
  { slug: 'squid-game-cookie-recipe', categories: ['recipes', 'desserts', 'baking'] },
  { slug: 'smoked-pork-belly-recipes', categories: ['recipes', 'dinner'] },
  { slug: 'in-and-out-sauce-recipe', categories: ['recipes', 'ingredient-guides'] },
  { slug: 'frozen-green-bean-recipes', categories: ['recipes', 'quick-and-easy-meals'] },
  { slug: 'chickpea-flour-recipes', categories: ['recipes', 'ingredient-guides'] },
  { slug: 'gipfeli-recipe', categories: ['recipes', 'baking', 'breakfast'] },
  { slug: 'easy-sloppy-joe-recipe-3-ingredients', categories: ['recipes', 'quick-and-easy-meals', 'dinner'] },
  { slug: 'crawfish-recipes', categories: ['recipes', 'dinner'] },
  { slug: 'prawn-creole-recipe', categories: ['recipes', 'dinner', 'international-cuisine'] },
  { slug: 'keto-dinner-recipes', categories: ['recipes', 'dinner', 'healthy-eating'] },
  { slug: 'kentucky-mule-recipe', categories: ['recipes', 'drinks-and-beverages'] },
  { slug: 'cast-iron-skillet-recipes-chicken', categories: ['recipes', 'dinner', 'cookware'] },
  { slug: 'chicken-breast-in-dutch-oven', categories: ['recipes', 'dinner', 'cookware'] },
  { slug: 'chicken-breast-in-a-cast-iron-skillet', categories: ['recipes', 'dinner', 'cookware'] },
  { slug: 'cast-iron-skillet-chicken', categories: ['recipes', 'dinner', 'cookware'] },

  // Kitchen appliances & gear guides
  { slug: 'homemade-sugar-wax-guide-natural-hair-removal-recipes-tips-uses', categories: ['recipes', 'ingredient-guides'] },
  { slug: 'stand-mixer-for-cakes-what-to-look-for-best-stand-mixer-buying-guide', categories: ['kitchen-appliances', 'best-kitchen-products'] },
  { slug: 'best-stand-mixer-for-beginners-top-kitchenaid-cuisinart-reviewed', categories: ['kitchen-appliances', 'best-kitchen-products', 'kitchen-product-reviews'] },
  { slug: 'stand-mixer-vs-hand-mixer-which-one-is-right-for-your-baking-needs', categories: ['kitchen-appliances', 'food-and-kitchen-comparisons'] },
  { slug: 'what-is-a-stand-mixer-advantages-disadvantages-buying-guide-for-home-professional-bakers', categories: ['kitchen-appliances'] },
  { slug: 'how-to-clean-stainless-steel-pans-ultimate-guide-to-sparkling-stainless-steel-cookware', categories: ['kitchen-cleaning', 'cookware'] },
  { slug: 'best-stand-mixer-for-bread-dough', categories: ['kitchen-appliances', 'best-kitchen-products'] },
  { slug: 'stand-mixer-buying-guide-how-to-choose-the-best-stand-mixer-for-baking-cooking', categories: ['kitchen-appliances', 'best-kitchen-products'] },
  { slug: 'best-beverage-refrigerator', categories: ['kitchen-appliances', 'best-kitchen-products'] },
  { slug: 'how-to-season-a-cast-iron-pan', categories: ['cookware', 'cooking-tips'] },
  { slug: 'best-popover-pans-bake-perfect-popovers-every-time', categories: ['bakeware', 'best-kitchen-products'] },
  { slug: 'best-microwaves-top-ovens-reviewed-for-every-kitchen', categories: ['kitchen-appliances', 'best-kitchen-products'] },

  // Restaurant & menu content — food reviews
  { slug: 'jasons-deli-menu', categories: ['food-reviews'] },
  { slug: 'applebees-happy-hour-menu-delights-times-and-specials-explained', categories: ['food-reviews'] },
  { slug: 'outback-steakhouse-happy-hour-times-deals-and-menu-specials', categories: ['food-reviews'] },
  { slug: 'bjs-daily-specials-deals-happy-hours-full-menu-prices-pizookie-deals', categories: ['food-reviews'] },
  { slug: 'longhorn-steakhouse-menu-full-food-guide-with-prices-combos-seasonal-favorites', categories: ['food-reviews'] },
  { slug: 'topgolf-food-and-drink-menu', categories: ['food-reviews'] }, // canonical for the malformed sitemap URL
  { slug: 'applebees-9-99-daily-specials-really-big-meal-deal-with-burger-fries-drink', categories: ['food-reviews'] },
  { slug: 'subway-daily-specials-sub-of-the-day-meal-of-the-day-footlong-deals', categories: ['food-reviews'] },
  { slug: 'j-alexander-menu-with-prices-upscale-restaurant-dining-experience-at-255-east-basse-rd', categories: ['food-reviews'] },
  { slug: 'longhorn-steakhouse-happy-hour-menu-steak-restaurant', categories: ['food-reviews'] },
  { slug: 'panda-menu-full-guide-to-panda-express-chinese-food-online-ordering-prices', categories: ['food-reviews'] },
  { slug: 'eatery-happy-hour-guide-best-food-drink-specials-in-des-moines-nyc', categories: ['food-reviews'] },
  { slug: 'philz-coffee-menu-full-blend-guide-food-items-pricing-delivery-in-chicago', categories: ['food-reviews'] },
  { slug: 'gordon-ramsay-hells-kitchen-menu-signature-dishes-prices-dining-experience-in-las-vegas-foxwoods', categories: ['food-reviews'] },
  { slug: 'glorias-latin-cuisine-menu-explore-authentic-latin-flavors-order-online', categories: ['food-reviews'] },
  { slug: 'ocharleys-menu-explore-delicious-dishes-order-online-and-enjoy-fast-menu-delivery', categories: ['food-reviews'] },
  { slug: 'discover-7-brew-secret-menu-unique-flavors-prices-customization', categories: ['food-reviews'] },
  { slug: 'walk-ons-sports-bistreaux-dive-into-the-best-game-day-menu', categories: ['food-reviews'] },
  { slug: 'silver-diner-menu-explore-delicious-dishes-and-delivery-options', categories: ['food-reviews'] },
  { slug: 'china-wok-menu-delicious-deals-and-unique-offerings-for-every-palate', categories: ['food-reviews'] },
  { slug: 'discover-portos-menu-unveiling-culinary-delights-for-every-taste', categories: ['food-reviews'] },
  { slug: 'on-the-border-menu-a-comprehensive-guide-to-must-try-dishes', categories: ['food-reviews'] },
  { slug: 'ding-tea-menu-explore-the-best-milk-teas-fruit-juices-and-bubble-teas', categories: ['food-reviews'] },
  { slug: 'china-king-menu-best-takeout-dishes-and-delicious-chinese-food-options', categories: ['food-reviews'] },
  { slug: 'savor-the-black-rock-menu', categories: ['food-reviews'] },
  { slug: 'rubios-coastal-grill-menu-best-healthy-dining-choices', categories: ['food-reviews'] },
  { slug: 'andys-frozen-custard-menu-explore-classic-and-creative-treats-with-delicious-options', categories: ['food-reviews'] },
  { slug: 'savor-the-black-rock-menu-a-guide-to-unforgettable-dishes-and-deals', categories: ['food-reviews'] },
  { slug: 'chicken-express-discover-the-full-menu-pricing-and-online-ordering-options', categories: ['food-reviews'] },
  { slug: 'newks-menu-explore-delicious-options-for-every-meal', categories: ['food-reviews'] },
  { slug: 'taco-bueno-menu-affordable-meal-deals-and-popular-favorites', categories: ['food-reviews'] },
  { slug: 'discover-delicious-deals-a-complete-guide-to-the-american-deli-menu', categories: ['food-reviews'] },
  { slug: 'jaggers-menu', categories: ['food-reviews'] },
  { slug: 'bill-miller-bbq-menu-explore-delicious-meals-sides-and-more', categories: ['food-reviews'] },
  { slug: 'old-mill-restaurant-menu', categories: ['food-reviews'] },
  { slug: 'boiling-crab-menu-top-seafood-picks-and-flavorful-cajun-dishes', categories: ['food-reviews'] },
  { slug: 'pinchers-happy-hour-menu', categories: ['food-reviews'] },
  { slug: 'tgi-fridays-happy-hour-deals-unbeatable-prices-on-food-and-drinks', categories: ['food-reviews'] },
  { slug: 'red-lobster-daily-specials-you-need-to-try-today-full-weekday-deals-guide', categories: ['food-reviews'] },
  { slug: 'ruby-tuesday-daily-specials-and-deals-menu', categories: ['food-reviews'] },
  { slug: 'millers-ale-house-daily-specials-best-sports-bar-lunch-drink-deals-near-you', categories: ['food-reviews'] },
  { slug: 'texas-roadhouse-happy-hour-deals-best-times-menus-and-prices-to-enjoy', categories: ['food-reviews'] },
  { slug: 'ihop-happy-hour-menu-unbeatable-offers-on-drinks-snacks-and-meals', categories: ['food-reviews'] },
  { slug: 'unmatched-happy-hour-specials-at-herbs-and-rye-las-vegas-indulge-in-craft-cocktails-steaks', categories: ['food-reviews'] },
  { slug: 'best-chinese-in-north-reading-order-china-cuisine-online-menu', categories: ['food-reviews', 'international-cuisine'] },
  { slug: 'cinco-de-mayo-2025-mexican-restaurant-specials', categories: ['food-reviews'] },

  // Cooking tips / how-tos
  { slug: 'can-you-put-foil-in-an-air-fryer-safe-use-of-aluminum-foil-tips-for-best-results', categories: ['cooking-tips', 'kitchen-appliances'] },
  { slug: 'how-long-to-cook-pork-chops-in-air-fryer-juicy-air-fryer-pork-chop-recipe', categories: ['recipes', 'cooking-tips'] },
  { slug: 'how-long-do-dishwashers-last-average-life', categories: ['kitchen-appliances'] },
  { slug: 'how-long-does-a-dishwasher-run-dishwasher-cycle-times', categories: ['kitchen-appliances'] },
  { slug: 'can-you-microwave-styrofoam', categories: ['cooking-tips', 'food-storage'] },
  { slug: 'how-long-to-cook-chicken-breast-in-air-fryer-juicy-easy-air-fryer-chicken-recipes', categories: ['recipes', 'cooking-tips'] },
  { slug: 'butter-conversion-how-many-sticks-in-1-cup-measure-butter-in-grams', categories: ['baking-tips', 'ingredient-guides'] },
  { slug: 'butter-conversion-how-many-tablespoons-in-a-stick-measure-butter', categories: ['baking-tips', 'ingredient-guides'] },
  { slug: '10-best-crockpot-chicken-soup-recipes', categories: ['recipes', 'dinner'] },
  { slug: 'how-to-make-broasted-chicken-crunchy-outside-juicy-inside-recipe', categories: ['recipes', 'dinner'] },
  { slug: 'how-to-make-stoved-chicken-easy-one-pot-scottish-recipe-guide', categories: ['recipes', 'international-cuisine', 'dinner'] },
  { slug: 'how-to-make-the-best-baked-chicken-hindquarters-crispy-tender-and-flavorful-recipe', categories: ['recipes', 'dinner'] },
  { slug: 'quick-recipe-jalbiteworldfood-flavor-packed-global-fusion-in-20-minutes', categories: ['recipes', 'international-cuisine', 'quick-and-easy-meals'] },
  { slug: 'how-to-create-the-perfect-jamaican-chicken-soup', categories: ['recipes', 'international-cuisine'] },
  { slug: 'easy-crockpot-chicken-and-stuffing-recipe-quick-delicious-for-busy-days', categories: ['recipes', 'dinner', 'family-meals'] },
  { slug: 'asian-cuisine-legumes-like-tofu-douchi-in-chinese-cooking', categories: ['ingredient-guides', 'international-cuisine'] },

  // Pet food guides
  { slug: 'diamond-puppy-dry-dog-food-puppy-pet-food', categories: ['affiliate-product-guides'] },
  { slug: 'aquarium-fish-food-flakes-pellets-goldfish-brine-shrimp-feed', categories: ['affiliate-product-guides'] },
  { slug: 'rabbit-diet-hay-pellets-for-bunnies-adult-young-rabbit-food', categories: ['affiliate-product-guides'] },
  { slug: 'fenugreek-horse-treat-recipe-for-healthy-and-happy-horses', categories: ['affiliate-product-guides', 'recipes'] },
  { slug: 'can-chickens-eat-pineapple-is-pineapple-safe-for-backyard-chickens', categories: ['affiliate-product-guides', 'ingredient-guides'] },
  { slug: 'can-chickens-eat-tomatoes-a-guide-for-backyard-chickens', categories: ['affiliate-product-guides', 'ingredient-guides'] },
  { slug: 'can-chickens-eat-oranges-safe-backyard-chicken-food-guide', categories: ['affiliate-product-guides', 'ingredient-guides'] },
  { slug: 'can-cats-eat-yogurt-is-greek-yogurt-safe', categories: ['affiliate-product-guides', 'ingredient-guides'] },
  { slug: 'can-dogs-eat-eggplant-benefits-safe-feeding-tips', categories: ['affiliate-product-guides', 'ingredient-guides'] },

  // "Foods that start with…" listicles
  { slug: 'foods-that-start-with-the-letter-j', categories: ['ingredient-guides'] },
  { slug: '20-foods-that-start-with-k-tasty-foods-starting-with-the-letter-k', categories: ['ingredient-guides'] },
  { slug: 'foods-that-start-with-u-ideas-facts-more', categories: ['ingredient-guides'] },

  // Sweets / baking
  { slug: 'moist-banana-bread-a-classic-easy-banana-bread-recipe', categories: ['recipes', 'baking', 'desserts'] },
  { slug: 'dubai-chocolate-bar-recipe-easy-pistachio-chocolate-bars', categories: ['recipes', 'desserts'] },
  { slug: 'festive-shamrock-and-gold-macarons-recipe-for-st-patricks-day', categories: ['recipes', 'desserts', 'baking'] },
  { slug: 'recipe-guide-heartumental-a-mindful-approach-to-cooking-at-home', categories: ['recipes', 'healthy-eating'] },
  { slug: 'delicious-pork-jowl-recipes-for-crispy-braised-and-grilled-perfection', categories: ['recipes', 'dinner'] },
  { slug: 'authentic-cin-chili-recipe-a-true-taste-of-texas-comfort-food', categories: ['recipes', 'dinner'] },
  { slug: 'how-to-make-a-bloody-molly-an-irish-twist-on-the-classic-bloody-mary-cocktail-recipe', categories: ['recipes', 'drinks-and-beverages'] },
  { slug: 'authentic-amish-apple-butter-recipe-how-to-make-homemade-apple-butter', categories: ['recipes', 'ingredient-guides'] },
  { slug: 'authentic-moonshine-mash-recipe-guide-how-to-make-moonshine-at-home', categories: ['recipes', 'drinks-and-beverages'] },
  { slug: 'effective-lemon-balm-tea-recipes-to-support-natural-weight-loss-and-calm', categories: ['recipes', 'drinks-and-beverages', 'healthy-eating'] },
  { slug: 'delicious-meatloaf-recipes-without-breadcrumbs-easy-moist-meatloaf-ideas', categories: ['recipes', 'dinner'] },
  { slug: 'biltong-food-recipes-traditional-south-african-biltong-guide-dishes', categories: ['recipes', 'international-cuisine'] },
  { slug: 'whipped-tallow-balm-homemade-tallow-lotion-recipe-for-nourished-skin', categories: ['recipes'] },
  { slug: 'jimmy-dean-breakfast-sausage-seasoning-recipe-make-authentic-copycat-sausage-at-home', categories: ['recipes', 'breakfast'] },
  { slug: 'hot-cocoa-mix-recipe-without-dry-milk-homemade-hot-chocolate-guide', categories: ['recipes', 'drinks-and-beverages'] },
  { slug: 'frying-saucer-recipe-crispy-homemade-saucer-pastries-with-savory-fillings', categories: ['recipes', 'snacks'] },
  { slug: 'amish-applesauce-cake-recipe-moist-old-fashioned-cake-with-raisins-and-walnuts', categories: ['recipes', 'desserts', 'baking'] },
  { slug: 'french-mulberry-bug-spray-recipe-a-natural-beautyberry-based-insect-repellent', categories: ['recipes'] },
  { slug: 'gaps-cream-cheese-dessert-recipe-a-gut-friendly-cheesecake-alternative', categories: ['recipes', 'desserts', 'healthy-eating'] },
  { slug: 'moriyo-kheer-recipe-how-to-make-sama-rice-kheer-for-fasting-days', categories: ['recipes', 'desserts', 'international-cuisine'] },
  { slug: 'birria-bombs-recipe-make-birria-tacos-and-ez-bombs-that-ignite-your-tastebuds', categories: ['recipes', 'international-cuisine', 'dinner'] },
  { slug: 'kosher-for-pesach-sushi-recipe-easy-passover-sushi-guide-with-vegetarian-options', categories: ['recipes', 'vegetarian-recipes', 'international-cuisine'] },
  { slug: 'alabama-hot-pockets-recipe-spicy-cheesy-homemade-comfort-food', categories: ['recipes', 'snacks'] },
  { slug: 'terra-massoud-recipe-bold-middle-eastern-flavors-made-easy-at-home', categories: ['recipes', 'international-cuisine'] },
  { slug: 'free-thermomix-recipes-cooking-tips-tm6-tm5-cookidoo-alyce-alexandra', categories: ['recipes', 'cooking-tips', 'kitchen-appliances'] },
  { slug: 'measuring-and-recipe-educational-iep-goal-strategies-examples-and-life-skills-development', categories: ['recipes'] },
];

export const LEGACY_POST_SLUGS = new Set(LEGACY_POSTS.map((p) => p.slug));

export function isLegacyPostSlug(slug: string): boolean {
  return LEGACY_POST_SLUGS.has(slug);
}

export function legacyCategoriesFor(slug: string): string[] {
  return LEGACY_POSTS.find((p) => p.slug === slug)?.categories ?? ['recipes'];
}
