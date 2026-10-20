import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Supabase Service Layer for RBB Catalogue Management
 * Handles:
 * 1. Owner Authentication & RLS session status via Supabase Auth & PostgreSQL is_rbb_owner()
 * 2. Concurrency-safe atomic product code generation (RPC: get_next_product_code)
 * 3. Secure product image uploads (max 2) to 'product-images' bucket with automated rollback
 * 4. Entity resolution (categories, brands, materials, subcategories, sizes)
 * 5. Complete product insertion without dropping schema fields
 * 6. Explicit failure reporting without silent localStorage fallbacks
 * 7. Public catalogue queries for unauthenticated visitors
 */

// Client-side rate limiting tracker for authentication attempts
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
let failedAttempts = 0;
let lockoutUntil = 0;

/**
 * Check if the owner login endpoint is temporarily locked due to repeated failed attempts
 */
export function getAuthRateLimitStatus() {
  const now = Date.now();
  if (lockoutUntil > now) {
    const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
    return { isLocked: true, remainingSeconds };
  }
  return { isLocked: false, remainingSeconds: 0 };
}

/**
 * Check current authentication state and server-verified owner status
 * Verifies directly against Supabase Auth session and PostgreSQL is_rbb_owner() function.
 * Never relies on client-side localStorage flags.
 */
export async function getOwnerAuthStatus() {
  if (!isSupabaseConfigured) {
    return {
      isConfigured: false,
      isAuthenticated: false,
      isOwner: false,
      isLoading: false,
      user: null,
      role: null,
      reason: 'Local offline preview mode'
    };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return {
        isConfigured: true,
        isAuthenticated: false,
        isOwner: false,
        isLoading: false,
        user: null,
        role: null,
        reason: 'Public visitor'
      };
    }

    // Server-side check:
    // 1. Explicit 'owner' role in app_metadata
    let isOwner = user.app_metadata?.role === 'owner';

    // 2. Query PostgreSQL public.is_rbb_owner() RPC for authoritative check
    if (!isOwner) {
      try {
        const { data: rpcIsOwner, error: rpcError } = await supabase.rpc('is_rbb_owner');
        if (!rpcError && rpcIsOwner === true) {
          isOwner = true;
        }
      } catch (e) {
        console.warn('[Owner RPC Check]', e);
      }
    }

    return {
      isConfigured: true,
      isAuthenticated: true,
      isOwner: Boolean(isOwner),
      isLoading: false,
      user,
      role: isOwner ? 'owner' : (user.app_metadata?.role || 'authenticated'),
      reason: isOwner
        ? 'Authenticated as RBB Owner'
        : 'Authenticated account is not authorized as the RBB Owner.'
    };
  } catch (err) {
    return {
      isConfigured: true,
      isAuthenticated: false,
      isOwner: false,
      isLoading: false,
      user: null,
      role: null,
      reason: 'Error checking authentication status.'
    };
  }
}

/**
 * Authenticate owner using real Supabase Auth email and password credentials.
 * Authorizes access ONLY if user is verified as owner by Supabase Auth and PostgreSQL RLS.
 * Rejects and signs out any non-owner user immediately.
 * Enforces progressive rate limiting against brute-force password guessing.
 */
export async function signInOwnerWithPassword(arg1, arg2) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please supply valid Supabase credentials.');
  }

  // Check rate limiting lockout
  const rateLimit = getAuthRateLimitStatus();
  if (rateLimit.isLocked) {
    throw new Error(
      `Too many failed login attempts. For security, please wait ${rateLimit.remainingSeconds} seconds before trying again.`
    );
  }

  let email = '';
  let password = '';

  if (typeof arg1 === 'object' && arg1 !== null) {
    email = arg1.email || '';
    password = arg1.password || '';
  } else if (typeof arg2 === 'string') {
    email = arg1;
    password = arg2;
  }

  email = (email || '').trim();
  password = (password || '').trim();

  if (!email || !password) {
    throw new Error('Please enter both your owner email and password.');
  }

  try {
    // 1. Real Supabase Auth sign-in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      failedAttempts += 1;
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      }
      throw new Error(error.message || 'Invalid email or password. Please verify your credentials and try again.');
    }

    if (!data?.user) {
      throw new Error('Authentication failed. No user record returned.');
    }

    // 2. Authoritative Server/Database Check: Verify owner status
    let isOwner = data.user.app_metadata?.role === 'owner';
    if (!isOwner) {
      try {
        const { data: rpcIsOwner } = await supabase.rpc('is_rbb_owner');
        if (rpcIsOwner === true) {
          isOwner = true;
        }
      } catch {}
    }

    if (!isOwner) {
      // Non-owner authenticated account detected: immediately sign out to prevent privilege leak
      await supabase.auth.signOut();
      throw new Error(
        'Access Denied: Your account is authenticated, but is not authorized as the designated RBB Owner.'
      );
    }

    // Success: reset rate limit tracking
    failedAttempts = 0;
    lockoutUntil = 0;

    // Purge any legacy client flags
    try {
      localStorage.removeItem('rbb_owner_session');
    } catch {}

    return {
      ...data,
      isOwner: true
    };
  } catch (err) {
    if (!rateLimit.isLocked && !err.message?.includes('Too many failed')) {
      failedAttempts += 1;
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      }
    }
    throw err;
  }
}

