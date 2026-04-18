import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('[@supabase/ssr] Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
    // Return a dummy client or null to prevent catastrophic crashes in components
    return null as any; 
  }

  return createBrowserClient(url, anonKey);
}
