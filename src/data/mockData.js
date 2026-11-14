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

// Production Clean State: Empty initial brands, materials, subcategories, and sizes arrays.
// Real production entries come from Supabase or owner input.
export const INITIAL_BRANDS = [];

export const INITIAL_MATERIALS = [];

export const INITIAL_SUBCATEGORIES = [];

export const INITIAL_SIZES = [];

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

  const existingSet = new Set(
    (Array.isArray(existingCodes) ? existingCodes : [])
      .filter((c) => typeof c === 'string' && c.trim().length > 0)
      .map((c) => c.trim().toUpperCase())
  );

  const clean = name.trim().toUpperCase().replace(/[^A-Z\s]/g, '');
  const words = clean.split(/\s+/).filter(Boolean);
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
  } else if (words.length === 1) {
    const word = words[0];

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
  } else {
    // Non-ASCII (e.g. Hindi) or numeric category names
    candidates.push('CA', 'CT', 'CG', 'CB', 'CC');
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

  // Ultimate fallback: scan A-Z x A-Z for any unused 2-letter code
  for (let i = 65; i <= 90; i++) {
    for (let j = 65; j <= 90; j++) {
      const code = String.fromCharCode(i) + String.fromCharCode(j);
      if (!existingSet.has(code)) {
        return code;
      }
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
 * Shared product status classification helpers.
 * Supports both UI labels ('In Stock', 'Out of Stock', 'Discontinued')
 * and legacy normalized keys ('active', 'stock_alert', 'discontinued').
 */
export function isStockAlertStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();
  return normalized === 'stock_alert' || normalized === 'out of stock' || normalized === 'stock alert';
}

export function isDiscontinuedStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();
  return normalized === 'discontinued';
}

export function isActiveStatus(status) {
  return !isStockAlertStatus(status) && !isDiscontinuedStatus(status);
}

/**
 * Returns summary stats for the dashboard.
 */
export function getCatalogueStats(products = INITIAL_PRODUCTS, categories = INITIAL_CATEGORIES) {
  const stockAlertCount = products.filter((p) => isStockAlertStatus(p.status)).length;
  const discontinuedCount = products.filter((p) => isDiscontinuedStatus(p.status)).length;

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
 * Dynamic material breakdown computed strictly from active materials and products
 */
export function getMaterialDistribution(products = INITIAL_PRODUCTS, materials = INITIAL_MATERIALS) {
  const total = products.length || 1;
  const palette = [
    'bg-blue-600',
    'bg-slate-500',
    'bg-amber-500',
    'bg-orange-500',
    'bg-stone-600',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-emerald-500',
  ];

  const materialNames = [];
  const seen = new Set();

  for (const mat of materials || []) {
    const name = typeof mat === 'string' ? mat : mat?.name;
    const trimmed = name ? name.trim() : '';
    if (trimmed && !seen.has(trimmed.toLowerCase())) {
      seen.add(trimmed.toLowerCase());
      materialNames.push(trimmed);
    }
  }

  for (const p of products || []) {
    const trimmed = p?.material ? String(p.material).trim() : '';
    if (trimmed && !seen.has(trimmed.toLowerCase())) {
      seen.add(trimmed.toLowerCase());
      materialNames.push(trimmed);
    }
  }

  return materialNames.map((matName, idx) => {
    const count = products.filter(
      (p) => String(p.material || '').trim().toLowerCase() === matName.toLowerCase()
    ).length;
    const percentage = Number(((count / total) * 100).toFixed(1));
    return {
      name: matName,
      count,
      percentage,
      color: palette[idx % palette.length],
    };
  });
}

/**
 * Get recent products sorted by creation date
 */
export function getRecentlyAddedProducts(products = INITIAL_PRODUCTS, limit = 5) {
  return [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}
