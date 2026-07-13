import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";

type LooseTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

type LooseSchema = {
  Tables: Record<string, LooseTable>;
  Views: Record<string, LooseTable>;
  Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>;
  Enums: Record<string, string>;
  CompositeTypes: Record<string, Record<string, unknown>>;
};

type AnyDatabase = {
  public: LooseSchema;
  storage: LooseSchema;
};

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabasePublicKey());
}

export function isServiceRoleConfigured() {
  return Boolean(isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function getSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createSupabaseServerClient<AnyDatabase>(
    getSupabaseUrl()!,
    getSupabasePublicKey()!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot always set cookies; Server Actions can.
          }
        },
      },
    },
  );
}

let serviceClient: ReturnType<typeof createClient<AnyDatabase>> | null = null;

export function getSupabaseServiceClient() {
  if (!isServiceRoleConfigured()) {
    return null;
  }

  if (!serviceClient) {
    serviceClient = createClient<AnyDatabase>(
      getSupabaseUrl()!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }

  return serviceClient;
}

export async function getCurrentHrUser() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .in("role", ["admin", "hr"])
    .maybeSingle();

  return profile ? { user, profile } : null;
}
