-- =============================================================================
-- RBB Database Migration - Phase 2: Public Catalogue & Strict Owner Access
--
-- Objective:
-- 1. Enable anonymous (unauthenticated) SELECT access to public catalogue tables:
--    - products, categories, brands, materials, sub_categories, sizes
--    - 'product-images' storage bucket public read
-- 2. Restrict INSERT, UPDATE, DELETE strictly to verified RBB Owner:
--    - Enforced server-side via public.is_rbb_owner()
-- 3. Secure administrative tables:
--    - category_sequences: strictly owner-only (no public read)
--    - app_config: strictly owner-only (no public read)
-- 4. Preserve ALL existing data: ZERO data loss, ZERO drop tables, ZERO truncates.
-- =============================================================================

-- 1. Ensure RLS is enabled on all tables
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.category_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_config ENABLE ROW LEVEL SECURITY;

-- 2. Ensure is_rbb_owner() function is secure and robust
CREATE OR REPLACE FUNCTION public.is_rbb_owner()
RETURNS BOOLEAN AS $$
DECLARE
    v_owner_email TEXT;
BEGIN
    -- Deny all unauthenticated or anonymous callers immediately
    IF auth.role() IS NULL OR auth.role() != 'authenticated' THEN
        RETURN false;
    END IF;

    -- A. Check if user JWT app_metadata has role = 'owner'
    IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner' THEN
        RETURN true;
    END IF;

    -- B. Check if user email matches configured owner email in app_config
    SELECT value INTO v_owner_email FROM public.app_config WHERE key = 'owner_email' LIMIT 1;
    IF v_owner_email IS NOT NULL AND TRIM(v_owner_email) <> '' THEN
        IF LOWER(COALESCE(auth.jwt() ->> 'email', '')) = LOWER(TRIM(v_owner_email)) THEN
            RETURN true;
        END IF;
    END IF;

    -- C. Check database session setting 'app.settings.owner_email'
    BEGIN
        v_owner_email := current_setting('app.settings.owner_email', true);
    EXCEPTION WHEN OTHERS THEN
        v_owner_email := NULL;
    END;

    IF v_owner_email IS NOT NULL AND TRIM(v_owner_email) <> '' THEN
        IF LOWER(COALESCE(auth.jwt() ->> 'email', '')) = LOWER(TRIM(v_owner_email)) THEN
            RETURN true;
        END IF;
    END IF;

    -- Fail-closed: Deny any other user
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- Revoke execute from public; allow authenticated to run check
REVOKE ALL ON FUNCTION public.is_rbb_owner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_rbb_owner() TO authenticated;

-- =============================================================================
-- 3. Categories RLS Policies
-- =============================================================================
DROP POLICY IF EXISTS "Public read on categories" ON public.categories;
DROP POLICY IF EXISTS "Owner full access on categories" ON public.categories;
DROP POLICY IF EXISTS "Owner insert on categories" ON public.categories;
DROP POLICY IF EXISTS "Owner update on categories" ON public.categories;
DROP POLICY IF EXISTS "Owner delete on categories" ON public.categories;

-- Allow anyone (public/anon + authenticated) to view categories
CREATE POLICY "Public read on categories" ON public.categories
    FOR SELECT TO public
    USING (true);

-- Only verified owner can insert, update, or delete categories
CREATE POLICY "Owner insert on categories" ON public.categories
    FOR INSERT TO authenticated
    WITH CHECK (public.is_rbb_owner());

CREATE POLICY "Owner update on categories" ON public.categories
    FOR UPDATE TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

CREATE POLICY "Owner delete on categories" ON public.categories
    FOR DELETE TO authenticated
    USING (public.is_rbb_owner());

-- =============================================================================
-- 4. Brands RLS Policies
-- =============================================================================
DROP POLICY IF EXISTS "Public read on brands" ON public.brands;
DROP POLICY IF EXISTS "Owner full access on brands" ON public.brands;
DROP POLICY IF EXISTS "Owner insert on brands" ON public.brands;
DROP POLICY IF EXISTS "Owner update on brands" ON public.brands;
DROP POLICY IF EXISTS "Owner delete on brands" ON public.brands;

CREATE POLICY "Public read on brands" ON public.brands
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Owner insert on brands" ON public.brands
    FOR INSERT TO authenticated
    WITH CHECK (public.is_rbb_owner());

CREATE POLICY "Owner update on brands" ON public.brands
    FOR UPDATE TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

CREATE POLICY "Owner delete on brands" ON public.brands
    FOR DELETE TO authenticated
    USING (public.is_rbb_owner());

-- =============================================================================
-- 5. Materials RLS Policies
-- =============================================================================
DROP POLICY IF EXISTS "Public read on materials" ON public.materials;
DROP POLICY IF EXISTS "Owner full access on materials" ON public.materials;
DROP POLICY IF EXISTS "Owner insert on materials" ON public.materials;
DROP POLICY IF EXISTS "Owner update on materials" ON public.materials;
DROP POLICY IF EXISTS "Owner delete on materials" ON public.materials;

