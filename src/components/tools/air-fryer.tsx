'use client';

import { useId, useState } from 'react';
import {
  AIR_FRYER_CHART,
  AIR_FRYER_MAX_F,
  FOODS,
  LOAD,
  OVEN_TYPES,
  THICKNESS,
  round5,
  toC,
  toF,
  type FoodId,
  type Load,
  type OvenType,
  type Thickness,
} from '@/data/air-fryer';
import { Field, Results, Segmented, ToolShell, bigInput } from './ui';

type Direction = 'to-air' | 'to-oven';
type Unit = 'F' | 'C';

export interface Conversion {
  tempF: number;
  minutes: number;
  checkFrom: number;
  halfway: number;
  capped: boolean;
  formula: string[];
}

const fmtF = (f: number) => `${Math.round(f)}°F`;

/** The arithmetic, kept apart so it can be read and tested. */
export function convert(o: {
  direction: Direction;
  oven: OvenType;
  tempF: number;
  minutes: number;
  food: FoodId;
  thickness: Thickness;
  load: Load;
}): Conversion {
  const oven = OVEN_TYPES[o.oven];
  const food = FOODS.find((f) => f.id === o.food) ?? FOODS[0];
  const thick = THICKNESS[o.thickness].factor;
  const formula: string[] = [];

  if (o.direction === 'to-air') {
    const change = oven.deltaF + food.extraF;
    let tempF = round5(o.tempF - change);
    const capped = tempF > AIR_FRYER_MAX_F;
    if (capped) tempF = AIR_FRYER_MAX_F;
    const load = LOAD[o.load].factor;
    const minutes = Math.max(1, Math.round(o.minutes * oven.timeFactor * thick * load));
    formula.push(change ? `${fmtF(o.tempF)} − ${change}°F = ${fmtF(o.tempF - change)}${round5(o.tempF - change) !== o.tempF - change ? `, rounded to ${fmtF(round5(o.tempF - change))}` : ''}` : `${fmtF(o.tempF)}: same temperature`);
    if (capped) formula.push(`capped at ${AIR_FRYER_MAX_F}°F, the top setting of most air fryers`);
    const factors = [`${oven.timeFactor.toFixed(2)} (${oven.label.toLowerCase()} oven)`];
    if (thick !== 1) factors.push(`${thick.toFixed(2)} (${THICKNESS[o.thickness].label.toLowerCase()})`);
    if (load !== 1) factors.push(`${load.toFixed(2)} (full basket)`);
    formula.push(`${o.minutes} min × ${factors.join(' × ')} = ${minutes} min`);
    return { tempF, minutes, checkFrom: Math.max(1, Math.round(minutes * 0.75)), halfway: Math.max(1, Math.round(minutes / 2)), capped, formula };
  }

  const change = oven.deltaF + food.extraF;
  const tempF = round5(o.tempF + change);
  const minutes = Math.max(1, Math.round((o.minutes / oven.timeFactor) * thick));
  formula.push(change ? `${fmtF(o.tempF)} + ${change}°F = ${fmtF(o.tempF + change)}` : `${fmtF(o.tempF)}: same temperature`);
  formula.push(`${o.minutes} min ÷ ${oven.timeFactor.toFixed(2)}${thick !== 1 ? ` × ${thick.toFixed(2)} (${THICKNESS[o.thickness].label.toLowerCase()})` : ''} = ${minutes} min`);
  return { tempF, minutes, checkFrom: Math.max(1, Math.round(minutes * 0.85)), halfway: Math.max(1, Math.round(minutes / 2)), capped: false, formula };
}

function PrinterIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 9V3h12v6" />
      <rect x="3" y="9" width="18" height="8" rx="2" />
      <path d="M6 14h12v7H6z" />
      <path d="M17.5 12h.01" />
    </svg>
  );
}

