"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function encoded(value: string) {
  return encodeURIComponent(value);
}

export async function signInApplicant(formData: FormData) {
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

  redirect("/account/applications");
}

export async function signUpApplicant(formData: FormData) {
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
    redirect("/account/applications?created=1");
  }

  redirect("/auth/login?message=check-email");
}

export async function signOutApplicant() {
  const supabase = await getSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
