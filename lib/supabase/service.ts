import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Bypasses RLS — for server-only routes that have no user session to
// authenticate with, like the public iCal feed. Never import this
// from client code or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
