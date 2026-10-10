/**
 * RBB Mock Data Store (JavaScript)
 *
 * This file contains the initial mock product catalogue data, dynamic category
 * definitions with 2-letter codes, and deterministic code generator utilities.
 */

export const INITIAL_CATEGORIES = [
  {
    id: 'cat-001',
    name: 'Cookware',
    code: 'CO',
    description: 'Pots, pans, pressure cookers, kadais, and frying pans',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cat-002',
    name: 'Kitchen Storage',
    code: 'KS',
    description: 'Airtight containers, spice boxes, oil dispensers, canisters',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cat-003',
    name: 'Tableware',
    code: 'TW',
    description: 'Plates, thalis, copper glasses, jugs, and cutlery',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cat-004',
    name: 'Serving',
    code: 'SE',
    description: 'Handis, platters, serving spoons, buffet bowls, chafing dishes',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cat-005',
    name: 'Barware & Beverage',
    code: 'BB',
    description: 'Mugs, cocktail shakers, water filters, ice buckets',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cat-006',
    name: 'Kitchen Tools & Accessories',
    code: 'KT',
    description: 'Graters, tongs, strainers, rolling pins, cutters',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z',
  },
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    productName: 'Tri-Ply Stainless Steel Deep Kadai',
    productCode: 'RBB-CO-001',
    category: 'Cookware',
    categoryCode: 'CO',
    subCategory: 'Kadai & Woks',
    brand: 'Vinod Platinum',
    material: 'Stainless Steel',
    sizeOrCapacity: '2.5 Litres (24 cm)',
    specialDetails: 'Induction friendly base, riveted cool-touch cast handles, heavy-gauge 2.5mm tri-ply body.',
    purchasePrice: 1450,
    image1: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
    image2: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    createdAt: '2026-09-28T10:15:00Z',
    updatedAt: '2026-10-01T14:20:00Z',
  },
  {
    id: 'prod-002',
    productName: 'Hard Anodised Pressure Cooker Inner Lid',
    productCode: 'RBB-CO-002',
    category: 'Cookware',
    categoryCode: 'CO',
    subCategory: 'Pressure Cookers',
    brand: 'Hawkins Contura',
    material: 'Aluminium',
    sizeOrCapacity: '3 Litres',
    specialDetails: 'Black hard-anodised 3.25mm body, heat-resistant safety valve, stay-cool ergonomic handle.',
    purchasePrice: 1890,
    image1: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=600&q=80',
    image2: '',
    status: 'stock_alert',
    createdAt: '2026-09-29T11:30:00Z',
    updatedAt: '2026-10-02T09:10:00Z',
  },
  {
    id: 'prod-003',
    productName: 'Hammered Pure Copper Water Dispenser & Jug',
    productCode: 'RBB-TW-001',
    category: 'Tableware',
    categoryCode: 'TW',
    subCategory: 'Water Storage',
    brand: 'Royal Heritage',
    material: 'Copper',
    sizeOrCapacity: '5 Litres + 1.5L Jug',
    specialDetails: 'Handcrafted pure 99% copper, hammered antique finish, anti-bacterial Ayurvedic water storage.',
    purchasePrice: 2850,
    image1: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    image2: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    createdAt: '2026-09-30T14:45:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'prod-004',
    productName: 'Traditional Pure Brass Biryani Handi with Tin Lining (Kalai)',
    productCode: 'RBB-SE-001',
    category: 'Serving',
    categoryCode: 'SE',
    subCategory: 'Traditional Serveware',
    brand: 'Craftsman Guild',
    material: 'Brass',
    sizeOrCapacity: '4 Litres (30 cm)',
    specialDetails: 'Hand-beaten thick brass with traditional food-safe pure tin lining, brass dome lid included.',
    purchasePrice: 3400,
    image1: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
    image2: '',
    status: 'active',
    createdAt: '2026-10-01T08:20:00Z',
    updatedAt: '2026-10-01T08:20:00Z',
  },
  {
    id: 'prod-005',
    productName: 'Airtight Stainless Steel Grain & Spice Canister Set',
    productCode: 'RBB-KS-001',
    category: 'Kitchen Storage',
    categoryCode: 'KS',
    subCategory: 'Canisters & Dabbas',
    brand: 'Pigeon Crest',
    material: 'Stainless Steel',
    sizeOrCapacity: 'Set of 4 (500g, 1kg, 2kg, 3kg)',
    specialDetails: 'Heavy gauge 202 grade SS, silicone seal ring, clear acrylic window lid with clamp latch.',
    purchasePrice: 1120,
    image1: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80',
    image2: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    status: 'stock_alert',
    createdAt: '2026-10-02T16:10:00Z',
    updatedAt: '2026-10-03T10:15:00Z',
  },
  {
    id: 'prod-006',
    productName: 'Heavy Duty Commercial Aluminium Stockpot',
    productCode: 'RBB-CO-003',
    category: 'Cookware',
    categoryCode: 'CO',
    subCategory: 'Commercial Pots',
    brand: 'Prestige Commercial',
    material: 'Aluminium',
    sizeOrCapacity: '15 Litres (36 cm)',
    specialDetails: 'Extra thick 4mm virgin aluminum, dual solid riveted handles, satin finish.',
    purchasePrice: 2200,
    image1: 'https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?auto=format&fit=crop&w=600&q=80',
    image2: '',
    status: 'discontinued',
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-09-25T11:40:00Z',
  },
  {
    id: 'prod-007',
    productName: '7-in-1 Pure Brass Spice Box (Masala Dani) with Glass Lid',
    productCode: 'RBB-KS-002',
    category: 'Kitchen Storage',
    categoryCode: 'KS',
    subCategory: 'Spice Organizers',
    brand: 'Royal Heritage',
    material: 'Brass',
    sizeOrCapacity: '8.5 Inch Diameter (7 cups + spoon)',
    specialDetails: 'Lacquered tarnish-proof brass exterior, airtight glass top, includes brass measuring spoon.',
    purchasePrice: 1750,
    image1: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    image2: '',
    status: 'active',
    createdAt: '2026-10-03T11:00:00Z',
    updatedAt: '2026-10-03T11:00:00Z',
  },
  {
    id: 'prod-008',
    productName: 'Pure Copper Engraved Serving Thali Dinner Set',
    productCode: 'RBB-TW-002',
    category: 'Tableware',
    categoryCode: 'TW',
    subCategory: 'Thali Sets',
    brand: 'Craftsman Guild',
    material: 'Copper',
    sizeOrCapacity: '6-Piece Set (1 Thali, 3 Bowls, 1 Glass, 1 Spoon)',
    specialDetails: 'Laser engraved floral border, pure hammered copper exterior with stainless steel interior lining.',
    purchasePrice: 3200,
    image1: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
    image2: '',
    status: 'active',
    createdAt: '2026-10-03T15:30:00Z',
    updatedAt: '2026-10-03T15:30:00Z',
  },
  {
    id: 'prod-009',
    productName: 'Classic Aluminium Kadhai',
    productCode: 'RBB-CO-004',
    category: 'Cookware',
    categoryCode: 'CO',
    subCategory: 'Kadhai & Deep Frying',
    brand: 'Hawkins Contura',
    material: 'Aluminium',
    sizeOrCapacity: '2.5 Litres (24 cm)',
    specialDetails: 'Heavy gauge pure aluminium body with dual riveted loop handles, ideal for deep frying and curries.',
    purchasePrice: 980,
    image1: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
    image2: '',
    status: 'active',
    createdAt: '2026-10-04T08:00:00Z',
    updatedAt: '2026-10-04T08:00:00Z',
  }
];

