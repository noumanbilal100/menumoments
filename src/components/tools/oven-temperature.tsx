'use client';

import { useId, useState } from 'react';

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
  const fanF = f - 25;
  const fanC = fToC(f) - 20;

  const results = [
    unit !== 'F' && { value: ok ? `${Math.round(f)}°F` : '—', label: 'Fahrenheit' },
    unit !== 'C' && { value: ok ? `${Math.round(fToC(f))}°C` : '—', label: 'Celsius' },
    unit !== 'gas' && { value: gas ? `Gas ${gas.mark}` : '—', label: gas ? 'nearest gas mark' : 'outside the gas mark range' },
    fan && { value: ok ? `${Math.round(fanF)}°F / ${Math.round(fanC)}°C` : '—', label: 'fan or convection oven' },
  ].filter(Boolean) as { value: string; label: string }[];

  const field =
    'mt-1 rounded-lg border border-bone-200 bg-white px-3 py-2 text-char-500 outline-none focus:border-ember-500 dark:border-char-400 dark:bg-char-600 dark:text-bone-50';
  return (
    <div className="my-8 rounded-2xl border border-bone-200 bg-bone-50 p-5 shadow-card dark:border-char-500 dark:bg-char-500 md:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">Oven temperature converter</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor={`${id}-temp`} className="block text-xs font-medium text-char-300 dark:text-bone-100">
            Temperature
          </label>
          <input id={`${id}-temp`} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${field} w-28 text-lg font-semibold`} />
        </div>
        <div>
          <label htmlFor={`${id}-unit`} className="block text-xs font-medium text-char-300 dark:text-bone-100">
            Unit
          </label>
          <select id={`${id}-unit`} value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className={`${field} py-2.5 text-sm`}>
            <option value="F">°F (Fahrenheit)</option>
            <option value="C">°C (Celsius)</option>
            <option value="gas">Gas mark</option>
          </select>
        </div>
        <label className="mb-2 flex items-center gap-2 text-sm text-char-300 dark:text-bone-100">
          <input type="checkbox" checked={fan} onChange={(e) => setFan(e.target.checked)} className="h-4 w-4 accent-ember-500" />
          Fan / convection oven
        </label>
        <div className="flex flex-wrap gap-1.5">
          {['325', '350', '375', '400', '425'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setAmount(t);
                setUnit('F');
              }}
              className="rounded-full border border-bone-200 px-3 py-1 text-xs font-medium text-char-300 hover:border-ember-500 hover:text-ember-500 dark:border-char-400 dark:text-bone-100"
            >
              {t}°F
            </button>
          ))}
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
      <p className="mt-4 text-[11px] leading-relaxed text-char-200">
        Exact conversions, rounded to the nearest degree. Recipes often round them (350°F is printed as 175°C or 180°C). For a fan
        oven, lower the temperature by about 20°C (25°F) or follow your oven&apos;s manual.
      </p>
    </div>
  );
}
