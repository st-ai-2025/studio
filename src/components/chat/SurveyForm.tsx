
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
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";

const surveySchema = z.object({
  graduationYear: z.string({ required_error: "Please select a graduation year." }),
  subject: z.enum(["math", "science", "language", "social studies"], { required_error: "Please select a subject." }),
  interestLevel: z.array(z.number()).min(1).max(1).transform(arr => arr[0]),
  aiUsage: z.enum(["daily", "weekly", "monthly", "rarely"], { required_error: "Please select your AI usage frequency." }),
  aiUsageReason: z.string().min(1, { message: "Please provide a reason." }),
});

type SurveyFormProps = {
  onSubmit: (data: z.infer<typeof surveySchema>) => void;
};

export default function SurveyForm({ onSubmit }: SurveyFormProps) {
  const { signOut } = useAuth();
  const form = useForm<z.infer<typeof surveySchema>>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      interestLevel: [3],
      aiUsageReason: "",
    },
  });

  return (
    <div className="flex items-center justify-center px-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-grow text-center">
              <div className="mx-auto mb-4 inline-block">
                  <Logo />
              </div>
              <CardTitle className="text-2xl font-headline">Please answer a few questions about you</CardTitle>
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="graduationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>1. High school graduation year</FormLabel>
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
                        <Slider
                            min={1}
                            max={5}
                            step={1}
                            defaultValue={field.value}
                            onValueChange={(value) => field.onChange(value)}
                        />
                    </FormControl>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Not Interested</span>
                        <span>Extremely Interested</span>
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
                          <FormLabel className="font-normal">Rarely</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aiUsageReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>5. When you use AI tools to assist your learning in this subject area, what is the most frequent reason to use the AI tool?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., to summarize long texts, to check my grammar, to get ideas for a paper..."
                        {...field}
                      />
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
