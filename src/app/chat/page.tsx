
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import ConsentForm from "@/components/chat/ConsentForm";
import SurveyForm from "@/components/chat/SurveyForm";
import ChatInterface from "@/components/chat/ChatInterface";
import { Logo } from "@/components/Logo";

const CONSENT_STORAGE_KEY = 'formflow-ai-chat-consent-given';

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
    const consentGiven = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (consentGiven === 'true') {
      setHasConsented(true);
    }
  }, []);

  const handleConsent = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'true');
    setHasConsented(true);
  };

  const handleSurveySubmit = (data: Record<string, any>) => {
    setSurveyData(data);
  };
  
  const handleResetSurvey = () => {
    setSurveyData(null);
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setHasConsented(false);
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
