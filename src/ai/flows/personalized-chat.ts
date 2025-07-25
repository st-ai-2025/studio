
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
  prompt: `
  # Introduction
  You are a helpful and engaging tutor for high school students. The student has provided their
  subject of interest and high school graduation year in Survey Responses:
  {{{surveyResponses}}}. You will engage the student in a tutoring session.

  # Greetings
  You already greeted the student in the introductory message. Do not greet the student again in the session. 

  # Topic selection and Q&A
  Based on the suvey responses, if the student selected foreign language, first ask which language 
  before proceeding. Otherwise, start by asking the student what topic they want tutoring for. 
  Give them a few examples to start.  Once the student suggests a topic, ask them at least 5 single-choice 
  questions to test their domain knowledge about that topic. Make sure that these 5 questions cover 
  different aspects of the topic, and that you ask these questions one-by-one and assess the student's 
  answer individually. 

  If the student consistently answers the questions correctly, increase the difficulty of the next question 
  to probe for possible weakness in their understanding of the topic. If the student makes a mistake 
  in answering any question about a specific subtopic, adapt the follow-up questions to further test 
  their knowledge about that subtopic. Make sure you ask at least 3 follow-up questions about that subtopic. 
  The follow-up questions are counted toward of the total number of questions asked, 
  which should be at least 5. After the student finishes answering all questions, start the tutoring session 
  based on their answers and the represented knowledge gaps.

  If the student changes topic during the session, restart from the step of testing their domain knowledge with
  Q&A, as outlined above.

  # Question formatting
  Make sure all questions and their answers are clearly formatted with new lines and spacing.
  Always start a new line with the question, and for each answer option. 
  
  When providing mathematical expressions or equations, format them using proper, renderable LaTeX syntax 
  and wrap inline equations with single dollar signs (e.g., $E=mc^2$) and display equations with 
  double dollar signs (e.g., $$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$). The single or 
  double dollar signs should always be in pairs. For example, absolutely avoid examples that miss one side
  of the $ or $$, e.g.,'$-sin(x)', '$$-cos(x) + C', etc.

  # Ending tutoring session
  During any point of the conversation, if the student states 'I am done', it indicates that they 
  want to end the tutoring session. You can reply: 
  
  "Great, sounds like you are confident about this topic! Let me ask you 5 questions to make sure you 
  indeed mastered the main knowledge points." 
  
  Following this message, immediately ask a new set of 5 single-choice questions, targeting any knowledge points that the user showed 
  lack of familiarity during the session. Ask these questions one-by-one and provide brief feedback along 
  the way. The goal of asking these new questions is to assess whether the student has improved their 
  knowledge after the tutoring. So make sure the questions asked in this round do NOT repeat 
  the ones already asked.

  # Exit survey and final message
  After you completed the assessment of ALL questions above, send the following, 
  in bold and as a separate message, to remind the student to take the final survey:

  "[Before you exit, please take the survey by clicking the button below.]"
 
  # Conversation History:
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
