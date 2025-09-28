import {
  INDUSTRY_CONFIGS,
  getAvailableIndustries,
  getIndustryDisplayNames,
} from '@/lib/industry-config';
import { getIndustryTemplate } from '@/lib/prompt-templates';
import {
  getIndustryFeatureMapping,
  getRequiredFeatures,
  getOptionalFeatures,
  getTechnicalStack,
} from '@/lib/feature-mappings';
import { IndustryConfig, IndustryContext } from '@/types/industry';
import { UserInput } from '@/types';

/**
 * Retrieve complete industry configuration
 */
export const getIndustryConfig = (industry: string): IndustryConfig | null => {
  return INDUSTRY_CONFIGS[industry] || null;
};

/**
 * Build comprehensive industry context from user input
 */
export const buildIndustryContext = (
  userInput: UserInput
): IndustryContext | null => {
  const industryConfig = getIndustryConfig(userInput.industry);
  const featureMapping = getIndustryFeatureMapping(userInput.industry);

  if (!industryConfig || !featureMapping) {
    return null;
  }

  return {
    sector: industryConfig.name,
    commonPatterns: {
      layouts: industryConfig.designPatterns.filter(
        (pattern) =>
          pattern.includes('layout') ||
          pattern.includes('grid') ||
          pattern.includes('navigation')
      ),
      components: featureMapping.designGuidelines.componentTypes,
      features: industryConfig.commonFeatures,
    },
    technicalConsiderations: {
      frameworks: featureMapping.technicalStack.required.filter(
        (tech) =>
          tech.includes('NextJS') ||
          tech.includes('React') ||
          tech.includes('framework')
      ),
      libraries: [
        ...featureMapping.technicalStack.recommended,
        ...featureMapping.technicalStack.optional,
      ],
      integrations: featureMapping.technicalStack.optional.filter(
        (tech) =>
          tech.includes('integration') ||
          tech.includes('API') ||
          tech.includes('service')
      ),
    },
    designPrinciples: industryConfig.designPatterns,
  };
};

/**
 * Get recommended features based on industry and user input
 */
export const getRecommendedFeatures = (
  userInput: UserInput
): {
  required: string[];
  recommended: string[];
  optional: string[];
} => {
  const requiredFeatures = getRequiredFeatures(userInput.industry);
  const optionalFeatures = getOptionalFeatures(userInput.industry);

  // Analyze user input to recommend optional features
  const aboutLower = userInput.aboutInfo.toLowerCase();
  const additionalLower = userInput.additionalRequirements?.toLowerCase() || '';

  const recommendedOptional = optionalFeatures.filter((feature) => {
    const featureLower = feature.toLowerCase();
    return (
      aboutLower.includes(featureLower.split(' ')[0]) ||
      additionalLower.includes(featureLower.split(' ')[0])
    );
  });

  return {
    required: requiredFeatures,
    recommended: recommendedOptional.slice(0, 5), // Limit to top 5 recommendations
    optional: optionalFeatures.filter((f) => !recommendedOptional.includes(f)),
  };
};

/**
 * Get color scheme recommendations based on industry
 */
export const getColorSchemeRecommendations = (industry: string): string[] => {
  const industryConfig = getIndustryConfig(industry);
  return industryConfig
    ? industryConfig.colorSchemes
    : ['blue', 'gray', 'neutral'];
};

/**
 * Get layout type recommendations based on industry
 */
export const getLayoutRecommendations = (industry: string): string[] => {
  const industryConfig = getIndustryConfig(industry);
  return industryConfig
    ? industryConfig.layoutTypes
    : ['standard', 'responsive'];
};

/**
 * Infer target audience based on industry and user input
 */
export const inferTargetAudience = (userInput: UserInput): string => {
  const industry = userInput.industry;
  const aboutInfo = userInput.aboutInfo.toLowerCase();

  // Industry-specific target audience mapping
  const audienceMap: Record<string, string> = {
    saas: 'business professionals and teams',
    ecommerce: 'online shoppers and consumers',
    portfolio: 'potential clients and employers',
    corporate: 'business partners and clients',
    startup: 'early adopters and investors',
    agency: 'businesses seeking creative services',
  };

  let baseAudience = audienceMap[industry] || 'website visitors';

  // Refine based on user input keywords
  if (aboutInfo.includes('b2b') || aboutInfo.includes('business')) {
    baseAudience = 'business professionals and decision makers';
  } else if (aboutInfo.includes('consumer') || aboutInfo.includes('customer')) {
    baseAudience = 'consumers and end users';
  } else if (
    aboutInfo.includes('professional') ||
    aboutInfo.includes('enterprise')
  ) {
    baseAudience = 'professional users and enterprises';
  }

  return baseAudience;
};

