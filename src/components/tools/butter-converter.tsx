'use client';

import { useId, useState } from 'react';
import { fractionText } from './format';
import { Field, Presets, Results, Segmented, ToolShell, bigInput } from './ui';

/**
 * Butter converter for the butter conversion post. US measures: one stick is
 * ½ cup, 8 tablespoons, 4 ounces and 113.4 grams.
 */
type Unit = 'sticks' | 'cups' | 'tbsp' | 'tsp' | 'grams' | 'oz' | 'lb';

const GRAMS: Record<Unit, number> = { sticks: 113.4, cups: 226.8, tbsp: 14.175, tsp: 4.725, grams: 1, oz: 28.35, lb: 453.6 };
const LABEL: Record<Unit, [string, string]> = {
  sticks: ['stick', 'sticks'],
  cups: ['cup', 'cups'],
  tbsp: ['tablespoon', 'tablespoons'],
  tsp: ['teaspoon', 'teaspoons'],
  grams: ['gram', 'grams'],
  oz: ['ounce', 'ounces'],
  lb: ['pound', 'pounds'],
};
const SHORT: Record<Unit, string> = { sticks: 'Sticks', cups: 'Cups', tbsp: 'Tbsp', tsp: 'Tsp', grams: 'Grams', oz: 'Ounces', lb: 'Pounds' };
// Grams first: it is what most people convert butter to.
const ORDER: Unit[] = ['grams', 'sticks', 'cups', 'tbsp', 'oz', 'tsp', 'lb'];

const PRESETS: { label: string; amount: number; unit: Unit }[] = [
  { label: '½ stick', amount: 0.5, unit: 'sticks' },
  { label: '1 stick', amount: 1, unit: 'sticks' },
  { label: '1 cup', amount: 1, unit: 'cups' },
  { label: '1 tbsp', amount: 1, unit: 'tbsp' },
  { label: '100 g', amount: 100, unit: 'grams' },
  { label: '250 g block', amount: 250, unit: 'grams' },
];

function show(value: number, unit: Unit): string {
  if (!Number.isFinite(value)) return '—';
  if (unit === 'grams') return value >= 10 ? String(Math.round(value)) : value.toFixed(1);
  return fractionText(value);
}

export function ButterConverter() {
  const id = useId();
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState<Unit>('sticks');
  const n = Number(amount.replace(',', '.'));
  const grams = Number.isFinite(n) && n >= 0 ? n * GRAMS[unit] : NaN;

  const results = ORDER.filter((u) => u !== unit).map((u) => {
    const text = show(grams / GRAMS[u], u);
    return { value: text, label: LABEL[u][text === '1' || /^[¼⅓½⅔¾⅛⅜⅝⅞]$/.test(text) ? 0 : 1] };
  });

  return (
    <ToolShell
      icon="butter"
      title="Butter Converter"
      subtitle="Sticks, cups, tablespoons, grams and ounces"
      footnote="US measures: 1 stick = ½ cup = 8 tablespoons = 4 oz = 113 g. Grams are rounded to the nearest gram."
    >
      <div className="grid gap-4 md:grid-cols-[11rem_minmax(0,1fr)] md:items-end">
        <Field label="Amount" htmlFor={`${id}-amount`}>
          <input id={`${id}-amount`} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={bigInput} />
        </Field>
        <Field label="Unit">
          <Segmented label="Unit" value={unit} onChange={setUnit} options={(Object.keys(SHORT) as Unit[]).map((u) => ({ value: u, label: SHORT[u] }))} />
        </Field>
      </div>
      <Presets
        items={PRESETS.map((p) => ({ label: p.label, key: p.label }))}
        onPick={(key) => {
          const p = PRESETS.find((x) => x.label === key);
          if (p) {
            setAmount(String(p.amount));
            setUnit(p.unit);
          }
        }}
      />
      <Results items={results} />
    </ToolShell>
  );
}
