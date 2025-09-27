
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import ConsentForm from "@/components/chat/ConsentForm";
import SurveyForm from "@/components/chat/SurveyForm";
import ChatInterface from "@/components/chat/ChatInterface";
import { Logo } from "@/components/Logo";
import { doc, getDoc } from "firebase/firestore";
import { db, updateUserProfile } from "@/lib/firebase";

export default function ChatPage() {
  const [hasConsented, setHasConsented] = useState(false);
  const [surveyData, setSurveyData] = useState<Record<string, any> | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const checkConsent = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().consentGiven) {
          setHasConsented(true);
        }
      }
    };
    checkConsent();
  }, [user]);

  const handleConsent = async () => {
    if (user) {
      await updateUserProfile(user, { consentGiven: true });
    }
    setHasConsented(true);
  };

  const handleSurveySubmit = (data: Record<string, any>) => {
    setSurveyData(data);
  };
  
  const handleResetSurvey = () => {
    setSurveyData(null);
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Logo className="h-16 w-16 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex items-start justify-center pt-12">
      {!hasConsented ? (
        <ConsentForm onConsent={handleConsent} />
      ) : !surveyData ? (
        <SurveyForm onSubmit={handleSurveySubmit} />
      ) : (
        <ChatInterface
          surveyData={surveyData}
          onResetSurvey={handleResetSurvey}
        />
      )}
    </div>
  );
}
