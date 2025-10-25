import AlchemystAI from '@alchemystai/sdk';

interface AlchemstInput {
  linkedinUrl?: string;
  githubUsername?: string;
}

interface AlchemstOutput {
  linkedin?: any;
  github?: any;
}

// Initialize the AlchemystAI client with API key from environment
const client = new AlchemystAI({
  apiKey: process.env.ALCHEMYST_API_KEY ?? ''
});

export const alchemstClient = async (input: AlchemstInput): Promise<AlchemstOutput> => {
  try {
    const result: AlchemstOutput = {};

    // Add context enrichment for LinkedIn data if URL is provided
    if (input.linkedinUrl) {
      try {
        const linkedinContext = await client.v1.context.add({
          data: [
            {
              content: input.linkedinUrl,
              metadata: { source: 'linkedin', type: 'profile' }
            }
          ]
        });
        result.linkedin = linkedinContext;
      } catch (error) {
        console.error('Error fetching LinkedIn data:', error);
        result.linkedin = { error: 'Failed to fetch LinkedIn data' };
      }
    }

    // Add context enrichment for GitHub data if username is provided
    if (input.githubUsername) {
      try {
        const githubContext = await client.v1.context.add({
          data: [
            {
              content: input.githubUsername,
              metadata: { source: 'github', type: 'profile' }
            }
          ]
        });
        result.github = githubContext;
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
        result.github = { error: 'Failed to fetch GitHub data' };
      }
    }

    return result;
  } catch (error) {
    console.error('Error in alchemstClient:', error);
    throw new Error('Failed to fetch data from AlchemystAI: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};
export { client as alchemystClient };