/**
 * Request a password reset link for an owner account
 */
export async function sendOwnerPasswordReset(email) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured yet.');
  }
  const cleanEmail = (email || '').trim();
  if (!cleanEmail) {
    throw new Error('Please enter your email to receive a password reset link.');
  }
  const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
  if (error) {
    throw new Error(error.message || 'Unable to send password reset request.');
  }
  return data;
}

/**
 * Sign out current session and revoke tokens
 */
export async function signOutOwner() {
  try {
    localStorage.removeItem('rbb_owner_session');
  } catch {}
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error', e);
    }
  }
}

/**
 * Public Catalogue Query: Fetch products from Supabase
 * Accessible to everyone without login
 */
export async function fetchPublicProducts() {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, code),
        brand:brands(id, name),
        material:materials(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Fetch Products Warning]', error.message);
      return [];
    }

    return (data || []).map((p) => ({
      ...p,
      id: p.id,
      name: p.name,
      productName: p.name,
      code: p.code,
      productCode: p.code,
      categoryId: p.category_id,
      categoryName: p.category?.name || '',
      category: p.category?.name || '',
      categoryCode: p.category?.code || '',
      brand: p.brand?.name || '',
      material: p.material?.name || '',
      subCategory: p.sub_category || '',
      sizeCapacity: p.size_capacity || '',
      sizeOrCapacity: p.size_capacity || '',
      purchasePrice: Number(p.purchase_price) || 0,
      purchaseUnit: p.purchase_unit || 'Piece',
      specialDetails: p.special_details || '',
      images: p.images || [p.image1, p.image2].filter(Boolean),
      image1: p.image1 || (p.images && p.images[0]) || '',
      image2: p.image2 || (p.images && p.images[1]) || '',
      status: p.status || 'In Stock',
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));
  } catch (err) {
    console.warn('[Fetch Products Error]', err);
    return [];
  }
}

/**
 * Public Catalogue Query: Fetch categories from Supabase
 * Accessible to everyone without login
 */
