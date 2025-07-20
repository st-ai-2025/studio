'use server';

/**
 * @fileOverview An AI agent that generates a personalized introduction based on survey responses.
 *
 * - generateContextAwareIntroduction - A function that generates the introduction.
 * - ContextAwareIntroductionInput - The input type for the generateContextAwareIntroduction function.
 * - ContextAwareIntroductionOutput - The return type for the generateContextAwareIntroduction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextAwareIntroductionInputSchema = z.object({
  surveyResponses: z.string().describe('The user\u0027s responses to the pre-chat survey.'),
});
export type ContextAwareIntroductionInput = z.infer<typeof ContextAwareIntroductionInputSchema>;

const ContextAwareIntroductionOutputSchema = z.object({
  introduction: z.string().describe('A personalized introduction for the chatbot.'),
});
export type ContextAwareIntroductionOutput = z.infer<typeof ContextAwareIntroductionOutputSchema>;

export async function generateContextAwareIntroduction(input: ContextAwareIntroductionInput): Promise<ContextAwareIntroductionOutput> {
  return contextAwareIntroductionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextAwareIntroductionPrompt',
  input: {schema: ContextAwareIntroductionInputSchema},
  output: {schema: ContextAwareIntroductionOutputSchema},
  prompt: `You are a chatbot designed to provide personalized assistance.

  Based on the user's responses to the pre-chat survey below, craft a brief and engaging introduction that acknowledges their input and sets the stage for a helpful conversation.  The introduction should be no more than three sentences.

  Survey Responses: {{{surveyResponses}}}
  `,
});

const contextAwareIntroductionFlow = ai.defineFlow(
  {
    name: 'contextAwareIntroductionFlow',
    inputSchema: ContextAwareIntroductionInputSchema,
    outputSchema: ContextAwareIntroductionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