export const INITIAL_BRANDS = [
  { id: 'br-1', name: 'Vinod Platinum', origin: 'Mumbai, India', count: 42 },
  { id: 'br-2', name: 'Hawkins Contura', origin: 'Thane, India', count: 38 },
  { id: 'br-3', name: 'Royal Heritage', origin: 'Moradabad, India', count: 35 },
  { id: 'br-4', name: 'Craftsman Guild', origin: 'Jaipur, India', count: 29 },
  { id: 'br-5', name: 'Pigeon Crest', origin: 'Bengaluru, India', count: 32 },
  { id: 'br-6', name: 'Prestige Commercial', origin: 'Chennai, India', count: 26 },
  { id: 'br-7', name: 'Meyer Kitchen', origin: 'International', count: 18 },
  { id: 'br-8', name: 'Stahl Artisan', origin: 'Pune, India', count: 28 },
];

export const INITIAL_MATERIALS = [
  { id: 'mat-1', name: 'Aluminium', description: 'Lightweight, high thermal conductivity, commercial & domestic grade', count: 82 },
  { id: 'mat-2', name: 'Stainless Steel', description: 'Rust-resistant 304 & tri-ply food-grade surgical steel', count: 64 },
  { id: 'mat-3', name: 'Brass', description: 'Traditional heavy alloy (Pital) for slow cooking and aesthetic serveware', count: 31 },
  { id: 'mat-4', name: 'Copper', description: 'Pure hammered metal (Tamba) for wellness water storage and table thalis', count: 18 },
  { id: 'mat-5', name: 'Cast Iron', description: 'Pre-seasoned heavy iron skillets and tawas', count: 34 },
  { id: 'mat-6', name: 'Glass & Ceramic', description: 'Borosilicate storage jars and serving casserole inserts', count: 19 },
];

