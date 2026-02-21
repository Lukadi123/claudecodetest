import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _isPlaceholder = false;

/**
 * Lazily-created Supabase client singleton.
 *
 * During `next build`, the static-page generation (SSR pre-render) phase
 * evaluates every imported module — including 'use client' components that
 * are server-rendered first.  The root layout wraps ALL pages (including
 * /_not-found) in <AuthProvider>, which imports this module.
 *
 * If the NEXT_PUBLIC_ env vars are not available at build time (common on
 * Vercel before runtime env injection), we return a placeholder client
 * pointing to a dummy URL.  This client is never actually used for real
 * requests because all Supabase calls live inside useEffect (which does
 * not run during SSR).  At runtime, the real env vars are present and a
 * real client is created.
 */
function getSupabaseClient(): SupabaseClient {
  // If the cached client was a placeholder but real env vars are now
  // available (transition from build-time to runtime), replace it.
  if (
    _supabase &&
    _isPlaceholder &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    _isPlaceholder = false;
  }

  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Build-time / SSR prerender: create a placeholder client so the
      // build does not crash.  The placeholder is harmless because all
      // real Supabase calls happen inside useEffect (client-side only).
      _supabase = createClient(
        'https://placeholder.supabase.co',
        'placeholder-key'
      );
      _isPlaceholder = true;
      return _supabase;
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey);
    _isPlaceholder = false;
  }

  return _supabase;
}

/**
 * Proxy that lazily creates the real Supabase client on first property access.
 * This allows the module to be imported and the export to be accessed at
 * build time without crashing — even when env vars are absent.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
