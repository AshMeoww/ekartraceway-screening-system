import { NextResponse } from "next/server";
import {
  getAuthenticatedRedirectPath,
  getSupabaseServerClient,
} from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = supabase
      ? await supabase.auth.exchangeCodeForSession(code)
      : { error: new Error("Supabase is not configured.") };

    if (!error) {
      return NextResponse.redirect(`${origin}${await getAuthenticatedRedirectPath()}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth-code`);
}
