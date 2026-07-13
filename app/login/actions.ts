"use server";

import { redirect } from "next/navigation";
import {
  getAuthenticatedRedirectPath,
  getSupabaseServerClient,
} from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    redirect("/auth/login?error=supabase-not-configured");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/auth/login?error=invalid-credentials");
  }

  redirect(await getAuthenticatedRedirectPath());
}

export async function signOut() {
  const supabase = await getSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/auth/login");
}