export const INITIAL_SUBCATEGORIES = [
  'Kadai & Deep Frying',
  'Pressure Cookers',
  'Water Storage & Jugs',
  'Traditional Serveware',
  'Canisters & Dabbas',
  'Commercial Stockpots',
  'Spice Organizers',
  'Thali Sets & Platters',
  'Frying Pans & Skillets',
  'Tawas & Griddles',
];

export const INITIAL_SIZES = [
  '2.5 Litres (24 cm)',
  '3 Litres',
  '5 Litres + 1.5L Jug',
  '4 Litres (30 cm)',
  'Set of 4 (500g, 1kg, 2kg, 3kg)',
  '15 Litres (36 cm)',
  '8.5 Inch Diameter (7 cups + spoon)',
  '6-Piece Set (1 Thali, 3 Bowls, 1 Glass, 1 Spoon)',
  '1.5 Litres (20 cm)',
  '5 Litres (28 cm)',
];

/**
 * Automatically generates a suggested 2-letter unique code from the category name.
 * 
 * Rules:
 * 1. Two or more words:
 *    - First candidate: Initials of first two words (e.g. "Kitchen Storage" -> "KS")
 *    - Second candidate: First 2 letters of first word (e.g. "Kitchen Supplies" -> "KI")
 *    - Third candidate: First letter of word 1 + second letter of word 2 ("KU")
 *    - Fourth candidate: First letter of word 1 + third letter of word 1 ("KT")
 * 2. Single word:
 *    - Compound words (e.g. "Tableware" -> "TW")
 *    - First 2 letters (e.g. "Cookware" -> "CO", "Serving" -> "SE")
 *    - First + third letter (e.g. "Cookware" -> "CK")
 * 3. Fallback:
 *    - Deterministic search over letters ensuring no duplicates.
 */
export function generateSuggestedCategoryCode(name, existingCodes = []) {
  if (!name || typeof name !== 'string') return '';
  const clean = name.trim().toUpperCase().replace(/[^A-Z\s]/g, '');
  if (!clean) return 'CA';

  const words = clean.split(/\s+/).filter(Boolean);
  const existingSet = new Set(existingCodes.map((c) => c.toUpperCase()));

  const candidates = [];

  if (words.length >= 2) {
    // Primary: Initials (Kitchen Storage -> KS)
    candidates.push(words[0][0] + words[1][0]);

    // Secondary: First 2 letters of first word (Kitchen Supplies -> KI)
    if (words[0].length >= 2) {
      candidates.push(words[0].slice(0, 2));
    }

    // Tertiary: First of word 1 + second of word 2
    if (words[1].length >= 2) {
      candidates.push(words[0][0] + words[1][1]);
    }

    // First + 3rd letter of word 1
    if (words[0].length >= 3) {
      candidates.push(words[0][0] + words[0][2]);
    }
  } else {
    const word = words[0] || 'CATEGORY';

    // Compound match: Tableware -> TW
    const compoundMatch = word.match(/^(TABLE|COOK|GLASS|BAKE|SILVER|BRASS|FLAT)(WARE|POT|PAN|DISP)/);
    if (compoundMatch) {
      candidates.push(compoundMatch[1][0] + compoundMatch[2][0]);
    }

    // First two letters: Cookware -> CO, Serving -> SE
    if (word.length >= 2) {
      candidates.push(word.slice(0, 2));
    }

    // First and 3rd letter: Cookware -> CK
    if (word.length >= 3) {
      candidates.push(word[0] + word[2]);
    }

    // First and 4th letter
    if (word.length >= 4) {
      candidates.push(word[0] + word[3]);
    }
  }

  // Return the first candidate that isn't already taken
  for (const candidate of candidates) {
    if (candidate.length === 2 && !existingSet.has(candidate)) {
      return candidate;
    }
  }

  // Systematic deterministic scan across characters of the clean name
  const fullLetters = clean.replace(/\s+/g, '');
  for (let i = 0; i < fullLetters.length; i++) {
    for (let j = i + 1; j < fullLetters.length; j++) {
      const code = fullLetters[i] + fullLetters[j];
      if (!existingSet.has(code)) {
        return code;
      }
    }
  }

  // Fallback: First letter paired with A-Z
  const firstChar = fullLetters[0] || 'C';
  for (let charCode = 65; charCode <= 90; charCode++) {
    const code = firstChar + String.fromCharCode(charCode);
    if (!existingSet.has(code)) {
      return code;
    }
  }

  return 'XX';
}

