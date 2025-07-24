
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

const postSurveySchema = z.object({
  feedback: z.string().min(10, { message: "Please provide at least 10 characters of feedback." }),
  interestChange: z.array(z.number()).min(1).max(1),
});

type PostSurveyFormProps = {
  onSubmit: (data: z.infer<typeof postSurveySchema>) => void;
};

export default function PostSurveyForm({ onSubmit }: PostSurveyFormProps) {
  const form = useForm<z.infer<typeof postSurveySchema>>({
    resolver: zodResolver(postSurveySchema),
    defaultValues: {
      feedback: "",
      interestChange: [2],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>1. How do you like the tutoring session?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your experience..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="interestChange"
            render={({ field }) => (
                <FormItem>
                <FormLabel>2. After this tutoring session, my level of interest in this subject is:</FormLabel>
                <FormControl>
                    <Slider
                        min={0}
                        max={4}
                        step={1}
                        defaultValue={field.value}
                        onValueChange={(value) => field.onChange(value)}
                    />
                </FormControl>
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Greatly Decreased</span>
                    <span>About the Same</span>
                    <span>Greatly Increased</span>
                </div>
                <FormMessage />
                </FormItem>
            )}
        />
        <Button type="submit" className="w-full">Submit Feedback</Button>
      </form>
    </Form>
  );
}
