'use client';

import { useId, useState } from 'react';
import { Field, Presets, Results, Segmented, ToolShell, bigInput } from './ui';

/**
 * Oven temperatures between °F, °C and UK gas marks, with the usual
 * adjustment for fan (convection) ovens: 20°C or 25°F lower.
 */
export const GAS_MARKS: { mark: string; value: number; f: number; c: number }[] = [
  { mark: '¼', value: 0.25, f: 225, c: 110 },
  { mark: '½', value: 0.5, f: 250, c: 120 },
  { mark: '1', value: 1, f: 275, c: 140 },
  { mark: '2', value: 2, f: 300, c: 150 },
  { mark: '3', value: 3, f: 325, c: 170 },
  { mark: '4', value: 4, f: 350, c: 180 },
  { mark: '5', value: 5, f: 375, c: 190 },
  { mark: '6', value: 6, f: 400, c: 200 },
  { mark: '7', value: 7, f: 425, c: 220 },
  { mark: '8', value: 8, f: 450, c: 230 },
  { mark: '9', value: 9, f: 475, c: 240 },
  { mark: '10', value: 10, f: 500, c: 260 },
];

type Unit = 'F' | 'C' | 'gas';
const fToC = (f: number) => ((f - 32) * 5) / 9;
const cToF = (c: number) => (c * 9) / 5 + 32;

function nearestMark(f: number) {
  if (f < 212 || f > 525) return null;
  return GAS_MARKS.reduce((best, g) => (Math.abs(g.f - f) < Math.abs(best.f - f) ? g : best));
}

export function OvenTemperature() {
  const id = useId();
  const [amount, setAmount] = useState('350');
  const [unit, setUnit] = useState<Unit>('F');
  const [fan, setFan] = useState(false);
  const n = Number(amount.replace(',', '.'));
  const mark = unit === 'gas' ? GAS_MARKS.find((g) => g.value === n || g.mark === amount.trim()) : undefined;
  const f = unit === 'F' ? n : unit === 'C' ? cToF(n) : mark ? mark.f : NaN;
  const ok = Number.isFinite(f) && f > 0;
  const gas = ok ? nearestMark(f) : null;

  const results = [
    ...(fan ? [{ value: ok ? `${Math.round(fToC(f) - 20)}°C` : '—', label: `fan oven · ${ok ? Math.round(f - 25) : '—'}°F` }] : []),
    ...(unit !== 'C' ? [{ value: ok ? `${Math.round(fToC(f))}°C` : '—', label: 'Celsius' }] : []),
    ...(unit !== 'F' ? [{ value: ok ? `${Math.round(f)}°F` : '—', label: 'Fahrenheit' }] : []),
    ...(unit !== 'gas' ? [{ value: gas ? `Gas ${gas.mark}` : '—', label: gas ? 'nearest gas mark' : 'outside the gas mark range' }] : []),
  ];

  return (
    <ToolShell
      icon="oven"
      title="Oven Temperature Converter"
      subtitle="Fahrenheit, Celsius and gas mark, with fan ovens"
      footnote="Exact conversions, rounded to the nearest degree. Recipes often round them (350°F is printed as 175°C or 180°C). For a fan oven, lower the temperature by about 20°C (25°F) or follow your oven's manual."
    >
      <div className="grid gap-4 md:grid-cols-[11rem_minmax(0,1fr)] md:items-end">
        <Field label="Temperature" htmlFor={`${id}-temp`}>
          <input id={`${id}-temp`} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={bigInput} />
        </Field>
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Unit">
            <Segmented
              label="Unit"
              value={unit}
              onChange={setUnit}
              options={[
                { value: 'F', label: '°F' },
                { value: 'C', label: '°C' },
                { value: 'gas', label: 'Gas mark' },
              ]}
            />
          </Field>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-bone-100 px-4 py-3 text-sm font-semibold text-char-300 dark:bg-char-500 dark:text-bone-100">
            <span className="relative inline-flex">
              <input type="checkbox" checked={fan} onChange={(e) => setFan(e.target.checked)} className="peer sr-only" />
              <span className="h-6 w-11 rounded-full bg-bone-300 transition peer-checked:bg-ember-500 dark:bg-char-400" />
              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
            </span>
            Fan / convection oven
          </label>
        </div>
      </div>
      <Presets
        items={['325', '350', '375', '400', '425'].map((t) => ({ label: `${t}°F`, key: t }))}
        onPick={(t) => {
          setAmount(t);
          setUnit('F');
        }}
      />
      <Results items={results} />
    </ToolShell>
  );
}
