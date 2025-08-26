
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

export default function ThankYouPage() {
  const router = useRouter();

  const handleNewSession = () => {
    router.push("/chat");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline">Thank You!</CardTitle>
          <CardDescription>
            Your feedback has been submitted. Thank you for participating in this AI tutoring research!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleNewSession} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Start New Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
