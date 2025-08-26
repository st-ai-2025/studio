
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const postSurveySchema = z.object({
  understandingChange: z.array(z.number()).min(1).max(1),
  interestChange: z.array(z.number()).min(1).max(1),
  futureInterest: z.enum(["yes", "no", "not_sure"], { required_error: "Please select an option." }),
  mostHelpful: z.string().optional(),
  missingAspects: z.string().optional(),
});

type PostSurveyFormProps = {
  onSubmit: (data: z.infer<typeof postSurveySchema>) => void;
};

export default function PostSurveyForm({ onSubmit }: PostSurveyFormProps) {
  const form = useForm<z.infer<typeof postSurveySchema>>({
    resolver: zodResolver(postSurveySchema),
    defaultValues: {
      understandingChange: [3],
      interestChange: [3],
      mostHelpful: "",
      missingAspects: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
            control={form.control}
            name="understandingChange"
            render={({ field }) => (
                <FormItem>
                <FormLabel>1. After this tutoring session, my understanding of this subject is:</FormLabel>
                <FormControl>
                    <div className="relative">
                        <Slider
                            min={1}
                            max={5}
                            step={1}
                            defaultValue={field.value}
                            onValueChange={(value) => field.onChange(value)}
                            className="h-3"
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 w-full h-full flex justify-between items-center px-[10px] pointer-events-none">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-2 w-2 rounded-full bg-slate-200" />
                            ))}
                        </div>
                    </div>
                </FormControl>
                <div className="relative h-10 text-sm text-muted-foreground">
                    <span className="absolute left-0 text-center w-1/5">Greatly<br/>Worsened</span>
                    <span className="absolute left-1/2 -translate-x-1/2 text-center w-1/5">Same</span>
                    <span className="absolute right-0 text-center w-1/5">Greatly<br/>Improved</span>
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
                <FormLabel>2. After this tutoring session, my level of interest in this subject is:</FormLabel>
                 <FormControl>
                    <div className="relative">
                        <Slider
                            min={1}
                            max={5}
                            step={1}
                            defaultValue={field.value}
                            onValueChange={(value) => field.onChange(value)}
                            className="h-3"
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 w-full h-full flex justify-between items-center px-[10px] pointer-events-none">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-2 w-2 rounded-full bg-slate-200" />
                            ))}
                        </div>
                    </div>
                </FormControl>
                <div className="relative h-10 text-sm text-muted-foreground">
                    <span className="absolute left-0 text-center w-1/5">Greatly<br/>Decreased</span>
                    <span className="absolute left-1/2 -translate-x-1/2 text-center w-1/5">Same</span>
                    <span className="absolute right-0 text-center w-1/5">Greatly<br/>Increased</span>
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
                <FormLabel>3. Will you be interested in further exploring this subject using similar AI tutoring tools in the future?</FormLabel>
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
        <FormField
          control={form.control}
          name="mostHelpful"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What aspects of the tutoring session were most helpful to you?</FormLabel>
              <FormControl>
                <Textarea placeholder="Your feedback..." {...field} className="text-sm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="missingAspects"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What other helpful aspects of tutoring were missing in the previous session</FormLabel>
              <FormControl>
                <Textarea placeholder="Your feedback..." {...field} className="text-sm" />
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
