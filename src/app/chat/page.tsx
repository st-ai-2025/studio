
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import SurveyForm from "@/components/chat/SurveyForm";
import ChatInterface from "@/components/chat/ChatInterface";
import { Logo } from "@/components/Logo";

export default function ChatPage() {
  const [surveyData, setSurveyData] = useState<Record<string, any> | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

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
      {!surveyData ? (
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
