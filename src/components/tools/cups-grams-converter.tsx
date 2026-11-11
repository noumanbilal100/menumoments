'use client';

import { useId, useState } from 'react';
import { fractionText } from './format';
import { Field, Results, Segmented, ToolShell, bigInput, selectInput } from './ui';

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
const UNIT_LABEL: Record<Unit, string> = { cups: 'Cups', tbsp: 'Tbsp', tsp: 'Tsp', grams: 'Grams', oz: 'Ounces' };
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

  const all: { value: string; label: string; unit: Unit }[] = [
    { value: Number.isFinite(grams) ? String(Math.round(grams)) : '—', label: 'grams', unit: 'grams' },
    { value: fractionText(cups), label: cups > 0 && cups <= 1 ? 'cup' : 'cups', unit: 'cups' },
    { value: fractionText(cups * 16), label: 'tablespoons', unit: 'tbsp' },
    { value: Number.isFinite(grams) ? String(Math.round((grams / OZ) * 10) / 10) : '—', label: 'ounces', unit: 'oz' },
  ];
  const results = all.filter((r) => r.unit !== unit);

  return (
    <ToolShell
      icon="cup"
      title="Cups to Grams Converter"
      subtitle="17 baking and cooking ingredients, both directions"
      footnote="US cups (236.6 ml). Flour and dry ingredients spooned into the cup and levelled; brown sugar packed. Weighing is always the most accurate."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_11rem]">
        <Field label="Ingredient" htmlFor={`${id}-ing`}>
          <select id={`${id}-ing`} value={ingredient} onChange={(e) => setIngredient(e.target.value)} className={selectInput}>
            {INGREDIENTS.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount" htmlFor={`${id}-amount`}>
          <input id={`${id}-amount`} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={bigInput} />
        </Field>
      </div>
      <Field label="Unit">
        <Segmented label="Unit" value={unit} onChange={setUnit} options={(Object.keys(UNIT_LABEL) as Unit[]).map((u) => ({ value: u, label: UNIT_LABEL[u] }))} />
      </Field>
      <Results items={results} />
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-char-200 dark:text-bone-100">{item.name}: common amounts</p>
        <div className="grid grid-cols-3 gap-2 text-center sm:grid-cols-6">
          {[0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1].map((c) => (
            <div key={c} className="rounded-xl border border-bone-200 bg-white px-2 py-2.5 dark:border-char-500 dark:bg-char-500">
              <span className="block text-sm font-semibold text-char-500 dark:text-bone-50">{fractionText(c)} cup</span>
              <span className="text-xs text-ember-600 dark:text-ember-200">{Math.round(c * item.gramsPerCup)} g</span>
            </div>
          ))}
        </div>
      </div>
    </ToolShell>
  );
}
