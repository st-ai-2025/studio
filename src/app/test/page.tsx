
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

export default function TestPage() {
  const { user, loading } = useAuth();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestWrite = async () => {
    if (!user) {
      setError("You must be logged in to perform this test.");
      return;
    }
    setIsTesting(true);
    setError(null);
    setResult(null);
    try {
      const testDocRef = doc(db, "test", user.uid);
      await setDoc(testDocRef, {
        timestamp: new Date(),
        uid: user.uid,
        email: user.email,
      });
      setResult("Success! Wrote a document to the 'test' collection.");
    } catch (e: any) {
      console.error("Firestore write failed:", e);
      setError(`Firestore write failed: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Logo className="h-16 w-16 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline">Firebase Connection Test</CardTitle>
          <CardDescription>
            This page helps diagnose Firestore connection and permission issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {user ? (
                <div className="text-center text-sm">
                    <p>Welcome, <span className="font-medium">{user.displayName}</span>!</p>
                    <p>You are logged in and ready to test.</p>
                </div>
            ) : (
                 <p className="text-center text-sm text-destructive">Please log in to run the test.</p>
            )}
          <Button
            onClick={handleTestWrite}
            disabled={!user || isTesting}
            className="w-full"
          >
            {isTesting ? "Testing..." : "Test Firestore Write"}
          </Button>
          {result && (
            <div className="rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-bold">Result:</p>
              <p>{result}</p>
            </div>
          )}
          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                <p className="font-bold">Error:</p>
                <p className="break-words">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
