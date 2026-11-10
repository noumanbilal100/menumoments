'use client';

import { useId, useState } from 'react';

/**
 * Butter converter for the butter conversion post. US measures: one stick is
 * ½ cup, 8 tablespoons, 4 ounces and 113.4 grams.
 */

type Unit = 'sticks' | 'cups' | 'tbsp' | 'tsp' | 'grams' | 'oz' | 'lb';

const GRAMS: Record<Unit, number> = {
  sticks: 113.4,
  cups: 226.8,
  tbsp: 14.175,
  tsp: 4.725,
  grams: 1,
  oz: 28.35,
  lb: 453.6,
};

const LABEL: Record<Unit, [string, string]> = {
  sticks: ['stick', 'sticks'],
  cups: ['cup', 'cups'],
  tbsp: ['tablespoon', 'tablespoons'],
  tsp: ['teaspoon', 'teaspoons'],
  grams: ['gram', 'grams'],
  oz: ['ounce', 'ounces'],
  lb: ['pound', 'pounds'],
};

const ORDER: Unit[] = ['sticks', 'cups', 'tbsp', 'tsp', 'grams', 'oz', 'lb'];

const PRESETS: { label: string; amount: number; unit: Unit }[] = [
  { label: '½ stick', amount: 0.5, unit: 'sticks' },
  { label: '1 stick', amount: 1, unit: 'sticks' },
  { label: '1 cup', amount: 1, unit: 'cups' },
  { label: '1 tbsp', amount: 1, unit: 'tbsp' },
  { label: '100 g', amount: 100, unit: 'grams' },
  { label: '250 g block', amount: 250, unit: 'grams' },
];

/** Kitchen-friendly numbers: whole grams, and quarters, thirds and halves for the rest. */
function show(value: number, unit: Unit): string {
  if (!Number.isFinite(value)) return '—';
  if (unit === 'grams') return value >= 10 ? String(Math.round(value)) : value.toFixed(1);
  const whole = Math.floor(value + 1e-9);
  const frac = value - whole;
  const fractions: [number, string][] = [
    [0, ''],
    [0.25, '¼'],
    [1 / 3, '⅓'],
    [0.5, '½'],
    [2 / 3, '⅔'],
    [0.75, '¾'],
    [1, ''],
  ];
  for (const [f, glyph] of fractions) {
    if (Math.abs(frac - f) < 0.02) {
      const w = f === 1 ? whole + 1 : whole;
      if (!glyph) return String(w);
      return w ? `${w}${glyph}` : glyph;
    }
  }
  return value >= 100 ? String(Math.round(value)) : String(Math.round(value * 100) / 100);
}

export function ButterConverter() {
  const id = useId();
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState<Unit>('sticks');
  const n = Number(amount.replace(',', '.'));
  const grams = Number.isFinite(n) && n >= 0 ? n * GRAMS[unit] : NaN;

  return (
    <div className="my-8 rounded-2xl border border-bone-200 bg-bone-50 p-5 shadow-card dark:border-char-500 dark:bg-char-500 md:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">Butter converter</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor={`${id}-amount`} className="block text-xs font-medium text-char-300 dark:text-bone-100">
            Amount
          </label>
          <input
            id={`${id}-amount`}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-28 rounded-lg border border-bone-200 bg-white px-3 py-2 text-lg font-semibold text-char-500 outline-none focus:border-ember-500 dark:border-char-400 dark:bg-char-600 dark:text-bone-50"
          />
        </div>
        <div>
          <label htmlFor={`${id}-unit`} className="block text-xs font-medium text-char-300 dark:text-bone-100">
            Unit
          </label>
          <select
            id={`${id}-unit`}
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="mt-1 rounded-lg border border-bone-200 bg-white px-3 py-2.5 text-sm text-char-500 outline-none focus:border-ember-500 dark:border-char-400 dark:bg-char-600 dark:text-bone-50"
          >
            {ORDER.map((u) => (
              <option key={u} value={u}>
                {LABEL[u][1]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setAmount(String(p.amount));
                setUnit(p.unit);
              }}
              className="rounded-full border border-bone-200 px-3 py-1 text-xs font-medium text-char-300 hover:border-ember-500 hover:text-ember-500 dark:border-char-400 dark:text-bone-100"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {ORDER.filter((u) => u !== unit).map((u) => {
          const value = grams / GRAMS[u];
          const text = show(value, u);
          return (
            <li key={u} className="rounded-xl bg-white px-4 py-3 dark:bg-char-600">
              <span className="block font-display text-2xl text-char-500 dark:text-bone-50">{text}</span>
              {/* "1 cup", "½ cup", "¼ pound"; plural otherwise. */}
              <span className="text-xs text-char-200">{LABEL[u][text === '1' || /^[¼⅓½⅔¾]$/.test(text) ? 0 : 1]}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[11px] leading-relaxed text-char-200">
        US measures: 1 stick = ½ cup = 8 tablespoons = 4 oz = 113 g. Grams are rounded to the nearest gram.
      </p>
    </div>
  );
}
