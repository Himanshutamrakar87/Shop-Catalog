/**
 * RBB Mock Data Store (JavaScript)
 *
 * This file contains the initial mock product catalogue data, dynamic category
 * definitions with 2-letter codes, and deterministic code generator utilities.
 */

// Production Clean State: Empty initial categories array.
// Real production categories are created by the owner.
export const INITIAL_CATEGORIES = [];

// Production Clean State: Empty initial products array.
// Real production products are created post-deployment.
export const INITIAL_PRODUCTS = [];

export const INITIAL_BRANDS = [
  { id: 'br-1', name: 'Vinod Platinum', origin: 'Mumbai, India', count: 0 },
  { id: 'br-2', name: 'Hawkins Contura', origin: 'Thane, India', count: 0 },
  { id: 'br-3', name: 'Royal Heritage', origin: 'Moradabad, India', count: 0 },
  { id: 'br-4', name: 'Craftsman Guild', origin: 'Jaipur, India', count: 0 },
  { id: 'br-5', name: 'Pigeon Crest', origin: 'Bengaluru, India', count: 0 },
  { id: 'br-6', name: 'Prestige Commercial', origin: 'Chennai, India', count: 0 },
  { id: 'br-7', name: 'Meyer Kitchen', origin: 'International', count: 0 },
  { id: 'br-8', name: 'Stahl Artisan', origin: 'Pune, India', count: 0 },
];

export const INITIAL_MATERIALS = [
  { id: 'mat-1', name: 'Aluminium', description: 'Lightweight, high thermal conductivity, commercial & domestic grade', count: 0 },
  { id: 'mat-2', name: 'Stainless Steel', description: 'Rust-resistant 304 & tri-ply food-grade surgical steel', count: 0 },
  { id: 'mat-3', name: 'Brass', description: 'Traditional heavy alloy (Pital) for slow cooking and aesthetic serveware', count: 0 },
  { id: 'mat-4', name: 'Copper', description: 'Pure hammered metal (Tamba) for wellness water storage and table thalis', count: 0 },
  { id: 'mat-5', name: 'Cast Iron', description: 'Pre-seasoned heavy iron skillets and tawas', count: 0 },
  { id: 'mat-6', name: 'Glass & Ceramic', description: 'Borosilicate storage jars and serving casserole inserts', count: 0 },
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
