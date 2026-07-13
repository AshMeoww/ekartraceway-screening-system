"use server";

import { redirect } from "next/navigation";
import {
  getAuthenticatedRedirectPath,
  getSupabaseServerClient,
} from "@/lib/supabase/server";

function encoded(value: string) {
  return encodeURIComponent(value);
}

function authCallbackUrl() {
  return `${process.env.APP_BASE_URL ?? "http://localhost:3000"}/auth/callback`;
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
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

export async function signUp(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    redirect("/auth/signup?error=supabase-not-configured");
  }

  if (password.length < 8) {
    redirect("/auth/signup?error=password-too-short");
  }

  if (password !== confirmPassword) {
    redirect("/auth/signup?error=password-mismatch");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email,
      },
    },
  });

  if (error) {
    redirect(`/auth/signup?error=${encoded(error.message)}`);
  }

  if (data.session) {
    redirect(await getAuthenticatedRedirectPath());
  }

  redirect("/auth/login?message=check-email");
}

export async function signInWithGoogle() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    redirect("/auth/login?error=supabase-not-configured");
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: authCallbackUrl(),
    },
  });

  if (error || !data.url) {
    redirect("/auth/login?error=google-oauth");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await getSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
