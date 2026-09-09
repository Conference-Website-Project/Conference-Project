"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Profile, UserRole } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, LOCAL_AUTH_STORAGE_KEY, signOutUser } from "@/lib/auth";

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
          setProfile({
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
            institution: session.user.user_metadata?.institution || "",
            country: session.user.user_metadata?.country || "India",
            role: "PARTICIPANT",
            created_at: session.user.created_at,
            updated_at: new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } else {
      // Local dev session fallback
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
        if (stored) {
          try {
            const parsedProfile = JSON.parse(stored) as Profile;
            setProfile(parsedProfile);
            setUser({ id: parsedProfile.id, email: parsedProfile.email });
          } catch (err) {
            localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
            setUser(null);
            setProfile(null);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      }
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
          }
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
