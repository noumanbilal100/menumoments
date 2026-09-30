import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { SITE } from '@/lib/env';

export const metadata: Metadata = {
  title: 'About',
  description: `Meet the people behind ${SITE.name} — a food and kitchen magazine for real home cooks.`,
};

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title={`Made for people who like to cook — and eat.`}
      lede={`${SITE.name} is a food, gear and lifestyle magazine for home cooks. We publish recipes we've actually eaten, guides to the tools we actually own, and honest takes on the food we love (and the food we don't).`}
    >
      <h2>What we cover</h2>
      <p>
        We spend our time in five places: at the stove, in the pantry, in the appliance aisle, at
        the table, and out to eat. Everything we publish belongs to one of those.
      </p>
      <ul>
        <li>
          <strong>Recipes.</strong> Weeknight dinners, weekend baking, holiday sides and everything
          between. <Link href="/category/recipes">Browse recipes →</Link>
        </li>
        <li>
          <strong>Kitchen tips.</strong> Technique, cleaning, organisation — the small changes that
          make cooking easier. <Link href="/category/cooking-tips">Read the tips →</Link>
        </li>
        <li>
          <strong>Gear.</strong> Cookware, bakeware, appliances and gadgets. We buy them, use them,
          and only recommend the ones that earn a place in the kitchen.{' '}
          <Link href="/category/kitchen-appliances">See gear guides →</Link>
        </li>
        <li>
          <strong>Reviews.</strong> Restaurant menus, happy hours and daily specials — the food you
          eat when you're not cooking. <Link href="/category/food-reviews">Read reviews →</Link>
        </li>
      </ul>

      <h2>How we work</h2>
      <p>
        Every recipe is tested. Every product recommendation comes from hands-on use. When a piece
        contains affiliate links, we say so — and we only link products we'd tell a friend to buy.
      </p>

      <h2>Who runs this place</h2>
      <p>
        {SITE.author} founded {SITE.name} to make good food less intimidating and good kitchen tools
        easier to find. The site is written by a small editorial team of home cooks, recipe testers
        and former restaurant staff.
      </p>
      <p>
        Want to work with us?{' '}
        <Link href="/write-for-us">See our contributor guidelines</Link> or{' '}
        <Link href="/contact">get in touch</Link>.
      </p>
    </PageShell>
  );
}
