"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser: User = {
  uid: 'preview-user-123',
  displayName: 'Preview User',
  email: 'preview@example.com',
  photoURL: 'https://placehold.co/100x100.png',
  providerId: 'google.com',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  useEffect(() => {
    if (bypassAuth) {
      setUser(mockUser);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [bypassAuth]);

  const signInWithGoogle = async () => {
    if (bypassAuth) {
      setUser(mockUser);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // The onAuthStateChanged listener will handle the user state update.
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        // This is a common user action, not an error to log.
        setLoading(false);
      } else {
        console.error("Error signing in with Google", error);
        setLoading(false);
      }
    }
  };

  const signOut = async () => {
    if (bypassAuth) {
        setUser(null);
        return;
    }
    try {
      await firebaseSignOut(auth);
      // The onAuthStateChanged listener will set the user to null.
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
