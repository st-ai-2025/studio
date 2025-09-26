
"use client";

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '../Logo';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

type ConsentFormProps = {
  onConsent: () => void;
};

export default function ConsentForm({ onConsent }: ConsentFormProps) {
  const { signOut } = useAuth();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin === 'https://form.jotform.com' &&
        event.data &&
        typeof event.data === 'string'
      ) {
        try {
          const data = JSON.parse(event.data);
          if (data.action === 'submission-completed') {
            console.log('Jotform submission completed');
            onConsent();
          }
        } catch (error) {
          // Not a JSON message, ignore
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onConsent]);
  
  const openConsentForm = () => {
    window.open(
      'https://form.jotform.com/252686065152156',
      'blank',
      'scrollbars=yes,toolbar=no,width=700,height=500'
    );
  };

  return (
    <Card className="w-full max-w-2xl shadow-xl">
       <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-grow text-center">
              <div className="mx-auto mb-4 inline-block">
                  <Logo />
              </div>
              <CardTitle className="text-2xl font-headline">Consent Form for Research</CardTitle>
              <CardDescription className="pt-2">
                Please click the button below to open and sign the consent form in a pop-up window.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
      <CardContent className="text-center">
        <Button onClick={openConsentForm}>Open Consent Form</Button>
      </CardContent>
    </Card>
  );
}
