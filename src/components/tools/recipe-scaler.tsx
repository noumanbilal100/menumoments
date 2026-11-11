'use client';

import { useId, useState } from 'react';
import { fractionText, parseQuantity } from './format';

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

export function scaleLine(line: string, factor: number): { text: string; scaled: boolean } {
  const m = line.match(LEADING);
  if (!m) return { text: line, scaled: false };
  const first = parseQuantity(m[2]);
  if (!Number.isFinite(first)) return { text: line, scaled: false };
  const second = m[4] ? parseQuantity(m[4]) : NaN;
  const amount = fractionText(first * factor, 0.04) + (Number.isFinite(second) ? `${m[3]}${fractionText(second * factor, 0.04)}` : '');
  const largest = Number.isFinite(second) ? second * factor : first * factor;
  return { text: m[1] + amount + agree(line.slice(m[0].length), largest), scaled: true };
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
  const lines = list.split('\n').map((l) => (Number.isFinite(factor) ? scaleLine(l, factor) : { text: l, scaled: false }));
  const output = lines.map((l) => l.text).join('\n');

  const field =
    'mt-1 w-full rounded-lg border border-bone-200 bg-white px-3 py-2 text-char-500 outline-none focus:border-ember-500 dark:border-char-400 dark:bg-char-600 dark:text-bone-50';
  return (
    <div className="my-8 rounded-2xl border border-bone-200 bg-bone-50 p-5 shadow-card dark:border-char-500 dark:bg-char-500 md:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-500">Recipe scaler</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="w-28">
          <label htmlFor={`${id}-from`} className="block text-xs font-medium text-char-300 dark:text-bone-100">
            Recipe serves
          </label>
          <input id={`${id}-from`} inputMode="numeric" value={from} onChange={(e) => setFrom(e.target.value)} className={`${field} text-lg font-semibold`} />
        </div>
        <div className="w-28">
          <label htmlFor={`${id}-to`} className="block text-xs font-medium text-char-300 dark:text-bone-100">
            You need
          </label>
          <input id={`${id}-to`} inputMode="numeric" value={to} onChange={(e) => setTo(e.target.value)} className={`${field} text-lg font-semibold`} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            ['½×', 0.5],
            ['2×', 2],
            ['3×', 3],
          ].map(([label, x]) => (
            <button
              key={label}
              type="button"
              onClick={() => setTo(String(Math.max(1, Math.round((Number(from) || 1) * Number(x) * 100) / 100)))}
              className="rounded-full border border-bone-200 px-3 py-1 text-xs font-medium text-char-300 hover:border-ember-500 hover:text-ember-500 dark:border-char-400 dark:text-bone-100"
            >
              {label}
            </button>
          ))}
        </div>
        {Number.isFinite(factor) && <p className="text-xs text-char-200">Multiplying every amount by {Math.round(factor * 100) / 100}</p>}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor={`${id}-list`} className="block text-xs font-medium text-char-300 dark:text-bone-100">
            Ingredients, one per line
          </label>
          <textarea id={`${id}-list`} rows={9} value={list} onChange={(e) => setList(e.target.value)} className={`${field} font-mono text-sm`} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-char-300 dark:text-bone-100">Scaled for {Number(to) || '—'}</p>
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
              className="text-xs font-medium text-ember-500 hover:underline"
            >
              {copied ? 'Copied' : 'Copy list'}
            </button>
          </div>
          <ul className="mt-1 min-h-[13.5rem] space-y-1 rounded-lg bg-white px-3 py-2 font-mono text-sm dark:bg-char-600" aria-live="polite">
            {lines.map((l, i) => (
              <li key={i} className={l.scaled ? 'text-char-500 dark:text-bone-50' : 'text-char-200'}>
                {l.text || ' '}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-char-200">
        Lines without a number (a pinch, to taste) stay as they are. Round eggs to whole ones, and check pan size and baking time
        yourself: they don&apos;t scale in a straight line.
      </p>
    </div>
  );
}
