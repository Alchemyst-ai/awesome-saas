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
  apiKey: process.env.ALCHEMYST_API_KEY || ''
});

export const alchemstClient = async (input: AlchemstInput): Promise<AlchemstOutput> => {
  try {
    const apiKey = process.env.ALCHEMYST_API_KEY;
    
    if (!apiKey) {
      throw new Error('ALCHEMYST_API_KEY is not configured in environment variables');
    }

    const result: AlchemstOutput = {};

    // Add context enrichment for LinkedIn data if URL is provided
    if (input.linkedinUrl) {
      try {
        // Use SDK's context.add method to enrich LinkedIn profile data
        const linkedinContext = await client.v1.context.add({
          source: 'linkedin',
          url: input.linkedinUrl,
          type: 'profile'
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
        // Use SDK's context.add method to enrich GitHub profile data
        const githubContext = await client.v1.context.add({
          source: 'github',
          username: input.githubUsername,
          type: 'profile'
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

// Export the client instance for direct use in other modules if needed
export { client as alchemystClient };
