import type { ComponentType } from 'react';
import { ButterConverter } from './tools/butter-converter';
import { CupsGramsConverter } from './tools/cups-grams-converter';
import { MeatTemperature } from './tools/meat-temperature';
import { OvenTemperature } from './tools/oven-temperature';
import { RecipeScaler } from './tools/recipe-scaler';

/**
 * An article's HTML, with interactive tools placed where the text asks for
 * them: `<div data-mm-tool="butter-converter"></div>` in a post becomes the
 * live converter. The text around a tool stays plain HTML, so search engines
 * read the article as before.
 */
export const TOOLS: Record<string, ComponentType> = {
  'butter-converter': ButterConverter,
  'cups-grams-converter': CupsGramsConverter,
  'meat-temperature': MeatTemperature,
  'oven-temperature': OvenTemperature,
  'recipe-scaler': RecipeScaler,
};

const MARKER = /<div\b[^>]*\bdata-mm-tool=["']([a-z0-9-]+)["'][^>]*>\s*<\/div>/gi;

export function ArticleBody({ html, className = 'prose-article' }: { html: string; className?: string }) {
  const parts: ({ kind: 'html'; html: string } | { kind: 'tool'; name: string })[] = [];
  let last = 0;
  for (const m of html.matchAll(MARKER)) {
    const at = m.index ?? 0;
    parts.push({ kind: 'html', html: html.slice(last, at) });
    parts.push({ kind: 'tool', name: m[1] });
    last = at + m[0].length;
  }
  parts.push({ kind: 'html', html: html.slice(last) });

  if (parts.length === 1) return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  return (
    <>
      {parts.map((part, i) => {
        if (part.kind === 'html') {
          return part.html.trim() ? <div key={i} className={className} dangerouslySetInnerHTML={{ __html: part.html }} /> : null;
        }
        const Tool = TOOLS[part.name];
        return Tool ? <Tool key={i} /> : null;
      })}
    </>
  );
}
