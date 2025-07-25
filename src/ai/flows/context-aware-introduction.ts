
'use server';
/**
 * @fileOverview Generates a context-aware introduction based on survey responses.
 *
 * - generateContextAwareIntroduction - A function that creates a personalized welcome message.
 * - ContextAwareIntroductionInput - The input type for the function.
 * - ContextAwareIntroductionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
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
  return contextAwareIntroductionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextAwareIntroductionPrompt',
  input: {schema: z.object({
    surveyResponses: z.string(),
  })},
  output: {schema: ContextAwareIntroductionOutputSchema},
  prompt: `You are a friendly and welcoming AI tutor for high school students. 
  As an introduction, generate a welcome message, exactly as the following:

  "Hi there! I am your AI tutor 🧑‍🏫. Super excited that you want to have a discussion with me today! 
  Please be aware that I am part of a science research project. Our discussion should take 
  **at least 15 minutes** to be effective.  As a reminder, please do NOT provide any personal 
  information during our chat. Are you ready to dive in?"
`,
});

const contextAwareIntroductionFlow = ai.defineFlow(
  {
    name: 'contextAwareIntroductionFlow',
    inputSchema: ContextAwareIntroductionInputSchema,
    outputSchema: ContextAwareIntroductionOutputSchema,
  },
  async input => {
    const {output} = await prompt({
      surveyResponses: JSON.stringify(input.surveyResponses),
    });
    return output!;
  }
);
