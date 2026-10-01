/**
 * Derives taxonomy categories from a post's slug and title.
 *
 * WordPress only ever used five categories (recipes, food-reviews,
 * kitchen-appliances, affiliate-product-guides, cooking-tips), but the
 * rebuilt site has 39. Without this, 34 of them render empty — which
 * takes out three homepage sections and most of the mega menu.
 *
 * Rules are keyword matches against the slug and title, ordered so the
 * most specific win. Each post keeps its real WP categories and gains
 * the derived ones on top; nothing is overwritten.
 */

type Rule = [category: string, pattern: RegExp];

/** Checked in order. A post can match several — see MAX_DERIVED. */
const RULES: Rule[] = [
  // ---- Meal slots -------------------------------------------------
  ['breakfast', /\b(breakfast|brunch|pancake|waffle|omelet|french.toast|oatmeal|granola|hash.brown|mcgriddle|cereal|hand.pies|bagel)\b/],
  ['desserts', /\b(dessert|cake|cookie|brownie|pie|ice.cream|custard|pudding|candy|macaron|marshmallow|kheer|cheesecake|fudge|truffle|cobbler|tart)\b/],
  ['baking', /\b(bak(e|ed|ing)|bread|dough|pastry|muffin|biscuit|pretzel|croissant|gipfeli|scone|sourdough|stuffing.balls|crust|proof)\b/],
  ['appetizers', /\b(appetizer|dip|wings|nachos|bruschetta|hanky.panky|finger.food|party.food|hors)\b/],
  ['drinks-and-beverages', /\b(drink|cocktail|mocktail|smoothie|juice|juicing|tea|coffee|latte|mule|mimosa|mockmosa|bloody|beer|ale|moonshine|kombucha|cocoa|brew|boba|bubble.tea|slush)\b/],
  ['snacks', /\b(snack|chips|popcorn|trail.mix|party.mix|jerky|snack.stick|pretzel.bites)\b/],
  ['lunch', /\b(lunch|sandwich|hoagie|sub\b|wrap|panini|salad|deli)\b/],
  ['dinner', /\b(dinner|supper|casserole|crockpot|crock.pot|slow.cook|meatloaf|roast|chili|stew|pasta|lasagna|enchilada|taco|burger|meatball|steak|brisket|pot.roast|skillet.chicken|weeknight)\b/],

  // ---- Diet / lifestyle -------------------------------------------
  ['vegan-recipes', /\b(vegan|plant.based)\b/],
  ['vegetarian-recipes', /\b(vegetarian|meatless)\b/],
  ['healthy-eating', /\b(health(y|ier)|nutrition|low.calorie|low.carb|keto|protein|diet|weight.loss|bariatric|pureed|soft.food)\b/],
  ['quick-and-easy-meals', /\b(quick|easy|simple|\d+.minute|\d+.ingredient|fast|no.bake|one.pot|5.ingredient|3.ingredients)\b/],
  ['meal-prep', /\b(meal.prep|batch|make.ahead|freezer.meal|prep.ahead)\b/],
  ['family-meals', /\b(family|kids|crowd|potluck|game.day)\b/],
  ['international-cuisine', /\b(italian|mexican|chinese|indian|thai|japanese|korean|french|jamaican|scottish|swiss|middle.eastern|latin|cajun|creole|amish|biltong|south.african|greek|spanish|vietnamese|caribbean|asian|passover|kosher)\b/],

  // ---- Kitchen know-how -------------------------------------------
  ['kitchen-cleaning', /\b(clean(ing)?|descale|season.a.cast.iron|scrub|sanitize|stain)\b/],
  ['kitchen-organization', /\b(organiz|pantry|recipe.box|recipe.tin|declutter|storage.solution)\b/],
  ['baking-tips', /\b(baking.tip|how.to.bake|proofing|rise|knead)\b/],
  ['cooking-tips', /\b(how.to.(cook|boil|poach|steam|fry|melt|defrost|thaw|season)|how.long.to.cook|how.long.does|how.do|pan.fry|saute|technique|temperature|internal.temp)\b/],
  ['kitchen-tips', /\b(kitchen.tip|hack|trick|substitute|conversion|how.many|how.much)\b/],

  // ---- Gear --------------------------------------------------------
  ['kitchen-appliances', /\b(appliance|mixer|blender|air.fryer|microwave|dishwasher|instant.pot|slow.cooker|coffee.maker|refrigerator|fridge|oven|toaster|ice.cream.maker|thermomix|food.processor|juicer)\b/],
  ['cookware', /\b(pan\b|pans\b|pot\b|pots\b|skillet|cast.iron|dutch.oven|cookware|saucepan|wok|griddle|stockpot)\b/],
  ['bakeware', /\b(bakeware|baking.sheet|popover.pan|baking.dish|cake.tin|loaf.pan|muffin.tin|ramekin|mold)\b/],
  ['knives-and-cutting-tools', /\b(knife|knives|cutting.board|mandoline|shears|cleaver|sharpen)\b/],
  ['food-storage', /\b(food.storage|container|freez(e|ing|er)|mason.jar|plastic.wrap|aluminum.foil|preserve|canning|shelf.life|how.long.do(es)?.*(last|keep)|expire|go.bad|spoil)\b/],
  ['kitchen-gadgets', /\b(gadget|thermometer|kitchen.scale|can.opener|peeler|whisk|spatula|tongs)\b/],

  // ---- Plan & shop -------------------------------------------------
  ['ingredient-guides', /\b(what.is|what.are|ingredient|foods.that.start|types.of|flour|butter|sugar|oil\b|vinegar|spice|herb|legume|tofu|chickpea)\b/],
  ['grocery-guides', /\b(grocery|shopping|aldi|costco|walmart|trader.joe|supermarket|where.to.buy)\b/],
  ['meal-planning', /\b(meal.plan|weekly.menu|menu.plan)\b/],

  // ---- Reviews -----------------------------------------------------
  ['food-reviews', /\b(menu|restaurant|happy.hour|specials|diner|bistro|steakhouse|grill\b|cafe|chain)\b/],
  ['food-and-kitchen-comparisons', /\b(vs\b|versus|comparison|which.one|difference.between|better.than)\b/],
  ['best-kitchen-products', /\b(best\b|top\s*\d+|\d+\s*best)\b/],
  ['amazon-kitchen-finds', /\b(amazon)\b/],
  ['kitchen-gift-guides', /\b(gift|present|holiday.guide)\b/],
  ['product-reviews', /\b(review|tested|hands.on)\b/],
  ['recipe-tools', /\b(converter|calculator|recipe.app|timer)\b/],
];

