import type { DietTag, Post, RecipeMeta } from './content';

/**
 * Heuristics that derive recipe metadata + article "kind" from the slug
 * and categories. WP posts don't carry structured recipe data, so this
 * gives us something useful to render until the WP schema is enriched.
 */
export function deriveKindAndRecipe(
  slug: string,
  categories: string[],
): { kind: Post['kind']; recipe?: RecipeMeta } {
  const s = slug.toLowerCase();
  const catSet = new Set(categories);

  const isRecipe = s.includes('recipe') || catSet.has('recipes');
  const isReview =
    catSet.has('food-reviews') ||
    catSet.has('product-reviews') ||
    catSet.has('kitchen-product-reviews') ||
    s.includes('menu') ||
    s.includes('review');
  const isRoundup = /\b(best|top|\d+\s*best|\d+\s*top|guide|comparison)\b/i.test(
    s.replace(/-/g, ' '),
  );
  const isTip =
    catSet.has('cooking-tips') ||
    catSet.has('kitchen-tips') ||
    catSet.has('baking-tips') ||
    s.startsWith('how-to') ||
    s.startsWith('can-you') ||
    s.startsWith('how-long');

  let kind: Post['kind'] = 'guide';
  if (isRecipe && !isReview) kind = 'recipe';
  else if (isReview) kind = 'review';
  else if (isRoundup) kind = 'roundup';
  else if (isTip) kind = 'tip';

  if (kind !== 'recipe') return { kind };

  const diet: DietTag[] = [];
  if (s.includes('vegan') || catSet.has('vegan-recipes')) diet.push('vegan');
  if (s.includes('vegetarian') || catSet.has('vegetarian-recipes')) diet.push('vegetarian');
  if (s.includes('gluten-free') || s.includes('gf-')) diet.push('gluten-free');
  if (s.includes('dairy-free')) diet.push('dairy-free');
  if (s.includes('keto')) diet.push('keto');
  if (s.includes('low-carb') || s.includes('low-histamine')) diet.push('low-carb');
  if (
    s.includes('quick') ||
    s.includes('5-ingredient') ||
    s.includes('3-ingredients') ||
    s.includes('20-minutes')
  )
    diet.push('quick');

  let prep = 15;
  let cook = 25;
  let servings = 4;
  if (catSet.has('breakfast')) {
    prep = 10;
    cook = 15;
  }
  if (catSet.has('desserts') || catSet.has('baking')) {
    prep = 20;
    cook = 35;
    servings = 8;
  }
  if (catSet.has('drinks-and-beverages')) {
    prep = 5;
    cook = 0;
    servings = 2;
  }
  if (catSet.has('snacks') || catSet.has('appetizers')) {
    prep = 10;
    cook = 15;
    servings = 6;
  }
  if (catSet.has('quick-and-easy-meals')) {
    prep = 10;
    cook = 15;
  }
  if (s.includes('crock-pot') || s.includes('crockpot') || s.includes('slow')) {
    prep = 15;
    cook = 240;
  }

  const total = prep + cook;
  const difficulty: RecipeMeta['difficulty'] =
    total < 30 ? 'easy' : total > 90 ? 'advanced' : 'medium';

  return {
    kind,
    recipe: {
      prepMinutes: prep,
      cookMinutes: cook,
      servings,
      difficulty,
      diet: diet.length ? diet : undefined,
    },
  };
}
