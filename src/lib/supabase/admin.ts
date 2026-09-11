import { createClient } from "@supabase/supabase-js";

/**
 * Server-only privileged Supabase client initialized with the Service Role key.
 *
 * CRITICAL SECURITY NOTICE:
 * This client bypasses PostgreSQL Row Level Security (RLS).
 * It MUST NEVER be imported into or executed within client-side components.
 * It is reserved strictly for trusted server-side API routes such as
 * cryptographic payment verification and webhook reconciliation.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("SECURITY VIOLATION: createAdminClient cannot be executed in the browser!");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes("placeholder")) {
    // Return null or throw a descriptive error for server-side callers to handle gracefully
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
