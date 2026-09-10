import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Profile, UserRole, ParticipationType } from "@/types/database";

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  institution: string;
  designation?: string;
  country: string;
  phone?: string;
}

export interface OnboardingData {
  fullName: string;
  institution: string;
  designation?: string;
  country: string;
  phone?: string;
  participationType: ParticipationType;
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

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return {
      error: "Real Supabase project credentials are missing. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    };
  }

  const supabase = createBrowserClient();
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3005";

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
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
    const newProfile: Partial<Profile> = {
      id: authData.user.id,
      full_name: params.fullName,
      email: params.email,
      phone: params.phone || "",
      institution: params.institution,
      designation: params.designation || "",
      country: params.country,
      role: "PARTICIPANT",
      onboarding_completed: true, // Email/Password signup supplies full info
      participation_type: "DELEGATE",
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
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (!profileData) {
      const fallbackProfile: Profile = {
        id: authData.user.id,
        full_name: authData.user.user_metadata?.full_name || email.split("@")[0],
        email: authData.user.email || email,
        phone: authData.user.user_metadata?.phone || "",
        institution: authData.user.user_metadata?.institution || "",
        designation: authData.user.user_metadata?.designation || "",
        country: authData.user.user_metadata?.country || "India",
        role: (authData.user.user_metadata?.role as UserRole) || "PARTICIPANT",
        onboarding_completed: true,
        participation_type: "DELEGATE",
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

export async function completeOnboardingProfile(
  userId: string,
  data: OnboardingData
): Promise<{ profile: Profile | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return {
      profile: null,
      error: "Real Supabase project credentials are missing.",
    };
  }

  const supabase = createBrowserClient();
  const updates = {
    full_name: data.fullName,
    institution: data.institution,
    designation: data.designation || "",
    country: data.country,
    phone: data.phone || "",
    participation_type: data.participationType,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedData, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: updatedData as Profile, error: null };
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<{ profile: Profile | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return {
      profile: null,
      error: "Real Supabase project credentials are missing.",
    };
  }

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
