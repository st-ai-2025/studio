
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '../Logo';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

type ConsentFormProps = {
  onConsent: () => void;
  hasAlreadyConsented: boolean;
};

export default function ConsentForm({ onConsent, hasAlreadyConsented }: ConsentFormProps) {
  const { signOut } = useAuth();

  return (
    <Card className="w-full max-w-4xl shadow-xl flex flex-col h-[90vh]">
       <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-grow text-center">
              <div className="mx-auto mb-4 inline-block">
                  <Logo />
              </div>
              <CardTitle className="text-2xl font-headline">Consent to Participate</CardTitle>
              <CardDescription className="pt-2">
                <span className="font-bold text-blue-600">Please scroll to review and sign the consent form below.</span>
                <br />
                Click 'Done' after you submitted the form. If you have submitted a form previously, click 'Already submitted' to proceed.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
      <CardContent className="text-center flex-grow flex flex-col p-6">
        <div className="flex-grow relative border rounded-lg overflow-hidden w-full">
            <iframe
              id="JotFormIFrame-252686065152156"
              title="Online AI Tutoring Survey Parental Consent Form"
              allow="geolocation; microphone; camera; fullscreen; payment"
              src="https://form.jotform.com/252686065152156"
              className="h-full w-full border-0"
            >
            </iframe>
        </div>
        <div className="mt-6 flex justify-center gap-4">
            <Button onClick={onConsent} className="w-full max-w-xs mx-auto">Done</Button>
            {hasAlreadyConsented && (
                <Button onClick={onConsent} variant="secondary" className="w-full max-w-xs mx-auto">Already submitted</Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
