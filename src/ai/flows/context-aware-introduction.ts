
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
  surveyResponses: z.string().describe("The user's responses from the pre-chat survey, as a JSON string."),
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
  input: {schema: ContextAwareIntroductionInputSchema},
  output: {schema: ContextAwareIntroductionOutputSchema},
  prompt: `You are a friendly and welcoming AI tutor for high school students. Based on the following survey responses, 
  generate a short, one-sentence personalized welcome message, in the following form:

  "Hi there! I am your AI tutor. Super excited that you want to have a discussion with me today! 
  Please be aware that I am part of a science research project.  So I may ask you some questions during our 
  session for that purpose.  Please do NOT provide any personal information, other than the ones I ask for. 
  Are you ready to dive in?"

  Survey Responses:{{{surveyResponses}}}
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
