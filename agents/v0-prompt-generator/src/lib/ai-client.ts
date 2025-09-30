import { AlchemystAI } from '@alchemystai/sdk';
import type {
  UserInput,
  GeneratedPrompt,
  AlchemystPromptRequest,
  AlchemystPromptResponse,
  IndustryConfig,
  PromptTemplate,
} from '@/types';
import { getIndustryConfig } from '@/utils/industry-utils';
import { BASE_PROMPT_TEMPLATE } from './prompt-templates';
import { performanceMonitor, measureAsync } from './performance-monitor';
import {
  cacheManager,
  CACHE_KEYS,
  CACHE_TTL,
  createCacheKey,
} from './cache-manager';

// AI client configuration using Alchemyst AI SDK
export class AlchemystClient {
  private client: AlchemystAI;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second base delay

  constructor() {
    this.client = new AlchemystAI({
      apiKey: process.env.ALCHEMYST_AI_API_KEY || '',
      baseURL: process.env.ALCHEMYST_AI_BASE_URL,
      maxRetries: 2,
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * Add context to Alchemyst AI for enhanced prompt generation
   */
  private async addContext(
    userInput: UserInput,
    industryContext: IndustryConfig,
    templateStructure: PromptTemplate
  ): Promise<void> {
    try {
      // Add industry-specific context
      await this.client.v1.context.add({
        context_type: 'resource',
        scope: 'internal',
        source: `v0-prompt-generator-${userInput.industry}`,
        documents: [
          {
            content: JSON.stringify({
              industry: industryContext.name,
              features: industryContext.commonFeatures,
              technicalRequirements: industryContext.technicalRequirements,
              designPatterns: industryContext.designPatterns,
            }),
          },
          {
            content: JSON.stringify({
              userInput: userInput,
              templateStructure: templateStructure,
            }),
          },
        ],
        metadata: {
          fileName: `${userInput.industry}-context.json`,
          fileType: 'application/json',
          lastModified: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.warn('Failed to add context to Alchemyst AI:', error);
      // Continue without context enhancement
    }
  }

  /**
   * Search for relevant context to enhance prompt generation
   */
  private async searchContext(query: string): Promise<string[]> {
    try {
      const response = await this.client.v1.context.search({
        query,
        minimum_similarity_threshold: 0.3,
        similarity_threshold: 0.8,
        scope: 'internal',
      });

      return response.contexts?.map((ctx) => ctx.content || '') || [];
    } catch (error) {
      console.warn('Failed to search context in Alchemyst AI:', error);
      return [];
    }
  }

  /**
   * Generate enhanced prompt using context enrichment with performance monitoring
   */
  async generatePrompt(
    request: AlchemystPromptRequest
  ): Promise<GeneratedPrompt> {
    const { userInput, industryContext, templateStructure } = request;

    // Check cache first
    const cacheKey = createCacheKey('ai_prompt', {
      websiteName: userInput.websiteName,
      industry: userInput.industry,
      aboutInfo: userInput.aboutInfo,
      additionalRequirements: userInput.additionalRequirements || '',
    });

    const cached = cacheManager.get<GeneratedPrompt>(cacheKey);
    if (cached) {
      return cached;
    }

    return measureAsync(
      'ai_generation',
      async () => {
        try {
          // Add context for this generation session
          await this.addContext(userInput, industryContext, templateStructure);

          // Search for relevant context
          const contextQuery = `${userInput.websiteName} ${userInput.industry} ${userInput.aboutInfo}`;
          const relevantContexts = await this.searchContext(contextQuery);

          // Generate the prompt using context enrichment
          const enrichedPrompt = await this.enrichPromptWithContext(
            userInput,
            industryContext,
            templateStructure,
            relevantContexts
          );

          // Cache the result
          cacheManager.set(cacheKey, enrichedPrompt, CACHE_TTL.AI_RESPONSES);

          // Record performance metrics
          performanceMonitor.recordAIGeneration(
            JSON.stringify(userInput).length,
            enrichedPrompt.fullPrompt.length,
            0, // Duration will be recorded by measureAsync
            true,
            userInput.industry
          );

          return enrichedPrompt;
        } catch (error) {
          console.error('Error in Alchemyst AI prompt generation:', error);

          // Record failed generation
          performanceMonitor.recordAIGeneration(
            JSON.stringify(userInput).length,
            0,
            0,
            false,
            userInput.industry
          );

          // Fallback to template-based generation
          const fallbackPrompt = this.generateFallbackPrompt(
            userInput,
            industryContext,
            templateStructure
          );

          // Cache fallback result with shorter TTL
          cacheManager.set(
            cacheKey,
            fallbackPrompt,
            CACHE_TTL.AI_RESPONSES / 2
          );

          return fallbackPrompt;
        }
      },
      {
        industry: userInput.industry,
        inputLength: JSON.stringify(userInput).length,
      }
    );
  }

  /**
   * Enrich prompt with context from Alchemyst AI
   */
  private async enrichPromptWithContext(
    userInput: UserInput,
    industryContext: IndustryConfig,
    templateStructure: PromptTemplate,
    contexts: string[]
  ): Promise<GeneratedPrompt> {
    // Parse contexts for additional insights
    const contextInsights = this.parseContextInsights(contexts);

    // Generate enhanced sections
    const title = `${userInput.websiteName} - ${industryContext.displayName} Website`;

    const description = this.generateDescription(
      userInput,
      industryContext,
      contextInsights
    );

    const context = this.generateContextSection(
      userInput,
      industryContext,
      contextInsights
    );

    const technicalSpecs = this.generateTechnicalSpecs(
      industryContext,
      contextInsights
    );

    const industryFeatures = this.selectIndustryFeatures(
      industryContext,
      contextInsights
    );

    const fullPrompt = this.assembleFullPrompt({
      title,
      description,
      context,
      technicalSpecs,
      industryFeatures,
      userInput,
      industryContext,
    });

    return {
      title,
      description,
      context,
      technicalSpecs,
      industryFeatures,
      fullPrompt,
      explanation: {
        sections: {
          description:
            'AI-enhanced description based on industry context and user input',
          context: 'Enriched context using Alchemyst AI knowledge base',
          technicalSpecs:
            'Technical requirements optimized for the specific industry',
          features:
            'Industry-specific features selected based on context analysis',
        },
        reasoning:
          'This prompt was generated using Alchemyst AI context enrichment to provide industry-specific insights and best practices.',
      },
    };
  }

  /**
   * Parse insights from context search results
   */
  private parseContextInsights(contexts: string[]): Record<string, any> {
    const insights: Record<string, any> = {
      additionalFeatures: [],
      technicalRecommendations: [],
      designSuggestions: [],
    };

    contexts.forEach((context) => {
      try {
        const parsed = JSON.parse(context);
        if (parsed.features) {
          insights.additionalFeatures.push(...parsed.features);
        }
        if (parsed.technicalRequirements) {
          insights.technicalRecommendations.push(
            ...parsed.technicalRequirements
          );
        }
        if (parsed.designPatterns) {
          insights.designSuggestions.push(...parsed.designPatterns);
        }
      } catch {
        // Context might not be JSON, treat as text
        insights.textualContext = insights.textualContext || [];
        insights.textualContext.push(context);
      }
    });

    return insights;
  }

  /**
   * Generate enhanced description
   */
  private generateDescription(
    userInput: UserInput,
    industryContext: IndustryConfig,
    insights: Record<string, any>
  ): string {
    const baseDescription = `Create a modern, professional ${industryContext.displayName.toLowerCase()} website for ${userInput.websiteName}.`;
    const aboutSection = userInput.aboutInfo ? ` ${userInput.aboutInfo}` : '';
    const additionalRequirements = userInput.additionalRequirements
      ? ` Additional requirements: ${userInput.additionalRequirements}`
      : '';

    return `${baseDescription}${aboutSection}${additionalRequirements}`;
  }

  /**
   * Generate context section with AI insights
   */
  private generateContextSection(
    userInput: UserInput,
    industryContext: IndustryConfig,
    insights: Record<string, any>
  ): string {
    const contextParts = [
      `Industry: ${industryContext.displayName}`,
      `Purpose: ${userInput.aboutInfo || 'Professional business website'}`,
      `Target Audience: ${this.inferTargetAudience(userInput, industryContext)}`,
    ];

    if (insights.textualContext?.length > 0) {
      contextParts.push(
        `Additional Context: ${insights.textualContext.join(' ')}`
      );
    }

    return contextParts.join('\n');
  }

  /**
   * Generate technical specifications with AI enhancements
   */
  private generateTechnicalSpecs(
    industryContext: IndustryConfig,
    insights: Record<string, any>
  ): string {
    const baseTech = industryContext.technicalRequirements.slice(0, 5);
    const enhancedTech = insights.technicalRecommendations?.slice(0, 3) || [];

    const allTech = Array.from(new Set([...baseTech, ...enhancedTech]));

    return allTech.map((tech) => `- ${tech}`).join('\n');
  }

  /**
   * Select industry features with AI insights
   */
  private selectIndustryFeatures(
    industryContext: IndustryConfig,
    insights: Record<string, any>
  ): string[] {
    const baseFeatures = industryContext.commonFeatures.slice(0, 6);
    const additionalFeatures = insights.additionalFeatures?.slice(0, 2) || [];

    return Array.from(new Set([...baseFeatures, ...additionalFeatures]));
  }

  /**
   * Assemble the full V0-optimized prompt
   */
  private assembleFullPrompt(params: {
    title: string;
    description: string;
    context: string;
    technicalSpecs: string;
    industryFeatures: string[];
    userInput: UserInput;
    industryContext: IndustryConfig;
  }): string {
    const {
      title,
      description,
      context,
      technicalSpecs,
      industryFeatures,
      industryContext,
    } = params;

    return `# ${title}

## Description
${description}

## Context
${context}

## Technical Requirements
${technicalSpecs}

## Key Features
${industryFeatures.map((feature) => `- ${feature}`).join('\n')}

## Design Guidelines
- Follow ${industryContext.displayName.toLowerCase()} industry best practices
- Use modern, responsive design principles
- Implement clean, professional UI/UX
- Ensure accessibility compliance (WCAG 2.1 AA)
- Optimize for performance and SEO

## Implementation Notes
- Use NextJS 14 with App Router for optimal performance
- Implement TypeScript for type safety
- Use Tailwind CSS for consistent styling
- Follow component-based architecture
- Include proper error handling and loading states

This prompt has been enhanced with AI-powered context analysis to ensure industry-specific best practices and optimal V0 compatibility.`;
  }

  /**
   * Infer target audience based on input and industry
   */
  private inferTargetAudience(
    userInput: UserInput,
    industryContext: IndustryConfig
  ): string {
    const audienceMap: Record<string, string> = {
      saas: 'Business professionals and enterprise users',
      ecommerce: 'Online shoppers and retail customers',
      portfolio: 'Potential clients and employers',
      corporate: 'Business partners and stakeholders',
      startup: 'Early adopters and investors',
      agency: 'Potential clients and creative professionals',
    };

    return audienceMap[userInput.industry] || 'General website visitors';
  }

  /**
   * Generate fallback prompt when AI enhancement fails
   */
  private generateFallbackPrompt(
    userInput: UserInput,
    industryContext: IndustryConfig,
    templateStructure: PromptTemplate
  ): GeneratedPrompt {
    const title = `${userInput.websiteName} - ${industryContext.displayName} Website`;
    const description = `Create a ${industryContext.displayName.toLowerCase()} website for ${userInput.websiteName}. ${userInput.aboutInfo}`;
    const context = `Industry: ${industryContext.displayName}\nPurpose: ${userInput.aboutInfo}\nTarget Audience: ${this.inferTargetAudience(userInput, industryContext)}`;
    const technicalSpecs = industryContext.technicalRequirements
      .slice(0, 5)
      .map((tech) => `- ${tech}`)
      .join('\n');
    const industryFeatures = industryContext.commonFeatures.slice(0, 6);

    const fullPrompt = this.assembleFullPrompt({
      title,
      description,
      context,
      technicalSpecs,
      industryFeatures,
      userInput,
      industryContext,
    });

    return {
      title,
      description,
      context,
      technicalSpecs,
      industryFeatures,
      fullPrompt,
      explanation: {
        sections: {
          description:
            'Template-based description using industry configuration',
          context: 'Standard context based on industry best practices',
          technicalSpecs: 'Industry-standard technical requirements',
          features: 'Common features for this industry type',
        },
        reasoning:
          'This prompt was generated using fallback templates due to AI service unavailability.',
      },
    };
  }

  /**
   * Retry logic with exponential backoff
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await this.delay(this.retryDelay * (this.maxRetries - retries + 1));
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const alchemystClient = new AlchemystClient();

/**
 * Main function to generate V0-optimized prompts
 */
export const generatePrompt = async (
  userInput: UserInput
): Promise<GeneratedPrompt> => {
  try {
    // Get industry configuration
    const industryContext = getIndustryConfig(userInput.industry);
    if (!industryContext) {
      throw new Error(`Unsupported industry: ${userInput.industry}`);
    }

    // Get prompt template
    const templateStructure = BASE_PROMPT_TEMPLATE;

    // Create request object
    const request: AlchemystPromptRequest = {
      userInput,
      industryContext,
      templateStructure,
    };

    // Generate prompt with AI enhancement
    return await alchemystClient.generatePrompt(request);
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw error;
  }
};

/**
 * Health check for Alchemyst AI service
 */
export const checkAlchemystHealth = async (): Promise<boolean> => {
  try {
    // Simple context search to test connectivity
    await alchemystClient['client'].v1.context.search({
      query: 'health check',
      minimum_similarity_threshold: 0.1,
      similarity_threshold: 0.9,
    });
    return true;
  } catch (error) {
    console.warn('Alchemyst AI health check failed:', error);
    return false;
  }
};
