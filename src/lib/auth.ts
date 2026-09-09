import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Profile, UserRole } from "@/types/database";

export const LOCAL_AUTH_STORAGE_KEY = "conference_platform_auth_session";

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

// Demo profiles for local preview when live Supabase is not connected
const DEMO_PROFILES: Record<string, Profile> = {
  "demo-admin-id": {
    id: "demo-admin-id",
    full_name: "Dr. Administrator",
    email: "admin@college.edu",
    phone: "+91 98765 43210",
    institution: "College of Engineering & Technology",
    designation: "General Conference Chair",
    country: "India",
    role: "ADMIN",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  "demo-participant-id": {
    id: "demo-participant-id",
    full_name: "Prof. Ananya Sharma",
    email: "ananya.sharma@university.edu",
    phone: "+91 91234 56789",
    institution: "Dept. of Computer Science, National Institute",
    designation: "Associate Professor",
    country: "India",
    role: "PARTICIPANT",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export async function signUpUser(params: SignUpParams): Promise<{ user: any; profile: Profile | null; error: string | null }> {
  if (isSupabaseConfigured()) {
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
      // Upsert to public.profiles table
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
        console.warn("Profile table insert warning:", profileError.message);
      }

      return {
        user: authData.user,
        profile: (profileData as Profile) || (newProfile as Profile),
        error: null,
      };
    }

    return { user: null, profile: null, error: "Registration failed." };
  }

  // Local Dev Fallback session handler
  const isDemoAdmin = params.email.toLowerCase().includes("admin");
  const newProfile: Profile = {
    id: `local-user-${Date.now()}`,
    full_name: params.fullName,
    email: params.email,
    phone: params.phone || "",
    institution: params.institution,
    designation: params.designation || "Research Scholar",
    country: params.country,
    role: isDemoAdmin ? "ADMIN" : "PARTICIPANT",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(newProfile));
  }

  return { user: { id: newProfile.id, email: newProfile.email }, profile: newProfile, error: null };
}

export async function signInUser(email: string, password: string): Promise<{ user: any; profile: Profile | null; error: string | null }> {
  if (isSupabaseConfigured()) {
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
      // Fetch user profile from public.profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      const profile = (profileData as Profile) || {
        id: authData.user.id,
        full_name: authData.user.user_metadata?.full_name || email.split("@")[0],
        email: authData.user.email || email,
        institution: authData.user.user_metadata?.institution || "",
        country: authData.user.user_metadata?.country || "India",
        role: (authData.user.user_metadata?.role as UserRole) || "PARTICIPANT",
        created_at: authData.user.created_at,
        updated_at: new Date().toISOString(),
      };

      return { user: authData.user, profile, error: null };
    }

    return { user: null, profile: null, error: "Authentication failed." };
  }

  // Local Dev Fallback
  if (!email || !password) {
    return { user: null, profile: null, error: "Please provide both email and password." };
  }

  const isAdmin = email.toLowerCase().includes("admin");
  const profile: Profile = isAdmin ? DEMO_PROFILES["demo-admin-id"] : {
    ...DEMO_PROFILES["demo-participant-id"],
    email,
    full_name: email.split("@")[0].replace(/\./g, " ").toUpperCase(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(profile));
  }

  return { user: { id: profile.id, email: profile.email }, profile, error: null };
}

export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
  }
}

export async function resetPasswordForEmail(email: string): Promise<{ success: boolean; message: string }> {
  if (!email) {
    return { success: false, message: "Please enter your registered email address." };
  }

  if (isSupabaseConfigured()) {
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      return { success: false, message: error.message };
    }
  }

  return {
    success: true,
    message: "Password reset instructions have been sent to your email.",
  };
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<{ profile: Profile | null; error: string | null }> {
  // Prevent unauthorized modification of critical fields
  const safeUpdates = { ...updates };
  delete (safeUpdates as any).id;
  delete (safeUpdates as any).role; // User CANNOT change their own role!
  delete (safeUpdates as any).created_at;

  safeUpdates.updated_at = new Date().toISOString();

  if (isSupabaseConfigured()) {
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

  // Local storage fallback
  if (typeof window !== "undefined") {
    const existing = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
    if (existing) {
      const current = JSON.parse(existing) as Profile;
      const updated = { ...current, ...safeUpdates };
      localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(updated));
      return { profile: updated, error: null };
    }
  }

  return { profile: null, error: "Profile update failed." };
}

export async function fetchAllProfiles(): Promise<Profile[]> {
  if (isSupabaseConfigured()) {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data as Profile[];
    }
  }

  // Demo participant list for admin table preview
  return [
    DEMO_PROFILES["demo-admin-id"],
    DEMO_PROFILES["demo-participant-id"],
    {
      id: "demo-p-2",
      full_name: "Dr. Vikram Sethi",
      email: "v.sethi@iit.ac.in",
      phone: "+91 98111 22233",
      institution: "Indian Institute of Technology",
      designation: "Professor",
      country: "India",
      role: "PARTICIPANT",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "demo-p-3",
      full_name: "Prof. Sarah Jenkins",
      email: "sarah.jenkins@oxford.ac.uk",
      phone: "+44 20 7946 0912",
      institution: "University of Oxford",
      designation: "Senior Researcher",
      country: "United Kingdom",
      role: "PARTICIPANT",
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}