/**
 * Generate industry-specific technical recommendations
 */
export const getTechnicalRecommendations = (
  userInput: UserInput
): {
  required: string[];
  recommended: string[];
  reasoning: string;
} => {
  const techStack = getTechnicalStack(userInput.industry);

  if (!techStack) {
    return {
      required: ['NextJS 14', 'TypeScript', 'Tailwind CSS'],
      recommended: ['React Hook Form', 'Next SEO'],
      reasoning: 'Standard modern web development stack',
    };
  }

  // Analyze user requirements for additional recommendations
  const aboutLower = userInput.aboutInfo.toLowerCase();
  const additionalLower = userInput.additionalRequirements?.toLowerCase() || '';
  const combinedInput = `${aboutLower} ${additionalLower}`;

  const contextualRecommendations = [];

  if (
    combinedInput.includes('auth') ||
    combinedInput.includes('login') ||
    combinedInput.includes('user')
  ) {
    contextualRecommendations.push('NextAuth.js for authentication');
  }

  if (
    combinedInput.includes('payment') ||
    combinedInput.includes('subscription') ||
    combinedInput.includes('billing')
  ) {
    contextualRecommendations.push('Stripe for payment processing');
  }

  if (
    combinedInput.includes('database') ||
    combinedInput.includes('data') ||
    combinedInput.includes('storage')
  ) {
    contextualRecommendations.push(
      'Prisma with PostgreSQL for data management'
    );
  }

  if (
    combinedInput.includes('email') ||
    combinedInput.includes('notification') ||
    combinedInput.includes('contact')
  ) {
    contextualRecommendations.push('Resend for email functionality');
  }

  return {
    required: techStack.required,
    recommended: [
      ...techStack.recommended.slice(0, 3),
      ...contextualRecommendations,
    ],
    reasoning: `Optimized for ${userInput.industry} industry requirements and user specifications`,
  };
};

/**
 * Validate industry selection
 */
export const validateIndustry = (industry: string): boolean => {
  return getAvailableIndustries().includes(industry);
};

/**
 * Get industry suggestions based on user input
 */
export const suggestIndustries = (aboutInfo: string): string[] => {
  const aboutLower = aboutInfo.toLowerCase();
  const suggestions: string[] = [];

  // Keyword-based industry suggestions
  const keywords = {
    saas: ['software', 'platform', 'tool', 'dashboard', 'subscription', 'api'],
    ecommerce: [
      'shop',
      'store',
      'product',
      'sell',
      'buy',
      'retail',
      'commerce',
    ],
    portfolio: [
      'portfolio',
      'showcase',
      'work',
      'designer',
      'developer',
      'freelance',
    ],
    corporate: [
      'company',
      'business',
      'corporate',
      'enterprise',
      'professional',
      'services',
    ],
    startup: [
      'startup',
      'innovation',
      'disrupt',
      'founder',
      'venture',
      'early',
    ],
    agency: [
      'agency',
      'creative',
      'marketing',
      'design',
      'advertising',
      'brand',
    ],
  };

  Object.entries(keywords).forEach(([industry, words]) => {
    if (words.some((word) => aboutLower.includes(word))) {
      suggestions.push(industry);
    }
  });

  return suggestions.length > 0
    ? suggestions
    : ['saas', 'corporate', 'portfolio'];
};

/**
 * Get comprehensive industry information for display
 */
export const getIndustryDisplayInfo = (industry: string) => {
  const config = getIndustryConfig(industry);
  const template = getIndustryTemplate(industry);
  const featureMapping = getIndustryFeatureMapping(industry);

  if (!config || !template || !featureMapping) {
    return null;
  }

  return {
    name: config.displayName,
    description: `Specialized for ${config.displayName.toLowerCase()} websites`,
    keyFeatures: config.commonFeatures.slice(0, 5),
    technicalHighlights: featureMapping.technicalStack.required.slice(0, 3),
    designStyle: config.designPatterns[0],
    colorOptions: config.colorSchemes,
    layoutOptions: config.layoutTypes,
    examplePrompt: config.examplePrompts[0],
  };
};

/**
 * Export all utility functions for easy access
 */
export const industryUtils = {
  getIndustryConfig,
  buildIndustryContext,
  getRecommendedFeatures,
  getColorSchemeRecommendations,
  getLayoutRecommendations,
  inferTargetAudience,
  getTechnicalRecommendations,
  validateIndustry,
  suggestIndustries,
  getIndustryDisplayInfo,
  getAvailableIndustries,
  getIndustryDisplayNames,
};
