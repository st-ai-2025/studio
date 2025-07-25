
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";

const surveySchema = z.object({
  graduationYear: z.string({ required_error: "Please select a graduation year." }),
  subject: z.enum(["math", "science", "language", "social studies", "sat", "act"], { required_error: "Please select a subject." }),
  interestLevel: z.array(z.number()).min(1).max(1),
  aiUsage: z.enum(["daily", "weekly", "monthly", "rarely"], { required_error: "Please select your AI usage frequency." }),
});

type SurveyFormProps = {
  onSubmit: (data: Record<string, any>) => void;
};

export default function SurveyForm({ onSubmit }: SurveyFormProps) {
  const { signOut } = useAuth();
  const form = useForm<z.infer<typeof surveySchema>>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      interestLevel: [3],
    },
  });

  const handleFormSubmit = (data: z.infer<typeof surveySchema>) => {
    onSubmit({
      ...data,
      interestLevel: data.interestLevel[0],
    });
  };

  return (
    <div className="flex items-center justify-center px-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-grow text-center">
              <div className="mx-auto mb-4 inline-block">
                  <Logo />
              </div>
              <CardTitle className="text-2xl font-headline">Welcome to AI Tutoring Research</CardTitle>
              <CardDescription className="pt-2">
                Help us personalize your experience by answering these questions.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="graduationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>1. Your high school graduation year</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your graduation year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2026">2026</SelectItem>
                        <SelectItem value="2027">2027</SelectItem>
                        <SelectItem value="2028">2028</SelectItem>
                        <SelectItem value="2029">2029</SelectItem>
                        <SelectItem value="2030">2030</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>2. Which subject area would you like to receive tutoring today?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="math" />
                          </FormControl>
                          <FormLabel className="font-normal">Math</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="science" />
                          </FormControl>
                          <FormLabel className="font-normal">Science</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="language" />
                          </FormControl>
                          <FormLabel className="font-normal">Language</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="social studies" />
                          </FormControl>
                          <FormLabel className="font-normal">Social Studies</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="sat" />
                          </FormControl>
                          <FormLabel className="font-normal">SAT</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="act" />
                          </FormControl>
                          <FormLabel className="font-normal">ACT</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interestLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>3. How would you rate your level of study interest in this area?</FormLabel>
                     <FormControl>
                        <div className="relative pt-2">
                            <Slider
                                min={1}
                                max={5}
                                step={1}
                                defaultValue={field.value}
                                onValueChange={(value) => field.onChange(value)}
                            />
                            <div className="absolute top-1/2 -translate-y-1/2 w-full h-full flex justify-between items-center px-[10px] pointer-events-none">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-2 w-2 rounded-full bg-slate-200" />
                                ))}
                            </div>
                        </div>
                    </FormControl>
                    <div className="relative h-10 text-sm text-muted-foreground">
                        <span className="absolute left-0 text-center w-[20%]">Not<br/>Interested</span>
                        <span className="absolute left-1/2 -translate-x-1/2 text-center w-[20%]">Neutral</span>
                        <span className="absolute right-0 text-center w-[20%]">Extremely<br/>Interested</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <FormField
                control={form.control}
                name="aiUsage"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>4. How frequently do you use AI tools to assist your learning in this subject area?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="daily" />
                          </FormControl>
                          <FormLabel className="font-normal">Daily</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="weekly" />
                          </FormControl>
                          <FormLabel className="font-normal">Weekly</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="monthly" />
                          </FormControl>
                          <FormLabel className="font-normal">Monthly</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="rarely" />
                          </FormControl>
                          <FormLabel className="font-normal">Rarely/Never</FormLabel>
                        </FormItem>
                      </RadioGroup>
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
