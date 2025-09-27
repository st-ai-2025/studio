
"use client";

import { useRef } from 'react';
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
  const popupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const openConsentForm = () => {
    const popup = window.open(
      'https://form.jotform.com/252686065152156',
      'blank',
      'scrollbars=yes,toolbar=no,width=700,height=500'
    );

    if (popup) {
      popupIntervalRef.current = setInterval(() => {
        if (popup.closed) {
          if(popupIntervalRef.current) {
            clearInterval(popupIntervalRef.current);
          }
          onConsent();
        }
      }, 500); // Check every 500ms
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-xl">
       <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-grow text-center">
              <div className="mx-auto mb-4 inline-block">
                  <Logo />
              </div>
              <CardTitle className="text-2xl font-headline">Consent to Participate</CardTitle>
              <CardDescription className="pt-2">
                Please sign the consent form below. Once finish, please close the pop-up window to proceed.
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
