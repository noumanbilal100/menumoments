import { Whisk, Olive, Chili, CoffeeBean, Croissant } from './doodles';

const ITEMS = [
  { icon: <Whisk /> as React.ReactNode, text: 'Recipes tested in a real kitchen' },
  { icon: <Chili />, text: 'Weeknight dinners · Cozy baking · Kitchen gear' },
  { icon: <Croissant />, text: 'One good recipe · Every Sunday' },
  { icon: <Olive />, text: 'Honest reviews · No sponsored placements' },
  { icon: <CoffeeBean />, text: 'Menu Moments · The food journal' },
];

/**
 * A slow, editorial ticker that stretches the width of the header.
 * Duplicates its content so the animation loops seamlessly.
 */
export function Marquee() {
  const row = (
    <div className="marquee-track">
      {ITEMS.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-bone-100/90">
          <span aria-hidden className="text-saffron-300">
            {it.icon}
          </span>
          {it.text}
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-char-500 py-2 text-bone-100">
      <div className="marquee">
        <div className="animate-marquee flex">
          {row}
          {row}
        </div>
      </div>
    </div>
  );
}
