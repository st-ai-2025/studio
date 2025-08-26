import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v2',
    }),
  ],
  model: 'googleai/gemini-2.5-flash-lite',
  config: {
    temperature: 0.7,
    maxOutputTokens: 65536,
  },
});
