import type { RecipeMeta } from '@/lib/content';
import { Whisk, CoffeeBean, Sparkle, Fork } from './doodles';

const DIET_LABELS: Record<string, string> = {
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  'gluten-free': 'Gluten-free',
  'dairy-free': 'Dairy-free',
  keto: 'Keto',
  'low-carb': 'Low-carb',
  quick: 'Quick',
};

const STAT_ICONS: Record<string, React.ReactNode> = {
  Prep: <Whisk size={18} />,
  Cook: <Fork size={18} />,
  Total: <CoffeeBean size={18} />,
  Serves: <Sparkle size={18} />,
  Difficulty: <Sparkle size={18} />,
};

export function RecipeMetaBar({ recipe }: { recipe: RecipeMeta }) {
  const stats = [
    { label: 'Prep', value: formatMinutes(recipe.prepMinutes) },
    { label: 'Cook', value: formatMinutes(recipe.cookMinutes) },
    { label: 'Total', value: formatMinutes((recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0)) },
    recipe.servings ? { label: 'Serves', value: String(recipe.servings) } : null,
    recipe.difficulty ? { label: 'Difficulty', value: cap(recipe.difficulty) } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <aside
      className="not-prose my-10 overflow-hidden rounded-3xl border border-bone-200 bg-gradient-to-br from-ember-50 via-bone-50 to-bone-100 shadow-card dark:border-char-500 dark:from-char-500 dark:via-char-400 dark:to-char-500"
      aria-label="Recipe details"
    >
      <div className="flex items-center justify-between border-b border-bone-200 bg-bone-100/60 px-6 py-3 dark:border-char-500 dark:bg-char-500/60">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-ember-500">
          <Whisk size={14} /> The recipe at a glance
        </p>
        {recipe.difficulty && (
          <span className="rounded-full bg-ember-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            {cap(recipe.difficulty)}
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-3 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="flex justify-center text-ember-500">{STAT_ICONS[s.label]}</div>
            <dt className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-char-200">
              {s.label}
            </dt>
            <dd className="mt-1 font-display text-2xl leading-tight text-char-500 dark:text-bone-50">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>

      {recipe.diet && recipe.diet.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 border-t border-bone-200 bg-bone-100/50 px-6 py-4 dark:border-char-500 dark:bg-char-500/60">
          {recipe.diet.map((d) => (
            <DietTag key={d} tag={d} />
          ))}
        </div>
      )}
    </aside>
  );
}

export function DietTag({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-moss-100 px-3 py-1 text-xs font-semibold text-moss-500 dark:bg-moss-500/25 dark:text-moss-100">
      <svg width="8" height="8" viewBox="0 0 10 10" aria-hidden="true">
        <circle cx="5" cy="5" r="3" fill="currentColor" />
      </svg>
      {DIET_LABELS[tag] ?? tag}
    </span>
  );
}

function formatMinutes(m?: number): string {
  if (!m) return '—';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
