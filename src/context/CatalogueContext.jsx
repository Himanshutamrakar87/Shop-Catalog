import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_BRANDS,
  INITIAL_MATERIALS,
  INITIAL_SUBCATEGORIES,
  INITIAL_SIZES,
  generateSuggestedCategoryCode,
  getNextProductCode,
  getCatalogueStats,
  getCategoryDistribution,
  getMaterialDistribution,
  getRecentlyAddedProducts
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getOwnerAuthStatus,
  getOptimisticOwnerStatus,
  isOwnerSignInInFlight,
  invalidateOwnerAuthCache,
  signOutOwner,
  enrichProductsWithLookups,
  createProductInSupabase,
  updateProductInSupabase,
  peekNextDbProductCode,
  ensureCategoryInDb,
  createCategoryInDb,
  updateCategoryInDb,
  deleteCategoryInDb,
  ensureBrandInDb,
  ensureMaterialInDb,
  ensureSubCategoryInDb,
  ensureSizeInDb,
  fetchPublicProducts,
  fetchPublicCategories,
  fetchPublicBrands,
  fetchPublicMaterials,
  fetchPublicSubCategories,
  fetchPublicSizes
} from '../lib/supabaseService';

const CatalogueContext = createContext(null);

const STORAGE_KEYS = {
  CATEGORIES: 'rbb_catalogue_categories_v1',
  PRODUCTS: 'rbb_catalogue_products_v1',
  SEQUENCES: 'rbb_category_sequences_v1',
  BRANDS: 'rbb_catalogue_brands_v1',
  MATERIALS: 'rbb_catalogue_materials_v1',
  SUBCATEGORIES: 'rbb_catalogue_subcategories_v1',
  SIZES: 'rbb_catalogue_sizes_v1'
};

const LEGACY_RAW_BRAND_IDS = new Set(['br-1', 'br-2', 'br-3', 'br-4', 'br-5', 'br-6', 'br-7', 'br-8']);
const LEGACY_RAW_BRAND_NAMES = new Set([
  'vinod platinum',
  'hawkins contura',
  'royal heritage',
  'craftsman guild',
  'pigeon crest',
  'prestige commercial',
  'meyer kitchen',
  'stahl artisan'
]);

const LEGACY_RAW_MATERIAL_IDS = new Set(['mat-1', 'mat-2', 'mat-3', 'mat-4', 'mat-5', 'mat-6']);
const LEGACY_RAW_MATERIAL_NAMES = new Set([
  'aluminium',
  'stainless steel',
  'brass',
  'copper',
  'cast iron',
  'glass & ceramic'
]);

const LEGACY_RAW_SUBCATEGORIES = new Set([
  'kadai & deep frying',
  'pressure cookers',
  'water storage & jugs',
  'traditional serveware',
  'canisters & dabbas',
  'commercial stockpots',
  'spice organizers',
  'thali sets & platters',
  'frying pans & skillets',
  'tawas & griddles'
]);

const LEGACY_RAW_SIZES = new Set([
  '2.5 litres (24 cm)',
  '3 litres',
  '5 litres + 1.5l jug',
  '4 litres (30 cm)',
  'set of 4 (500g, 1kg, 2kg, 3kg)',
  '15 litres (36 cm)',
  '8.5 inch diameter (7 cups + spoon)',
  '6-piece set (1 thali, 3 bowls, 1 glass, 1 spoon)',
  '1.5 litres (20 cm)',
  '5 litres (28 cm)'
]);

function isLegacyRawBrand(b) {
  if (!b) return true;
  if (typeof b.id === 'string' && LEGACY_RAW_BRAND_IDS.has(b.id)) return true;
  const name = String(b.name || '').toLowerCase().trim();
  return LEGACY_RAW_BRAND_NAMES.has(name);
}

function isLegacyRawMaterial(m) {
  if (!m) return true;
  if (typeof m.id === 'string' && LEGACY_RAW_MATERIAL_IDS.has(m.id)) return true;
  const name = String(m.name || '').toLowerCase().trim();
  return LEGACY_RAW_MATERIAL_NAMES.has(name);
}

function isLegacyRawSubCategory(name) {
  if (!name) return true;
  return LEGACY_RAW_SUBCATEGORIES.has(String(name).toLowerCase().trim());
}

function isLegacyRawSize(name) {
  if (!name) return true;
  return LEGACY_RAW_SIZES.has(String(name).toLowerCase().trim());
}

// Helper to filter out legacy development dummy/test products
function isLegacyTestProduct(p) {
  if (!p) return true;
  const testIds = ['prod-001', 'prod-002', 'prod-003', 'prod-004', 'prod-005', 'prod-006', 'prod-007', 'prod-008', 'prod-009'];
  const testCodes = ['RBB-CO-001', 'RBB-CO-002', 'RBB-CO-003', 'RBB-CO-004', 'RBB-TW-001', 'RBB-TW-002', 'RBB-SE-001', 'RBB-KS-001', 'RBB-KS-002'];
  if (typeof p.id === 'string' && (testIds.includes(p.id) || p.id.startsWith('prod-') || p.id.startsWith('test-') || p.id.startsWith('demo-'))) {
    return true;
  }
  const code = p.productCode || p.code;
  if (code && testCodes.includes(code)) {
    return true;
  }
  return false;
}

