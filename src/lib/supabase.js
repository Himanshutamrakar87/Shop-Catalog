import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization (Phase 1)
 *
 * Reads Vite client-side environment variables:
 * - VITE_SUPABASE_URL: Your project endpoint (e.g. https://your-project.supabase.co)
 * - VITE_SUPABASE_ANON_KEY: Safe, public anonymous API key (never use the service_role key)
 * - VITE_OWNER_EMAIL: Optional email identifier for owner-only policy validation
 */

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const ownerEmail = import.meta.env.VITE_OWNER_EMAIL || '';

// Detect if real credentials have been supplied or if placeholders are active
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseAnonKey.includes('your-anon-public-key')
);

if (!isSupabaseConfigured) {
  console.info(
    '[RBB Supabase] Running in local offline mode. Supabase credentials are not configured yet in .env.local.'
  );
}

// Initialize client with fallback placeholder to prevent runtime crash when importing
const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'placeholder-anon-key';

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured ? supabaseAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
