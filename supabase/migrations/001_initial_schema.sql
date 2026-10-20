-- =============================================================================
-- RBB Database Schema - Phase 1 Migration
-- Standalone Catalogue Management System for RBB
-- =============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Generic Trigger for Updating Timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 3. Tables Definition
-- =============================================================================

-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code VARCHAR(4) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: brands
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    origin TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: materials
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: sub_categories
CREATE TABLE IF NOT EXISTS sub_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sub_category_name_category UNIQUE (name, category_id)
);

-- Table: sizes (Sizes and Capacities)
CREATE TABLE IF NOT EXISTS sizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: category_sequences
-- Manages monotonically increasing counters for each category code prefix.
-- Prevents code reuse even after products are deleted.
CREATE TABLE IF NOT EXISTS category_sequences (
    category_code VARCHAR(4) PRIMARY KEY,
    last_number INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
    sub_category TEXT DEFAULT '',
    size_capacity TEXT DEFAULT '',
    purchase_price NUMERIC(10, 2) DEFAULT 0 CHECK (purchase_price >= 0),
    purchase_unit TEXT DEFAULT 'Piece',
    special_details TEXT DEFAULT '',
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    image1 TEXT DEFAULT '',
    image2 TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'In Stock'
        CHECK (status IN ('In Stock', 'Out of Stock', 'Discontinued', 'active', 'stock_alert', 'discontinued')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 4. Indexes for Search and Filter Performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_material_id ON products(material_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_code ON categories(code);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);

-- =============================================================================
-- 5. Automatic Timestamp Update Triggers
-- =============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_categories_updated_at') THEN
        CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories
        FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_brands_updated_at') THEN
        CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON brands
        FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_materials_updated_at') THEN
        CREATE TRIGGER trg_materials_updated_at BEFORE UPDATE ON materials
        FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sub_categories_updated_at') THEN
        CREATE TRIGGER trg_sub_categories_updated_at BEFORE UPDATE ON sub_categories
        FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sizes_updated_at') THEN
        CREATE TRIGGER trg_sizes_updated_at BEFORE UPDATE ON sizes
        FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_category_sequences_updated_at') THEN
        CREATE TRIGGER trg_category_sequences_updated_at BEFORE UPDATE ON category_sequences
        FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_products_updated_at') THEN
        CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
    END IF;
END $$;

-- =============================================================================
-- 6. Atomic Product Code Generator (RBB-[CATEGORY_CODE]-[3 DIGIT NUMBER])
--
-- Guaranteed Properties:
-- 1. Strictly formats as RBB-[CATEGORY_CODE]-[3 DIGIT NUMBER]
-- 2. Concurrency-safe: atomically increments category_sequences in PostgreSQL
-- 3. Non-reuse: Product deletion has zero effect on category_sequences counter
-- =============================================================================
CREATE OR REPLACE FUNCTION get_next_product_code(p_category_code VARCHAR)
RETURNS TEXT AS $$
DECLARE
    v_upper_code VARCHAR(4);
    v_next_num INT;
BEGIN
    -- Enforce owner-only execution: prevent unauthorized sequence tampering
    IF NOT public.is_rbb_owner() THEN
        RAISE EXCEPTION 'Access denied: Only RBB owner can generate product codes';
    END IF;

    IF p_category_code IS NULL OR TRIM(p_category_code) = '' THEN
        RAISE EXCEPTION 'Category code cannot be null or empty';
    END IF;

    v_upper_code := UPPER(TRIM(p_category_code));

    -- Atomically insert or increment counter for this category code
    INSERT INTO public.category_sequences (category_code, last_number, updated_at)
    VALUES (v_upper_code, 1, NOW())
    ON CONFLICT (category_code)
    DO UPDATE SET 
        last_number = public.category_sequences.last_number + 1,
        updated_at = NOW()
    RETURNING last_number INTO v_next_num;

    -- Return formatted code: RBB-[CODE]-[3 DIGIT PADDED NUMBER]
    RETURN 'RBB-' || v_upper_code || '-' || LPAD(v_next_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Revoke default public execution; grant only to authenticated roles
REVOKE ALL ON FUNCTION get_next_product_code(VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_next_product_code(VARCHAR) TO authenticated;

-- Table: app_config
-- Stores application parameters including the designated owner email
CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 7. Owner Authentication Function & Row Level Security (RLS)
--
-- RBB is a single-owner application. Access must be genuinely restricted to the
-- configured owner account. Unauthenticated users and non-owner authenticated accounts
-- are denied access (Fail-Closed).
-- =============================================================================

CREATE OR REPLACE FUNCTION is_rbb_owner()
RETURNS BOOLEAN AS $$
DECLARE
    v_owner_email TEXT;
BEGIN
    -- Deny all unauthenticated requests
    IF auth.role() != 'authenticated' THEN
        RETURN false;
    END IF;

    -- 1. Check if user has explicit 'owner' role in app_metadata
    IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner' THEN
        RETURN true;
    END IF;

    -- 2. Check if user email matches the email configured in app_config
    SELECT value INTO v_owner_email FROM public.app_config WHERE key = 'owner_email' LIMIT 1;
    IF v_owner_email IS NOT NULL AND TRIM(v_owner_email) <> '' THEN
        IF LOWER(auth.jwt() ->> 'email') = LOWER(TRIM(v_owner_email)) THEN
            RETURN true;
        END IF;
    END IF;

    -- 3. Check database setting 'app.settings.owner_email' if set via ALTER DATABASE
    BEGIN
        v_owner_email := current_setting('app.settings.owner_email', true);
    EXCEPTION WHEN OTHERS THEN
        v_owner_email := NULL;
    END;

    IF v_owner_email IS NOT NULL AND TRIM(v_owner_email) <> '' THEN
        IF LOWER(auth.jwt() ->> 'email') = LOWER(TRIM(v_owner_email)) THEN
            RETURN true;
        END IF;
    END IF;

    -- Fail-closed: Deny any other authenticated user who is not the configured owner
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- Revoke default public execution; grant only to authenticated roles
REVOKE ALL ON FUNCTION is_rbb_owner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_rbb_owner() TO authenticated;

-- Enable RLS on all tables
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policies: Drop existing before recreating
DROP POLICY IF EXISTS "Owner full access on app_config" ON app_config;
CREATE POLICY "Owner full access on app_config" ON app_config
    FOR ALL TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

DROP POLICY IF EXISTS "Owner full access on categories" ON categories;
CREATE POLICY "Owner full access on categories" ON categories
    FOR ALL TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

DROP POLICY IF EXISTS "Owner full access on brands" ON brands;
CREATE POLICY "Owner full access on brands" ON brands
    FOR ALL TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

DROP POLICY IF EXISTS "Owner full access on materials" ON materials;
CREATE POLICY "Owner full access on materials" ON materials
    FOR ALL TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

DROP POLICY IF EXISTS "Owner full access on sub_categories" ON sub_categories;
CREATE POLICY "Owner full access on sub_categories" ON sub_categories
    FOR ALL TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

DROP POLICY IF EXISTS "Owner full access on sizes" ON sizes;
CREATE POLICY "Owner full access on sizes" ON sizes
    FOR ALL TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

DROP POLICY IF EXISTS "Owner full access on category_sequences" ON category_sequences;
CREATE POLICY "Owner full access on category_sequences" ON category_sequences
    FOR ALL TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

DROP POLICY IF EXISTS "Owner full access on products" ON products;
CREATE POLICY "Owner full access on products" ON products
    FOR ALL TO authenticated
    USING (public.is_rbb_owner())
    WITH CHECK (public.is_rbb_owner());

-- =============================================================================
-- 8. Storage Configuration (Product Images)
-- Creates the 'product-images' bucket for storing product photos (max 2 per product).
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5 MB max per file
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Policies: Public can read product images; Only owner can upload/delete
DROP POLICY IF EXISTS "Public read on product-images" ON storage.objects;
CREATE POLICY "Public read on product-images" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Owner write on product-images" ON storage.objects;
CREATE POLICY "Owner write on product-images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-images' AND public.is_rbb_owner());

DROP POLICY IF EXISTS "Owner update on product-images" ON storage.objects;
CREATE POLICY "Owner update on product-images" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'product-images' AND public.is_rbb_owner())
    WITH CHECK (bucket_id = 'product-images' AND public.is_rbb_owner());

DROP POLICY IF EXISTS "Owner delete on product-images" ON storage.objects;
CREATE POLICY "Owner delete on product-images" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'product-images' AND public.is_rbb_owner());

-- =============================================================================
-- 9. Post-Migration Owner Setup Instructions
-- =============================================================================
-- After running this migration on your new Supabase project, designate your owner
-- account so that is_rbb_owner() recognizes your session and permits catalogue
-- writes. Run ONE of the following queries in the Supabase SQL Editor:
--
-- METHOD 1 (Recommended - via app_config table):
--   INSERT INTO public.app_config (key, value)
--   VALUES ('owner_email', 'your-owner-email@example.com')
--   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
--
-- METHOD 2 (Via Supabase Auth app_metadata):
--   UPDATE auth.users
--   SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "owner"}'::jsonb
--   WHERE email = 'your-owner-email@example.com';
--
-- Also set in your frontend environment (.env.local):
--   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
--   VITE_SUPABASE_ANON_KEY=<your-anon-publishable-key>
--   VITE_OWNER_EMAIL=your-owner-email@example.com
-- =============================================================================
