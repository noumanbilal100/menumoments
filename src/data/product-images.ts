/**
 * Product photos for the buying-guide posts, keyed by ASIN.
 *
 * The migrated guides still point at generated SVG placeholders. At render
 * time any placeholder sitting inside a link to one of these ASINs (or in the
 * same table row) is swapped for the photo below, so the content JSON stays
 * untouched. ASINs whose links are dead or point at the wrong product are
 * left out on purpose and keep their placeholder until the link is fixed.
 *
 * Same constraint as src/data/products.ts: these are Amazon CDN images, which
 * the Associates agreement only permits via the Product Advertising API.
 */
export const PRODUCT_IMAGES: Record<string, string> = {
  B07FDJMC9Q: 'https://m.media-amazon.com/images/I/71+8uTMDRFL._AC_SL1500_.jpg', // Ninja AF101 Air Fryer, 4 Qt Capacity, 4-in-1 Crisp, Roast, R
  B0C33CHG99: 'https://m.media-amazon.com/images/I/81R9sA3IyBL._AC_SL1500_.jpg', // Cosori TurboBlaze Air Fryer, 9-in-1, 6 Qt, PFAS-Free Ceramic
  B07VHFMZHJ: 'https://m.media-amazon.com/images/I/71GPWtT61gL._AC_SL1500_.jpg', // Instant Pot VORTEX Plus 6QT XL Air Fryer, 6-in-1 Air Fryer, 
  B07G3V9K17: 'https://m.media-amazon.com/images/I/51gck0ednrL._AC_SL1023_.jpg', // Philips Premium Airfryer XXL, Fat Removal Technology, 3lb/7q
  B077W6TX88: 'https://m.media-amazon.com/images/I/715xv7PPZ2L._AC_SL1500_.jpg', // Dash Compact Air Fryer - Healthy Cooking with Auto Shut-Off 
  B0786TJC33: 'https://m.media-amazon.com/images/I/71G-itWi-HL._AC_SL1500_.jpg', // hOmeLabs Beverage Refrigerator and Cooler, 120 Cans Capacity
  B0CS2WT2WM: 'https://m.media-amazon.com/images/I/81mOfKq9SCL._AC_SL1500_.jpg', // Feelfunn 50 Can Beverage Refrigerator, 1.3CuFt Mini Fridge w
  B0D6R78TYF: 'https://m.media-amazon.com/images/I/81JcIAHC3tL._AC_SL1500_.jpg', // Ca'Lefort 24 Beverage Fridge Under Counter, 180 Can Beverage
  B00P7QI4IM: 'https://m.media-amazon.com/images/I/81Ep5pYDu8L._AC_SL1500_.jpg', // Whynter Beverage Fridge, 127 Can, Glass Door, BR-130SB
  B0BWSJVTCJ: 'https://m.media-amazon.com/images/I/71vZk6aXveL._AC_SL1500_.jpg', // Vitamix Propel Series 750 Professional-Grade Blender, 4 Prog
  B0855B5Z6F: 'https://m.media-amazon.com/images/I/71RbmccXCUL._AC_SL1500_.jpg', // Ninja Professional Plus Blender, Auto-iQ, 1400W, 72oz Pitche
  B0BZK4TZJ2: 'https://m.media-amazon.com/images/I/41J8iw-NxzL._AC_SL1000_.jpg', // NutriBullet Special Edition NutriBullet Pro 900 - Watt Blend
  B07GJ24VXV: 'https://m.media-amazon.com/images/I/51mP5MKHIBL._AC_SL1080_.jpg', // Breville BBL620SIL Fresh and Furious Blender for Kitchens, S
  B000GIGZXM: 'https://m.media-amazon.com/images/I/61fMVeuyoeL._AC_SL1500_.jpg', // Blendtec Total Blender Classic (Black) & 75oz* FourSide Jar
  B0081PTLGU: 'https://m.media-amazon.com/images/I/71yPPaI6PgL._AC_SL1500_.jpg', // Hamilton Beach Wave Crusher Blender For Smoothies With 40 Oz
  B00XHXN54K: 'https://m.media-amazon.com/images/I/719Tg+tMdlL._AC_SL1500_.jpg', // Oster Pro 1200 Smoothie Blender with Glass Jar & 24oz To-Go 
  B0BPJQS63W: 'https://m.media-amazon.com/images/I/51gZg9CToFL._AC_SL1000_.jpg', // Technivorm Moccamaster 53923 KBGV Select 10-Cup Coffee Maker
  B07FDNBSNS: 'https://m.media-amazon.com/images/I/71PhMMe2PUL._AC_SL1500_.jpg', // Ninja 12-Cup Programmable Coffee Maker with Classic and Rich
  B0B1LB7Z99: 'https://m.media-amazon.com/images/I/71XAzIlBd2L._AC_SL1500_.jpg', // Ninja 14 Cup , Programmable Coffee Maker XL Pro with Permane
  B093DYPBYR: 'https://m.media-amazon.com/images/I/713zbtG35lL._AC_SL1500_.jpg', // Technivorm Moccamaster 53941 KBGV Select 10-Cup Coffee Maker
  B0768NNG4X: 'https://m.media-amazon.com/images/I/818rz3CIaFL._AC_SL1500_.jpg', // Hamilton Beach FlexBrew Trio 2-Way Coffee Maker, Compatible 
  B071WCB1T6: 'https://m.media-amazon.com/images/I/61moUe+FENL._AC_SL1500_.jpg', // TOSHIBA Countertop Microwave Oven, 1.2 Cu.Ft, 1000W, Black
  B01EIZSF6I: 'https://m.media-amazon.com/images/I/81TZMVXxBxL._AC_SL1500_.jpg', // Farberware 1.1 Cu. Ft. Countertop Microwave Oven – 1000 Watt
  B0C6NHVT5F: 'https://m.media-amazon.com/images/I/71aIpRuaU1L._AC_SL1500_.jpg', // Chefman Countertop Microwave Oven 1.1 Cu. Ft. Digital Stainl
  B07HGH1KG6: 'https://m.media-amazon.com/images/I/81gP22+jCVL._AC_SL1500_.jpg', // BLACK+DECKER Countertop Microwave Oven, 0.7 Cu.Ft, 700W, Sta
  B00BGTOHJO: 'https://m.media-amazon.com/images/I/71ciLJ4ftEL._AC_SL1500_.jpg', // Commercial Chef 0.7 Cu. Ft. Countertop Microwave Oven, CHM77
  B09S3XQQB4: 'https://m.media-amazon.com/images/I/71SdtHWfgDL._AC_SL1500_.jpg', // Nostalgia Countertop Microwave Oven with Easy Clean Interior
  B07HG9Y3VL: 'https://m.media-amazon.com/images/I/81A66Mk8+lL._AC_SL1500_.jpg', // BLACK+DECKER Microwave Oven Countertop, 1.1 Cu.Ft, 1000W, St
  B07VS476X8: 'https://m.media-amazon.com/images/I/71QwlJV-ToL._AC_SL1500_.jpg', // Farberware 0.7 Cu. Ft. Countertop Microwave Oven – 700 Watts
  B0DC8FRZZ5: 'https://m.media-amazon.com/images/I/61H38OPrpFL._AC_SL1500_.jpg', // Chefman Countertop Microwave Oven 0.9 Cu. Ft., 900 Watts wit
  B01M0TREAM: 'https://m.media-amazon.com/images/I/5154Vebi-TL._AC_SL1500_.jpg', // Chicago Metallic Professional 6-Cup Popover Pan with Armor-G
  B09557PWKM: 'https://m.media-amazon.com/images/I/518eXaKN7iL._AC_SL1024_.jpg', // Cuisinart AMB-6POP 6 Cup Popover Pan
  B00WX9KKTW: 'https://m.media-amazon.com/images/I/613HmVaeylL._AC_SL1500_.jpg', // Epica Bellemain Popover Pan, Nonstick Baking Pan for Perfect
  B0BHSZX927: 'https://m.media-amazon.com/images/I/71h7dM2aipL._AC_SL1500_.jpg', // Shellwei 2 Pcs 12 Cups Nonstick Popover Pan Muffin Cupcake P
  B0000VLYT0: 'https://m.media-amazon.com/images/I/91OnY9BSNYL._AC_SL1500_.jpg', // Norpro Nonstick Mini Popover Pan, 12 Count
  B008DS0UDI: 'https://m.media-amazon.com/images/I/81vBkneoHNL._AC_SL1500_.jpg', // USA Pans 6-Well Popover Pan
  B0000635XA: 'https://m.media-amazon.com/images/I/71dwD1MdoSL._AC_SL1500_.jpg', // KitchenAid Artisan, 5-Qt Tilt Head Stand Mixer, KSM150PS, Pi
  B0CRR325DW: 'https://m.media-amazon.com/images/I/51RHD5dXIYL._AC_SL1001_.jpg', // KitchenAid Classic Series 4.5 Quart Tilt-Head Stand Mixer K4
  B0758BQPY8: 'https://m.media-amazon.com/images/I/71-upEiDFZL._AC_SL1500_.jpg', // Hamilton Beach 4 Qt Electric Stand Mixer With 7 Speeds, Easy
  B09FZG6M9T: 'https://m.media-amazon.com/images/I/612uNe0+pdL._AC_SL1000_.jpg', // Cuisinart SM-50 Precision Master 5.5-Quart Stand Mixer White
  B0C59MGW5J: 'https://m.media-amazon.com/images/I/71DO8DZvK4L._AC_SL1500_.jpg', // KitchenAid Artisan, 5-Qt Tilt Head Stand Mixer, KSM150PS, Po
  B00004SGFW: 'https://m.media-amazon.com/images/I/51jpWoprCvL._AC_SL1280_.jpg', // KitchenAid Classic Series 4.5 Quart Tilt-Head Stand Mixer K4
  B0CJCKHQGK: 'https://m.media-amazon.com/images/I/61bZke6ZsJL._AC_SL1500_.jpg', // Bosch Universal Plus Stand Mixer 500 Watt, 6.5 Quarts with W
  B09HDT27F3: 'https://m.media-amazon.com/images/I/61m7KnZenWL._AC_SL1500_.jpg', // Cuisinart SMD-50CRM Precision Pro 5.5-Quart Digital Stand Mi
  B01LXC4JPJ: 'https://m.media-amazon.com/images/I/71BtySVK6kL._AC_SL1500_.jpg', // Cuisinart Stand Mixer, 12 Speed, 5.5 Quart Stainless Steel B
  B0G4731TLT: 'https://m.media-amazon.com/images/I/71Lpd5ceFDL._AC_SL1500_.jpg', // KUCCU Stand Mixer, 6.5 Qt 660W, 6-Speed Tilt-Head Food Dough
  B00005UP2L: 'https://m.media-amazon.com/images/I/71+lgOjOMtL._AC_SL1500_.jpg', // KitchenAid Artisan, 5-Qt Tilt Head Stand Mixer, KSM150PS, On
};
