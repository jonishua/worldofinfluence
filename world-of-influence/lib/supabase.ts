import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
/** True when real Supabase URL and anon key are set (not placeholder). Use to avoid "Failed to fetch" on auth. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("placeholder"));

if (typeof window !== "undefined") {
  if (isSupabaseConfigured) {
    console.info("[Supabase] Configured — local build is using your Supabase project.");
  } else {
    console.warn("[Supabase] Environment variables missing or placeholder. Auth and persistence will not work. See README → Local development.");
  }
}

// We provide fallback values to prevent the build from crashing if environment variables are missing.
// This is common in CI/CD environments where secrets might not be available during the build phase.
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
