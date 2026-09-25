"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { learnerRepo } from "../repositories/supabase/supabaseStore";
import { LearnerProfile } from "../domain/types";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: LearnerProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, targetRole?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = "proofpath_auth_user_session";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth State on Mount
  useEffect(() => {
    async function initAuth() {
      try {
        // 1. Check Supabase Auth session
        const { data: { session } } = await supabase.auth.getSession();
        
        let activeUserId: string | null = null;
        let activeEmail = "";
        let activeName = "";

        if (session?.user) {
          activeUserId = session.user.id;
          activeEmail = session.user.email || "";
          activeName = session.user.user_metadata?.name || activeEmail.split("@")[0] || "Learner";
        } else if (typeof window !== "undefined") {
          // Check local stored session token
          const stored = localStorage.getItem(AUTH_USER_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              activeUserId = parsed.id;
              activeEmail = parsed.email;
              activeName = parsed.name;
            } catch (_) {}
          }
        }

        if (activeUserId) {
          const authUser: AuthUser = {
            id: activeUserId,
            email: activeEmail,
            name: activeName,
          };
          setUser(authUser);

          // Fetch only this user's profile from Supabase
          const prof = await learnerRepo.getProfile(activeUserId);
          setProfile(prof);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth initialization error", err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase Auth State Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Learner",
        };
        setUser(authUser);
        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
        }
        const prof = await learnerRepo.getProfile(session.user.id);
        setProfile(prof);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(AUTH_USER_KEY);
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const prof = await learnerRepo.getProfile(user.id);
    setProfile(prof);
  };

  const syncUserRecord = async (activeUserId: string, cleanEmail: string, authName: string) => {
    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingUser) {
        if (existingUser.id !== activeUserId) {
          const oldId = existingUser.id;
          // Temporarily alter old email to prevent unique constraint conflict
          await supabase.from("users").update({ email: `${cleanEmail}.legacy-${Date.now()}` }).eq("id", oldId);
          // Insert the canonical auth UUID record
          await supabase.from("users").insert({
            id: activeUserId,
            email: cleanEmail,
            name: authName,
            role: "learner",
            updated_at: new Date().toISOString(),
          });
          // Re-link all related data to the active UUID
          await Promise.allSettled([
            supabase.from("learner_profiles").update({ user_id: activeUserId }).eq("user_id", oldId),
            supabase.from("evidence_items").update({ user_id: activeUserId }).eq("user_id", oldId),
            supabase.from("assessment_attempts").update({ user_id: activeUserId }).eq("user_id", oldId),
            supabase.from("assessment_results").update({ user_id: activeUserId }).eq("user_id", oldId),
            supabase.from("learning_paths").update({ user_id: activeUserId }).eq("user_id", oldId),
            supabase.from("mentor_conversations").update({ user_id: activeUserId }).eq("user_id", oldId),
          ]);
          // Clean up old record
          await supabase.from("users").delete().eq("id", oldId);
        } else {
          await supabase.from("users").update({
            name: authName,
            updated_at: new Date().toISOString(),
          }).eq("id", activeUserId);
        }
      } else {
        const { data: existingById } = await supabase
          .from("users")
          .select("id")
          .eq("id", activeUserId)
          .maybeSingle();

        if (existingById) {
          await supabase.from("users").update({
            email: cleanEmail,
            name: authName,
            updated_at: new Date().toISOString(),
          }).eq("id", activeUserId);
        } else {
          await supabase.from("users").insert({
            id: activeUserId,
            email: cleanEmail,
            name: authName,
            role: "learner",
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (syncErr) {
      console.warn("User sync notice (non-fatal):", syncErr);
    }
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        return { success: false, error: "Please enter your email address." };
      }

      if (password && password.length >= 6) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          console.warn("Supabase auth notice:", error.message);
          let userMsg = error.message;
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            userMsg = "Invalid email or password. If you don't have an account yet, please switch to 'Create Candidate Account'.";
          } else if (error.message.toLowerCase().includes("email not confirmed")) {
            userMsg = "Email address has not been confirmed. Please check your inbox or sign up again.";
          }
          return { success: false, error: userMsg };
        }

        if (data?.user) {
          const activeUserId = data.user.id;
          const authName = data.user.user_metadata?.name || cleanEmail.split("@")[0];
          const authUser: AuthUser = {
            id: activeUserId,
            email: data.user.email || cleanEmail,
            name: authName,
          };
          setUser(authUser);
          if (typeof window !== "undefined") {
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
          }

          // Ensure user record exists in users table cleanly
          await syncUserRecord(activeUserId, cleanEmail, authName);

          const prof = await learnerRepo.getProfile(activeUserId);
          setProfile(prof);
          return { success: true };
        }
      }

      // Email login fallback
      const derivedId = `user-${cleanEmail.replace(/[^a-z0-9]/g, "-")}`;
      const name = cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      await syncUserRecord(derivedId, cleanEmail, name);

      const authUser: AuthUser = {
        id: derivedId,
        email: cleanEmail,
        name,
      };

      setUser(authUser);
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      }

      const prof = await learnerRepo.getProfile(derivedId);
      setProfile(prof);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to log in." };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    targetRole: string = "Software Engineer"
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        return { success: false, error: "Please enter your email address." };
      }
      if (!name.trim()) {
        return { success: false, error: "Please enter your full name." };
      }

      let activeUserId = `user-${cleanEmail.replace(/[^a-z0-9]/g, "-")}`;

      // Supabase auth signup attempt
      if (password && password.length >= 6) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { name: name.trim() } },
        });

        if (error) {
          console.warn("Supabase auth signup notice:", error.message);
          if (
            error.message.toLowerCase().includes("already registered") ||
            error.message.toLowerCase().includes("already exists")
          ) {
            // Attempt auto-login if account exists
            const autoLogin = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });
            if (autoLogin.data?.user) {
              activeUserId = autoLogin.data.user.id;
            } else {
              return {
                success: false,
                error: "This email is already registered. Please switch to 'Sign In' and enter your password.",
              };
            }
          } else {
            return { success: false, error: error.message };
          }
        } else if (data?.user?.id) {
          activeUserId = data.user.id;
        }
      }

      // Sync cleanly into users table
      await syncUserRecord(activeUserId, cleanEmail, name.trim());

      let userProfile = await learnerRepo.getProfile(activeUserId);
      if (!userProfile) {
        const newProfile: LearnerProfile = {
          id: `profile-${activeUserId}`,
          userId: activeUserId,
          name: name.trim(),
          targetRole: targetRole || "Software Engineer",
          learningGoal: `Validate genuine ${targetRole || "engineering"} competencies.`,
          experienceLevel: "Intermediate",
          programmingLanguages: ["TypeScript", "Python"],
          selfReportedSkills: ["Core Data Structures & Memory Layouts"],
          preferredLearningHoursPerWeek: 10,
          aiAssistancePreference: "balanced",
          isDemoUser: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await learnerRepo.saveProfile(newProfile);
        userProfile = newProfile;
      }

      const authUser: AuthUser = {
        id: activeUserId,
        email: cleanEmail,
        name: name.trim(),
      };

      setUser(authUser);
      setProfile(userProfile);
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Sign up failed." };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}

    setUser(null);
    setProfile(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_USER_KEY);
    }
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoggedIn: !!user,
        isLoading,
        login,
        signUp,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
