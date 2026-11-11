/**
 * The site's kitchen tools. Each is a post (filed under Kitchen calculators)
 * whose text holds the live tool via <div data-mm-tool="...">; the post is
 * shown in the tool layout (components/tool-article.tsx), tool first.
 *
 * `triggers` are words in another post's title that make the tool the first
 * suggestion in that post's "Read next" box (src/lib/read-next.ts), so the
 * tools are linked from the articles their readers come from. The first
 * matching tool wins, so the more specific ones come first.
 */
export type ToolIconName = 'butter' | 'cup' | 'thermometer' | 'scale' | 'oven' | 'airfryer';

export interface KitchenTool {
  /** The post that carries the tool. */
  slug: string;
  /** Short name for menus and lists. */
  name: string;
  /** The tool component, as named in data-mm-tool. */
  tool: string;
  icon: ToolIconName;
  /** One line under the name in tool lists. */
  blurb: string;
  triggers: RegExp;
}

export const KITCHEN_TOOLS: KitchenTool[] = [
  {
    slug: 'air-fryer-conversion-calculator',
    name: 'Air fryer conversion calculator',
    tool: 'air-fryer-converter',
    icon: 'airfryer',
    blurb: 'Oven recipes to air fryer time and temperature',
    // First: an air fryer post is better served by this than by the meat or oven tools.
    triggers: /\b(air[- ]?fry(er|ers|ing)?|air[- ]?fried)\b/i,
  },
  {
    slug: 'butter-conversion-how-many-sticks-in-1-cup-measure-butter-in-grams',
    name: 'Butter converter',
    tool: 'butter-converter',
    icon: 'butter',
    blurb: 'Sticks, cups, tablespoons, grams and ounces',
    triggers: /\bbutter\b/i,
  },
  {
    slug: 'meat-temperature-chart',
    name: 'Meat temperature chart',
    tool: 'meat-temperature',
    icon: 'thermometer',
    blurb: 'USDA safe temperatures and steak doneness',
    triggers: /\b(steak|chicken|pork|beef|turkey|lamb|brisket|ribs?|roast|meatloaf|burgers?|salmon|wings|tenderloin|ham|chops?)\b/i,
  },
  {
    slug: 'cups-to-grams-converter',
    name: 'Cups to grams converter',
    tool: 'cups-grams-converter',
    icon: 'cup',
    blurb: 'Flour, sugar, oats, honey and 13 more',
    triggers: /\b(flour|sugar|cups?|grams?|measur\w*|ounces?)\b/i,
  },
  {
    slug: 'oven-temperature-conversion',
    name: 'Oven temperature converter',
    tool: 'oven-temperature',
    icon: 'oven',
    blurb: '°F, °C and gas mark, with fan ovens',
    triggers: /\b(bake[ds]?|baking|oven|cakes?|cookies?|bread|muffins?|casseroles?|pies?|brownies?)\b/i,
  },
  {
    slug: 'recipe-scaler',
    name: 'Recipe scaler',
    tool: 'recipe-scaler',
    icon: 'scale',
    blurb: 'Double, halve or resize any recipe',
    triggers: /\b(soups?|stews?|chili|crockpot|slow cooker|family|crowd|batch|meal prep|dinners?)\b/i,
  },
];

export function toolForTitle(title: string, exclude: string): KitchenTool | undefined {
  return KITCHEN_TOOLS.find((t) => t.slug !== exclude && t.triggers.test(title));
}

/** The tool a post carries, if it is a tool page. */
export function toolForPost(slug: string): KitchenTool | undefined {
  return KITCHEN_TOOLS.find((t) => t.slug === slug);
}
