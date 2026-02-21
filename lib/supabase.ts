import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

/**
 * Lazily-created Supabase client singleton.
 *
 * Why lazy?  During `next build` the static-page generation (SSR pre-render)
 * phase evaluates every imported module.  If the NEXT_PUBLIC_ env vars are
 * not yet available at that point a module-level `throw` would crash the
 * entire build.  By deferring client creation to first runtime access we
 * avoid that while keeping the same singleton semantics.
 */
function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  return _supabase;
}

/**
 * Proxy that lazily creates the real Supabase client on first property access.
 * This allows the module to be imported at build time without throwing.
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
