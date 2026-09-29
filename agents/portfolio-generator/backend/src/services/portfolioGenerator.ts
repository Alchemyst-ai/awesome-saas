import { alchemstClient } from '../clients/alchemstClient';
import { geminiClient } from '../clients/geminiClient';
import { contextEnricher } from './contextEnricher';

interface PortfolioInput {
  linkedinUrl?: string;
  githubUsername?: string;
  additionalInfo?: string;
}

interface PortfolioOutput {
  personalInfo: any;
  projects: any[];
  skills: string[];
  experience: any[];
  education: any[];
  summary: string;
}

export const portfolioGenerator = async (input: PortfolioInput): Promise<PortfolioOutput> => {
  try {
    // Step 1: Fetch data from Alchemic AI (LinkedIn and GitHub)
    const rawData = await alchemstClient({
      linkedinUrl: input.linkedinUrl,
      githubUsername: input.githubUsername
    });

    // Step 2: Enrich context with additional information
    const enrichedData = await contextEnricher(rawData, input.additionalInfo);

    // Step 3: Generate portfolio content using Gemini
    const portfolio = await geminiClient(enrichedData);

    return portfolio;
  } catch (error) {
    console.error('Error in portfolioGenerator:', error);
    throw new Error('Failed to generate portfolio: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};
