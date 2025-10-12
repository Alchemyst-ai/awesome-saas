import type {
  UserInput,
  GeneratedPrompt,
  IndustryConfig,
  PromptTemplate,
} from '@/types';
import { alchemystClient, checkAlchemystHealth } from './ai-client';
import { getIndustryConfig } from '@/utils/industry-utils';
import { BASE_PROMPT_TEMPLATE } from './prompt-templates';
import {
  ApiError,
  ErrorHandler,
  RetryHandler,
  CircuitBreaker,
} from './error-handling';

/**
 * Prompt Generation Service
 * Orchestrates the AI prompt generation process with error handling and retry logic
 */
export class PromptGenerationService {
  private static instance: PromptGenerationService;
  private healthCheckCache: { isHealthy: boolean; lastCheck: number } = {
    isHealthy: false,
    lastCheck: 0,
  };
  private readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private circuitBreaker = new CircuitBreaker(5, 60000, 2); // 5 failures, 1 minute timeout, 2 successes to close

  private constructor() {}

  public static getInstance(): PromptGenerationService {
    if (!PromptGenerationService.instance) {
      PromptGenerationService.instance = new PromptGenerationService();
    }
    return PromptGenerationService.instance;
  }

  /**
   * Main method to generate V0-optimized prompts
   */
  async generatePrompt(userInput: UserInput): Promise<GeneratedPrompt> {
    return RetryHandler.withRetry(
      async () => {
        try {
          // Validate input
          this.validateUserInput(userInput);

          // Get industry configuration
          const industryContext = getIndustryConfig(userInput.industry);
          if (!industryContext) {
            throw new ApiError(
              `Unsupported industry: ${userInput.industry}`,
              'INVALID_INDUSTRY',
              400
            );
          }

          // Get prompt template
          const templateStructure = BASE_PROMPT_TEMPLATE;

          // Try AI-enhanced generation with circuit breaker
          try {
            return await this.circuitBreaker.execute(async () => {
              const request = {
                userInput,
                industryContext,
                templateStructure,
              };
              return await alchemystClient.generatePrompt(request);
            });
          } catch (aiError) {
            const handledError = ErrorHandler.handleError(
              aiError,
              'AI prompt generation'
            );

            // If we should use fallback, do so
            if (ErrorHandler.shouldUseFallback(handledError)) {
              console.warn(
                'AI generation failed, using fallback:',
                handledError.message
              );
              return this.generateFallbackPrompt(userInput);
            }

            throw handledError;
          }
        } catch (error) {
          const handledError = ErrorHandler.handleError(
            error,
            'Prompt generation service'
          );

          // If it's a validation error, don't retry
          if (
            handledError.code === 'VALIDATION_ERROR' ||
            handledError.code === 'INVALID_INDUSTRY'
          ) {
            throw handledError;
          }

          // For other errors, try fallback generation
          try {
            return this.generateFallbackPrompt(userInput);
          } catch (fallbackError) {
            throw new ApiError(
              'Failed to generate prompt with both AI and fallback methods',
              'GENERATION_FAILED',
              500,
              { originalError: error, fallbackError }
            );
          }
        }
      },
      {
        maxAttempts: 2,
        shouldRetry: (error) => {
          if (error instanceof ApiError) {
            return (
              error.isRetryable() &&
              error.code !== 'VALIDATION_ERROR' &&
              error.code !== 'INVALID_INDUSTRY'
            );
          }
          return false;
        },
      }
    );
  }

  /**
   * Generate prompt using fallback templates when AI service is unavailable
   */
  private generateFallbackPrompt(userInput: UserInput): GeneratedPrompt {
    const industryContext = getIndustryConfig(userInput.industry);
    if (!industryContext) {
      throw new ApiError(
        `Unsupported industry: ${userInput.industry}`,
        'INVALID_INDUSTRY',
        400
      );
    }

    const templateStructure = BASE_PROMPT_TEMPLATE;

    return this.createBasicPrompt(
      userInput,
      industryContext,
      templateStructure
    );
  }

