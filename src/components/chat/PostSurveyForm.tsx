
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const postSurveySchema = z.object({
  feedback: z.string().min(10, { message: "Please provide at least 10 characters of feedback." }),
  understandingChange: z.array(z.number()).min(1).max(1),
  interestChange: z.array(z.number()).min(1).max(1),
  futureInterest: z.enum(["yes", "no", "not_sure"], { required_error: "Please select an option." }),
});

type PostSurveyFormProps = {
  onSubmit: (data: z.infer<typeof postSurveySchema>) => void;
};

export default function PostSurveyForm({ onSubmit }: PostSurveyFormProps) {
  const form = useForm<z.infer<typeof postSurveySchema>>({
    resolver: zodResolver(postSurveySchema),
    defaultValues: {
      feedback: "",
      understandingChange: [2],
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
            name="understandingChange"
            render={({ field }) => (
                <FormItem>
                <FormLabel>2. After this tutoring session, my understanding of this subject is:</FormLabel>
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
                    <span>Greatly Worsened</span>
                    <span>About the Same</span>
                    <span>Greatly Improved</span>
                </div>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="interestChange"
            render={({ field }) => (
                <FormItem>
                <FormLabel>3. After this tutoring session, my level of interest in this subject is:</FormLabel>
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
        <FormField
            control={form.control}
            name="futureInterest"
            render={({ field }) => (
                <FormItem>
                <FormLabel>4. Will you be interested in further exploring this subject using similar AI tutoring tools in the future?</FormLabel>
                <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="not_sure" />
                          </FormControl>
                          <FormLabel className="font-normal">Not sure</FormLabel>
                        </FormItem>
                      </RadioGroup>
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

    