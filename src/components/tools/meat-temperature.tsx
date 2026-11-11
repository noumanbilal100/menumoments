'use client';

import { useId, useState } from 'react';

/**
 * Safe internal temperatures (USDA FSIS minimums) and doneness targets for
 * whole cuts. Temperatures in °F; °C is worked out from them.
 */
interface Meat {
  id: string;
  name: string;
  /** USDA safe minimum internal temperature, °F. */
  usda: number;
  /** Minutes to rest before cutting, when USDA asks for it. */
  rest: number;
  /** Doneness targets for whole cuts, °F. */
  doneness?: [string, number][];
  note?: string;
}

const STEAK: [string, number][] = [
  ['Rare', 125],
  ['Medium-rare', 135],
  ['Medium', 145],
  ['Medium-well', 150],
  ['Well done', 160],
];

export const MEATS: Meat[] = [
  { id: 'beef', name: 'Beef steaks and roasts', usda: 145, rest: 3, doneness: STEAK },
  { id: 'lamb', name: 'Lamb chops and roasts', usda: 145, rest: 3, doneness: STEAK },
  {
    id: 'pork',
    name: 'Pork chops, tenderloin and roasts',
    usda: 145,
    rest: 3,
    doneness: [
      ['Medium', 145],
      ['Medium-well', 150],
      ['Well done', 160],
    ],
  },
  { id: 'ground', name: 'Ground beef, pork or lamb (burgers, meatloaf)', usda: 160, rest: 0 },
  { id: 'poultry', name: 'Chicken and turkey (whole, pieces or ground)', usda: 165, rest: 0 },
  { id: 'fish', name: 'Fish and shellfish', usda: 145, rest: 0, note: 'Fish is done when the flesh turns opaque and flakes easily with a fork.' },
  { id: 'ham-fresh', name: 'Fresh or uncooked ham', usda: 145, rest: 3 },
  {
    id: 'ham-cooked',
    name: 'Fully cooked ham, reheated',
    usda: 140,
    rest: 0,
    note: 'For ham packaged in a USDA-inspected plant. Reheat other cooked ham to 165°F.',
  },
  { id: 'eggs', name: 'Egg dishes (quiche, casseroles)', usda: 160, rest: 0 },
  { id: 'leftovers', name: 'Leftovers and casseroles', usda: 165, rest: 0 },
];

export const toC = (f: number) => Math.round(((f - 32) * 5) / 9);

export function MeatTemperature() {
  const id = useId();
  const [meatId, setMeatId] = useState('beef');
  const meat = MEATS.find((m) => m.id === meatId) ?? MEATS[0];
  const [level, setLevel] = useState('Medium');
  const choice = meat.doneness?.find(([name]) => name === level) ?? meat.doneness?.[0];
  const target = choice ? choice[1] : meat.usda;
  const belowUsda = target < meat.usda;
  // Whole cuts keep cooking as they rest; take them off a few degrees early.
  const pull = meat.doneness ? target - 5 : null;

  const field =
    'mt-1 w-full rounded-lg border border-bone-200 bg-white px-3 py-2.5 text-sm text-char-500 outline-none focus:border-ember-500 dark:border-char-400 dark:bg-char-600 dark:text-bone-50';
  return (
    <div className="my-8 rounded-2xl border border-bone-200 bg-bone-50 p-5 shadow-card dark:border-char-500 dark:bg-char-500 md:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">Meat temperature finder</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-meat`} className="block text-xs font-medium text-char-300 dark:text-bone-100">
            What are you cooking?
          </label>
          <select id={`${id}-meat`} value={meatId} onChange={(e) => setMeatId(e.target.value)} className={field}>
            {MEATS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        {meat.doneness && (
          <div>
            <label htmlFor={`${id}-level`} className="block text-xs font-medium text-char-300 dark:text-bone-100">
              How do you like it?
            </label>
            <select id={`${id}-level`} value={choice?.[0]} onChange={(e) => setLevel(e.target.value)} className={field}>
              {meat.doneness.map(([name, f]) => (
                <option key={name} value={name}>
                  {name} ({f}°F)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <ul className="mt-5 grid gap-2 sm:grid-cols-3" aria-live="polite">
        <li className="rounded-xl bg-white px-4 py-3 dark:bg-char-600">
          <span className="block font-display text-3xl text-char-500 dark:text-bone-50">{target}°F</span>
          <span className="text-xs text-char-200">{toC(target)}°C · target temperature</span>
        </li>
        {pull !== null && (
          <li className="rounded-xl bg-white px-4 py-3 dark:bg-char-600">
            <span className="block font-display text-3xl text-char-500 dark:text-bone-50">{pull}°F</span>
            <span className="text-xs text-char-200">{toC(pull)}°C · take it off the heat</span>
          </li>
        )}
        <li className="rounded-xl bg-white px-4 py-3 dark:bg-char-600">
          <span className="block font-display text-3xl text-char-500 dark:text-bone-50">{meat.rest ? `${meat.rest} min` : 'None'}</span>
          <span className="text-xs text-char-200">rest before cutting{meat.rest ? ' (USDA)' : ''}</span>
        </li>
      </ul>

      <p className={`mt-4 rounded-lg px-3 py-2 text-xs leading-relaxed ${belowUsda ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' : 'text-char-300 dark:text-bone-100'}`}>
        {belowUsda
          ? `${choice?.[0]} is below the USDA safe minimum of ${meat.usda}°F (${toC(meat.usda)}°C) with a ${meat.rest}-minute rest. Many cooks serve it this way; children, older people, pregnant people and anyone with a weak immune system should not.`
          : `USDA safe minimum: ${meat.usda}°F (${toC(meat.usda)}°C)${meat.rest ? `, then rest ${meat.rest} minutes` : ''}.`}
        {meat.note ? ` ${meat.note}` : ''}
      </p>
      <p className="mt-3 text-[11px] leading-relaxed text-char-200">
        Measure with an instant-read thermometer in the thickest part, away from bone, fat and gristle.
      </p>
    </div>
  );
}
