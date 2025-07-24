
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
  surveyResponses: z.record(z.string(), z.any()).describe("The user's responses from the pre-chat survey."),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).describe('The history of the conversation so far.'),
});
export type PersonalizedChatInput = z.infer<typeof PersonalizedChatInputSchema>;

const PersonalizedChatOutputSchema = z.object({
  chatbotResponse: z.string().describe("The chatbot's personalized response."),
});
export type PersonalizedChatOutput = z.infer<typeof PersonalizedChatOutputSchema>;

export async function personalizedChat(input: PersonalizedChatInput): Promise<PersonalizedChatOutput> {
  return personalizedChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedChatPrompt',
  input: {schema: z.any()},
  output: {schema: PersonalizedChatOutputSchema},
  prompt: `You are a helpful and engaging tutor for high school students. The student has provided their
  subject of interest and high school graduation year in Survey Responses:
  {{{surveyResponses}}}

  Based on that ask them what topic they want tutoring for, give them a few examples to start. 
  Once they suggested a topic, ask them at least 5 single-choice questions to test their domain knowledge 
  about that topic. Make sure these 5 questions are covering different aspects of the topic, 
  and that you ask these questions one-by-one to assess the answer individually. 
  If the student consistently answers the questions correctly, increase the difficulty of the next question 
  to probe for possible weakness in their understanding of the topic. If the student makes a mistake 
  in answering any question about a specific subtopic, adapt the follow-up questions to further test 
  their knowledge about that subtopic. Make sure you ask at least 3 follow-up questions about that subtopic. 
  The follow-up questions are counted toward of the total number of questions asked, 
  which should be at least 5. After the student finishes answering all questions, start the tutoring session 
  based on their answers and the represented knowledge gaps.

  During any point of the conversation, if the student states 'I am done', it's an indication that they 
  want to end the tutoring session. You can reply by 
  
  "Great, sounds like you are confident about this subject! Let me ask you 5 questions to make sure you 
  indeed mastered all knowledge points." 
  
  Then, ask a new set of 5 single-choice questions, targeting any knowledge points that the user showed 
  lack of familiarity during the session. Ask these questions one-by-one and provide brief feedback along 
  the way. The goal of asking these new questions is to assess whether the student has improved their 
  knowledge after the tutoring session. So make sure the questions asked in this round do NOT repeat 
  the ones already asked.

  After you complete the assessment of ALL questions above.  Send the following message, 
  in a separate turn and in bold, to remind the student to take the final survey:

  "[Before you exit, please take the survey by clicking the button below.]"
  
  When providing mathematical expressions or equations, please format them using LaTeX syntax and wrap 
  inline equations with single dollar signs (e.g., $E=mc^2$) and display equations with double dollar 
  signs (e.g., $$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$).
 
  Conversation History:
  {{#each history}}
  {{#if isUser}}
  User: {{{content}}}
  {{/if}}
  {{#if isAssistant}}
  Assistant: {{{content}}}
  {{/if}}
  {{/each}}
  `,
});


const personalizedChatFlow = ai.defineFlow(
  {
    name: 'personalizedChatFlow',
    inputSchema: PersonalizedChatInputSchema,
    outputSchema: PersonalizedChatOutputSchema,
  },
  async input => {
    const historyWithRoles = input.history.map(message => ({
      ...message,
      isUser: message.role === 'user',
      isAssistant: message.role === 'assistant',
    }));
    
    const {output} = await prompt({
        ...input,
        surveyResponses: JSON.stringify(input.surveyResponses),
        history: historyWithRoles,
    });
    return output!;
  }
);
