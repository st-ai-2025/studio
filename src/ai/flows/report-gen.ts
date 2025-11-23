
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Report, ReportInput, SerializableMessage } from '@/types';

export async function generateReport(input: ReportInput): Promise<Report> {
    const ReportSchema = z.object({
        subject: z.string().describe('The subject of the tutoring session'),
        topics: z.array(z.string()).describe('The topics covered in the tutoring session'),
        goodAt: z.array(z.string()).describe('The areas that the student is good at'),
        needsPractice: z.array(z.string()).describe('The areas that the student needs more practice on'),
        summary: z.string().describe('A summary of the tutoring session'),
    });

    const SerializableMessageSchema = z.object({
        id: z.string(),
        userId: z.string(),
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        timestamp: z.number(),
        answers: z.optional(z.object({
            A: z.string(),
            B: z.string(),
            C: z.string(),
            D: z.string(),
        })),
    });

    const ReportInputSchema = z.object({
        history: z.array(SerializableMessageSchema).describe('The history of the conversation so far.'),
    });

    const reportGenerationPrompt = ai.definePrompt({
        name: 'reportGenerationPrompt',
        input: { schema: z.any() },
        output: { schema: ReportSchema },
        prompt: `You are an experienced teacher overseeing the tutoring session between a student (role: user) 
            and a tutor (role: assistant). Given the chat history between the two, summarize the subject and topics tutored, 
            student's understanding about the topics, highlighting the areas that the student is good at, 
            and the areas that needs to pay more attention to. 
            Whenever possible, suggest a list of related topics, with brief rationale, for the student to dive deeper offline.
    
# Conversation History:
{{#if history}}
{{#each history}}
{{#if this.isUser}}
Student: {{{this.content}}}
{{/if}}
{{#if this.isAssistant}}
Tutor: {{{this.content}}}
{{/if}}
{{/each}}
{{/if}}
`,
    });

    const generateReportFlow = ai.defineFlow(
        {
            name: 'generateReportFlow',
            inputSchema: ReportInputSchema,
            outputSchema: ReportSchema,
        },
        async (input: { history: SerializableMessage[] }) => {
            const historyWithRoles = input.history.map(message => ({
                isUser: message.role === 'user',
                isAssistant: message.role === 'assistant',
                ...message,
            }));
            const { output } = await reportGenerationPrompt({ ...input, history: historyWithRoles });
            return output!;
        }
    );

    return generateReportFlow(input);
}