  /**
   * Create a basic prompt using templates without AI enhancement
   */
  private createBasicPrompt(
    userInput: UserInput,
    industryContext: IndustryConfig,
    templateStructure: PromptTemplate
  ): GeneratedPrompt {
    const title = `${userInput.websiteName} - ${industryContext.displayName} Website`;

    const description = this.createBasicDescription(userInput, industryContext);

    const context = this.createBasicContext(userInput, industryContext);

    const technicalSpecs = this.createBasicTechnicalSpecs(industryContext);

    const industryFeatures = industryContext.commonFeatures.slice(0, 6);

    const fullPrompt = this.assembleBasicPrompt({
      title,
      description,
      context,
      technicalSpecs,
      industryFeatures,
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
            'Template-based description using industry best practices',
          context: 'Standard context based on industry configuration',
          technicalSpecs: 'Industry-standard technical requirements',
          features: 'Common features for this industry type',
        },
        reasoning:
          'This prompt was generated using template-based fallback due to AI service unavailability.',
      },
    };
  }

  /**
   * Create basic description without AI enhancement
   */
  private createBasicDescription(
    userInput: UserInput,
    industryContext: IndustryConfig
  ): string {
    let description = `Create a modern, professional ${industryContext.displayName.toLowerCase()} website for ${userInput.websiteName}.`;

    if (userInput.aboutInfo) {
      description += ` ${userInput.aboutInfo}`;
    }

    if (userInput.additionalRequirements) {
      description += ` Additional requirements: ${userInput.additionalRequirements}`;
    }

    return description;
  }

  /**
   * Create basic context section
   */
  private createBasicContext(
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

    const targetAudience =
      audienceMap[userInput.industry] || 'General website visitors';

    return [
      `Industry: ${industryContext.displayName}`,
      `Purpose: ${userInput.aboutInfo || 'Professional business website'}`,
      `Target Audience: ${targetAudience}`,
    ].join('\n');
  }

  /**
   * Create basic technical specifications
   */
  private createBasicTechnicalSpecs(industryContext: IndustryConfig): string {
    return industryContext.technicalRequirements
      .slice(0, 5)
      .map((tech) => `- ${tech}`)
      .join('\n');
  }

  /**
   * Assemble basic prompt without AI enhancements
   */
  private assembleBasicPrompt(params: {
    title: string;
    description: string;
    context: string;
    technicalSpecs: string;
    industryFeatures: string[];
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

This prompt follows industry-standard templates and best practices for V0 compatibility.`;
  }

  /**
   * Check service health with caching
   */
  async checkServiceHealth(): Promise<boolean> {
    const now = Date.now();

    // Return cached result if within interval
    if (now - this.healthCheckCache.lastCheck < this.HEALTH_CHECK_INTERVAL) {
      return this.healthCheckCache.isHealthy;
    }

    // Perform health check
    try {
      const isHealthy = await checkAlchemystHealth();
      this.healthCheckCache = {
        isHealthy,
        lastCheck: now,
      };
      return isHealthy;
    } catch (error) {
      console.warn('Health check failed:', error);
      this.healthCheckCache = {
        isHealthy: false,
        lastCheck: now,
      };
      return false;
    }
  }

  /**
   * Validate user input
   */
  private validateUserInput(userInput: UserInput): void {
    const errors: string[] = [];

    if (!userInput.websiteName?.trim()) {
      errors.push('Website name is required');
    }

    if (!userInput.industry?.trim()) {
      errors.push('Industry is required');
    }

    if (!userInput.aboutInfo?.trim()) {
      errors.push('About information is required');
    }

    if (userInput.websiteName && userInput.websiteName.length > 100) {
      errors.push('Website name must be less than 100 characters');
    }

    if (userInput.aboutInfo && userInput.aboutInfo.length > 1000) {
      errors.push('About information must be less than 1000 characters');
    }

    if (
      userInput.additionalRequirements &&
      userInput.additionalRequirements.length > 500
    ) {
      errors.push('Additional requirements must be less than 500 characters');
    }

    if (errors.length > 0) {
      throw new ApiError(
        `Validation failed: ${errors.join(', ')}`,
        'VALIDATION_ERROR',
        400,
        { errors }
      );
    }
  }

  /**
   * Get available industries
   */
  getAvailableIndustries(): string[] {
    return ['saas', 'ecommerce', 'portfolio', 'corporate', 'startup', 'agency'];
  }

  /**
   * Get industry display names
   */
  getIndustryDisplayNames(): Record<string, string> {
    return {
      saas: 'Software as a Service',
      ecommerce: 'E-commerce & Retail',
      portfolio: 'Portfolio & Personal',
      corporate: 'Corporate & Business',
      startup: 'Startup & Innovation',
      agency: 'Creative Agency',
    };
  }
}

// Create and export singleton instance
export const promptGenerationService = PromptGenerationService.getInstance();

// Export convenience functions
export const generatePrompt = (
  userInput: UserInput
): Promise<GeneratedPrompt> => {
  return promptGenerationService.generatePrompt(userInput);
};

export const getAvailableIndustries = (): string[] => {
  return promptGenerationService.getAvailableIndustries();
};

export const getIndustryDisplayNames = (): Record<string, string> => {
  return promptGenerationService.getIndustryDisplayNames();
};

// Export the service health check method
export const checkServiceHealth = async (): Promise<boolean> => {
  return promptGenerationService.checkServiceHealth();
};
