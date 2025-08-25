
'use server';
/**
 * @fileOverview Generates a context-aware introduction based on survey responses.
 *
 * - generateContextAwareIntroduction - A function that creates a personalized welcome message.
 * - ContextAwareIntroductionInput - The input type for the function.
 * - ContextAwareIntroductionOutput - The return type for the function.
 */

import {z} from 'genkit';

const ContextAwareIntroductionInputSchema = z.object({
  surveyResponses: z.record(z.string(), z.any()).describe("The user's responses from the pre-chat survey."),
});
export type ContextAwareIntroductionInput = z.infer<typeof ContextAwareIntroductionInputSchema>;

const ContextAwareIntroductionOutputSchema = z.object({
  introduction: z.string().describe('A short, personalized welcome message for the user.'),
});
export type ContextAwareIntroductionOutput = z.infer<typeof ContextAwareIntroductionOutputSchema>;

export async function generateContextAwareIntroduction(input: ContextAwareIntroductionInput): Promise<ContextAwareIntroductionOutput> {
  return {
    introduction: `Hi there! I am your AI tutor 🧑‍🏫. Super excited that you want to have a discussion with me today! 
Please be aware that I am part of a science research project. Our discussion should take 
<strong>at least 15 minutes</strong> to be effective.  As a reminder, please do NOT provide any personal 
information during our chat. Are you ready to dive in?`
  };
}