function printChart() {
  document.body.classList.add('mm-print-chart');
  const done = () => {
    document.body.classList.remove('mm-print-chart');
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  window.print();
}

export function AirFryerConverter() {
  const id = useId();
  const [direction, setDirection] = useState<Direction>('to-air');
  const [unit, setUnit] = useState<Unit>('F');
  const [temp, setTemp] = useState('400');
  const [time, setTime] = useState('30');
  const [oven, setOven] = useState<OvenType>('conventional');
  const [food, setFood] = useState<FoodId>('any');
  const [thickness, setThickness] = useState<Thickness>('average');
  const [load, setLoad] = useState<Load>('single');

  const t = Number(temp.replace(',', '.'));
  const m = Number(time.replace(',', '.'));
  const tempF = unit === 'F' ? t : toF(t);
  const valid = Number.isFinite(tempF) && tempF >= 200 && tempF <= 550 && Number.isFinite(m) && m > 0 && m <= 600;
  const r = valid ? convert({ direction, oven, tempF, minutes: m, food, thickness, load }) : null;
  const foodInfo = FOODS.find((f) => f.id === food) ?? FOODS[0];
  const toAir = direction === 'to-air';

  // The temperature step of the working, in the unit the reader is using.
  const change = OVEN_TYPES[oven].deltaF + foodInfo.extraF;
  const working = !r
    ? []
    : unit === 'F'
      ? r.formula
      : [
          change
            ? `${Math.round(t)}°C ${toAir ? '−' : '+'} ${Math.round((change * 5) / 9)}°C ≈ ${round5(toC(r.tempF))}°C`
            : `${Math.round(t)}°C: same temperature${r.capped ? '' : ''}`,
          ...r.formula.slice(1).map((line) => line.replace(`${AIR_FRYER_MAX_F}°F`, `${AIR_FRYER_MAX_F}°F (${round5(toC(AIR_FRYER_MAX_F))}°C)`)),
        ];

  const shown = (f: number) => (unit === 'F' ? `${f}°F` : `${round5(toC(f))}°C`);
  const other = (f: number) => (unit === 'F' ? `${round5(toC(f))}°C` : `${f}°F`);

  const results = r
    ? [
        { value: shown(r.tempF), label: `${toAir ? 'air fryer' : 'oven'} temperature · ${other(r.tempF)}` },
        { value: `${r.minutes} min`, label: 'estimated cooking time' },
        { value: `${r.checkFrom} min`, label: toAir ? `start checking · shake or flip at ${r.halfway} min` : 'start checking' },
        ...(foodInfo.safeF ? [{ value: `${foodInfo.safeF}°F`, label: `safe internal temperature · ${Math.round(toC(foodInfo.safeF))}°C` }] : []),
      ]
    : [];

  return (
    <ToolShell
      icon="airfryer"
      title="Air Fryer Conversion Calculator"
      subtitle="Oven recipes to air fryer, and back"
      footnote={
        <>
          Results are estimates for a typical basket air fryer, not guarantees: models, food size and thickness, and how full the basket is all change
          cooking time. Start checking early and use a thermometer for meat and fish.
        </>
      }
    >
      <Segmented
        label="Direction"
        value={direction}
        onChange={setDirection}
        options={[
          { value: 'to-air', label: 'Oven → Air fryer' },
          { value: 'to-oven', label: 'Air fryer → Oven' },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={toAir ? 'Oven temperature' : 'Air fryer temperature'} htmlFor={`${id}-temp`}>
          <div className="flex gap-2">
            <input id={`${id}-temp`} inputMode="decimal" value={temp} onChange={(e) => setTemp(e.target.value)} className={bigInput} />
            <Segmented
              label="Temperature unit"
              value={unit}
              onChange={(u) => {
                // Keep the same temperature, shown in the other unit.
                if (Number.isFinite(t) && u !== unit) setTemp(String(u === 'C' ? round5(toC(t)) : round5(toF(t))));
                setUnit(u);
              }}
              options={[
                { value: 'F', label: '°F' },
                { value: 'C', label: '°C' },
              ]}
            />
          </div>
        </Field>
        <Field label={toAir ? 'Oven time (minutes)' : 'Air fryer time (minutes)'} htmlFor={`${id}-time`}>
          <input id={`${id}-time`} inputMode="numeric" value={time} onChange={(e) => setTime(e.target.value)} className={bigInput} />
        </Field>
      </div>

      <Field label={toAir ? 'The recipe was written for' : 'Your oven'}>
        <Segmented
          label="Oven type"
          value={oven}
          onChange={setOven}
          options={(Object.keys(OVEN_TYPES) as OvenType[]).map((k) => ({ value: k, label: OVEN_TYPES[k].label }))}
        />
      </Field>

      <Field label="Food">
        <Segmented label="Food" value={food} onChange={setFood} options={FOODS.map((f) => ({ value: f.id, label: f.name }))} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Thickness">
          <Segmented
            label="Thickness"
            value={thickness}
            onChange={setThickness}
            options={(Object.keys(THICKNESS) as Thickness[]).map((k) => ({ value: k, label: THICKNESS[k].label }))}
          />
        </Field>
        {toAir && (
          <Field label="Amount in the basket">
            <Segmented label="Amount" value={load} onChange={setLoad} options={(Object.keys(LOAD) as Load[]).map((k) => ({ value: k, label: LOAD[k].label }))} />
          </Field>
        )}
      </div>

      {r ? (
        <>
          <Results items={results} columns={results.length > 3 ? 2 : 3} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-bone-200 bg-bone-100 px-4 py-3 dark:border-char-500 dark:bg-char-500">
              <p className="text-xs font-semibold uppercase tracking-wider text-char-200 dark:text-bone-100">How we worked it out</p>
              <ul className="mt-2 space-y-1 font-mono text-[13px] text-char-300 dark:text-bone-100">
                {working.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-ember-100 bg-ember-50 px-4 py-3 dark:border-char-400 dark:bg-char-500">
              <p className="text-xs font-semibold uppercase tracking-wider text-ember-700 dark:text-ember-200">{foodInfo.id === 'any' ? 'Tips' : `Tips for ${foodInfo.name.toLowerCase()}`}</p>
              <ul className="mt-2 space-y-1.5 text-sm text-char-300 dark:text-bone-100">
                {[...foodInfo.tips, ...(thickness === 'thick' ? ['Thick pieces: if the outside browns too fast, lower the heat 10–15°F and cook a little longer.'] : []), ...(toAir && load === 'full' ? ['A full basket cooks unevenly: shake more often, or cook in batches.'] : [])].map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span aria-hidden className="mt-0.5 text-ember-500">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <p className="rounded-2xl bg-saffron-50 px-4 py-3 text-sm text-char-300">
          Enter a temperature between {unit === 'F' ? '200 and 550°F' : '95 and 290°C'} and a time in minutes.
        </p>
      )}

      {/* The printable chart, offered as its own card so it is easy to spot. */}
      <div className="flex flex-col gap-4 rounded-2xl border-2 border-dashed border-saffron-300 bg-saffron-50 p-4 sm:flex-row sm:items-center sm:p-5 dark:border-char-400 dark:bg-char-500">
        <span aria-hidden className="hidden h-12 w-12 shrink-0 place-items-center rounded-xl bg-saffron-300 text-char-500 sm:grid">
          <PrinterIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight text-char-500 dark:text-bone-50">Free printable air fryer conversion chart</p>
          <p className="mt-1 text-sm text-char-300 dark:text-bone-100">
            {AIR_FRYER_CHART.length} common foods, oven vs air fryer times and temperatures, on one page for the fridge door.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <button
            type="button"
            onClick={printChart}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-char-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ember-500 hover:shadow-embered focus:outline-none focus-visible:ring-4 focus-visible:ring-ember-500/30"
          >
            <PrinterIcon className="h-4 w-4" />
            Print the chart
          </button>
          <a href="#air-fryer-chart" className="text-center text-xs font-semibold text-ember-600 underline-offset-2 hover:underline sm:text-right dark:text-ember-200">
            View the chart below ↓
          </a>
        </div>
      </div>
    </ToolShell>
  );
}
