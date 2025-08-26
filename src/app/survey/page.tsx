
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import PostSurveyForm from "@/components/chat/PostSurveyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";

function SurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sessionId = searchParams.get('sessionId');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
    if (!sessionId) {
        console.error("No session ID provided");
        toast({ variant: "destructive", title: "Error", description: "No session ID found. Cannot submit survey." });
        router.replace('/chat');
    }
  }, [authLoading, user, router, sessionId, toast]);

  const handlePostSurveySubmit = async (data: Record<string, any>) => {
    if (!user || !sessionId) {
      toast({ variant: "destructive", title: "Error", description: "Cannot save survey. User or session is not initialized." });
      return;
    }
    
    setIsSubmitting(true);
    
    const surveyResponse = {
      ...data,
      interestChange: data.interestChange[0],
      understandingChange: data.understandingChange[0],
    };

    try {
      const sessionRef = doc(db, "users", user.uid, "sessions", sessionId);
      await updateDoc(sessionRef, {
        postSurveyResponse: surveyResponse,
        endTime: serverTimestamp()
      });
      console.log("Post-chat survey submitted:", surveyResponse);
      router.push('/thank-you');
    } catch (error) {
      console.error("Error saving post-chat survey:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to submit survey. Please try again." });
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Logo className="h-16 w-16 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-lg shadow-xl">
            <CardHeader className="text-center">
            <div className="mx-auto mb-4">
                <Logo />
            </div>
            <CardTitle className="text-2xl font-headline">Post-Session Survey</CardTitle>
            <CardDescription>
                Please answer the following questions about your session.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <PostSurveyForm onSubmit={handlePostSurveySubmit} isSubmitting={isSubmitting} />
            </CardContent>
        </Card>
    </div>
  );
}


export default function SurveyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SurveyContent />
        </Suspense>
    )
}
