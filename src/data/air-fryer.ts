/**
 * Data for the air fryer conversion calculator and its chart. The rule of
 * thumb: from a conventional oven, lower the temperature by 25°F and cut the
 * time by about 20%. Fan and convection ovens already cook faster, so their
 * recipes need less change. Everything here is a starting point, not a
 * guarantee: models, food size and how full the basket is all change it.
 */

export type OvenType = 'conventional' | 'fan' | 'convection';

export const OVEN_TYPES: Record<OvenType, { label: string; deltaF: number; timeFactor: number; note: string }> = {
  conventional: { label: 'Conventional', deltaF: 25, timeFactor: 0.8, note: 'no fan' },
  fan: { label: 'Fan-assisted', deltaF: 10, timeFactor: 0.85, note: 'fan, top and bottom heat' },
  convection: { label: 'Convection', deltaF: 0, timeFactor: 0.9, note: 'fan with its own element' },
};

export type Thickness = 'thin' | 'average' | 'thick';
export const THICKNESS: Record<Thickness, { label: string; factor: number }> = {
  thin: { label: 'Thin', factor: 0.85 },
  average: { label: 'Average', factor: 1 },
  thick: { label: 'Thick', factor: 1.2 },
};

export type Load = 'single' | 'full';
export const LOAD: Record<Load, { label: string; factor: number }> = {
  single: { label: 'Single layer', factor: 1 },
  full: { label: 'Full basket', factor: 1.15 },
};

/** Most basket air fryers top out here. */
export const AIR_FRYER_MAX_F = 400;

export type FoodId = 'any' | 'chicken' | 'fries' | 'vegetables' | 'fish' | 'pizza' | 'baked';

export interface Food {
  id: FoodId;
  name: string;
  /** Extra temperature change for this food, °F (baked goods go a little lower so the middle sets before the top browns). */
  extraF: number;
  /** USDA safe minimum internal temperature, °F, where one applies. */
  safeF?: number;
  tips: string[];
}

export const FOODS: Food[] = [
  {
    id: 'any',
    name: 'Any food',
    extraF: 0,
    tips: ['Preheat for 3 to 5 minutes if your model allows it.', 'Cook in a single layer and shake or flip halfway.', 'Start checking early: air fryers vary.'],
  },
  {
    id: 'chicken',
    name: 'Chicken',
    extraF: 0,
    safeF: 165,
    tips: ['Cook until the thickest part reads 165°F (74°C).', 'Flip pieces halfway for even browning.', 'Pat dry and use a light coat of oil for crisp skin.'],
  },
  {
    id: 'fries',
    name: 'Fries',
    extraF: 0,
    tips: ['Shake the basket every 5 minutes.', 'Frozen fries need no extra oil.', 'Fresh-cut fries: soak, dry well and toss with about 1 teaspoon of oil.'],
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    extraF: 0,
    tips: ['Cut pieces the same size and toss with a little oil.', 'Shake halfway.', 'Dense vegetables like potatoes take longer than florets.'],
  },
  {
    id: 'fish',
    name: 'Fish',
    extraF: 0,
    safeF: 145,
    tips: ['Use a perforated liner or oil the basket so fillets don’t stick.', 'Flip thick fillets gently; leave thin ones be.', 'Done at 145°F (63°C), when the flesh is opaque and flakes.'],
  },
  {
    id: 'pizza',
    name: 'Pizza',
    extraF: 0,
    tips: ['Check that the pizza fits flat in the basket.', 'Reheat slices at about 350°F for 3 to 5 minutes.', 'Watch the crust: it browns faster than in an oven.'],
  },
  {
    id: 'baked',
    name: 'Baked goods',
    extraF: 5,
    tips: ['Use a small pan that leaves space for air around it.', 'Tent with foil if the top browns before the middle is done.', 'Test with a toothpick from the time shown.'],
  },
];

/** Common foods: typical oven settings and air fryer starting points (rule of thumb: 25°F lower). */
export const AIR_FRYER_CHART: { food: string; ovenF: number; ovenTime: string; airF: number; airTime: string; tip: string }[] = [
  { food: 'Frozen french fries', ovenF: 425, ovenTime: '20–25 min', airF: 400, airTime: '12–15 min', tip: 'Shake every 5 minutes' },
  { food: 'Fresh-cut fries', ovenF: 425, ovenTime: '30–35 min', airF: 400, airTime: '15–20 min', tip: 'Soak, dry, toss in a little oil' },
  { food: 'Chicken wings', ovenF: 400, ovenTime: '40–45 min', airF: 375, airTime: '22–25 min', tip: 'Flip halfway; at least 165°F' },
  { food: 'Chicken breast, boneless', ovenF: 400, ovenTime: '20–25 min', airF: 375, airTime: '12–16 min', tip: 'Cook to 165°F' },
  { food: 'Chicken thighs, bone-in', ovenF: 425, ovenTime: '35–40 min', airF: 400, airTime: '18–22 min', tip: 'Cook to 165°F' },
  { food: 'Chicken nuggets, frozen', ovenF: 400, ovenTime: '15–18 min', airF: 375, airTime: '8–10 min', tip: 'Shake halfway' },
  { food: 'Salmon fillet, 1 inch', ovenF: 400, ovenTime: '12–15 min', airF: 375, airTime: '8–10 min', tip: 'Cook to 145°F' },
  { food: 'White fish fillets', ovenF: 400, ovenTime: '10–12 min', airF: 375, airTime: '8–10 min', tip: 'Use a liner; cook to 145°F' },
  { food: 'Broccoli or cauliflower', ovenF: 425, ovenTime: '20–25 min', airF: 400, airTime: '8–10 min', tip: 'Toss with a little oil' },
  { food: 'Brussels sprouts, halved', ovenF: 400, ovenTime: '25–30 min', airF: 375, airTime: '12–15 min', tip: 'Shake halfway' },
  { food: 'Potato wedges', ovenF: 425, ovenTime: '30–35 min', airF: 400, airTime: '18–22 min', tip: 'Single layer; shake twice' },
  { food: 'Frozen pizza, small', ovenF: 425, ovenTime: '12–15 min', airF: 400, airTime: '6–8 min', tip: 'Check it fits; watch the crust' },
  { food: 'Pizza slice, reheated', ovenF: 375, ovenTime: '8–10 min', airF: 350, airTime: '3–5 min', tip: 'Crisp base, no soggy crust' },
  { food: 'Bacon', ovenF: 400, ovenTime: '15–20 min', airF: 375, airTime: '8–10 min', tip: 'Single layer; drain the fat' },
  { food: 'Muffins or cupcakes', ovenF: 350, ovenTime: '18–22 min', airF: 320, airTime: '12–15 min', tip: 'Toothpick test' },
  { food: 'Cookies', ovenF: 350, ovenTime: '10–12 min', airF: 320, airTime: '6–8 min', tip: 'Parchment; small batches' },
];

export const toC = (f: number) => ((f - 32) * 5) / 9;
export const toF = (c: number) => (c * 9) / 5 + 32;
/** Oven dials move in 5-degree steps. */
export const round5 = (n: number) => Math.round(n / 5) * 5;
