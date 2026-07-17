import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Public, anonymous, cookie-free Supabase client for the storefront's product reads.
 *
 * Why not reuse src/lib/supabase/server.ts? That client reads request cookies (via
 * next/headers) to carry the visitor's auth session — necessary for anything user-scoped
 * (account pages, wishlist sync, checkout), but incompatible with `unstable_cache` (Next.js
 * cache functions can't depend on per-request data like cookies) and unnecessary overhead for
 * genuinely public reads. Product browsing needs no session at all — RLS already scopes reads to
 * `is_published = true` for the anon role regardless of who's asking.
 *
 * Reads the same NEXT_PUBLIC_SUPABASE_ANON_KEY name every other client in this codebase reads —
 * not a new naming convention.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase public client is not configured: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.");
  }

  return createSupabaseClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
