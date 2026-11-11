/**
 * The site's kitchen tools. Each is a post (filed under Kitchen calculators)
 * whose text holds the live tool via <div data-mm-tool="...">.
 *
 * `triggers` are words in another post's title that make the tool the first
 * suggestion in that post's "Read next" box (src/lib/read-next.ts), so the
 * tools are linked from the articles their readers come from. The first
 * matching tool wins, so the more specific ones come first.
 */
export interface KitchenTool {
  /** The post that carries the tool. */
  slug: string;
  /** Short name for menus and lists. */
  name: string;
  triggers: RegExp;
}

export const KITCHEN_TOOLS: KitchenTool[] = [
  {
    slug: 'butter-conversion-how-many-sticks-in-1-cup-measure-butter-in-grams',
    name: 'Butter converter',
    triggers: /\bbutter\b/i,
  },
  {
    slug: 'meat-temperature-chart',
    name: 'Meat temperature chart',
    triggers: /\b(steak|chicken|pork|beef|turkey|lamb|brisket|ribs?|roast|meatloaf|burgers?|salmon|wings|tenderloin|ham|chops?)\b/i,
  },
  {
    slug: 'cups-to-grams-converter',
    name: 'Cups to grams converter',
    triggers: /\b(flour|sugar|cups?|grams?|measur\w*|ounces?)\b/i,
  },
  {
    slug: 'oven-temperature-conversion',
    name: 'Oven temperature converter',
    triggers: /\b(bake[ds]?|baking|oven|cakes?|cookies?|bread|muffins?|casseroles?|pies?|brownies?)\b/i,
  },
  {
    slug: 'recipe-scaler',
    name: 'Recipe scaler',
    triggers: /\b(soups?|stews?|chili|crockpot|slow cooker|family|crowd|batch|meal prep|dinners?)\b/i,
  },
];

export function toolForTitle(title: string, exclude: string): KitchenTool | undefined {
  return KITCHEN_TOOLS.find((t) => t.slug !== exclude && t.triggers.test(title));
}
