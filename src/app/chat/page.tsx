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

  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem('surveyData');
      if (savedData) {
        setSurveyData(JSON.parse(savedData));
      }
    } catch (error) {
        console.error("Could not parse survey data from session storage", error);
        sessionStorage.removeItem('surveyData');
    }
  }, []);


  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Logo className="h-16 w-16 animate-pulse" />
      </div>
    );
  }

  const handleSurveySubmit = (data: Record<string, any>) => {
    sessionStorage.setItem('surveyData', JSON.stringify(data));
    setSurveyData(data);
  };

  return (
    <div className="h-screen bg-background">
      {!surveyData ? (
        <SurveyForm onSubmit={handleSurveySubmit} />
      ) : (
        <ChatInterface
          surveyData={surveyData}
          onResetSurvey={() => {
            sessionStorage.removeItem('surveyData');
            setSurveyData(null);
          }}
        />
      )}
    </div>
  );
}
