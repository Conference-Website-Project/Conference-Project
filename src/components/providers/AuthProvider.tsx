"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Profile, UserRole } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, signOutUser, ensurePublicUserExists } from "@/lib/auth";

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setProfileState: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  setProfileState: () => {},
  signOut: async () => {},
  refreshSession: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    setLoading(true);

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileData) {
          setProfile(profileData as Profile);
        } else {
          // Profile is missing from DB! Upsert default profile for authenticated user into public.profiles
          const fullName =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "Participant User";

          const defaultProfile: Partial<Profile> = {
            id: session.user.id,
            full_name: fullName,
            email: session.user.email || "",
            institution: session.user.user_metadata?.institution || "",
            country: session.user.user_metadata?.country || "India",
            role: "PARTICIPANT" as UserRole,
            onboarding_completed: false,
            participation_type: "DELEGATE",
          };

          const { data: upsertedProfile } = await supabase
            .from("profiles")
            .upsert(defaultProfile, { onConflict: "id" })
            .select("*")
            .single();

          setProfile((upsertedProfile as Profile) || (defaultProfile as Profile));
        }

        // Ensure row exists in public.users table
        await ensurePublicUserExists(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    } else {
      // Real Supabase credentials not configured yet
      setUser(null);
      setProfile(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    initAuth();

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileData) {
            setProfile(profileData as Profile);
          } else {
            const fullName =
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split("@")[0] ||
              "Participant User";

            const defaultProfile: Partial<Profile> = {
              id: session.user.id,
              full_name: fullName,
              email: session.user.email || "",
              institution: session.user.user_metadata?.institution || "",
              country: session.user.user_metadata?.country || "India",
              role: "PARTICIPANT" as UserRole,
              onboarding_completed: false,
              participation_type: "DELEGATE",
            };

            const { data: upsertedProfile } = await supabase
              .from("profiles")
              .upsert(defaultProfile, { onConflict: "id" })
              .select("*")
              .single();

            setProfile((upsertedProfile as Profile) || (defaultProfile as Profile));
          }

          // Ensure row exists in public.users table
          await ensurePublicUserExists(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    await signOutUser();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const setProfileState = (newProfile: Profile | null) => {
    setProfile(newProfile);
    if (newProfile) {
      setUser({ id: newProfile.id, email: newProfile.email });
    } else {
      setUser(null);
    }
  };

  const role: UserRole | null = profile?.role || null;
  const isAuthenticated = Boolean(user && profile);
  const isAdmin = role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        isAuthenticated,
        isAdmin,
        setProfileState,
        signOut: handleSignOut,
        refreshSession: initAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
