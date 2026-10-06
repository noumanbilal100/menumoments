/**
 * Products featured on /best-kitchen-gear (the shop page).
 *
 * Each entry is an ASIN plus the copy around it. The affiliate URL is built
 * from the tag at render time, so switching Associates accounts never means
 * editing this file.
 *
 * `image` is the product's main photo on Amazon's CDN (m.media-amazon.com,
 * allowed in next.config.mjs). The Associates agreement only permits images
 * obtained through the Product Advertising API, so swap these for API images
 * once that access opens.
 */

export interface Product {
  asin: string;
  name: string;
  category: string;
  /** Short award line, e.g. "Top Pick". */
  verdict?: string;
  /** One line on who it suits. */
  note?: string;
  /** Two or three sentences of review copy, shown in in-article blocks. */
  review?: string;
  /** Three short spec chips, e.g. "1.2 cu ft". */
  highlights?: string[];
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
    image: 'https://m.media-amazon.com/images/I/71+8uTMDRFL._AC_SL1500_.jpg',
    guide: 'best-air-fryer-guide-instant-pot-air-fryer-reviews',
  },
  {
    asin: 'B0C33CHG99',
    name: 'COSORI Air Fryer 6QT',
    category: 'Air fryers',
    verdict: 'Best for families',
    note: 'Enough basket for four servings in one go.',
    image: 'https://m.media-amazon.com/images/I/81R9sA3IyBL._AC_SL1500_.jpg',
    guide: 'best-air-fryer-guide-instant-pot-air-fryer-reviews',
  },
  {
    asin: 'B0BWSJVTCJ',
    name: 'Vitamix Propel Series 750',
    category: 'Blenders',
    verdict: 'Top pick',
    note: 'Expensive, and still the one that outlasts everything else.',
    image: 'https://m.media-amazon.com/images/I/71vZk6aXveL._AC_SL1500_.jpg',
    guide: 'best-blenders-for-smoothies',
  },
  {
    asin: 'B0855B5Z6F',
    name: 'Ninja Professional Plus with Auto-iQ',
    category: 'Blenders',
    verdict: 'Best value',
    note: 'Handles daily smoothies for a fraction of the price.',
    image: 'https://m.media-amazon.com/images/I/71RbmccXCUL._AC_SL1500_.jpg',
    guide: 'best-blenders-for-smoothies',
  },
  {
    asin: 'B0000635XA',
    name: 'KitchenAid Artisan 5-Quart Tilt-Head',
    category: 'Stand mixers',
    verdict: 'Top pick',
    note: 'The default for a reason — bread dough included.',
    image: 'https://m.media-amazon.com/images/I/71dwD1MdoSL._AC_SL1500_.jpg',
    guide: 'best-stand-mixer-for-bread-dough',
  },
  {
    asin: 'B00004SGFW',
    name: 'KitchenAid Classic 4.5-Quart K45SS',
    category: 'Stand mixers',
    verdict: 'Best for beginners',
    note: 'Smaller bowl, lower price, same build.',
    image: 'https://m.media-amazon.com/images/I/51jpWoprCvL._AC_SL1280_.jpg',
    guide: 'best-stand-mixer-for-beginners-top-kitchenaid-cuisinart-reviewed',
  },
  {
    asin: 'B0BPJQS63W',
    name: 'Technivorm Moccamaster KBGV Select',
    category: 'Coffee makers',
    verdict: 'Top pick',
    note: 'Brews at the right temperature, every time.',
    image: 'https://m.media-amazon.com/images/I/51gZg9CToFL._AC_SL1000_.jpg',
    guide: 'best-coffee-makers',
  },
  {
    asin: 'B07FDNBSNS',
    name: 'Ninja 12-Cup Programmable CE201',
    category: 'Coffee makers',
    verdict: 'Best budget',
    note: 'A tenth of the price and perfectly good coffee.',
    image: 'https://m.media-amazon.com/images/I/71PhMMe2PUL._AC_SL1500_.jpg',
    guide: 'best-coffee-makers',
  },
  {
    asin: 'B071WCB1T6',
    name: 'Toshiba EM131A5C-BS 1.2 Cu. Ft. Countertop Microwave',
    category: 'Microwaves',
    verdict: 'Best overall',
    note: 'Sensor cooking that actually stops at the right moment.',
    review:
      'A full-size 1.2 cu ft cavity with sensor reheat that adjusts the time to the food, so leftovers do not need guesswork. It is roomy enough for a dinner plate or a glass meal-prep container — exactly what you want once the food is out of the foam box.',
    highlights: ['1.2 cu ft', '1,100 W', 'Sensor cooking'],
    image: 'https://m.media-amazon.com/images/I/61moUe+FENL._AC_SL1500_.jpg',
    guide: 'best-microwaves-top-ovens-reviewed-for-every-kitchen',
  },
  {
    asin: 'B01EIZSF6I',
    name: 'Farberware 1.1 Cu. Ft. 1000W Microwave',
    category: 'Microwaves',
    verdict: 'Best compact',
    note: 'Fits under a cabinet without giving up power.',
    image: 'https://m.media-amazon.com/images/I/81TZMVXxBxL._AC_SL1500_.jpg',
    guide: 'best-microwaves-top-ovens-reviewed-for-every-kitchen',
  },
  {
    asin: 'B07HGH1KG6',
    name: 'BLACK+DECKER EM720CB7 0.7 Cu. Ft. Microwave',
    category: 'Microwaves',
    verdict: 'Best budget',
    note: 'Everything a reheat needs, for the least money.',
    review:
      'If all you ask of a microwave is to warm up takeout and last night’s dinner, this does it without the extras you would pay for elsewhere. The 0.7 cu ft cavity takes a standard plate or bowl, and the simple controls make it an easy first microwave.',
    highlights: ['0.7 cu ft', '700 W', 'Simple controls'],
    image: 'https://m.media-amazon.com/images/I/81gP22+jCVL._AC_SL1500_.jpg',
    guide: 'can-you-microwave-styrofoam',
  },
  {
    asin: 'B07GV36BLD',
    name: "COMFEE' 0.7 Cu. Ft. Countertop Microwave",
    category: 'Microwaves',
    verdict: 'Best for small spaces',
    note: 'Fits the dorm, the office, the studio.',
    review:
      'Small kitchens are where this one earns its place: a compact body that slides onto a narrow counter or a shelf, with a cavity that still fits a lunch container or a bowl of soup. Pair it with a glass container and it handles daily reheating without taking over the room.',
    highlights: ['0.7 cu ft', 'Compact footprint', 'Countertop'],
    image: 'https://m.media-amazon.com/images/I/71I1kb2hSlL._AC_SL1500_.jpg',
    guide: 'can-you-microwave-styrofoam',
  },
  {
    asin: 'B07TM72TFX',
    name: 'Farberware 1.6 Cu. Ft. 1100W Countertop Microwave',
    category: 'Microwaves',
    verdict: 'Best large capacity',
    note: 'Room for the big glass dish.',
    review:
      'At 1.6 cu ft this is the one for family-size portions: a wide cavity that takes a large casserole dish or a big bowl you have moved a whole takeout order into. The 1,100 watts keep bigger portions from taking forever to heat through.',
    highlights: ['1.6 cu ft', '1,100 W', 'Family size'],
    image: 'https://m.media-amazon.com/images/I/71HliewcilL._AC_SL1500_.jpg',
    guide: 'can-you-microwave-styrofoam',
  },
  {
    asin: 'B01DEWZUG4',
    name: 'Panasonic NN-SN686S 1.2 Cu. Ft. 1200W Inverter Microwave',
    category: 'Microwaves',
    verdict: 'Best inverter',
    note: 'Even heat instead of hot edges and a cold middle.',
    review:
      'A conventional microwave cycles full power on and off to fake a lower setting; an inverter delivers steady power instead. For reheating that means fewer rubbery edges and cold centres, which is the main complaint with leftovers and takeout. It is the pick if you reheat more than you cook.',
    highlights: ['1.2 cu ft', '1,200 W', 'Inverter'],
    image: 'https://m.media-amazon.com/images/I/51UhO1pK-5L._AC_SL1500_.jpg',
    guide: 'can-you-microwave-styrofoam',
  },
  {
    asin: 'B01M0TREAM',
    name: 'Chicago Metallic 6-Cup Popover Pan',
    category: 'Bakeware',
    verdict: 'Top pick',
    note: 'Deep wells and a coating that releases cleanly.',
    image: 'https://m.media-amazon.com/images/I/5154Vebi-TL._AC_SL1500_.jpg',
    guide: 'best-popover-pans-bake-perfect-popovers-every-time',
  },
  {
    asin: 'B09557PWKM',
    name: 'Cuisinart AMB-6POP Popover Pan',
    category: 'Bakeware',
    note: 'The affordable pick if popovers are an occasional thing.',
    image: 'https://m.media-amazon.com/images/I/518eXaKN7iL._AC_SL1024_.jpg',
    guide: 'best-popover-pans-bake-perfect-popovers-every-time',
  },
  {
    asin: 'B0786TJC33',
    name: 'hOmeLabs Beverage Refrigerator, 120-can',
    category: 'Beverage fridges',
    verdict: 'Top pick',
    note: 'Holds a party without taking over the kitchen.',
    image: 'https://m.media-amazon.com/images/I/71G-itWi-HL._AC_SL1500_.jpg',
    guide: 'best-beverage-refrigerator',
  },
  {
    asin: 'B0CS2WT2WM',
    name: 'Feelfunn Beverage Cooler, 50-can',
    category: 'Beverage fridges',
    verdict: 'Best small',
    note: 'For an office corner or a narrow gap.',
    image: 'https://m.media-amazon.com/images/I/81mOfKq9SCL._AC_SL1500_.jpg',
    guide: 'best-beverage-refrigerator',
  },
  {
    asin: 'B07FCZSC41',
    name: 'Etekcity Digital Kitchen Scale',
    category: 'Measuring & prep',
    verdict: 'Top pick',
    note: 'Grams straight off the dial — no stick-to-cup maths at all.',
    image: 'https://m.media-amazon.com/images/I/71h1DcDREBL._AC_SL1500_.jpg',
    guide: 'butter-conversion-how-many-sticks-in-1-cup-measure-butter-in-grams',
  },
  {
    asin: 'B00M2J7PCI',
    name: 'Pyrex Glass Measuring Cups, 3-Piece',
    category: 'Measuring & prep',
    note: 'The set that outlives everything else in the drawer.',
    image: 'https://m.media-amazon.com/images/I/71ygLu2o0OL._AC_SL1500_.jpg',
    guide: 'butter-conversion-how-many-sticks-in-1-cup-measure-butter-in-grams',
  },
  {
    asin: 'B09SG1M7R2',
    name: 'TILUCK Stainless Measuring Cups',
    category: 'Measuring & prep',
    note: 'Nesting, stackable, and they do not bend.',
    image: 'https://m.media-amazon.com/images/I/61SCxMDBPcL._AC_SL1500_.jpg',
    guide: 'butter-conversion-how-many-sticks-in-1-cup-measure-butter-in-grams',
  },
  {
    asin: 'B0FLJMCN5H',
    name: 'KITCHENDAO Airtight Butter Dish',
    category: 'Measuring & prep',
    note: 'One-handed lid, and it keeps a stick usably soft.',
    image: 'https://m.media-amazon.com/images/I/61IlOnxWh2L._AC_SL1500_.jpg',
    guide: 'butter-conversion-how-many-sticks-in-1-cup-measure-butter-in-grams',
  },
  {
    asin: 'B0CHGFG64S',
    name: 'ChefAide Silicone Spatula Set',
    category: 'Measuring & prep',
    note: 'Gets the last of the butter out of the cup.',
    image: 'https://m.media-amazon.com/images/I/51hm8-fJJkL._AC_SL1500_.jpg',
    guide: 'butter-conversion-how-many-sticks-in-1-cup-measure-butter-in-grams',
  },
];

export const PRODUCT_CATEGORIES = [...new Set(PRODUCTS.map((p) => p.category))];
