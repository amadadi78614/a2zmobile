import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. NEVER import this outside server-only contexts (API routes,
 * webhooks) — it bypasses Row Level Security entirely. This is deliberately the ONLY place in
 * the codebase that constructs a service-role client, so there is exactly one convention to keep
 * correct rather than several drifting copies.
 *
 * ENVIRONMENT VARIABLE REQUIRED IN VERCEL:
 *   Set SUPABASE_SERVICE_ROLE_KEY to your Supabase project's service_role secret key.
 *   If your Supabase project was provisioned under Supabase's newer "publishable/secret key"
 *   naming instead of the classic "anon/service_role" naming, set SUPABASE_SECRET_KEY instead —
 *   this client checks SUPABASE_SERVICE_ROLE_KEY first and falls back to SUPABASE_SECRET_KEY.
 *   Whichever you use, only ONE needs to be set; do not set both to different values.
 *
 * This same fallback pattern is why this client (not the existing anon-key clients in
 * src/lib/supabase/*.ts) is the one place a naming mismatch is handled defensively — the
 * anon/publishable-key mismatch spotted elsewhere in this codebase during Critical Fix 1's
 * inspection is a separate, pre-existing issue outside this fix's scope; flagged separately.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase service-role client is not configured: NEXT_PUBLIC_SUPABASE_URL and either " +
        "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY must be set."
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
