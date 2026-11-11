'use client';

import { useId, useState } from 'react';
import { fractionText } from './format';

/**
 * Cups ↔ grams for common baking and cooking ingredients. Grams per level US
 * cup (236.6 ml); dry ingredients spooned into the cup and levelled, brown
 * sugar packed.
 */
export const INGREDIENTS: { id: string; name: string; gramsPerCup: number }[] = [
  { id: 'ap-flour', name: 'All-purpose flour', gramsPerCup: 120 },
  { id: 'bread-flour', name: 'Bread flour', gramsPerCup: 120 },
  { id: 'wheat-flour', name: 'Whole wheat flour', gramsPerCup: 113 },
  { id: 'sugar', name: 'Granulated sugar', gramsPerCup: 200 },
  { id: 'brown-sugar', name: 'Brown sugar (packed)', gramsPerCup: 213 },
  { id: 'powdered-sugar', name: 'Powdered sugar', gramsPerCup: 120 },
  { id: 'butter', name: 'Butter', gramsPerCup: 227 },
  { id: 'water', name: 'Water', gramsPerCup: 237 },
  { id: 'milk', name: 'Milk', gramsPerCup: 245 },
  { id: 'cream', name: 'Heavy cream', gramsPerCup: 240 },
  { id: 'yogurt', name: 'Plain yogurt', gramsPerCup: 245 },
  { id: 'oil', name: 'Vegetable oil', gramsPerCup: 218 },
  { id: 'honey', name: 'Honey', gramsPerCup: 340 },
  { id: 'oats', name: 'Rolled oats', gramsPerCup: 90 },
  { id: 'rice', name: 'White rice (uncooked)', gramsPerCup: 185 },
  { id: 'cocoa', name: 'Cocoa powder (unsweetened)', gramsPerCup: 85 },
  { id: 'chocolate-chips', name: 'Chocolate chips', gramsPerCup: 170 },
];

type Unit = 'cups' | 'tbsp' | 'tsp' | 'grams' | 'oz';
const UNIT_LABEL: Record<Unit, string> = { cups: 'cups', tbsp: 'tablespoons', tsp: 'teaspoons', grams: 'grams', oz: 'ounces' };
const PER_CUP: Record<Exclude<Unit, 'grams' | 'oz'>, number> = { cups: 1, tbsp: 16, tsp: 48 };
const OZ = 28.35;

export function CupsGramsConverter() {
  const id = useId();
  const [ingredient, setIngredient] = useState('ap-flour');
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState<Unit>('cups');
  const item = INGREDIENTS.find((i) => i.id === ingredient) ?? INGREDIENTS[0];
  const n = Number(amount.replace(',', '.'));
  const valid = Number.isFinite(n) && n >= 0;
  const grams = !valid ? NaN : unit === 'grams' ? n : unit === 'oz' ? n * OZ : (n / PER_CUP[unit]) * item.gramsPerCup;
  const cups = grams / item.gramsPerCup;

  const results: { value: string; label: string; unit: Unit }[] = [
    { value: Number.isFinite(grams) ? String(Math.round(grams)) : '—', label: 'grams', unit: 'grams' as Unit },
    { value: fractionText(cups), label: cups > 0 && cups <= 1 ? 'cup' : 'cups', unit: 'cups' as Unit },
    { value: fractionText(cups * 16), label: 'tablespoons', unit: 'tbsp' as Unit },
    { value: Number.isFinite(grams) ? (Math.round((grams / OZ) * 10) / 10).toString() : '—', label: 'ounces', unit: 'oz' as Unit },
  ].filter((r) => r.unit !== unit);

  const field =
    'mt-1 rounded-lg border border-bone-200 bg-white px-3 py-2 text-char-500 outline-none focus:border-ember-500 dark:border-char-400 dark:bg-char-600 dark:text-bone-50';
  return (
    <div className="my-8 rounded-2xl border border-bone-200 bg-bone-50 p-5 shadow-card dark:border-char-500 dark:bg-char-500 md:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">Cups to grams converter</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_9rem]">
        <div>
          <label htmlFor={`${id}-ing`} className="block text-xs font-medium text-char-300 dark:text-bone-100">
            Ingredient
          </label>
          <select id={`${id}-ing`} value={ingredient} onChange={(e) => setIngredient(e.target.value)} className={`${field} w-full text-sm`}>
            {INGREDIENTS.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-amount`} className="block text-xs font-medium text-char-300 dark:text-bone-100">
            Amount
          </label>
          <input id={`${id}-amount`} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${field} w-full text-lg font-semibold`} />
        </div>
        <div>
          <label htmlFor={`${id}-unit`} className="block text-xs font-medium text-char-300 dark:text-bone-100">
            Unit
          </label>
          <select id={`${id}-unit`} value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className={`${field} w-full text-sm`}>
            {(Object.keys(UNIT_LABEL) as Unit[]).map((u) => (
              <option key={u} value={u}>
                {UNIT_LABEL[u]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className="mt-5 grid gap-2 sm:grid-cols-3" aria-live="polite">
        {results.map((r) => (
          <li key={r.label} className="rounded-xl bg-white px-4 py-3 dark:bg-char-600">
            <span className="block font-display text-2xl text-char-500 dark:text-bone-50">{r.value}</span>
            <span className="text-xs text-char-200">{r.label}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs font-medium text-char-300 dark:text-bone-100">{item.name} by the cup</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-xs sm:grid-cols-6">
        {[0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1].map((c) => (
          <div key={c} className="rounded-lg bg-white px-2 py-2 dark:bg-char-600">
            <span className="block font-semibold text-char-500 dark:text-bone-50">{fractionText(c)} cup</span>
            <span className="text-char-200">{Math.round(c * item.gramsPerCup)} g</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-char-200">
        US cups (236.6 ml). Flour and dry ingredients spooned into the cup and levelled; brown sugar packed. Weighing is always the
        most accurate.
      </p>
    </div>
  );
}
