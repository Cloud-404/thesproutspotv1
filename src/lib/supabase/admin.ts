import { createClient } from "@supabase/supabase-js";

/**
 * Server-only administrative Supabase client using the Service Role Key.
 *
 * CRITICAL SECURITY RULES:
 * 1. NEVER import this file into client components or client bundles.
 * 2. NEVER send SUPABASE_SERVICE_ROLE_KEY to the browser.
 * 3. Use solely for server-side trusted operations such as:
 *    - Resolving normalized username to internal Supabase Auth email
 *    - Admin bootstrapping
 *    - Privileged system tasks
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase service role credentials missing. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

