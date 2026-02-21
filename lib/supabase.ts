import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client singleton.
 *
 * Uses fallback empty strings when env vars are missing (happens during
 * Vercel's `next build` static-page prerendering).  The client created
 * with empty strings is inert — it won't make real network requests, and
 * all Supabase calls in this app happen inside useEffect (client-side
 * only) so the placeholder is never exercised during SSR.
 *
 * At runtime on Vercel the real env vars are always injected, so the
 * client works normally.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);