/**
 * Calculates the next sequential product code for a category.
 * Format: RBB-[CATEGORY_CODE]-[NUMBER] (e.g. RBB-CO-001, RBB-CO-002, RBB-KS-001)
 * 
 * Enforces Rule 7:
 * Deleting a product must NOT cause an old product code to be reused.
 * If RBB-CO-001, RBB-CO-002, RBB-CO-003 exist and RBB-CO-002 is deleted,
 * the next product will be RBB-CO-004.
 */
export function getNextProductCode(categoryCode, products = [], sequenceHistory = {}) {
  if (!categoryCode) return 'RBB-??-001';
  const upperCode = categoryCode.toUpperCase();

  let maxSeq = 0;
  const prefix = `RBB-${upperCode}-`;

  // Scan current products
  for (const p of products) {
    if (p.productCode && p.productCode.startsWith(prefix)) {
      const numPart = p.productCode.slice(prefix.length);
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  }

  // Also verify sequence history to ensure deleted codes are never reused
  if (sequenceHistory && sequenceHistory[upperCode] && sequenceHistory[upperCode] > maxSeq) {
    maxSeq = sequenceHistory[upperCode];
  }

  const nextSeq = maxSeq + 1;
  const paddedNumber = String(nextSeq).padStart(3, '0');
  return `RBB-${upperCode}-${paddedNumber}`;
}

/**
 * Returns summary stats for the dashboard.
 */
export function getCatalogueStats(products = INITIAL_PRODUCTS, categories = INITIAL_CATEGORIES) {
  const stockAlertCount = products.filter((p) => p.status === 'stock_alert').length;
  const discontinuedCount = products.filter((p) => p.status === 'discontinued').length;

  return {
    totalProducts: products.length,
    stockAlert: stockAlertCount,
    discontinued: discontinuedCount,
    categoriesCount: categories.length,
  };
}

/**
 * Dynamic category breakdown calculation from active products list
 */
export function getCategoryDistribution(products = INITIAL_PRODUCTS, categories = INITIAL_CATEGORIES) {
  const total = products.length || 1;
  const colors = [
    'bg-blue-600',
    'bg-sky-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-emerald-500',
    'bg-rose-500',
  ];

  return categories.map((cat, idx) => {
    const count = products.filter(
      (p) => p.category === cat.name || p.categoryCode === cat.code
    ).length;
    const percentage = Number(((count / total) * 100).toFixed(1));
    return {
      name: cat.name,
      code: cat.code,
      count,
      percentage,
      color: colors[idx % colors.length],
    };
  });
}

/**
 * Dynamic material breakdown
 */
export function getMaterialDistribution(products = INITIAL_PRODUCTS) {
  const total = products.length || 1;
  const materials = ['Aluminium', 'Stainless Steel', 'Brass', 'Copper', 'Cast Iron'];
  const colors = {
    Aluminium: 'bg-slate-500',
    'Stainless Steel': 'bg-blue-600',
    Brass: 'bg-amber-500',
    Copper: 'bg-orange-500',
    'Cast Iron': 'bg-stone-600',
  };

  const distribution = materials.map((mat) => {
    const count = products.filter((p) => p.material === mat).length;
    const percentage = Number(((count / total) * 100).toFixed(1));
    return {
      name: mat,
      count,
      percentage,
      color: colors[mat] || 'bg-slate-400',
    };
  });

  return distribution;
}

/**
 * Get recent products sorted by creation date
 */
export function getRecentlyAddedProducts(products = INITIAL_PRODUCTS, limit = 5) {
  return [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}
