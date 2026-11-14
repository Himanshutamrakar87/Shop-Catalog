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

// In-memory owner auth cache to avoid redundant network roundtrips on every fetch/save
const OWNER_AUTH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OWNER_HINT_STORAGE_KEY = 'rbb_verified_owner_hint_v1';

let ownerAuthCache = {
  userId: null,
  accessToken: null,
  status: null,
  cachedAt: 0
};
let inFlightAuthCheck = null;
let inFlightSignInPromise = null;

function readStoredSupabaseSession() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const session = parsed?.currentSession || parsed?.session || parsed;
        const user = session?.user;
        const expiresAt = Number(session?.expires_at || 0);
        if (user?.id && (!expiresAt || expiresAt * 1000 > Date.now() - 30000)) {
          return {
            user,
            accessToken: session?.access_token || null
          };
        }
      }
    }
  } catch {
    // Ignore storage read/parse errors
  }
  return null;
}

function saveVerifiedOwnerHint(user) {
  if (!user?.id) return;
  try {
    localStorage.setItem(
      OWNER_HINT_STORAGE_KEY,
      JSON.stringify({
        userId: user.id,
        email: user.email || '',
        verifiedAt: Date.now()
      })
    );
  } catch {
    // Ignore storage errors
  }
}

function clearVerifiedOwnerHint() {
  try {
    localStorage.removeItem(OWNER_HINT_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Synchronous optimistic auth status for instant UI hydration on mount/reload.
 * Background server verification (is_rbb_owner) always still runs to enforce truth,
 * and PostgreSQL RLS enforces server-side security on every write.
 */
export function getOptimisticOwnerStatus() {
  if (!isSupabaseConfigured) {
    return {
      isConfigured: false,
      isAuthenticated: false,
      isOwner: false,
      isLoading: false,
      user: null,
      role: null,
      reason: 'Local offline mode'
    };
  }

  const storedSession = readStoredSupabaseSession();
  if (!storedSession?.user?.id) {
    clearVerifiedOwnerHint();
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

  try {
    const rawHint = localStorage.getItem(OWNER_HINT_STORAGE_KEY);
    if (rawHint) {
      const hint = JSON.parse(rawHint);
      if (hint?.userId && hint.userId === storedSession.user.id) {
        return {
          isConfigured: true,
          isAuthenticated: true,
          isOwner: true,
          isLoading: false,
          user: storedSession.user,
          role: 'owner',
          reason: 'Authenticated as RBB Owner'
        };
      }
    }
  } catch {
    // Ignore parse errors
  }

  // Session exists locally without cached owner hint: brief verification state
  return {
    isConfigured: true,
    isAuthenticated: true,
    isOwner: storedSession.user.app_metadata?.role === 'owner',
    isLoading: storedSession.user.app_metadata?.role !== 'owner',
    user: storedSession.user,
    role: storedSession.user.app_metadata?.role || null,
    reason: 'Verifying Supabase authentication...'
  };
}

export function isOwnerSignInInFlight() {
  return Boolean(inFlightSignInPromise);
}

export function invalidateOwnerAuthCache() {
  ownerAuthCache = {
    userId: null,
    accessToken: null,
    status: null,
    cachedAt: 0
  };
  inFlightAuthCheck = null;
}

function isValidUuid(val) {
  return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

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
 * Uses local session fast-path + short-lived memory cache + in-flight deduplication
 * to keep login transitions, page loads, and saves instantaneous.
 */
export async function getOwnerAuthStatus(forceRefresh = false) {
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

  // If a password sign-in flow is currently executing its own authoritative owner RPC check,
  // share its result instead of firing a duplicate parallel is_rbb_owner() RPC.
  if (!forceRefresh && inFlightSignInPromise) {
    try {
      const signInRes = await inFlightSignInPromise;
      if (signInRes?.authStatus) {
        return signInRes.authStatus;
      }
    } catch {
      // Fall through to standard check if sign-in failed
    }
  }

  if (!forceRefresh && inFlightAuthCheck) {
    return inFlightAuthCheck;
  }

  const runCheck = async () => {
    try {
      // Fast-path: read current session from local storage without forcing an extra /user roundtrip
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      const user = session?.user || null;
      const accessToken = session?.access_token || null;

      if (sessionError || !user) {
        invalidateOwnerAuthCache();
        clearVerifiedOwnerHint();
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

      // Return cached verified owner status if token matches and TTL hasn't expired
      const now = Date.now();
      if (
        !forceRefresh &&
        ownerAuthCache.status &&
        ownerAuthCache.userId === user.id &&
        ownerAuthCache.accessToken === accessToken &&
        now - ownerAuthCache.cachedAt < OWNER_AUTH_CACHE_TTL_MS
      ) {
        return ownerAuthCache.status;
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

      if (isOwner) {
        saveVerifiedOwnerHint(user);
      } else {
        clearVerifiedOwnerHint();
      }

      const resolvedStatus = {
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

      ownerAuthCache = {
        userId: user.id,
        accessToken,
        status: resolvedStatus,
        cachedAt: now
      };

      return resolvedStatus;
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
    } finally {
      inFlightAuthCheck = null;
    }
  };

  inFlightAuthCheck = runCheck();
  return inFlightAuthCheck;
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

  const executeSignIn = async () => {
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
        clearVerifiedOwnerHint();
        // Non-owner authenticated account detected: immediately sign out to prevent privilege leak
        await supabase.auth.signOut();
        throw new Error(
          'Access Denied: Your account is authenticated, but is not authorized as the designated RBB Owner.'
        );
      }

      // Success: reset rate limit tracking and warm auth cache immediately
      // so post-login navigation/checks resolve in 0ms without re-querying is_rbb_owner()
      failedAttempts = 0;
      lockoutUntil = 0;

      const resolvedStatus = {
        isConfigured: true,
        isAuthenticated: true,
        isOwner: true,
        isLoading: false,
        user: data.user,
        role: 'owner',
        reason: 'Authenticated as RBB Owner'
      };

      ownerAuthCache = {
        userId: data.user.id,
        accessToken: data.session?.access_token || null,
        status: resolvedStatus,
        cachedAt: Date.now()
      };
      inFlightAuthCheck = null;
      saveVerifiedOwnerHint(data.user);

      // Purge any legacy client flags
      try {
        localStorage.removeItem('rbb_owner_session');
      } catch {}

      return {
        ...data,
        isOwner: true,
        authStatus: resolvedStatus
      };
    } catch (err) {
      if (!rateLimit.isLocked && !err.message?.includes('Too many failed')) {
        failedAttempts += 1;
        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
          lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
        }
      }
      throw err;
    } finally {
      inFlightSignInPromise = null;
    }
  };

  inFlightSignInPromise = executeSignIn();
  return inFlightSignInPromise;
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
  invalidateOwnerAuthCache();
  clearVerifiedOwnerHint();
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
 * Enrich normalized product objects with category/brand/material display fields
 * from separate metadata tables (avoids slower PostgREST lateral joins).
 */
export function enrichProductsWithLookups(productsList, categoriesList = [], brandsList = [], materialsList = []) {
  if (!Array.isArray(productsList) || productsList.length === 0) return productsList;

  const categoryById = new Map();
  for (const c of categoriesList || []) {
    if (c?.id) categoryById.set(c.id, c);
  }
  const brandById = new Map();
  for (const b of brandsList || []) {
    if (b?.id) brandById.set(b.id, b);
  }
  const materialById = new Map();
  for (const m of materialsList || []) {
    if (m?.id) materialById.set(m.id, m);
  }

  return productsList.map((p) => {
    const cat = p.categoryId ? categoryById.get(p.categoryId) : null;
    const br = p.brandId ? brandById.get(p.brandId) : null;
    const mat = p.materialId ? materialById.get(p.materialId) : null;

    const categoryName = cat?.name || p.categoryName || p.category || '';
    const categoryCode = cat?.code || p.categoryCode || '';
    const brandName = br?.name || p.brand || '';
    const materialName = mat?.name || p.material || '';

    return {
      ...p,
      categoryName,
      category: categoryName,
      categoryCode,
      brand: brandName,
      material: materialName
    };
  });
}

/**
 * Public Catalogue Query: Fetch products from Supabase
 * Uses a fast single-table indexed scan without lateral joins; metadata is merged in JS.
 * Accessible to everyone without login
 */
export async function fetchPublicProducts(lookups = null) {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select(
        'id, name, code, category_id, brand_id, material_id, sub_category, size_capacity, purchase_price, purchase_unit, special_details, images, image1, image2, status, created_at, updated_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Fetch Products Warning]', error.message);
      return null;
    }

    const normalized = (data || []).map((p) => ({
      ...p,
      id: p.id,
      name: p.name,
      productName: p.name,
      code: p.code,
      productCode: p.code,
      categoryId: p.category_id,
      brandId: p.brand_id,
      materialId: p.material_id,
      categoryName: '',
      category: '',
      categoryCode: '',
      brand: '',
      material: '',
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

    if (lookups) {
      return enrichProductsWithLookups(
        normalized,
        lookups.categories,
        lookups.brands,
        lookups.materials
      );
    }

    return normalized;
  } catch (err) {
    console.warn('[Fetch Products Error]', err);
    return null;
  }
}

/**
 * Public Catalogue Query: Fetch categories from Supabase
 * Accessible to everyone without login
 */
export async function fetchPublicCategories() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, code, description, created_at, updated_at')
      .order('name');
    if (error) {
      console.warn('[Fetch Categories Warning]', error.message);
      return null;
    }
    return (data || []).map((c) => ({
      ...c,
      name: c.name || '',
      code: c.code || '',
      description: c.description || '',
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));
  } catch (err) {
    console.warn('[Fetch Categories Error]', err);
    return null;
  }
}

/**
 * Public Catalogue Query: Fetch brands from Supabase
 * Accessible to everyone without login
 */
export async function fetchPublicBrands() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, origin, created_at, updated_at')
      .order('name');
    if (error) {
      console.warn('[Fetch Brands Warning]', error.message);
      return null;
    }
    return data || [];
  } catch (err) {
    console.warn('[Fetch Brands Error]', err);
    return null;
  }
}

/**
 * Public Catalogue Query: Fetch materials from Supabase
 * Accessible to everyone without login
 */
export async function fetchPublicMaterials() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('materials')
      .select('id, name, description, created_at, updated_at')
      .order('name');
    if (error) {
      console.warn('[Fetch Materials Warning]', error.message);
      return null;
    }
    return data || [];
  } catch (err) {
    console.warn('[Fetch Materials Error]', err);
    return null;
  }
}

/**
 * Public Catalogue Query: Fetch sub-categories from Supabase
 * Accessible to everyone without login
 */
export async function fetchPublicSubCategories() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('sub_categories')
      .select('id, name, category_id, created_at, updated_at')
      .order('name');
    if (error) {
      console.warn('[Fetch SubCategories Warning]', error.message);
      return null;
    }
    return data || [];
  } catch (err) {
    console.warn('[Fetch SubCategories Error]', err);
    return null;
  }
}

