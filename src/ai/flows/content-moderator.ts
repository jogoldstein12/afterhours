'use server';

/**
 * @fileOverview A content moderation AI agent that flags potentially inappropriate user-submitted prompts.
 *
 * - moderateContent - A function that moderates user-submitted content based on the NSFW level.
 * - ModerateContentInput - The input type for the moderateContent function.
 * - ModerateContentOutput - The return type for the moderateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateContentInputSchema = z.object({
  content: z.string().describe('The user-submitted content to be moderated.'),
  nsfwLevel: z.enum(['Mild', 'Medium', 'Extreme']).describe('The selected NSFW level.'),
});
export type ModerateContentInput = z.infer<typeof ModerateContentInputSchema>;

const ModerateContentOutputSchema = z.object({
  isAppropriate: z.boolean().describe('Whether the content is appropriate for the selected NSFW level.'),
  flagReason: z.string().optional().describe('The reason why the content was flagged as inappropriate.'),
});
export type ModerateContentOutput = z.infer<typeof ModerateContentOutputSchema>;

export async function moderateContent(input: ModerateContentInput): Promise<ModerateContentOutput> {
  return moderateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateContentPrompt',
  input: {schema: ModerateContentInputSchema},
  output: {schema: ModerateContentOutputSchema},
  prompt: `You are an AI content moderator for a party game app called \"After Hours.\" Your task is to determine whether user-submitted content is appropriate for the selected NSFW level.\n\nContent: {{{content}}}\nNSFW Level: {{{nsfwLevel}}}\n\nConsider the following guidelines when making your determination:\n*   Mild: Content should be generally tame and suitable for a wide audience. No overtly sexual or violent content is allowed.\n*   Medium: Content may contain some suggestive themes or mild profanity. Violence should be minimal and not graphic.\n*   Extreme: Content may contain explicit sexual themes, strong profanity, and graphic violence.\n\nBased on these guidelines, determine whether the content is appropriate for the selected NSFW level. If it is, set isAppropriate to true. If it is not, set isAppropriate to false and provide a brief reason why in the flagReason field.\n\nReturn your answer as a JSON object.`,
});

const moderateContentFlow = ai.defineFlow(
  {
    name: 'moderateContentFlow',
    inputSchema: ModerateContentInputSchema,
    outputSchema: ModerateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
