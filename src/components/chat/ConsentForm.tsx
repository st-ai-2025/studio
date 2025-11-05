
"use client";

import { useEffect } from 'react';
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

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://form.jotform.com/jsform/252686065152156';
    
    const container = document.getElementById('jotform-container');
    if (container) {
        container.appendChild(script);
    }

    return () => {
        if (container) {
            container.innerHTML = '';
        }
    };
  }, []);

  return (
    <Card className="w-full max-w-4xl shadow-xl">
       <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-grow text-center">
              <div className="mx-auto mb-4 inline-block">
                  <Logo />
              </div>
              <CardTitle className="text-2xl font-headline">Consent to Participate</CardTitle>
              <CardDescription className="pt-2">
                <span className="font-bold text-blue-600">Please review and sign the consent form below</span>
                <br />
                Click 'Done' after submission, or 'Already submitted' if you have submitted a consent form previously.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
      <CardContent className="p-6">
        <div id="jotform-container" className="border rounded-lg" />
        <div className="mt-4 flex justify-center gap-4">
            <Button onClick={onConsent} className="w-full max-w-xs mx-auto">Done</Button>
            {hasAlreadyConsented && (
                <Button onClick={onConsent} variant="secondary" className="w-full max-w-xs mx-auto">Already submitted</Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
