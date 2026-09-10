import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-supabase-project") &&
    !supabaseAnonKey.includes("placeholder")
  ) {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: "", ...options });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    let profile: { onboarding_completed?: boolean; role?: string } | null = null;
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed, role")
        .eq("id", user.id)
        .single();
      profile = data;
    }

    // 1. Protection for /onboarding
    if (pathname.startsWith("/onboarding")) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", "/onboarding");
        return NextResponse.redirect(url);
      }
      if (profile?.onboarding_completed === true || profile?.role === "ADMIN") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }

    // 2. Protection for /dashboard
    if (pathname.startsWith("/dashboard")) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }
      if (profile && !profile.onboarding_completed && profile.role !== "ADMIN") {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
    }

    // 3. Protection for /admin
    if (pathname.startsWith("/admin")) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }

      if (profile?.role !== "ADMIN") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        url.searchParams.set("error", "unauthorized_admin");
        return NextResponse.redirect(url);
      }
    }

    // 4. Redirect authenticated users away from /login and /register
    if (user && (pathname === "/login" || pathname === "/register")) {
      const url = request.nextUrl.clone();
      if (profile && !profile.onboarding_completed && profile.role !== "ADMIN") {
        url.pathname = "/onboarding";
      } else {
        url.pathname = "/dashboard";
      }
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
