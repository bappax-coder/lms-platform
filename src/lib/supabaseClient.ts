import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserEnv(): {
  url: string;
  anonKey: string;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { url, anonKey };
}

export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  const { url, anonKey } = getSupabaseBrowserEnv();

  return createBrowserClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    return createSupabaseBrowserClient();
  }

  if (!browserClient) {
    browserClient = createSupabaseBrowserClient();
  }

  return browserClient;
}

export const supabase = {
  get client() {
    return getSupabaseBrowserClient();
  },
};
