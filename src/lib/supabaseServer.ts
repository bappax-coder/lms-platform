import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { getSupabaseBrowserEnv } from "./supabaseClient";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return key;
}

export async function createSupabaseServerClient(): Promise<
  SupabaseClient<Database>
> {
  const { url, anonKey } = getSupabaseBrowserEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll is invoked from a Server Component where cookies are read-only.
        }
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createSupabaseServiceClient(): SupabaseClient<Database> {
  const { url } = getSupabaseBrowserEnv();

  return createClient<Database>(url, getServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return { supabase, user };
}

export async function requireAuthenticatedUser() {
  const result = await getAuthenticatedUser();

  if (!result.user) {
    throw new Error("Authentication required.");
  }

  return result;
}
