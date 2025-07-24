
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const postSurveySchema = z.object({
  feedback: z.string().min(10, { message: "Please provide at least 10 characters of feedback." }),
});

type PostSurveyFormProps = {
  onSubmit: (data: z.infer<typeof postSurveySchema>) => void;
};

export default function PostSurveyForm({ onSubmit }: PostSurveyFormProps) {
  const form = useForm<z.infer<typeof postSurveySchema>>({
    resolver: zodResolver(postSurveySchema),
    defaultValues: {
      feedback: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How do you like the tutoring session?</FormLabel>
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
        <Button type="submit" className="w-full">Submit Feedback</Button>
      </form>
    </Form>
  );
}