CREATE POLICY "Public read on materials" ON public.materials
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Owner insert on materials" ON public.materials
    FOR INSERT TO authenticated
    WITH CHECK (public.is_rbb_owner());

CREATE POLICY "Owner update on materials" ON public.materials
    FOR UPDATE TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

CREATE POLICY "Owner delete on materials" ON public.materials
    FOR DELETE TO authenticated
    USING (public.is_rbb_owner());

-- =============================================================================
-- 6. Sub-Categories RLS Policies
-- =============================================================================
DROP POLICY IF EXISTS "Public read on sub_categories" ON public.sub_categories;
DROP POLICY IF EXISTS "Owner full access on sub_categories" ON public.sub_categories;
DROP POLICY IF EXISTS "Owner insert on sub_categories" ON public.sub_categories;
DROP POLICY IF EXISTS "Owner update on sub_categories" ON public.sub_categories;
DROP POLICY IF EXISTS "Owner delete on sub_categories" ON public.sub_categories;

CREATE POLICY "Public read on sub_categories" ON public.sub_categories
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Owner insert on sub_categories" ON public.sub_categories
    FOR INSERT TO authenticated
    WITH CHECK (public.is_rbb_owner());

CREATE POLICY "Owner update on sub_categories" ON public.sub_categories
    FOR UPDATE TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

CREATE POLICY "Owner delete on sub_categories" ON public.sub_categories
    FOR DELETE TO authenticated
    USING (public.is_rbb_owner());

-- =============================================================================
-- 7. Sizes RLS Policies
-- =============================================================================
DROP POLICY IF EXISTS "Public read on sizes" ON public.sizes;
DROP POLICY IF EXISTS "Owner full access on sizes" ON public.sizes;
DROP POLICY IF EXISTS "Owner insert on sizes" ON public.sizes;
DROP POLICY IF EXISTS "Owner update on sizes" ON public.sizes;
DROP POLICY IF EXISTS "Owner delete on sizes" ON public.sizes;

CREATE POLICY "Public read on sizes" ON public.sizes
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Owner insert on sizes" ON public.sizes
    FOR INSERT TO authenticated
    WITH CHECK (public.is_rbb_owner());

CREATE POLICY "Owner update on sizes" ON public.sizes
    FOR UPDATE TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

CREATE POLICY "Owner delete on sizes" ON public.sizes
    FOR DELETE TO authenticated
    USING (public.is_rbb_owner());

-- =============================================================================
-- 8. Products RLS Policies (Core Catalogue)
-- =============================================================================
DROP POLICY IF EXISTS "Public read on products" ON public.products;
DROP POLICY IF EXISTS "Owner full access on products" ON public.products;
DROP POLICY IF EXISTS "Owner insert on products" ON public.products;
DROP POLICY IF EXISTS "Owner update on products" ON public.products;
DROP POLICY IF EXISTS "Owner delete on products" ON public.products;

-- Allow public catalogue browsing without login
CREATE POLICY "Public read on products" ON public.products
    FOR SELECT TO public
    USING (true);

-- Only verified owner can create, edit, or delete products
CREATE POLICY "Owner insert on products" ON public.products
    FOR INSERT TO authenticated
    WITH CHECK (public.is_rbb_owner());

CREATE POLICY "Owner update on products" ON public.products
    FOR UPDATE TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

CREATE POLICY "Owner delete on products" ON public.products
    FOR DELETE TO authenticated
    USING (public.is_rbb_owner());

-- =============================================================================
-- 9. Category Sequences (Strictly Owner-Only - No Public Read)
-- =============================================================================
DROP POLICY IF EXISTS "Owner full access on category_sequences" ON public.category_sequences;
CREATE POLICY "Owner full access on category_sequences" ON public.category_sequences
    FOR ALL TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

-- =============================================================================
-- 10. App Config (Strictly Owner-Only - Contains Owner Email & Sensitive Config)
-- =============================================================================
DROP POLICY IF EXISTS "Owner full access on app_config" ON public.app_config;
CREATE POLICY "Owner full access on app_config" ON public.app_config
    FOR ALL TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

-- =============================================================================
-- 11. Storage Policies ('product-images' bucket)
-- =============================================================================
DROP POLICY IF EXISTS "Public read on product-images" ON storage.objects;
DROP POLICY IF EXISTS "Owner write on product-images" ON storage.objects;
DROP POLICY IF EXISTS "Owner update on product-images" ON storage.objects;
DROP POLICY IF EXISTS "Owner delete on product-images" ON storage.objects;

CREATE POLICY "Public read on product-images" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'product-images');

CREATE POLICY "Owner write on product-images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-images' AND public.is_rbb_owner());

CREATE POLICY "Owner update on product-images" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'product-images' AND public.is_rbb_owner())
    WITH CHECK (bucket_id = 'product-images' AND public.is_rbb_owner());

CREATE POLICY "Owner delete on product-images" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'product-images' AND public.is_rbb_owner());

-- Grant usage on schema public to anon and authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.categories, public.brands, public.materials, public.sub_categories, public.sizes, public.products TO anon, authenticated;
