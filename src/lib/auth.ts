import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Profile, UserRole } from "@/types/database";

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  institution: string;
  designation?: string;
  country: string;
  phone?: string;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url && 
    key && 
    !url.includes("your-supabase-project") && 
    !key.includes("placeholder")
  );
}

export async function signUpUser(params: SignUpParams): Promise<{ user: any; profile: Profile | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return {
      user: null,
      profile: null,
      error: "Real Supabase project credentials are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  const supabase = createBrowserClient();

  // Supabase Auth SignUp
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.fullName,
        institution: params.institution,
        designation: params.designation || "",
        country: params.country,
        phone: params.phone || "",
      },
    },
  });

  if (authError) {
    return { user: null, profile: null, error: authError.message };
  }

  if (authData.user) {
    // Explicit insert to public.profiles table (in addition to DB trigger handle_new_user)
    const newProfile: Partial<Profile> = {
      id: authData.user.id,
      full_name: params.fullName,
      email: params.email,
      phone: params.phone || "",
      institution: params.institution,
      designation: params.designation || "",
      country: params.country,
      role: "PARTICIPANT", // MANDATORY default role
    };

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .upsert([newProfile])
      .select()
      .single();

    if (profileError) {
      console.warn("Profile table upsert info:", profileError.message);
    }

    return {
      user: authData.user,
      profile: (profileData as Profile) || (newProfile as Profile),
      error: null,
    };
  }

  return { user: null, profile: null, error: "Registration failed on Supabase." };
}

export async function signInUser(email: string, password: string): Promise<{ user: any; profile: Profile | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return {
      user: null,
      profile: null,
      error: "Real Supabase project credentials are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  const supabase = createBrowserClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    let friendlyMessage = authError.message;
    if (authError.message.includes("Invalid login credentials")) {
      friendlyMessage = "Unable to sign in. Please check your email and password.";
    }
    return { user: null, profile: null, error: friendlyMessage };
  }

  if (authData.user) {
    // Fetch profile from public.profiles table in PostgreSQL
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profileData) {
      // Fallback to metadata if trigger was delayed
      const fallbackProfile: Profile = {
        id: authData.user.id,
        full_name: authData.user.user_metadata?.full_name || email.split("@")[0],
        email: authData.user.email || email,
        phone: authData.user.user_metadata?.phone || "",
        institution: authData.user.user_metadata?.institution || "",
        designation: authData.user.user_metadata?.designation || "",
        country: authData.user.user_metadata?.country || "India",
        role: (authData.user.user_metadata?.role as UserRole) || "PARTICIPANT",
        created_at: authData.user.created_at,
        updated_at: new Date().toISOString(),
      };
      return { user: authData.user, profile: fallbackProfile, error: null };
    }

    return { user: authData.user, profile: profileData as Profile, error: null };
  }

  return { user: null, profile: null, error: "Authentication failed." };
}

export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
  }
}

export async function resetPasswordForEmail(email: string): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Supabase connection is not configured in .env.local.",
    };
  }

  const supabase = createBrowserClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: "Password reset instructions have been sent to your email.",
  };
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<{ profile: Profile | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return {
      profile: null,
      error: "Real Supabase project credentials are missing.",
    };
  }

  // Security check: strip role field so users cannot elevate themselves
  const safeUpdates = { ...updates };
  delete (safeUpdates as any).id;
  delete (safeUpdates as any).role;
  delete (safeUpdates as any).created_at;
  safeUpdates.updated_at = new Date().toISOString();

  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(safeUpdates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: data as Profile, error: null };
}

export async function fetchAllProfiles(): Promise<Profile[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching profiles from Supabase:", error?.message);
    return [];
  }

  return data as Profile[];
}
