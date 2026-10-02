/**
 * Products featured on /shop.
 *
 * Each entry is an ASIN plus the copy around it. The affiliate URL is built
 * from the tag at render time, so switching Associates accounts never means
 * editing this file.
 *
 * `image` points at a generated placeholder. Amazon only permits product
 * photography obtained through the Product Advertising API, and that needs
 * three qualifying sales before access is granted — until then these stay as
 * placeholders or get swapped for original photography.
 */

export interface Product {
  asin: string;
  name: string;
  category: string;
  /** Short award line, e.g. "Top Pick". */
  verdict?: string;
  /** One line on who it suits. */
  note?: string;
  image: string;
  /** Slug of the full review this product is drawn from. */
  guide: string;
}

export const AMAZON_TAG = 'nomi06d06-20';

/** Affiliate URL for an ASIN, always on the current tag. */
export function amazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

export const PRODUCTS: Product[] = [
  {
    asin: 'B07FDJMC9Q',
    name: 'Ninja AF101 Air Fryer',
    category: 'Air fryers',
    verdict: 'Top pick',
    note: 'The one we reach for most — fast, compact, easy to clean.',
    image: '/img/products/top-pick-ninja-af101-air-fryer-review.svg',
    guide: 'best-air-fryer-guide-instant-pot-air-fryer-reviews',
  },
  {
    asin: 'B0C33CHG99',
    name: 'COSORI Air Fryer 6QT',
    category: 'Air fryers',
    verdict: 'Best for families',
    note: 'Enough basket for four servings in one go.',
    image: '/img/products/cosori-air-fryer-6qt-review-best-for-large-families.svg',
    guide: 'best-air-fryer-guide-instant-pot-air-fryer-reviews',
  },
  {
    asin: 'B0BWSJVTCJ',
    name: 'Vitamix Professional Series 750',
    category: 'Blenders',
    verdict: 'Top pick',
    note: 'Expensive, and still the one that outlasts everything else.',
    image: '/img/products/our-top-pick-vitamix-professional-series-750-blender.svg',
    guide: 'best-blenders-for-smoothies',
  },
  {
    asin: 'B0855B5Z6F',
    name: 'Ninja Professional Plus with Auto-iQ',
    category: 'Blenders',
    verdict: 'Best value',
    note: 'Handles daily smoothies for a fraction of the price.',
    image: '/img/products/ninja-professional-plus-blender-with-auto-iq.svg',
    guide: 'best-blenders-for-smoothies',
  },
  {
    asin: 'B0000635XA',
    name: 'KitchenAid Artisan 5-Quart Tilt-Head',
    category: 'Stand mixers',
    verdict: 'Top pick',
    note: 'The default for a reason — bread dough included.',
    image: '/img/products/kitchenaid-artisan-series-5-quart-tilt-head-stand-mixer.svg',
    guide: 'best-stand-mixer-for-bread-dough',
  },
  {
    asin: 'B00004SGFW',
    name: 'KitchenAid Classic 4.5-Quart K45SS',
    category: 'Stand mixers',
    verdict: 'Best for beginners',
    note: 'Smaller bowl, lower price, same build.',
    image: '/img/products/kitchenaid-classic-series-4-5-quart-tilt-head-stand-mixer-k4.svg',
    guide: 'best-stand-mixer-for-beginners-top-kitchenaid-cuisinart-reviewed',
  },
  {
    asin: 'B0BPJQS63W',
    name: 'Technivorm Moccamaster KBGV Select',
    category: 'Coffee makers',
    verdict: 'Top pick',
    note: 'Brews at the right temperature, every time.',
    image: '/img/products/technivorm-moccamaster-kbgv-select-juniper.svg',
    guide: 'best-coffee-makers',
  },
  {
    asin: 'B07FDNBSNS',
    name: 'Ninja 12-Cup Programmable CE201',
    category: 'Coffee makers',
    verdict: 'Best budget',
    note: 'A tenth of the price and perfectly good coffee.',
    image: '/img/products/ninja-12-cup-programmable-coffee-maker-ce201-best-budget-alt.svg',
    guide: 'best-coffee-makers',
  },
  {
    asin: 'B071WCB1T6',
    name: 'Toshiba Microwave with Sensor Reheat',
    category: 'Microwaves',
    verdict: 'Top pick',
    note: 'Sensor cooking that actually stops at the right moment.',
    image: '/img/products/toshiba-black-and-stainless-steel-microwave-oven-with-digita.svg',
    guide: 'best-microwaves-top-ovens-reviewed-for-every-kitchen',
  },
  {
    asin: 'B01EIZSF6I',
    name: 'Farberware Stainless Steel Microwave',
    category: 'Microwaves',
    verdict: 'Best compact',
    note: 'Fits under a cabinet without giving up power.',
    image: '/img/products/farberware-stainless-steel-microwave-with-black-front-door-p.svg',
    guide: 'best-microwaves-top-ovens-reviewed-for-every-kitchen',
  },
  {
    asin: 'B01M0TREAM',
    name: 'Chicago Metallic 6-Cup Popover Pan',
    category: 'Bakeware',
    verdict: 'Top pick',
    note: 'Deep wells and a coating that releases cleanly.',
    image: '/img/products/chicago-metallic-professional-6-cup-popover-pan-with-armor-g.svg',
    guide: 'best-popover-pans-bake-perfect-popovers-every-time',
  },
  {
    asin: 'B09557PWKM',
    name: 'Cuisinart AMB-6POP Popover Pan',
    category: 'Bakeware',
    note: 'The affordable pick if popovers are an occasional thing.',
    image: '/img/products/cuisinart-amb-6pop-6-cup-popover-pan.svg',
    guide: 'best-popover-pans-bake-perfect-popovers-every-time',
  },
  {
    asin: 'B0786TJC33',
    name: 'hOmeLabs Beverage Refrigerator, 120-can',
    category: 'Beverage fridges',
    verdict: 'Top pick',
    note: 'Holds a party without taking over the kitchen.',
    image: '/img/products/homelabs-beverage-refrigerator-120-can.svg',
    guide: 'best-beverage-refrigerator',
  },
  {
    asin: 'B0CS2WT2WM',
    name: 'Feelfunn Beverage Cooler, 50-can',
    category: 'Beverage fridges',
    verdict: 'Best small',
    note: 'For an office corner or a narrow gap.',
    image: '/img/products/feelfunn-beverage-refrigerator-cooler-50-can.svg',
    guide: 'best-beverage-refrigerator',
  },
];

export const PRODUCT_CATEGORIES = [...new Set(PRODUCTS.map((p) => p.category))];
