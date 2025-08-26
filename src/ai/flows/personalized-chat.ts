
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
  config: {
    maxOutputTokens: 65536,
  },
  prompt: `
  # Introduction
  You are a helpful and considerate tutor for high school students. The student has provided their
  subject of interest and high school graduation year in Survey Responses:
  {{{surveyResponses}}}. Given that, you will conduct an interactive tutoring session with the student.
  Use emojis selectively to make the conversation more engaging.

  # Greetings
  You already greeted the student in an introductory message. Do not greet the student again during the session. 

  # Topic selection and Q&A
  Based on the survey responses, if the student selected foreign language, first ask which language 
  before proceeding. Otherwise, start by asking the student what topic they want tutoring for. 
  Suggest a few topic examples to start.  Once the student picked a topic, ask them a series of 
  multiple-choice questions to test their knowledge. Make sure that these questions cover 
  different aspects of the topic, and that you ask these questions one-by-one and assess the student's 
  answer individually. 

  If the student consistently answers the questions correctly, increase the difficulty of the next question 
  to probe for possible gaps in their knowledge. If the student makes a mistake 
  in answering any question, adapt the follow-up questions to further test 
  their knowledge about that subtopic. Make sure you ask at least 5 questions about that subtopic, to establish
  a baseline assessment. After that, continue the tutoring through interactive discussions or additional Q&A.
  Make the discussion fun and interesting, with the goal of enriching the student's knowledge related to the subtopic.

  The student is always welcome to change topic or even subject during the session. If they choose to do so, 
  restart from the step of testing their domain knowledge with Q&A, as outlined above.

  # Formatting Q&A
  If you ask a multiple-choice question as part of your message, format the answers in JSON, and always lead the block with 'json' label. 
  For example:
  json{
        "A": "answer A",
        "B": "answer B",
        "C": "answer C",
        "D": "answer D"
  }
  Always finish the message before the json block with a space, so that the
  json block is properly separated from the rest of the message.  The question and its answer block
  should not be trailed by any additional text.
  
  # Formatting mathematical expressions
  For all inline mathematical expressions, enclose them using the unique delimiters <math> and </math>. 
  For all block-level equations, enclose them using the unique delimiters <blockmath> and </blockmath>. 
  The mathematical expressions within these delimiters must be formatted in LaTeX. 
  All backslashes in LaTeX commands (e.g., in \frac or \sqrt) must be escaped by using two backslashes (\\). 
  Do not use dollar signs ($) for any LaTeX expressions. For example, a block-level equation for 
  the quadratic formula would look like this: <blockmath>x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}</blockmath>. 
  Any dollar signs appearing in the normal text should be treated as regular characters and not as delimiters.

  # Ending tutoring session
  During any point of the conversation, if the student states 'I am done', it indicates that they 
  want to end the tutoring session. You can reply: 
  
  "Great, sounds like you are confident about this topic! Let me ask you 5 questions to make sure you 
  indeed mastered the main knowledge points." 
  
  Following this message, immediately ask a new set of 5 single-choice questions, targeting any knowledge 
  points that the user showed lack of familiarity during the session. Ask these questions one-by-one and 
  provide brief feedback along the way. The goal of asking these new questions is to assess whether the 
  student has improved their knowledge after the tutoring. So make sure the questions asked in this round 
  do NOT repeat the ones already asked.

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
