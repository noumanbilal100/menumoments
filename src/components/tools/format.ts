/**
 * Kitchen-friendly numbers for the tools: whole numbers with ¼, ⅓, ½, ⅔ and ¾,
 * or two decimals when no common fraction is close.
 */
const FRACTIONS: [number, string][] = [
  [0, ''],
  [1 / 8, '⅛'],
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [3 / 8, '⅜'],
  [0.5, '½'],
  [5 / 8, '⅝'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
  [7 / 8, '⅞'],
  [1, ''],
];

export function fractionText(value: number, tolerance = 0.02): string {
  if (!Number.isFinite(value) || value < 0) return '—';
  if (value >= 20) return String(Math.round(value));
  const whole = Math.floor(value + 1e-9);
  const frac = value - whole;
  for (const [f, glyph] of FRACTIONS) {
    if (Math.abs(frac - f) < tolerance) {
      const w = f === 1 ? whole + 1 : whole;
      if (!glyph) return String(w);
      return w ? `${w}${glyph}` : glyph;
    }
  }
  return String(Math.round(value * 100) / 100);
}

/** "½", "1½", "1 1/2", "3/4", "2.5" or "2" → a number; NaN when it isn't one. */
export function parseQuantity(text: string): number {
  const glyphs: Record<string, number> = { '½': 0.5, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 0.25, '¾': 0.75, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875 };
  const t = text.trim();
  const m = t.match(/^(\d+(?:\.\d+)?)?\s*(?:([½⅓⅔¼¾⅛⅜⅝⅞])|(\d+)\/(\d+))?$/);
  if (!m || (!m[1] && !m[2] && !m[3])) return NaN;
  let v = m[1] ? Number(m[1]) : 0;
  if (m[2]) v += glyphs[m[2]];
  if (m[3] && m[4]) {
    if (m[1] && !t.includes(' ')) return NaN;
    v = m[1] ? Number(m[1]) + Number(m[3]) / Number(m[4]) : Number(m[3]) / Number(m[4]);
  }
  return v;
}