export function CatalogueProvider({ children }) {
  // 1. Categories state: Clean empty start, purging any legacy mock categories
  const [categories, setCategories] = useState(() => {
    try {
      // One-time cleanup of legacy mock categories from localStorage
      const hasCleaned = localStorage.getItem('rbb_legacy_categories_cleaned_v1');
      if (!hasCleaned) {
        localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
        localStorage.setItem('rbb_legacy_categories_cleaned_v1', 'true');
        return [];
      }

      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const legacyIds = new Set(['cat-001', 'cat-002', 'cat-003', 'cat-004', 'cat-005', 'cat-006']);
          const legacyNames = new Set([
            'cookware',
            'kitchen storage',
            'tableware',
            'serving',
            'barware & beverage',
            'kitchen tools & accessories',
          ]);
          return parsed.filter(
            (c) => !legacyIds.has(c.id) && !legacyNames.has(String(c.name || '').toLowerCase().trim())
          );
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // 2. Products state: Clean empty start for production, purging any legacy test data
  const [products, setProducts] = useState(() => {
    try {
      // One-time cleanup of legacy development/test products from localStorage
      const hasCleaned = localStorage.getItem('rbb_test_products_cleaned_v2');
      if (!hasCleaned) {
        localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
        localStorage.removeItem(STORAGE_KEYS.SEQUENCES);
        localStorage.setItem('rbb_test_products_cleaned_v2', 'true');
        return [];
      }

      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Never merge mock products; only return genuine user-created products
          return parsed.filter((p) => !isLegacyTestProduct(p));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // 3. Sequence history to ensure deleted product numbers are never reused (Rule 7)
  const [sequenceHistory, setSequenceHistory] = useState(() => {
    try {
      const hasCleaned = localStorage.getItem('rbb_test_products_cleaned_v2');
      if (!hasCleaned) {
        return {};
      }
      const saved = localStorage.getItem(STORAGE_KEYS.SEQUENCES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // 4. Brands dynamic state (clean start, purge any legacy raw mock brands)
  const [brands, setBrands] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRANDS);
      const parsed = saved ? JSON.parse(saved) : INITIAL_BRANDS;
      const list = Array.isArray(parsed) ? parsed : [];
      if (!localStorage.getItem('rbb_legacy_raw_brands_cleaned_v1')) {
        const cleaned = list.filter((b) => !isLegacyRawBrand(b));
        localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(cleaned));
        localStorage.setItem('rbb_legacy_raw_brands_cleaned_v1', 'true');
        return cleaned;
      }
      return list;
    } catch {
      return [];
    }
  });

  // 5. Materials dynamic state (clean start, purge any legacy raw mock materials)
  const [materials, setMaterials] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      const parsed = saved ? JSON.parse(saved) : INITIAL_MATERIALS;
      const list = Array.isArray(parsed) ? parsed : [];
      if (!localStorage.getItem('rbb_legacy_raw_materials_cleaned_v1')) {
        const cleaned = list.filter((m) => !isLegacyRawMaterial(m));
        localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(cleaned));
        localStorage.setItem('rbb_legacy_raw_materials_cleaned_v1', 'true');
        return cleaned;
      }
      return list;
    } catch {
      return [];
    }
  });

  // 6. Subcategories dynamic state (clean start, purge any legacy raw mock subcategories)
  const [subCategories, setSubCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBCATEGORIES);
      const parsed = saved ? JSON.parse(saved) : INITIAL_SUBCATEGORIES;
      const list = Array.isArray(parsed) ? parsed : [];
      if (!localStorage.getItem('rbb_legacy_raw_subcategories_cleaned_v1')) {
        const cleaned = list.filter((s) => !isLegacyRawSubCategory(s));
        localStorage.setItem(STORAGE_KEYS.SUBCATEGORIES, JSON.stringify(cleaned));
        localStorage.setItem('rbb_legacy_raw_subcategories_cleaned_v1', 'true');
        return cleaned;
      }
      return list;
    } catch {
      return [];
    }
  });

  // 7. Sizes / Capacities dynamic state (clean start, purge any legacy raw mock sizes)
  const [sizes, setSizes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SIZES);
      const parsed = saved ? JSON.parse(saved) : INITIAL_SIZES;
      const list = Array.isArray(parsed) ? parsed : [];
      if (!localStorage.getItem('rbb_legacy_raw_sizes_cleaned_v1')) {
        const cleaned = list.filter((s) => !isLegacyRawSize(s));
        localStorage.setItem(STORAGE_KEYS.SIZES, JSON.stringify(cleaned));
        localStorage.setItem('rbb_legacy_raw_sizes_cleaned_v1', 'true');
        return cleaned;
      }
      return list;
    } catch {
      return [];
    }
  });

  // 8. Supabase Auth & Owner Status State (Optimistic local hydration + background server verification)
  const [authStatus, setAuthStatus] = useState(() => getOptimisticOwnerStatus());

  // Only show blocking skeleton/spinner if Supabase is configured AND we have zero cached products
  const [isCatalogueLoading, setIsCatalogueLoading] = useState(
    () => isSupabaseConfigured && products.length === 0
  );

  // Refs for instant lookup enrichment and deduplicated loading
  const productsRef = useRef(products);
  const categoriesRef = useRef(categories);
  const brandsRef = useRef(brands);
  const materialsRef = useRef(materials);
  const inFlightCatalogueLoadRef = useRef(null);
  const lastLoadedAuthKeyRef = useRef(null);
  const catalogueLoadSeqRef = useRef(0);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);
  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);
  useEffect(() => {
    brandsRef.current = brands;
  }, [brands]);
  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  const loadPublicCatalogueData = useCallback(async ({ background = false, force = false, authKey = null } = {}) => {
    if (!isSupabaseConfigured) {
      setIsCatalogueLoading(false);
      return;
    }

    if (inFlightCatalogueLoadRef.current && !force) {
      return inFlightCatalogueLoadRef.current;
    }

    const seq = ++catalogueLoadSeqRef.current;
    const shouldShowLoading = !background && productsRef.current.length === 0;
    if (shouldShowLoading) {
      setIsCatalogueLoading(true);
    }

    const runLoad = async () => {
      try {
        if (authKey !== null) {
          lastLoadedAuthKeyRef.current = authKey;
        } else if (lastLoadedAuthKeyRef.current === null) {
          lastLoadedAuthKeyRef.current = 'public';
        }

        // Prioritize core 4 tables in parallel without heavy SQL lateral joins;
        // clear loading flag as soon as products arrive instead of waiting for slower metadata tables.
        const productsPromise = fetchPublicProducts().then((dbProducts) => {
          if (seq !== catalogueLoadSeqRef.current) return dbProducts;
          if (Array.isArray(dbProducts)) {
            const enriched = enrichProductsWithLookups(
              dbProducts,
              categoriesRef.current,
              brandsRef.current,
              materialsRef.current
            );
            productsRef.current = enriched;
            setProducts(enriched);
            setIsCatalogueLoading(false);

            const productSubNames = enriched
              .map((p) => (typeof p?.subCategory === 'string' ? p.subCategory.trim() : ''))
              .filter(Boolean);
            if (productSubNames.length > 0) {
              setSubCategories((prev) => {
                const seen = new Set(prev.map((item) => item.toLowerCase()));
                const merged = [...prev];
                for (const name of productSubNames) {
                  if (!seen.has(name.toLowerCase())) {
                    seen.add(name.toLowerCase());
                    merged.push(name);
                  }
                }
                return merged;
              });
            }

            const productSizeNames = enriched
              .map((p) => (typeof p?.sizeCapacity === 'string' ? p.sizeCapacity.trim() : ''))
              .filter(Boolean);
            if (productSizeNames.length > 0) {
              setSizes((prev) => {
                const seen = new Set(prev.map((item) => item.toLowerCase()));
                const merged = [...prev];
                for (const name of productSizeNames) {
                  if (!seen.has(name.toLowerCase())) {
                    seen.add(name.toLowerCase());
                    merged.push(name);
                  }
                }
                return merged;
              });
            }
          }
          return dbProducts;
        });

        const categoriesPromise = fetchPublicCategories().then((dbCategories) => {
          if (seq !== catalogueLoadSeqRef.current) return dbCategories;
          if (Array.isArray(dbCategories)) {
            categoriesRef.current = dbCategories;
            setCategories(dbCategories);
          }
          return dbCategories;
        });

        const brandsPromise = fetchPublicBrands().then((dbBrands) => {
          if (seq !== catalogueLoadSeqRef.current) return dbBrands;
          if (Array.isArray(dbBrands)) {
            brandsRef.current = dbBrands;
            setBrands(dbBrands);
          }
          return dbBrands;
        });

        const materialsPromise = fetchPublicMaterials().then((dbMaterials) => {
          if (seq !== catalogueLoadSeqRef.current) return dbMaterials;
          if (Array.isArray(dbMaterials)) {
            materialsRef.current = dbMaterials;
            setMaterials(dbMaterials);
          }
          return dbMaterials;
        });

        await Promise.allSettled([
          productsPromise,
          categoriesPromise,
          brandsPromise,
          materialsPromise
        ]);

        if (seq !== catalogueLoadSeqRef.current) return;

        // Re-enrich products once all metadata lookup tables settle so names are 100% synced
        if (productsRef.current.length > 0) {
          setProducts((prev) =>
            enrichProductsWithLookups(
              prev,
              categoriesRef.current,
              brandsRef.current,
              materialsRef.current
            )
          );
        }

        setIsCatalogueLoading(false);

        // Fetch secondary form metadata in background without blocking main loading state
        fetchPublicSubCategories().then((dbSubCategories) => {
          const dbSubNames = (Array.isArray(dbSubCategories) ? dbSubCategories.map((s) => s?.name) : [])
            .map((s) => (typeof s === 'string' ? s.trim() : ''))
            .filter(Boolean);
          if (dbSubNames.length > 0) {
            setSubCategories((prev) => {
              const seen = new Set(prev.map((item) => item.toLowerCase()));
              const merged = [...prev];
              for (const name of dbSubNames) {
                if (!seen.has(name.toLowerCase())) {
                  seen.add(name.toLowerCase());
                  merged.push(name);
                }
              }
              return merged;
            });
          }
        }).catch(() => {});

        fetchPublicSizes().then((dbSizes) => {
          const dbSizeNames = (Array.isArray(dbSizes) ? dbSizes.map((s) => s?.name) : [])
            .map((s) => (typeof s === 'string' ? s.trim() : ''))
            .filter(Boolean);
          if (dbSizeNames.length > 0) {
            setSizes((prev) => {
              const seen = new Set(prev.map((item) => item.toLowerCase()));
              const merged = [...prev];
              for (const name of dbSizeNames) {
                if (!seen.has(name.toLowerCase())) {
                  seen.add(name.toLowerCase());
                  merged.push(name);
                }
              }
              return merged;
            });
          }
        }).catch(() => {});
      } catch (err) {
        console.warn('[Supabase Public Data Load]', err);
        setIsCatalogueLoading(false);
      } finally {
        inFlightCatalogueLoadRef.current = null;
      }
    };

    const promise = runLoad();
    inFlightCatalogueLoadRef.current = promise;
    return promise;
  }, []);

  const refreshAuthStatus = useCallback(async (forceRefreshOrStatus = false, preverifiedStatus = null) => {
    try {
      const resolvedPreverified =
        forceRefreshOrStatus &&
        typeof forceRefreshOrStatus === 'object' &&
        'isAuthenticated' in forceRefreshOrStatus
          ? forceRefreshOrStatus
          : preverifiedStatus;
      const forceRefresh = typeof forceRefreshOrStatus === 'boolean' ? forceRefreshOrStatus : false;

      // Fast-path: Apply verified login result synchronously so dashboard renders in 0ms
      if (resolvedPreverified && typeof resolvedPreverified === 'object' && 'isAuthenticated' in resolvedPreverified) {
        const appliedStatus = {
          ...resolvedPreverified,
          isLoading: false
        };
        setAuthStatus(appliedStatus);

        const nextUserId = appliedStatus.user?.id || null;
        if (
          isSupabaseConfigured &&
          appliedStatus.isOwner &&
          (productsRef.current.length === 0 || lastLoadedAuthKeyRef.current !== nextUserId)
        ) {
          // Kick off silent background sync without blocking post-login redirect
          loadPublicCatalogueData({
            background: productsRef.current.length > 0,
            force: lastLoadedAuthKeyRef.current !== nextUserId || productsRef.current.length === 0,
            authKey: nextUserId
          });
        }
        return appliedStatus;
      }

      if (forceRefresh) invalidateOwnerAuthCache();
      const status = await getOwnerAuthStatus(forceRefresh);
      setAuthStatus({
        ...status,
        isLoading: false
      });

      const nextUserId = status?.user?.id || null;
      if (
        isSupabaseConfigured &&
        status?.isOwner &&
        nextUserId &&
        (productsRef.current.length === 0 || lastLoadedAuthKeyRef.current !== nextUserId)
      ) {
        loadPublicCatalogueData({
          background: productsRef.current.length > 0,
          force: lastLoadedAuthKeyRef.current !== nextUserId || productsRef.current.length === 0,
          authKey: nextUserId
        });
      }

      return status;
    } catch (err) {
      console.warn('[Owner Auth Check]', err);
      setAuthStatus((prev) => ({
        ...prev,
        isLoading: false,
        reason: 'Error checking authentication status.'
      }));
    }
  }, [loadPublicCatalogueData]);

  const signOut = async () => {
    try {
      await signOutOwner();
      lastLoadedAuthKeyRef.current = 'public';
      await refreshAuthStatus(true);
      showToast('Signed out of owner session');
    } catch (err) {
      console.error('[Sign Out Error]', err);
      showToast('Failed to sign out', 'error');
    }
  };

  const initialAuthUserIdRef = useRef(authStatus?.user?.id || null);

  useEffect(() => {
    // 1. Authoritative Auth Check (background if optimistic session already matched)
    refreshAuthStatus();

    // 2. If Supabase is configured, fetch live public catalogue data immediately
    if (isSupabaseConfigured) {
      loadPublicCatalogueData({
        background: productsRef.current.length > 0,
        authKey: initialAuthUserIdRef.current || 'public'
      });

      // Listen for real auth state transitions (skip duplicate check during active sign-in)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'INITIAL_SESSION') return;
        if (event === 'SIGNED_IN' && isOwnerSignInInFlight()) {
          // signInOwnerWithPassword already verifies is_rbb_owner() and notifies UI
          return;
        }
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          invalidateOwnerAuthCache();
          refreshAuthStatus(true);
        } else {
          refreshAuthStatus(false);
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [loadPublicCatalogueData, refreshAuthStatus]);

  // 9. Lightweight Global Toast State
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed to save categories', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      // Fallback on QuotaExceededError (e.g. oversized base64 images): persist lightweight cache
      // so instant hydration on reload/login still works while live images fetch from Supabase.
      try {
        const compactProducts = products.map((p) => {
          const stripLargeDataUri = (val) =>
            typeof val === 'string' && val.startsWith('data:') && val.length > 20000 ? '' : val;
          return {
            ...p,
            image1: stripLargeDataUri(p.image1),
            image2: stripLargeDataUri(p.image2),
            images: Array.isArray(p.images) ? p.images.map(stripLargeDataUri).filter(Boolean) : []
          };
        });
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(compactProducts));
      } catch (fallbackErr) {
        console.warn('Failed to save products cache', fallbackErr || e);
      }
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SEQUENCES, JSON.stringify(sequenceHistory));
    } catch (e) {
      console.warn('Failed to save sequence history', e);
    }
  }, [sequenceHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands));
    } catch (e) {
      console.warn('Failed to save brands', e);
    }
  }, [brands]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
    } catch (e) {
      console.warn('Failed to save materials', e);
    }
  }, [materials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBCATEGORIES, JSON.stringify(subCategories));
    } catch (e) {
      console.warn('Failed to save subcategories', e);
    }
  }, [subCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SIZES, JSON.stringify(sizes));
    } catch (e) {
      console.warn('Failed to save sizes', e);
    }
  }, [sizes]);

  /**
   * Generates a suggested unique 2-letter category code
   */
  const suggestCategoryCode = useCallback(
    (name) => {
      const existingCodes = categories
        .map((c) => (c && typeof c.code === 'string' ? c.code : ''))
        .filter(Boolean);
      return generateSuggestedCategoryCode(name, existingCodes);
    },
    [categories]
  );

  /**
   * Generates next sequential product code for a category
   */
  const generateProductCodeForCategory = useCallback(
    (categoryCode) => {
      return getNextProductCode(categoryCode, products, sequenceHistory);
    },
    [products, sequenceHistory]
  );

  /**
   * Count products in a category
   */
  const getCategoryProductCount = (categoryOrName) => {
    if (!categoryOrName) return 0;
    const name = String(typeof categoryOrName === 'string' ? categoryOrName : categoryOrName.name || '').trim().toLowerCase();
    const code = String(typeof categoryOrName === 'object' ? categoryOrName.code || '' : '').trim().toLowerCase();

    return products.filter((p) => {
      const pCat = String(p.category || p.categoryName || '').trim().toLowerCase();
      const pCode = String(p.categoryCode || '').trim().toLowerCase();
      if (name && pCat === name) return true;
      if (code && pCode === code) return true;
      return false;
    }).length;
  };

  /**
   * Add a new category (persists to Supabase when configured, or localStorage in offline mode)
   */
  const addCategory = async ({ name, code, description = '' }) => {
    const trimmedName = (name || '').trim();
    if (!trimmedName) {
      throw new Error('Please enter a category name.');
    }

    const nameExists = categories.some(
      (c) => String(c?.name || '').trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (nameExists) {
      throw new Error(`Category "${trimmedName}" already exists.`);
    }

    let finalCode = (code || suggestCategoryCode(trimmedName)).toUpperCase().trim();

    const codeExists = categories.some(
      (c) => String(c?.code || '').trim().toUpperCase() === finalCode.toUpperCase()
    );

    if (codeExists || !finalCode) {
      finalCode = suggestCategoryCode(trimmedName);
    }

    if (isSupabaseConfigured) {
      const savedInDb = await createCategoryInDb(
        {
          name: trimmedName,
          code: finalCode,
          description: (description || '').trim(),
        },
        generateSuggestedCategoryCode
      );
      setCategories((prev) => {
        if (prev.some((c) => c.id === savedInDb.id)) return prev;
        return [...prev, savedInDb];
      });
      return savedInDb;
    }

    const newCategory = {
      id: 'cat-' + Date.now(),
      name: trimmedName,
      code: finalCode,
      description: (description || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  /**
   * Add a new brand dynamically
   */
  const addBrand = (brandName, origin = 'India') => {
    const trimmed = brandName.trim();
    if (!trimmed) return null;
    const existing = brands.find((b) => b.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;

    const newBrand = {
      id: 'br-' + Date.now(),
      name: trimmed,
      origin: origin.trim() || 'India',
      count: 0,
    };
    setBrands((prev) => [...prev, newBrand]);
    return newBrand;
  };

  /**
   * Count products by brand
   */
  const getBrandProductCount = (brandOrName) => {
    if (!brandOrName) return 0;
    const name = String(typeof brandOrName === 'string' ? brandOrName : brandOrName.name || '').trim().toLowerCase();
    if (!name) return 0;
    return products.filter((p) => String(p.brand || '').trim().toLowerCase() === name).length;
  };

  /**
   * Update / rename an existing brand
   * Also safely updates existing products using this brand
   */
  const updateBrand = (id, { name, origin }) => {
    const target = brands.find((b) => b.id === id);
    if (!target) return { success: false, error: 'Brand not found' };

    const oldName = target.name;
    const updatedName = name ? name.trim() : target.name;
    const updatedOrigin = origin !== undefined ? origin.trim() : target.origin;

    setBrands((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, name: updatedName, origin: updatedOrigin } : b
      )
    );

    if (oldName !== updatedName) {
      setProducts((prev) =>
        prev.map((p) => (p.brand === oldName ? { ...p, brand: updatedName } : p))
      );
    }

    return { success: true };
  };

  /**
   * Delete a brand safely
   * Prevents deletion if products currently use this brand
   */
  const deleteBrand = (id) => {
    const target = brands.find((b) => b.id === id);
    if (!target) return { success: false, error: 'Brand not found' };

    const count = getBrandProductCount(target);
    if (count > 0) {
      return {
        success: false,
        error: `This brand contains ${count} product${count === 1 ? '' : 's'}. Move or update those products before deleting the brand.`,
        count,
      };
    }

    setBrands((prev) => prev.filter((b) => b.id !== id));
    return { success: true };
  };

  /**
   * Add a new material dynamically
   */
  const addMaterial = (materialName, description = '') => {
    const trimmed = materialName.trim();
    if (!trimmed) return null;
    const existing = materials.find((m) => m.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;

    const newMaterial = {
      id: 'mat-' + Date.now(),
      name: trimmed,
      description: description.trim() || 'Custom material entry',
      count: 0,
    };
    setMaterials((prev) => [...prev, newMaterial]);
    return newMaterial;
  };

  /**
   * Count products by material
   */
  const getMaterialProductCount = (materialOrName) => {
    if (!materialOrName) return 0;
    const name = String(typeof materialOrName === 'string' ? materialOrName : materialOrName.name || '').trim().toLowerCase();
    if (!name) return 0;
    return products.filter((p) => String(p.material || '').trim().toLowerCase() === name).length;
  };

  /**
   * Update / rename an existing material
   * Also safely updates existing products using this material
   */
  const updateMaterial = (id, { name, description }) => {
    const target = materials.find((m) => m.id === id);
    if (!target) return { success: false, error: 'Material not found' };

    const oldName = target.name;
    const updatedName = name ? name.trim() : target.name;
    const updatedDesc = description !== undefined ? description.trim() : target.description;

    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, name: updatedName, description: updatedDesc } : m
      )
    );

    if (oldName !== updatedName) {
      setProducts((prev) =>
        prev.map((p) => (p.material === oldName ? { ...p, material: updatedName } : p))
      );
    }

    return { success: true };
  };

  /**
   * Delete a material safely
   * Prevents deletion if products currently use this material
   */
  const deleteMaterial = (id) => {
    const target = materials.find((m) => m.id === id);
    if (!target) return { success: false, error: 'Material not found' };

    const count = getMaterialProductCount(target);
    if (count > 0) {
      return {
        success: false,
        error: `This material is used by ${count} product${count === 1 ? '' : 's'}. Move or update those products before deleting the material.`,
        count,
      };
    }

    setMaterials((prev) => prev.filter((m) => m.id !== id));
    return { success: true };
  };

  /**
   * Add a new sub-category dynamically
   */
  const addSubCategory = (subCatName) => {
    const trimmed = subCatName.trim();
    if (!trimmed) return null;
    if (!subCategories.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSubCategories((prev) => [trimmed, ...prev]);
    }
    return trimmed;
  };

  /**
   * Count products by sub-category
   */
  const getSubCategoryProductCount = (subCatName) => {
    if (!subCatName) return 0;
    const target = String(subCatName).trim().toLowerCase();
    return products.filter(
      (p) => String(p.subCategory || '').trim().toLowerCase() === target
    ).length;
  };

  /**
   * Update / rename an existing sub-category
   * Also safely updates existing products using this sub-category
   */
  const updateSubCategory = (oldName, newName) => {
    const trimmedNew = (newName || '').trim();
    if (!trimmedNew) return { success: false, error: 'Sub-category name is required.' };

    const exists = subCategories.some(
      (s) => s.toLowerCase() === trimmedNew.toLowerCase() && s !== oldName
    );
    if (exists) {
      return { success: false, error: 'A sub-category with this name already exists.' };
    }

    setSubCategories((prev) =>
      prev.map((s) => (s === oldName ? trimmedNew : s))
    );

    if (oldName !== trimmedNew) {
      setProducts((prev) =>
        prev.map((p) =>
          String(p.subCategory || '').trim().toLowerCase() === String(oldName).trim().toLowerCase()
            ? { ...p, subCategory: trimmedNew }
            : p
        )
      );
    }

    return { success: true };
  };

  /**
   * Delete a sub-category safely
   * Prevents deletion if products currently use this sub-category
   */
  const deleteSubCategory = (subCatName) => {
    const count = getSubCategoryProductCount(subCatName);
    if (count > 0) {
      return {
        success: false,
        error: `This sub-category is used by ${count} product${count === 1 ? '' : 's'}. Move or update those products before deleting it.`,
        count,
      };
    }

    setSubCategories((prev) => prev.filter((s) => s !== subCatName));
    return { success: true };
  };

  /**
   * Add a new size / capacity dynamically
   */
  const addSize = (sizeName) => {
    const trimmed = sizeName.trim();
    if (!trimmed) return null;
    if (!sizes.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSizes((prev) => [trimmed, ...prev]);
    }
    return trimmed;
  };

  /**
   * Edit an existing category
   */
  const updateCategory = async (id, { name, description }) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return { success: false, error: 'Category not found' };

    const oldName = target.name;
    const updatedName = name ? name.trim() : target.name;
    const updatedDesc = description !== undefined ? description.trim() : (target.description || '');

    const duplicateName = categories.some(
      (c) => c.id !== id && String(c?.name || '').trim().toLowerCase() === updatedName.toLowerCase()
    );
    if (duplicateName) {
      return { success: false, error: `Category "${updatedName}" already exists.` };
    }

    const isUuid = typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isSupabaseConfigured && isUuid) {
      try {
        await updateCategoryInDb(id, { name: updatedName, description: updatedDesc });
      } catch (err) {
        return { success: false, error: err?.message || 'Failed to update category in Supabase.' };
      }
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              name: updatedName,
              description: updatedDesc,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    if (oldName !== updatedName) {
      setProducts((prev) =>
        prev.map((p) =>
          p.category === oldName || p.categoryName === oldName
            ? { ...p, category: updatedName, categoryName: updatedName }
            : p
        )
      );
    }

    return { success: true };
  };

  /**
   * Delete a category
   */
  const deleteCategory = async (id) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return { success: false, error: 'Category not found' };

    const productCount = getCategoryProductCount(target);
    if (productCount > 0) {
      return {
        success: false,
        error: 'This category contains products. Move or update those products before deleting the category.',
        count: productCount
      };
    }

    const isUuid = typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isSupabaseConfigured && isUuid) {
      try {
        await deleteCategoryInDb(id);
      } catch (err) {
        return { success: false, error: err?.message || 'Failed to delete category in Supabase.' };
      }
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
    return { success: true };
  };

  /**
   * Preview product code without incrementing counter
   */
  const peekProductCodeForCategory = useCallback(async (categoryCode) => {
    if (!categoryCode) return '';
    if (isSupabaseConfigured) {
      return await peekNextDbProductCode(categoryCode);
    }
    return getNextProductCode(categoryCode, products, sequenceHistory);
  }, [products, sequenceHistory]);

  const fileToDataUrl = (file) =>
    new Promise((resolve) => {
      if (!file) return resolve('');
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });

  /**
   * Add a new product
   * When Supabase mode is active, delegates to Supabase service (RPC code gen, Storage upload, RLS owner insert)
   * If an error occurs, it throws explicitly (DO NOT silently fallback to localStorage).
   * When local offline mode is active, executes localStorage sequence generation and persistence.
   */
  const addProduct = async (productData, imageFiles = {}) => {
    if (isSupabaseConfigured) {
      const savedInDb = await createProductInSupabase(productData, imageFiles);
      setProducts((prev) => [savedInDb, ...prev]);
      return savedInDb;
    }

    const targetCat = categories.find(
      (c) =>
        c.name === productData.categoryName ||
        c.name === productData.category ||
        c.code === productData.categoryCode
    ) || categories[0];

    const catCode = targetCat ? targetCat.code : (productData.categoryCode || 'GN');
    const generatedCode = getNextProductCode(catCode, products, sequenceHistory);

    // Update sequence history permanently
    const match = generatedCode.match(/^RBB-[A-Z0-9]+-(\d+)$/);
    if (match) {
      const issuedNum = parseInt(match[1], 10);
      setSequenceHistory((prev) => ({
        ...prev,
        [catCode]: Math.max(prev[catCode] || 0, issuedNum),
      }));
    }

    const resolvedImg1 = imageFiles.file1
      ? await fileToDataUrl(imageFiles.file1)
      : (productData.image1 || productData.images?.[0] || '');
    const resolvedImg2 = imageFiles.file2
      ? await fileToDataUrl(imageFiles.file2)
      : (productData.image2 || productData.images?.[1] || '');

    const productName = productData.name || productData.productName || '';
    const imagesList = [resolvedImg1, resolvedImg2].filter(Boolean);

    const newProduct = {
      id: 'prod-' + Date.now(),
      name: productName,
      productName: productName, // backward compatibility
      code: generatedCode,
      productCode: generatedCode, // backward compatibility
      categoryId: targetCat ? targetCat.id : null,
      categoryName: targetCat ? targetCat.name : (productData.categoryName || productData.category || ''),
      category: targetCat ? targetCat.name : (productData.category || productData.categoryName || ''), // backward compatibility
      categoryCode: catCode,
      subCategory: productData.subCategory || '',
      brand: productData.brand || '',
      material: productData.material || '',
      sizeCapacity: productData.sizeCapacity || productData.sizeOrCapacity || '',
      sizeOrCapacity: productData.sizeCapacity || productData.sizeOrCapacity || '', // backward compatibility
      purchasePrice: Number(productData.purchasePrice) || 0,
      purchaseUnit: productData.purchaseUnit || productData.purchase_unit || 'Piece',
      specialDetails: productData.specialDetails || '',
      images: imagesList,
      image1: imagesList[0] || '',
      image2: imagesList[1] || '',
      status: productData.status || 'In Stock',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  /**
   * Update an existing product
   */

  const updateProduct = async (id, productData, imageFiles = {}) => {
    const isUuid = typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isSupabaseConfigured && isUuid) {
      const updatedInDb = await updateProductInSupabase(id, productData, imageFiles);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updatedInDb : p))
      );
      return updatedInDb;
    }

    const existing = products.find((p) => p.id === id);
    if (!existing) {
      throw new Error('Product could not be found to update.');
    }

    const resolvedImg1 = imageFiles.file1
      ? await fileToDataUrl(imageFiles.file1)
      : (productData.image1 !== undefined ? productData.image1 : existing.image1);
    const resolvedImg2 = imageFiles.file2
      ? await fileToDataUrl(imageFiles.file2)
      : (productData.image2 !== undefined ? productData.image2 : existing.image2);

    const imagesList = [resolvedImg1, resolvedImg2].filter(Boolean);
    const productName = productData.name || productData.productName || existing.productName;

    const updatedLocal = {
      ...existing,
      ...productData,
      name: productName,
      productName: productName,
      categoryName: productData.categoryName || productData.category || existing.categoryName,
      category: productData.categoryName || productData.category || existing.category,
      sizeCapacity: productData.sizeCapacity ?? productData.sizeOrCapacity ?? existing.sizeCapacity,
      sizeOrCapacity: productData.sizeCapacity ?? productData.sizeOrCapacity ?? existing.sizeOrCapacity,
      images: imagesList,
      image1: imagesList[0] || '',
      image2: imagesList[1] || '',
      purchasePrice: productData.purchasePrice !== undefined ? Number(productData.purchasePrice) : existing.purchasePrice,
      purchaseUnit: productData.purchaseUnit !== undefined ? productData.purchaseUnit : (existing.purchaseUnit || 'Piece'),
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => prev.map((p) => (p.id === id ? updatedLocal : p)));
    return updatedLocal;
  };

  /**
   * Delete a product
   */
  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Memoized stats & distributions for dashboard
  const stats = useMemo(() => getCatalogueStats(products, categories), [products, categories]);
  const categoryDistribution = useMemo(
    () => getCategoryDistribution(products, categories),
    [products, categories]
  );
  const materialDistribution = useMemo(
    () => getMaterialDistribution(products, materials),
    [products, materials]
  );
  const recentProducts = useMemo(
    () => getRecentlyAddedProducts(products, 5),
    [products]
  );

  return (
    <CatalogueContext.Provider
      value={{
        categories,
        products,
        brands,
        materials,
        subCategories,
        sizes,
        sequenceHistory,
        stats,
        categoryDistribution,
        materialDistribution,
        recentProducts,
        toast,
        showToast,
        hideToast,
        isSupabaseMode: isSupabaseConfigured,
        isCatalogueLoading,
        refreshCatalogueData: loadPublicCatalogueData,
        authStatus,
        refreshAuthStatus,
        signOut,
        peekProductCodeForCategory,
        suggestCategoryCode,
        generateProductCodeForCategory,
        getCategoryProductCount,
        getSubCategoryProductCount,
        getBrandProductCount,
        getMaterialProductCount,
        addCategory,
        addBrand,
        updateBrand,
        deleteBrand,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        addSubCategory,
        updateSubCategory,
        deleteSubCategory,
        addSize,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </CatalogueContext.Provider>
  );
}

export function useCatalogue() {
  const context = useContext(CatalogueContext);
  if (!context) {
    throw new Error('useCatalogue must be used within a CatalogueProvider');
  }
  return context;
}