/** Caps how many derived categories one post can pick up. */
const MAX_DERIVED = 4;

/** Categories whose presence implies a broader parent. */
const IMPLIES: Record<string, string> = {
  breakfast: 'recipes',
  lunch: 'recipes',
  dinner: 'recipes',
  desserts: 'recipes',
  baking: 'recipes',
  snacks: 'recipes',
  appetizers: 'recipes',
  'drinks-and-beverages': 'recipes',
  'vegan-recipes': 'recipes',
  'vegetarian-recipes': 'recipes',
};

/**
 * Returns the categories implied by a post's slug and title, excluding
 * any already present. The caller merges these with the WP categories.
 */
export function deriveCategories(
  slug: string,
  title: string,
  existing: string[] = [],
): string[] {
  // Hyphens become spaces so `\b` anchors behave on slug words.
  const haystack = `${slug.replace(/-/g, ' ')} ${title}`.toLowerCase();
  const have = new Set(existing);
  const out: string[] = [];

  for (const [category, pattern] of RULES) {
    if (out.length >= MAX_DERIVED) break;
    if (have.has(category)) continue;
    if (!pattern.test(haystack)) continue;
    out.push(category);
    have.add(category);
  }

  // Pull in the parent category for any meal-slot match.
  for (const c of [...out]) {
    const parent = IMPLIES[c];
    if (parent && !have.has(parent)) {
      out.push(parent);
      have.add(parent);
    }
  }

  return out;
}