/**
 * Public Catalogue Query: Fetch sizes/capacities from Supabase
 * Accessible to everyone without login
 */
export async function fetchPublicSizes() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('sizes')
      .select('id, name, created_at, updated_at')
      .order('name');
    if (error) {
      console.warn('[Fetch Sizes Warning]', error.message);
      return null;
    }
    return data || [];
  } catch (err) {
    console.warn('[Fetch Sizes Error]', err);
    return null;
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

  // Normalize MIME type (some mobile browsers emit image/jpg or empty string)
  const extFromName = file.name?.split('.').pop()?.toLowerCase() || '';
  let mimeType = (file.type || '').toLowerCase();
  if (mimeType === 'image/jpg') {
    mimeType = 'image/jpeg';
  } else if (!mimeType) {
    if (extFromName === 'png') mimeType = 'image/png';
    else if (extFromName === 'webp') mimeType = 'image/webp';
    else if (extFromName === 'jpg' || extFromName === 'jpeg') mimeType = 'image/jpeg';
  }

  // Validate MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(mimeType)) {
    throw new Error(
      `Image ${slotNumber} must be JPG, PNG, or WEBP (received: ${file.type || 'unknown'}).`
    );
  }

  // Sanitize file extension and path
  const ext = extFromName || (mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg');
  const safeCode = (productCode || 'prod').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const filePath = `products/${safeCode}_slot${slotNumber}_${timestamp}_${randomSuffix}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: mimeType
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
export async function ensureCategoryInDb({ id, name, code, description = '' }) {
  if (isValidUuid(id)) {
    return { id, name: (name || '').trim(), code: (code || '').toUpperCase().trim() };
  }

  const cleanCode = (code || '').toUpperCase().trim();
  const cleanName = (name || '').trim();

  // Try to find existing category by code first
  if (cleanCode) {
    const { data: existingByCode, error: findError } = await supabase
      .from('categories')
      .select('id, name, code')
      .eq('code', cleanCode)
      .limit(1);

    if (findError) {
      throw new Error(`Database error finding category "${cleanCode}": ${findError.message}`);
    }
    if (existingByCode && existingByCode.length > 0) {
      return existingByCode[0];
    }
  }

  // Fallback: find by name (case-insensitive)
  if (cleanName) {
    const { data: existingByName } = await supabase
      .from('categories')
      .select('id, name, code')
      .ilike('name', cleanName)
      .limit(1);

    if (existingByName && existingByName.length > 0) {
      return existingByName[0];
    }
  }

  // Insert new category
  const { data: inserted, error: insertError } = await supabase
    .from('categories')
    .insert([
      {
        name: cleanName || 'General',
        code: cleanCode || 'GN',
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
 * Create a new category in Supabase with duplicate name/code protection
 */
export async function createCategoryInDb({ name, code, description = '' }, generateCodeFn) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const authStatus = await getOwnerAuthStatus();
  if (!authStatus.isAuthenticated || !authStatus.isOwner) {
    throw new Error('Please sign in as the Owner to add categories to Supabase.');
  }

  const cleanName = (name || '').trim();
  if (!cleanName) {
    throw new Error('Category name is required.');
  }

  const { data: existingRows, error: fetchErr } = await supabase
    .from('categories')
    .select('id, name, code');

  if (fetchErr) {
    throw new Error(`Database error checking existing categories: ${fetchErr.message}`);
  }

  const rows = existingRows || [];
  const nameExists = rows.some(
    (c) => String(c.name || '').trim().toLowerCase() === cleanName.toLowerCase()
  );
  if (nameExists) {
    throw new Error(`Category "${cleanName}" already exists.`);
  }

  const existingCodes = rows.map((c) => String(c.code || '').toUpperCase()).filter(Boolean);
  let finalCode = (code || '').toUpperCase().trim();
  if (!finalCode || existingCodes.includes(finalCode)) {
    finalCode = typeof generateCodeFn === 'function'
      ? generateCodeFn(cleanName, existingCodes)
      : finalCode;
  }

  const { data: inserted, error: insertError } = await supabase
    .from('categories')
    .insert([
      {
        name: cleanName,
        code: finalCode,
        description: (description || '').trim()
      }
    ])
    .select('id, name, code, description, created_at, updated_at')
    .single();

  if (insertError) {
    throw new Error(`Failed to create category "${cleanName}": ${insertError.message}`);
  }

  return {
    ...inserted,
    name: inserted.name || cleanName,
    code: inserted.code || finalCode,
    description: inserted.description || '',
    createdAt: inserted.created_at,
    updatedAt: inserted.updated_at
  };
}

/**
 * Update an existing category in Supabase
 */
export async function updateCategoryInDb(id, { name, description }) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const authStatus = await getOwnerAuthStatus();
  if (!authStatus.isAuthenticated || !authStatus.isOwner) {
    throw new Error('Please sign in as the Owner to update categories.');
  }

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description.trim();

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select('id, name, code, description, created_at, updated_at')
    .single();

  if (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }

  return {
    ...data,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

/**
 * Delete a category from Supabase
 */
export async function deleteCategoryInDb(id) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const authStatus = await getOwnerAuthStatus();
  if (!authStatus.isAuthenticated || !authStatus.isOwner) {
    throw new Error('Please sign in as the Owner to delete categories.');
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    if (error.code === '23503') {
      throw new Error('This category is used by products in the database. Move or delete those products first.');
    }
    throw new Error(`Failed to delete category: ${error.message}`);
  }

  return true;
}

/**
 * Ensure brand exists in Supabase brands table
 */
export async function ensureBrandInDb(brandName, origin = 'India', existingId = null) {
  if (isValidUuid(existingId)) return existingId;
  if (!brandName || !brandName.trim()) return null;
  const clean = brandName.trim();

  const { data: existingRows } = await supabase
    .from('brands')
    .select('id, name')
    .ilike('name', clean)
    .limit(1);

  if (existingRows && existingRows.length > 0) return existingRows[0].id;

  const { data: inserted, error } = await supabase
    .from('brands')
    .insert([{ name: clean, origin: origin.trim() || 'India' }])
    .select('id')
    .single();

  if (error) {
    const { data: retryRows } = await supabase
      .from('brands')
      .select('id')
      .ilike('name', clean)
      .limit(1);
    return retryRows?.[0]?.id || null;
  }

  return inserted.id;
}

/**
 * Ensure material exists in Supabase materials table
 */
export async function ensureMaterialInDb(materialName, description = '', existingId = null) {
  if (isValidUuid(existingId)) return existingId;
  if (!materialName || !materialName.trim()) return null;
  const clean = materialName.trim();

  const { data: existingRows } = await supabase
    .from('materials')
    .select('id, name')
    .ilike('name', clean)
    .limit(1);

  if (existingRows && existingRows.length > 0) return existingRows[0].id;

  const { data: inserted, error } = await supabase
    .from('materials')
    .insert([{ name: clean, description: description.trim() }])
    .select('id')
    .single();

  if (error) {
    const { data: retryRows } = await supabase
      .from('materials')
      .select('id')
      .ilike('name', clean)
      .limit(1);
    return retryRows?.[0]?.id || null;
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

  const categoryCode = formPayload.categoryCode?.trim() || 'GN';
  const categoryName = formPayload.categoryName?.trim() || formPayload.category?.trim() || 'General';

  // 3. Resolve Category, Brand, Material Foreign Keys in parallel
  const [dbCategory, brandId, materialId] = await Promise.all([
    ensureCategoryInDb({
      id: formPayload.categoryId,
      name: categoryName,
      code: categoryCode,
      description: formPayload.categoryDescription || ''
    }),
    formPayload.brand ? ensureBrandInDb(formPayload.brand, 'India', formPayload.brandId) : Promise.resolve(null),
    formPayload.material ? ensureMaterialInDb(formPayload.material, '', formPayload.materialId) : Promise.resolve(null)
  ]);

  const categoryId = dbCategory.id;

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

  const parsedPrice = Number(formPayload.purchasePrice);
  const safePrice = Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0;

  // 7. Insert Product Record into PostgreSQL
  const dbPayload = {
    name: productName,
    code: generatedCode,
    category_id: categoryId,
    brand_id: brandId,
    material_id: materialId,
    sub_category: formPayload.subCategory?.trim() || '',
    size_capacity: (formPayload.sizeCapacity || formPayload.sizeOrCapacity || '').trim(),
    purchase_price: safePrice,
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
  if (insertError && (insertError.code === '42703' || insertError.code === 'PGRST204' || insertError.message?.includes('purchase_unit'))) {
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
    } else {
      insertError = retryResult.error;
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
      invalidateOwnerAuthCache();
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

/**
 * Update an existing Product Record in Supabase
 */
export async function updateProductInSupabase(id, formPayload, imageFiles = {}) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const authStatus = await getOwnerAuthStatus();
  if (!authStatus.isAuthenticated || !authStatus.isOwner) {
    throw new Error(
      'Authentication required: Please sign in to your owner account to update products in Supabase.'
    );
  }

  const productName = formPayload.name?.trim() || formPayload.productName?.trim();
  if (!productName) {
    throw new Error('Product name is required.');
  }

  const categoryCode = formPayload.categoryCode?.trim() || 'GN';
  const categoryName = formPayload.categoryName?.trim() || formPayload.category?.trim() || 'General';

  // Resolve Category, Brand & Material in parallel (fast-pathing existing UUIDs)
  const [dbCategory, brandId, materialId] = await Promise.all([
    ensureCategoryInDb({
      id: formPayload.categoryId,
      name: categoryName,
      code: categoryCode,
      description: formPayload.categoryDescription || ''
    }),
    formPayload.brand ? ensureBrandInDb(formPayload.brand, 'India', formPayload.brandId) : Promise.resolve(null),
    formPayload.material ? ensureMaterialInDb(formPayload.material, '', formPayload.materialId) : Promise.resolve(null)
  ]);

  if (formPayload.subCategory) {
    ensureSubCategoryInDb(formPayload.subCategory, dbCategory.id).catch(() => {});
  }
  if (formPayload.sizeCapacity || formPayload.sizeOrCapacity) {
    ensureSizeInDb(formPayload.sizeCapacity || formPayload.sizeOrCapacity).catch(() => {});
  }

  const uploadedPaths = [];
  const permanentUrls = [];
  const codeForStorage = formPayload.code || formPayload.productCode || id;

  try {
    if (imageFiles.file1) {
      const res1 = await uploadProductImage(imageFiles.file1, codeForStorage, 1);
      if (res1) {
        uploadedPaths.push(res1.path);
        permanentUrls.push(res1.publicUrl);
      }
    } else if (formPayload.image1 && !formPayload.image1.startsWith('blob:')) {
      permanentUrls.push(formPayload.image1);
    }

    if (imageFiles.file2) {
      const res2 = await uploadProductImage(imageFiles.file2, codeForStorage, 2);
      if (res2) {
        uploadedPaths.push(res2.path);
        permanentUrls.push(res2.publicUrl);
      }
    } else if (formPayload.image2 && !formPayload.image2.startsWith('blob:')) {
      permanentUrls.push(formPayload.image2);
    }
  } catch (uploadError) {
    if (uploadedPaths.length > 0) {
      await deleteStorageFiles(uploadedPaths);
    }
    throw new Error(`Image storage upload failed: ${uploadError.message}`);
  }

  const parsedPrice = Number(formPayload.purchasePrice);
  const safePrice = Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0;

  const dbPayload = {
    name: productName,
    category_id: dbCategory.id,
    brand_id: brandId,
    material_id: materialId,
    sub_category: formPayload.subCategory?.trim() || '',
    size_capacity: (formPayload.sizeCapacity || formPayload.sizeOrCapacity || '').trim(),
    purchase_price: safePrice,
    purchase_unit: (formPayload.purchaseUnit || formPayload.purchase_unit || 'Piece').trim(),
    special_details: formPayload.specialDetails?.trim() || '',
    images: permanentUrls,
    image1: permanentUrls[0] || '',
    image2: permanentUrls[1] || '',
    status: formPayload.status || 'In Stock'
  };

  let { data: updatedRows, error: updateError } = await supabase
    .from('products')
    .update(dbPayload)
    .eq('id', id)
    .select(`
      *,
      category:categories(id, name, code),
      brand:brands(id, name),
      material:materials(id, name)
    `);

  if (updateError && (updateError.code === '42703' || updateError.code === 'PGRST204' || updateError.message?.includes('purchase_unit'))) {
    const { purchase_unit: _discard, ...fallbackPayload } = dbPayload;
    const retryResult = await supabase
      .from('products')
      .update(fallbackPayload)
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, code),
        brand:brands(id, name),
        material:materials(id, name)
      `);

    if (!retryResult.error) {
      updatedRows = retryResult.data;
      updateError = null;
    } else {
      updateError = retryResult.error;
    }
  }

  if (updateError) {
    if (uploadedPaths.length > 0) {
      await deleteStorageFiles(uploadedPaths);
    }
    if (updateError.code === '42501' || updateError.message?.includes('row-level security')) {
      invalidateOwnerAuthCache();
      throw new Error('Supabase RLS Permission Denied: Please sign in again as the RBB Owner to save edits.');
    }
    throw new Error(`Database error updating product in Supabase: ${updateError.message}`);
  }

  const updatedProduct = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
  if (!updatedProduct) {
    if (uploadedPaths.length > 0) {
      await deleteStorageFiles(uploadedPaths);
    }
    invalidateOwnerAuthCache();
    throw new Error(
      'Update did not save any changes in Supabase (product record not found or owner permission denied). Please verify your owner sign-in and try again.'
    );
  }

  return {
    ...updatedProduct,
    id: updatedProduct.id,
    name: updatedProduct.name,
    productName: updatedProduct.name,
    code: updatedProduct.code,
    productCode: updatedProduct.code,
    categoryId: updatedProduct.category_id,
    categoryName: updatedProduct.category?.name || categoryName,
    category: updatedProduct.category?.name || categoryName,
    categoryCode: updatedProduct.category?.code || categoryCode,
    brand: updatedProduct.brand?.name || formPayload.brand || '',
    material: updatedProduct.material?.name || formPayload.material || '',
    subCategory: updatedProduct.sub_category,
    sizeCapacity: updatedProduct.size_capacity,
    sizeOrCapacity: updatedProduct.size_capacity,
    purchasePrice: Number(updatedProduct.purchase_price) || 0,
    purchaseUnit: updatedProduct.purchase_unit || formPayload.purchaseUnit || 'Piece',
    specialDetails: updatedProduct.special_details,
    images: updatedProduct.images || permanentUrls,
    image1: updatedProduct.image1 || permanentUrls[0] || '',
    image2: updatedProduct.image2 || permanentUrls[1] || '',
    status: updatedProduct.status,
    isSupabaseSynced: true,
    createdAt: updatedProduct.created_at,
    updatedAt: updatedProduct.updated_at
  };
}
