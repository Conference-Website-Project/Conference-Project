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
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("onboarding_completed, role")
        .eq("id", sessionData.user.id)
        .single();

      let profile = existingProfile;

      if (!profile) {
        const fullName =
          sessionData.user.user_metadata?.full_name ||
          sessionData.user.user_metadata?.name ||
          sessionData.user.email?.split("@")[0] ||
          "Participant User";

        const { data: newProfile } = await supabase
          .from("profiles")
          .upsert({
            id: sessionData.user.id,
            full_name: fullName,
            email: sessionData.user.email || "",
            institution: sessionData.user.user_metadata?.institution || "",
            country: sessionData.user.user_metadata?.country || "India",
            role: "PARTICIPANT",
            onboarding_completed: false,
            participation_type: "DELEGATE",
          }, { onConflict: "id" })
          .select("onboarding_completed, role")
          .single();

        profile = newProfile;
      }

      if (profile) {
        if (!profile.onboarding_completed && profile.role !== "ADMIN") {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }

      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  // Auth failure or user cancelled OAuth
  return NextResponse.redirect(`${origin}/login?error=oauth_cancelled`);
}
