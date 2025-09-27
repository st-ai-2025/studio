
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '../Logo';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';
import useScript from '@/hooks/use-script';

type ConsentFormProps = {
  onConsent: () => void;
};

export default function ConsentForm({ onConsent }: ConsentFormProps) {
  const { signOut } = useAuth();
  const status = useScript('https://form.jotform.com/jsform/252686065152156');

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
                Please review and complete the consent form below. Click "Done" when you have finished.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
      <CardContent className="text-center flex-grow flex flex-col p-6">
        {status === 'loading' && <div className="flex-grow flex items-center justify-center">Loading Consent Form...</div>}
        {status === 'error' && <div className="flex-grow flex items-center justify-center">Failed to load consent form. Please try again later.</div>}
        
        <div className="flex-grow relative border rounded-lg overflow-y-auto w-full">
            <div id="252686065152156" className="absolute inset-0"></div>
        </div>
        
        <Button onClick={onConsent} className="mt-6 w-full max-w-xs mx-auto">Done</Button>
      </CardContent>
    </Card>
  );
}
