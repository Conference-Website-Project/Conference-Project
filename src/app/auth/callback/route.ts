import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    });

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && sessionData.user) {
      // Check if profile exists and if onboarding is completed
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, role")
        .eq("id", sessionData.user.id)
        .single();

      if (profile) {
        if (!profile.onboarding_completed && profile.role !== "ADMIN") {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Default to onboarding if profile row was just created
      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  // Auth failure or user cancelled OAuth
  return NextResponse.redirect(`${origin}/login?error=oauth_cancelled`);
}