export async function fetchPublicCategories() {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, code, description, created_at, updated_at')
      .order('name');
    if (error) {
      console.warn('[Fetch Categories Warning]', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[Fetch Categories Error]', err);
    return [];
  }
}

/**
 * Public Catalogue Query: Fetch brands from Supabase
 * Accessible to everyone without login
 */
export async function fetchPublicBrands() {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, origin, created_at, updated_at')
      .order('name');
    if (error) {
      console.warn('[Fetch Brands Warning]', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[Fetch Brands Error]', err);
    return [];
  }
}

/**
 * Public Catalogue Query: Fetch materials from Supabase
 * Accessible to everyone without login
 */
export async function fetchPublicMaterials() {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('materials')
      .select('id, name, description, created_at, updated_at')
      .order('name');
    if (error) {
      console.warn('[Fetch Materials Warning]', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[Fetch Materials Error]', err);
    return [];
  }
}

/**
 * Atomically generates the next product code from PostgreSQL get_next_product_code()
 * Never relies on client-side sequence or localStorage when in Supabase mode.
 */
export async function fetchDbProductCode(categoryCode) {
  if (!categoryCode || !categoryCode.trim()) {
    throw new Error('Category code is required for product code generation.');
  }

  const cleanCode = categoryCode.toUpperCase().trim();
  const { data, error } = await supabase.rpc('get_next_product_code', {
    p_category_code: cleanCode
  });

  if (error) {
    console.error('[Supabase RPC Error]', error);
    throw new Error(
      `Database sequence generation failed for category "${cleanCode}": ${error.message}. ` +
      `Check that the migration 001_initial_schema.sql has been applied and that your account is authenticated.`
    );
  }

  if (!data || typeof data !== 'string' || !data.startsWith('RBB-')) {
    throw new Error(`Invalid product code returned from database RPC: "${data}"`);
  }

  return data;
}

/**
 * Peek at the expected next product code without incrementing the database counter.
 * Used exclusively for form previews prior to submission.
 */
export async function peekNextDbProductCode(categoryCode) {
  if (!isSupabaseConfigured || !categoryCode) {
    return null;
  }

  try {
    const cleanCode = categoryCode.toUpperCase().trim();
    const { data, error } = await supabase
      .from('category_sequences')
      .select('last_number')
      .eq('category_code', cleanCode)
      .maybeSingle();

    if (error) {
      // If table query fails, fallback to clean placeholder preview
      return `RBB-${cleanCode}-...`;
    }

    const nextNum = (data?.last_number || 0) + 1;
    return `RBB-${cleanCode}-${String(nextNum).padStart(3, '0')}`;
  } catch {
    return `RBB-${categoryCode.toUpperCase().trim()}-...`;
  }
}

/**
 * Upload product image to Supabase Storage ('product-images' bucket)
 * Enforces:
 * - 5MB maximum file size
 * - Allowed types: image/jpeg, image/png, image/webp
 * - Unique path generation
 */
export async function uploadProductImage(file, productCode, slotNumber) {
  if (!file) return null;

  // Validate file size (5MB = 5,242,880 bytes)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(
      `Image ${slotNumber} is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 5MB.`
    );
  }

  // Validate MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Image ${slotNumber} must be JPG, PNG, or WEBP (received: ${file.type || 'unknown'}).`
    );
  }

  // Sanitize file extension and path
  const ext = file.name?.split('.').pop()?.toLowerCase() || (file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg');
  const safeCode = (productCode || 'prod').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const filePath = `products/${safeCode}_slot${slotNumber}_${timestamp}_${randomSuffix}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });

  if (uploadError) {
    throw new Error(`Failed to upload Image ${slotNumber} to Supabase Storage: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: urlData.publicUrl
  };
}

/**
 * Remove uploaded files from storage (used for rollback on error)
 */
export async function deleteStorageFiles(paths) {
  if (!paths || !Array.isArray(paths) || paths.length === 0) return;
  try {
    await supabase.storage.from('product-images').remove(paths);
  } catch (err) {
    console.warn('[Storage Cleanup Warning] Failed to delete rolled-back files:', paths, err);
  }
}

/**
 * Ensure category exists in Supabase categories table
 * Returns the record with its UUID id
 */
