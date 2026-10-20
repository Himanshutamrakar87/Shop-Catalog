import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  signOutOwner,
  createProductInSupabase,
  peekNextDbProductCode,
  ensureCategoryInDb,
  ensureBrandInDb,
  ensureMaterialInDb,
  ensureSubCategoryInDb,
  ensureSizeInDb,
  fetchPublicProducts,
  fetchPublicCategories,
  fetchPublicBrands,
  fetchPublicMaterials
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

  // 4. Brands dynamic state
  const [brands, setBrands] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRANDS);
      return saved ? JSON.parse(saved) : INITIAL_BRANDS;
    } catch {
      return INITIAL_BRANDS;
    }
  });

  // 5. Materials dynamic state
  const [materials, setMaterials] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
    } catch {
      return INITIAL_MATERIALS;
    }
  });

  // 6. Subcategories dynamic state
  const [subCategories, setSubCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBCATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_SUBCATEGORIES;
    } catch {
      return INITIAL_SUBCATEGORIES;
    }
  });

  // 7. Sizes / Capacities dynamic state
  const [sizes, setSizes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SIZES);
      return saved ? JSON.parse(saved) : INITIAL_SIZES;
    } catch {
      return INITIAL_SIZES;
    }
  });

  // 8. Supabase Auth & Owner Status State (Real session verification, no localStorage flag)
  const [authStatus, setAuthStatus] = useState({
    isConfigured: isSupabaseConfigured,
    isAuthenticated: false,
    isOwner: false,
    isLoading: isSupabaseConfigured,
    user: null,
    role: null,
    reason: isSupabaseConfigured ? 'Verifying Supabase authentication...' : 'Local offline mode'
  });

  const refreshAuthStatus = async () => {
    try {
      const status = await getOwnerAuthStatus();
      setAuthStatus({
        ...status,
        isLoading: false
      });
      return status;
    } catch (err) {
      console.warn('[Owner Auth Check]', err);
      setAuthStatus((prev) => ({
        ...prev,
        isLoading: false,
        reason: 'Error checking authentication status.'
      }));
    }
  };

  const signOut = async () => {
    try {
      await signOutOwner();
      await refreshAuthStatus();
      showToast('Signed out of owner session');
    } catch (err) {
      console.error('[Sign Out Error]', err);
      showToast('Failed to sign out', 'error');
    }
  };

  useEffect(() => {
    // 1. Authoritative Auth Check
    refreshAuthStatus();

    // 2. If Supabase is configured, fetch live public catalogue data for all visitors
    if (isSupabaseConfigured) {
      const loadPublicCatalogueData = async () => {
        try {
          const [dbProducts, dbCategories, dbBrands, dbMaterials] = await Promise.all([
            fetchPublicProducts(),
            fetchPublicCategories(),
            fetchPublicBrands(),
            fetchPublicMaterials()
          ]);

          if (Array.isArray(dbProducts) && dbProducts.length > 0) {
            setProducts(dbProducts);
          }
          if (Array.isArray(dbCategories) && dbCategories.length > 0) {
            setCategories(dbCategories);
          }
          if (Array.isArray(dbBrands) && dbBrands.length > 0) {
            setBrands(dbBrands);
          }
          if (Array.isArray(dbMaterials) && dbMaterials.length > 0) {
            setMaterials(dbMaterials);
          }
        } catch (err) {
          console.warn('[Supabase Public Data Load]', err);
        }
      };

      loadPublicCatalogueData();

      // Listen for auth state transitions (sign-in, token refresh, sign-out)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        refreshAuthStatus();
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

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
      console.warn('Failed to save products', e);
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
  const suggestCategoryCode = (name) => {
    const existingCodes = categories.map((c) => c.code);
    return generateSuggestedCategoryCode(name, existingCodes);
  };

  /**
   * Generates next sequential product code for a category
   */
  const generateProductCodeForCategory = (categoryCode) => {
    return getNextProductCode(categoryCode, products, sequenceHistory);
  };

  /**
   * Count products in a category
   */
  const getCategoryProductCount = (categoryOrName) => {
    if (!categoryOrName) return 0;
    const name = typeof categoryOrName === 'string' ? categoryOrName : categoryOrName.name;
    const code = typeof categoryOrName === 'object' ? categoryOrName.code : null;

    return products.filter((p) => {
      const pCat = p.category || p.categoryName;
      const pCode = p.categoryCode;
      if (pCat === name) return true;
      if (code && pCode === code) return true;
      return false;
    }).length;
  };

  /**
   * Add a new category
   */
  const addCategory = ({ name, code, description = '' }) => {
    const trimmedName = name.trim();
    let finalCode = (code || suggestCategoryCode(trimmedName)).toUpperCase().trim();

    const codeExists = categories.some(
      (c) => c.code.toUpperCase() === finalCode.toUpperCase()
    );

    if (codeExists) {
      finalCode = suggestCategoryCode(trimmedName);
    }

    const newCategory = {
      id: 'cat-' + Date.now(),
      name: trimmedName,
      code: finalCode,
      description: description.trim(),
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
    const name = typeof brandOrName === 'string' ? brandOrName : brandOrName.name;
    return products.filter((p) => p.brand === name).length;
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
    const name = typeof materialOrName === 'string' ? materialOrName : materialOrName.name;
    return products.filter((p) => p.material === name).length;
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
  const updateCategory = (id, { name, description }) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return { success: false, error: 'Category not found' };

    const oldName = target.name;
    const updatedName = name ? name.trim() : target.name;
    const updatedDesc = description !== undefined ? description.trim() : target.description;

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
  const deleteCategory = (id) => {
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

    setCategories((prev) => prev.filter((c) => c.id !== id));
    return { success: true };
  };

  /**
   * Preview product code without incrementing counter
   */
  const peekProductCodeForCategory = async (categoryCode) => {
    if (!categoryCode) return '';
    if (isSupabaseConfigured) {
      return await peekNextDbProductCode(categoryCode);
    }
    return getNextProductCode(categoryCode, products, sequenceHistory);
  };

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

    const productName = productData.name || productData.productName || '';
    const imagesList = productData.images || [productData.image1, productData.image2].filter(Boolean);

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
      image1: imagesList[0] || productData.image1 || '',
      image2: imagesList[1] || productData.image2 || '',
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
  const updateProduct = (id, productData) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const productName = productData.name || productData.productName || p.productName;
        const imagesList = productData.images || [productData.image1, productData.image2].filter(Boolean);

        return {
          ...p,
          ...productData,
          name: productName,
          productName: productName,
          categoryName: productData.categoryName || productData.category || p.categoryName,
          category: productData.categoryName || productData.category || p.category,
          sizeCapacity: productData.sizeCapacity || productData.sizeOrCapacity || p.sizeCapacity,
          sizeOrCapacity: productData.sizeCapacity || productData.sizeOrCapacity || p.sizeOrCapacity,
          images: imagesList.length > 0 ? imagesList : p.images,
          image1: imagesList[0] || productData.image1 || p.image1,
          image2: imagesList[1] || productData.image2 || p.image2,
          purchasePrice: productData.purchasePrice !== undefined ? Number(productData.purchasePrice) : p.purchasePrice,
          purchaseUnit: productData.purchaseUnit !== undefined ? productData.purchaseUnit : (p.purchaseUnit || 'Piece'),
          updatedAt: new Date().toISOString(),
        };
      })
    );
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
    () => getMaterialDistribution(products),
    [products]
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
        authStatus,
        refreshAuthStatus,
        signOut,
        peekProductCodeForCategory,
        generateProductCodeForCategory,
        getCategoryProductCount,
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
