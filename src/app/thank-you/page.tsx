
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, Timestamp, doc, updateDoc } from "firebase/firestore";
import { generateReport } from "@/ai/flows/report-gen";
import type { Message, Report, SerializableMessage } from "@/types";
import { Slider } from "@/components/ui/slider";

function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [feedback, setFeedback] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const sessionId = searchParams.get('sessionId');

  const handleNewSession = () => {
    router.push("/chat");
  };

  const handleGenerateReport = async () => {
    if (!user || !sessionId) {
      alert("User or session not found.");
      return;
    }

    setIsGenerating(true);
    try {
      const messagesRef = collection(db, "users", user.uid, "sessions", sessionId, "messages");
      const q = query(messagesRef, orderBy("timestamp"));
      const messagesSnapshot = await getDocs(q);
      
      const chatHistory = messagesSnapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: doc.id } as Message;
      });

      const serializableChatHistory: SerializableMessage[] = chatHistory.map(message => ({
        ...message,
        timestamp: (message.timestamp as Timestamp).toMillis(),
      }));

      const generatedReport = await generateReport({ history: serializableChatHistory });
      setReport(generatedReport);

    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!user || !sessionId) {
      alert("User or session not found.");
      return;
    }

    setIsSubmitting(true);
    try {
      const sessionRef = doc(db, "users", user.uid, "sessions", sessionId);
      await updateDoc(sessionRef, {
        reportHelpfulness: feedback,
      });
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackLabels = [
    "Not helpful at all",
    "Somewhat unhelpful",
    "Neutral",
    "Somewhat helpful",
    "Extremely helpful",
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline">{report ? 'Tutoring Report' : 'Thank You'}</CardTitle>
          {!report && (
            <CardDescription>
              Your feedback has been submitted. Thank you for participating in this AI tutoring research!
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          {report ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Subject:</h3>
                <p>{report.subject}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Topics:</h3>
                <ul className="list-disc list-inside">
                  {report.topics.map((topic, index) => <li key={index}>{topic}</li>)}
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">What you did well:</h3>
                <ul className="list-disc list-inside">
                  {report.goodAt.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Areas to practice:</h3>
                <ul className="list-disc list-inside">
                  {report.needsPractice.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Summary:</h3>
                <p>{report.summary}</p>
              </div>
              <div className="space-y-4 pt-4">
                <h3 className="font-semibold text-center">How helpful was this report?</h3>
                <div className="relative">
                    <Slider
                        min={0}
                        max={4}
                        step={1}
                        value={[feedback]}
                        onValueChange={(value) => setFeedback(value[0])}
                        className="h-3"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-full flex justify-between items-center px-[10px] pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-2 w-2 rounded-full bg-slate-200" />
                        ))}
                    </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  {feedbackLabels.map((label, index) => (
                    <div key={index} className="w-1/5 text-center">{label}</div>
                  ))}
                </div>
              </div>
              {!feedbackSubmitted ? (
                <Button onClick={handleFeedbackSubmit} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              ) : (
                <Button onClick={handleNewSession} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Start New Session
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <Button onClick={handleGenerateReport} className="w-full" disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate tutoring report"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  )
}