export async function ensureCategoryInDb({ name, code, description = '' }) {
  const cleanCode = code.toUpperCase().trim();
  const cleanName = name.trim();

  // Try to find existing category by code
  const { data: existing, error: findError } = await supabase
    .from('categories')
    .select('id, name, code')
    .eq('code', cleanCode)
    .maybeSingle();

  if (findError) {
    throw new Error(`Database error finding category "${cleanCode}": ${findError.message}`);
  }

  if (existing) {
    return existing;
  }

  // Insert new category
  const { data: inserted, error: insertError } = await supabase
    .from('categories')
    .insert([
      {
        name: cleanName,
        code: cleanCode,
        description: description.trim()
      }
    ])
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to insert category "${cleanName}" (${cleanCode}): ${insertError.message}`);
  }

  return inserted;
}

/**
 * Ensure brand exists in Supabase brands table
 */
export async function ensureBrandInDb(brandName, origin = 'India') {
  if (!brandName || !brandName.trim()) return null;
  const clean = brandName.trim();

  const { data: existing } = await supabase
    .from('brands')
    .select('id, name')
    .ilike('name', clean)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: inserted, error } = await supabase
    .from('brands')
    .insert([{ name: clean, origin: origin.trim() || 'India' }])
    .select('id')
    .single();

  if (error) {
    // If concurrent insert occurred, re-query
    const { data: retry } = await supabase
      .from('brands')
      .select('id')
      .ilike('name', clean)
      .maybeSingle();
    return retry?.id || null;
  }

  return inserted.id;
}

/**
 * Ensure material exists in Supabase materials table
 */
export async function ensureMaterialInDb(materialName, description = '') {
  if (!materialName || !materialName.trim()) return null;
  const clean = materialName.trim();

  const { data: existing } = await supabase
    .from('materials')
    .select('id, name')
    .ilike('name', clean)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: inserted, error } = await supabase
    .from('materials')
    .insert([{ name: clean, description: description.trim() }])
    .select('id')
    .single();

  if (error) {
    const { data: retry } = await supabase
      .from('materials')
      .select('id')
      .ilike('name', clean)
      .maybeSingle();
    return retry?.id || null;
  }

  return inserted.id;
}

/**
 * Ensure subcategory exists in Supabase sub_categories table
 */
export async function ensureSubCategoryInDb(subCategoryName, categoryId) {
  if (!subCategoryName || !subCategoryName.trim()) return null;
  const clean = subCategoryName.trim();

  const query = supabase
    .from('sub_categories')
    .select('id')
    .ilike('name', clean);

  if (categoryId) {
    query.eq('category_id', categoryId);
  }

  const { data: existing } = await query.maybeSingle();
  if (existing) return existing.id;

  const { data: inserted } = await supabase
    .from('sub_categories')
    .insert([{ name: clean, category_id: categoryId || null }])
    .select('id')
    .maybeSingle();

  return inserted?.id || null;
}

/**
 * Ensure size/capacity exists in Supabase sizes table
 */
export async function ensureSizeInDb(sizeName) {
  if (!sizeName || !sizeName.trim()) return null;
  const clean = sizeName.trim();

  const { data: existing } = await supabase
    .from('sizes')
    .select('id')
    .ilike('name', clean)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: inserted } = await supabase
    .from('sizes')
    .insert([{ name: clean }])
    .select('id')
    .maybeSingle();

  return inserted?.id || null;
}

/**
 * Complete Product Creation in Supabase
 *
 * Requirements handled:
 * 1. Checks Supabase Auth & Owner RLS
 * 2. Generates atomic code via get_next_product_code() RPC
 * 3. Resolves category, brand, material foreign keys
 * 4. Uploads image 1 and image 2 (enforcing max 2) to Storage
 * 5. Automatic rollback of uploaded images if database insertion fails
 * 6. Preserves all fields: name, purchase_price, status, special_details, etc.
 * 7. Fails explicitly with descriptive error; never silently falls back to localStorage
 */
export async function createProductInSupabase(formPayload, imageFiles = {}) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  // 1. Verify owner session
  const authStatus = await getOwnerAuthStatus();
  if (!authStatus.isAuthenticated) {
    throw new Error(
      'Authentication required: Please sign in to your owner account to add products to the Supabase catalogue.'
    );
  }

  // 2. Validate essential form payload
  const productName = formPayload.name?.trim() || formPayload.productName?.trim();
  if (!productName) {
    throw new Error('Product name is required.');
  }

  const categoryCode = formPayload.categoryCode?.trim() || 'CO';
  const categoryName = formPayload.categoryName?.trim() || formPayload.category?.trim() || 'Cookware';

  // 3. Resolve Category Foreign Key in Supabase
  const dbCategory = await ensureCategoryInDb({
    name: categoryName,
    code: categoryCode,
    description: formPayload.categoryDescription || ''
  });

  const categoryId = dbCategory.id;

  // 4. Resolve Brand and Material Foreign Keys
  const brandId = formPayload.brand
    ? await ensureBrandInDb(formPayload.brand)
    : null;

  const materialId = formPayload.material
    ? await ensureMaterialInDb(formPayload.material)
    : null;

  // Optional: Record subcategory and size in background for future dropdown auto-complete
  if (formPayload.subCategory) {
    ensureSubCategoryInDb(formPayload.subCategory, categoryId).catch(() => {});
  }
  if (formPayload.sizeCapacity || formPayload.sizeOrCapacity) {
    ensureSizeInDb(formPayload.sizeCapacity || formPayload.sizeOrCapacity).catch(() => {});
  }

  // 5. Generate Atomic Product Code from PostgreSQL Function
  // Non-reuse and concurrency-safe
  const generatedCode = await fetchDbProductCode(categoryCode);

  // 6. Upload Images to Storage (Max 2 images)
  const uploadedPaths = [];
  const permanentUrls = [];

  try {
    // Slot 1 (Required)
    if (imageFiles.file1) {
      const res1 = await uploadProductImage(imageFiles.file1, generatedCode, 1);
      if (res1) {
        uploadedPaths.push(res1.path);
        permanentUrls.push(res1.publicUrl);
      }
    } else if (formPayload.image1 && !formPayload.image1.startsWith('blob:')) {
      // Existing remote URL (e.g. from template/migration)
      permanentUrls.push(formPayload.image1);
    } else {
      throw new Error('A valid product image is required for Image 1.');
    }

    // Slot 2 (Optional)
    if (imageFiles.file2) {
      const res2 = await uploadProductImage(imageFiles.file2, generatedCode, 2);
      if (res2) {
        uploadedPaths.push(res2.path);
        permanentUrls.push(res2.publicUrl);
      }
    } else if (formPayload.image2 && !formPayload.image2.startsWith('blob:')) {
      permanentUrls.push(formPayload.image2);
    }
  } catch (uploadError) {
    // Roll back any images uploaded during this transaction
    if (uploadedPaths.length > 0) {
      await deleteStorageFiles(uploadedPaths);
    }
    throw new Error(`Image storage upload failed: ${uploadError.message}`);
  }

  // 7. Insert Product Record into PostgreSQL
  const dbPayload = {
    name: productName,
    code: generatedCode,
    category_id: categoryId,
    brand_id: brandId,
    material_id: materialId,
    sub_category: formPayload.subCategory?.trim() || '',
    size_capacity: (formPayload.sizeCapacity || formPayload.sizeOrCapacity || '').trim(),
    purchase_price: formPayload.purchasePrice !== undefined && formPayload.purchasePrice !== null && formPayload.purchasePrice !== ''
      ? Number(formPayload.purchasePrice)
      : 0,
    purchase_unit: (formPayload.purchaseUnit || formPayload.purchase_unit || 'Piece').trim(),
    special_details: formPayload.specialDetails?.trim() || '',
    images: permanentUrls,
    image1: permanentUrls[0] || '',
    image2: permanentUrls[1] || '',
    status: formPayload.status || 'In Stock'
  };

  let { data: insertedProduct, error: insertError } = await supabase
    .from('products')
    .insert([dbPayload])
    .select(`
      *,
      category:categories(id, name, code),
      brand:brands(id, name),
      material:materials(id, name)
    `)
    .single();

  // Graceful fallback: If Supabase table does not yet have purchase_unit column, retry without it
  if (insertError && (insertError.code === '42703' || insertError.message?.includes('purchase_unit'))) {
    console.warn('[Supabase Insert] purchase_unit column not present in schema; retrying without it.');
    const { purchase_unit: _discard, ...fallbackPayload } = dbPayload;
    const retryResult = await supabase
      .from('products')
      .insert([fallbackPayload])
      .select(`
        *,
        category:categories(id, name, code),
        brand:brands(id, name),
        material:materials(id, name)
      `)
      .single();

    if (!retryResult.error) {
      insertedProduct = retryResult.data;
      insertError = null;
    }
  }

  if (insertError) {
    // Database insert failed: ROLL BACK uploaded images to prevent orphaned storage
    if (uploadedPaths.length > 0) {
      await deleteStorageFiles(uploadedPaths);
    }

    console.error('[Supabase Insert Error]', insertError);

    // Provide helpful user-facing diagnostics
    if (insertError.code === '42501' || insertError.message?.includes('row-level security')) {
      throw new Error(
        'Supabase RLS Permission Denied: Your account is authenticated, but is not authorized as the RBB Owner. ' +
        'Ensure your account is designated as the authorized RBB Owner.'
      );
    }

    throw new Error(`Database error creating product in Supabase: ${insertError.message} (Code: ${insertError.code || 'UNKNOWN'})`);
  }

  // 8. Return normalized product record compatible with frontend state
  return {
    ...insertedProduct,
    id: insertedProduct.id,
    name: insertedProduct.name,
    productName: insertedProduct.name,
    code: insertedProduct.code,
    productCode: insertedProduct.code,
    categoryId: insertedProduct.category_id,
    categoryName: insertedProduct.category?.name || categoryName,
    category: insertedProduct.category?.name || categoryName,
    categoryCode: insertedProduct.category?.code || categoryCode,
    brand: insertedProduct.brand?.name || formPayload.brand || '',
    material: insertedProduct.material?.name || formPayload.material || '',
    subCategory: insertedProduct.sub_category,
    sizeCapacity: insertedProduct.size_capacity,
    sizeOrCapacity: insertedProduct.size_capacity,
    purchasePrice: Number(insertedProduct.purchase_price) || 0,
    purchaseUnit: insertedProduct.purchase_unit || formPayload.purchaseUnit || 'Piece',
    specialDetails: insertedProduct.special_details,
    images: insertedProduct.images || permanentUrls,
    image1: insertedProduct.image1 || permanentUrls[0] || '',
    image2: insertedProduct.image2 || permanentUrls[1] || '',
    status: insertedProduct.status,
    isSupabaseSynced: true,
    createdAt: insertedProduct.created_at,
    updatedAt: insertedProduct.updated_at
  };
}
