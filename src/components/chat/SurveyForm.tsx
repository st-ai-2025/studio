"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/Logo";

const surveySchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  goal: z.string().min(10, { message: "Please describe your goal in a bit more detail." }),
});

type SurveyFormProps = {
  onSubmit: (data: z.infer<typeof surveySchema>) => void;
};

export default function SurveyForm({ onSubmit }: SurveyFormProps) {
  const form = useForm<z.infer<typeof surveySchema>>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      name: "",
      goal: "",
    },
  });

  return (
    <div className="flex h-screen items-center justify-center px-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4">
                <Logo />
            </div>
          <CardTitle className="text-2xl font-headline">Just a few questions</CardTitle>
          <CardDescription>
            Help us personalize your experience by answering two quick questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What's your name?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What are you hoping to learn or achieve today?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., I want to understand how to use React hooks." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Start Chat
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
