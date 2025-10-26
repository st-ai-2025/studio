"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type UserCredential } from "firebase/auth";
import { auth, googleProvider, createUserProfile } from "@/lib/firebase";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      // The user object is available in the result.
      await createUserProfile(result.user);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        // This is a common scenario & not a critical error.
        console.log("Sign-in popup closed by user.");
      } else {
        console.error("Error during sign-in or profile creation:", error);
      }
    } finally {
      // Ensure loading is always turned off, even if there's an error.
      // onAuthStateChanged will also set loading to false on success, but this is a good failsafe.
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
