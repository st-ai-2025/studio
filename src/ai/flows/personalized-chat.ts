'use server';

/**
 * @fileOverview A personalized chat flow that incorporates pre-chat survey responses.
 *
 * - personalizedChat - A function that initiates a personalized chat session.
 * - PersonalizedChatInput - The input type for the personalizedChat function.
 * - PersonalizedChatOutput - The return type for the personalizedChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedChatInputSchema = z.object({
  surveyResponses: z.record(z.string(), z.any()).describe('The user\'s responses from the pre-chat survey.'),
  userMessage: z.string().describe('The user\'s initial message.'),
});
export type PersonalizedChatInput = z.infer<typeof PersonalizedChatInputSchema>;

const PersonalizedChatOutputSchema = z.object({
  chatbotResponse: z.string().describe('The chatbot\'s personalized response.'),
});
export type PersonalizedChatOutput = z.infer<typeof PersonalizedChatOutputSchema>;

export async function personalizedChat(input: PersonalizedChatInput): Promise<PersonalizedChatOutput> {
  return personalizedChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedChatPrompt',
  input: {schema: PersonalizedChatInputSchema},
  output: {schema: PersonalizedChatOutputSchema},
  prompt: `You are a helpful AI chatbot. Personalize the conversation based on the user's pre-chat survey responses.

Survey Responses:
{{#each surveyResponses}}
  {{@key}}: {{{this}}}
{{/each}}

User Message: {{{userMessage}}}

Based on the survey responses and the user's message, provide a relevant and helpful response, tailoring your opening conversational move to the user's input in the survey.
`,
});

const personalizedChatFlow = ai.defineFlow(
  {
    name: 'personalizedChatFlow',
    inputSchema: PersonalizedChatInputSchema,
    outputSchema: PersonalizedChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
