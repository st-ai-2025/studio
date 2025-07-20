
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

  // Redirect to login if auth check is complete and there's no user.
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Load survey data from session storage on initial render.
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


  const handleSurveySubmit = (data: Record<string, any>) => {
    sessionStorage.setItem('surveyData', JSON.stringify(data));
    setSurveyData(data);
  };
  
  const handleResetSurvey = () => {
    sessionStorage.removeItem('surveyData');
    setSurveyData(null);
  }

  // Display a loading indicator while authentication is in progress.
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Logo className="h-16 w-16 animate-pulse" />
      </div>
    );
  }

  // Once authenticated, show either the survey or the chat interface.
  return (
    <div className="h-screen bg-background">
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
