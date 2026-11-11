'use client';

import { useId, useState } from 'react';
import { fractionText, parseQuantity } from './format';
import { Field, Presets, ToolShell } from './ui';

/**
 * Scales an ingredient list: each line's leading amount (2, 1½, 1 1/2, ¾,
 * 0.5, or a range like 2-3) is multiplied; the rest of the line stays as is.
 */
const EXAMPLE = `2 cups all-purpose flour
1 1/2 tsp baking powder
½ cup sugar
2 large eggs
3/4 cup milk
4 tbsp butter, melted
1 pinch salt`;

// The space before a glyph is part of the amount ("1 ½"); the one after it is not.
const AMOUNT = String.raw`(?:\d+(?:\.\d+)?\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?(?:\s*[½⅓⅔¼¾⅛⅜⅝⅞])?|[½⅓⅔¼¾⅛⅜⅝⅞])`;
const LEADING = new RegExp(`^(\\s*)(${AMOUNT})(?:(\\s*(?:-|–|to)\\s*)(${AMOUNT}))?`);

/** Singular and plural of the units and countable things recipes start lines with. */
const NOUNS: [string, string][] = [
  ['cup', 'cups'],
  ['tablespoon', 'tablespoons'],
  ['teaspoon', 'teaspoons'],
  ['pound', 'pounds'],
  ['ounce', 'ounces'],
  ['stick', 'sticks'],
  ['clove', 'cloves'],
  ['can', 'cans'],
  ['slice', 'slices'],
  ['egg', 'eggs'],
  ['pinch', 'pinches'],
];
const SIZES = /^(\s*(?:(?:large|medium|small|extra[- ]large)\s+)?)([a-z]+)\b/i;

/** "1 cups flour" → "1 cup flour", "2 large egg" → "2 large eggs", after the amount changes. */
function agree(rest: string, amount: number): string {
  const m = rest.match(SIZES);
  if (!m) return rest;
  const word = m[2].toLowerCase();
  const pair = NOUNS.find(([one, many]) => word === one || word === many);
  if (!pair) return rest;
  const wanted = amount > 0 && amount <= 1 ? pair[0] : pair[1];
  const cased = m[2][0] === m[2][0].toUpperCase() ? wanted[0].toUpperCase() + wanted.slice(1) : wanted;
  return m[1] + cased + rest.slice(m[0].length);
}

export function scaleLine(line: string, factor: number): { text: string; scaled: boolean; amount: string; lead: string } {
  const m = line.match(LEADING);
  if (!m) return { text: line, scaled: false, amount: '', lead: '' };
  const first = parseQuantity(m[2]);
  if (!Number.isFinite(first)) return { text: line, scaled: false, amount: '', lead: '' };
  const second = m[4] ? parseQuantity(m[4]) : NaN;
  const amount = fractionText(first * factor, 0.04) + (Number.isFinite(second) ? `${m[3]}${fractionText(second * factor, 0.04)}` : '');
  const largest = Number.isFinite(second) ? second * factor : first * factor;
  return { text: m[1] + amount + agree(line.slice(m[0].length), largest), scaled: true, amount, lead: m[1] };
}

export function RecipeScaler() {
  const id = useId();
  const [list, setList] = useState(EXAMPLE);
  const [from, setFrom] = useState('4');
  const [to, setTo] = useState('8');
  const [copied, setCopied] = useState(false);
  const f = Number(from);
  const t = Number(to);
  const factor = f > 0 && t > 0 ? t / f : NaN;
  const lines = list.split('\n').map((l) => (Number.isFinite(factor) ? scaleLine(l, factor) : { text: l, scaled: false, amount: '', lead: '' }));
  const output = lines.map((l) => l.text).join('\n');

  const stepper = (value: string, set: (v: string) => void, label: string, inputId: string) => (
    <Field label={label} htmlFor={inputId}>
      <div className="flex items-stretch overflow-hidden rounded-2xl border border-bone-300 bg-white focus-within:border-ember-500 focus-within:ring-4 focus-within:ring-ember-500/15 dark:border-char-400 dark:bg-char-500">
        <button type="button" aria-label={`Fewer: ${label}`} onClick={() => set(String(Math.max(1, (Number(value) || 1) - 1)))} className="px-4 text-2xl text-char-200 hover:bg-bone-100 hover:text-ember-600 dark:hover:bg-char-400">
          −
        </button>
        <input id={inputId} inputMode="numeric" value={value} onChange={(e) => set(e.target.value)} className="w-full min-w-0 bg-transparent py-3 text-center font-display text-3xl tabular-nums text-char-500 outline-none dark:text-bone-50" />
        <button type="button" aria-label={`More: ${label}`} onClick={() => set(String((Number(value) || 0) + 1))} className="px-4 text-2xl text-char-200 hover:bg-bone-100 hover:text-ember-600 dark:hover:bg-char-400">
          +
        </button>
      </div>
    </Field>
  );

  return (
    <ToolShell
      icon="scale"
      title="Recipe Scaler"
      subtitle="Paste a recipe, choose the servings"
      footnote="Lines without a number (to taste) stay as they are. Round eggs to whole ones, and check pan size and baking time yourself: they don't scale in a straight line."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        {stepper(from, setFrom, 'Recipe serves', `${id}-from`)}
        {stepper(to, setTo, 'You need', `${id}-to`)}
        <Presets
          items={[
            { label: 'Half', key: '0.5' },
            { label: 'Double', key: '2' },
            { label: 'Triple', key: '3' },
          ]}
          onPick={(x) => setTo(String(Math.max(1, Math.round((Number(from) || 1) * Number(x) * 100) / 100)))}
        />
      </div>
      {Number.isFinite(factor) && (
        <p className="inline-flex rounded-full bg-ember-50 px-3 py-1 text-xs font-semibold text-ember-700 dark:bg-char-500 dark:text-ember-200">
          Every amount × {Math.round(factor * 100) / 100}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Ingredients, one per line" htmlFor={`${id}-list`}>
          <textarea
            id={`${id}-list`}
            rows={9}
            value={list}
            onChange={(e) => setList(e.target.value)}
            className="w-full rounded-2xl border border-bone-300 bg-white px-4 py-3 font-mono text-sm leading-7 text-char-500 outline-none focus:border-ember-500 focus:ring-4 focus:ring-ember-500/15 dark:border-char-400 dark:bg-char-500 dark:text-bone-50"
          />
        </Field>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-char-200 dark:text-bone-100">Scaled for {Number(to) || '—'}</p>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(output);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  // Clipboard blocked; the list can still be selected by hand.
                }
              }}
              className="rounded-full bg-ember-500 px-3 py-1 text-xs font-semibold text-white hover:bg-ember-600"
            >
              {copied ? 'Copied' : 'Copy list'}
            </button>
          </div>
          <ul className="min-h-[15.5rem] space-y-0.5 rounded-2xl border border-ember-100 bg-ember-50/60 px-4 py-3 font-mono text-sm leading-7 dark:border-char-400 dark:bg-char-500" aria-live="polite">
            {lines.map((l, i) => (
              <li key={i} className={l.scaled ? 'text-char-500 dark:text-bone-50' : 'text-char-200'}>
                {l.scaled ? (
                  <>
                    {l.lead}
                    <strong className="font-bold text-ember-600 dark:text-ember-200">{l.amount}</strong>
                    {l.text.slice(l.lead.length + l.amount.length)}
                  </>
                ) : (
                  l.text || '\u00a0'
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ToolShell>
  );
}
