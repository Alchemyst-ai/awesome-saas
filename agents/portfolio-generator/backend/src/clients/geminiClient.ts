import { GoogleGenerativeAI } from '@google/generative-ai';
import { client as alchemystClient } from './alchemstClient';

interface EnrichedData {
  linkedin?: any;
  github?: any;
  additionalContext?: string;
  enrichedAt: string;
}

interface PortfolioOutput {
  personalInfo: any;
  projects: any[];
  skills: string[];
  experience: any[];
  education: any[];
  summary: string;
}

export const geminiClient = async (enrichedData: EnrichedData): Promise<PortfolioOutput> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }

    // Perform context search before generating the portfolio
    const searchResults = await alchemystClient.v1.context.search({
      query: "Portfolio information for LinkedIn and GitHub profiles",
      limit: 10
    });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Prepare the prompt for Gemini, including context search results
    const prompt = `
      Generate a comprehensive portfolio based on the following data:

      Context Search Results: ${JSON.stringify(searchResults, null, 2)}

      LinkedIn Data: ${JSON.stringify(enrichedData.linkedin, null, 2)}
      GitHub Data: ${JSON.stringify(enrichedData.github, null, 2)}
      Additional Context: ${enrichedData.additionalContext}

      Please generate a structured portfolio with the following sections:
      1. Personal Information (name, email, location, summary)
      2. Professional Experience
      3. Education
      4. Skills (technical and soft skills)
      5. Projects (from GitHub and LinkedIn)
      6. Professional Summary

      Return the result as a valid JSON object with keys: personalInfo, experience, education, skills, projects, summary.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    try {
      // Remove markdown code blocks if present
      const jsonMatch = text.match(/``````/) || text.match(/``````/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;

      const portfolio = JSON.parse(jsonText);
      return portfolio;
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return {
        personalInfo: {},
        projects: [],
        skills: [],
        experience: [],
        education: [],
        summary: text
      };
    }
  } catch (error) {
    console.error('Error in geminiClient:', error);
    throw new Error('Failed to generate portfolio with Gemini: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};
