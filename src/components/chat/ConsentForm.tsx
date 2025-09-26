
"use client";

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useScript } from '@/hooks/use-script';
import { Logo } from '../Logo';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

type ConsentFormProps = {
  onConsent: () => void;
};

export default function ConsentForm({ onConsent }: ConsentFormProps) {
  const { signOut } = useAuth();
  const scriptStatus = useScript('https://form.jotform.com/jsform/252686065152156');

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

  useEffect(() => {
    if (scriptStatus === 'ready') {
      if (typeof JotformFeedback !== 'undefined') {
        new JotformFeedback({
          formId: '252686065152156',
          buttonText: 'Consent Form',
          base: 'https://form.jotform.com/',
          background: '#F59202',
          fontColor: '#FFFFFF',
          buttonSide: 'bottom',
          buttonAlign: 'center',
          type: 'iframe',
          height: 500,
          width: 700,
          isCardForm: false,
        });
      }
    }
  }, [scriptStatus]);


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
                Please read and sign the consent form below before proceeding.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
      <CardContent>
        {scriptStatus === 'loading' && <p>Loading consent form...</p>}
        {scriptStatus === 'error' && <p>There was an error loading the consent form. Please try again later.</p>}
        <div id="jotform-container-252686065152156">
          {/* The Jotform script will inject the form here. */}
        </div>
      </CardContent>
    </Card>
  );
}
