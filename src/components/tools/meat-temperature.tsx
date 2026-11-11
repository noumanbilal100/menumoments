'use client';

import { useId, useState } from 'react';
import { Field, Results, Segmented, ToolShell, selectInput } from './ui';

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

  const results = [
    { value: `${target}°F`, label: `${toC(target)}°C · target temperature` },
    ...(pull !== null ? [{ value: `${pull}°F`, label: `${toC(pull)}°C · take it off the heat` }] : []),
    { value: meat.rest ? `${meat.rest} min` : 'No rest', label: meat.rest ? 'rest before cutting (USDA)' : 'needed before serving' },
  ];

  return (
    <ToolShell
      icon="thermometer"
      title="Meat Temperature Finder"
      subtitle="USDA safe temperatures and steak doneness"
      footnote="Measure with an instant-read thermometer in the thickest part, away from bone, fat and gristle."
    >
      <Field label="What are you cooking?" htmlFor={`${id}-meat`}>
        <select id={`${id}-meat`} value={meatId} onChange={(e) => setMeatId(e.target.value)} className={selectInput}>
          {MEATS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Field>
      {meat.doneness && (
        <Field label="How do you like it?">
          <Segmented label="Doneness" value={choice?.[0] ?? ''} onChange={setLevel} options={meat.doneness.map(([name]) => ({ value: name, label: name }))} />
        </Field>
      )}
      <Results items={results} />
      <p
        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          belowUsda
            ? 'border border-saffron-300 bg-saffron-50 text-char-300'
            : 'border border-ember-100 bg-ember-50 text-ember-700 dark:border-char-400 dark:bg-char-500 dark:text-ember-200'
        }`}
      >
        {belowUsda
          ? `${choice?.[0]} is below the USDA safe minimum of ${meat.usda}°F (${toC(meat.usda)}°C) with a ${meat.rest}-minute rest. Many cooks serve it this way; children, older people, pregnant people and anyone with a weak immune system should not.`
          : `USDA safe minimum: ${meat.usda}°F (${toC(meat.usda)}°C)${meat.rest ? `, then rest ${meat.rest} minutes` : ''}.`}
        {meat.note ? ` ${meat.note}` : ''}
      </p>
    </ToolShell>
  );
}
