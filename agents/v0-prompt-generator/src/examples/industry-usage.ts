/**
 * Example usage of the Industry Knowledge Base
 * This file demonstrates how to use the industry configuration,
 * templates, and utility functions.
 */

import { UserInput } from '@/types';
import { industryUtils } from '@/utils/industry-utils';
import { getIndustryTemplate } from '@/lib/prompt-templates';
import { getIndustryFeatureMapping } from '@/lib/feature-mappings';

// Example user input
const exampleUserInput: UserInput = {
  websiteName: 'TaskFlow Pro',
  industry: 'saas',
  aboutInfo:
    'A project management platform that helps teams collaborate, track tasks, and manage deadlines with real-time updates and analytics.',
  additionalRequirements:
    'Need user authentication, dashboard with charts, and team collaboration features',
};

/**
 * Example: Get comprehensive industry information
 */
export function demonstrateIndustryInfo() {
  console.log('=== Industry Information Demo ===');

  // Get basic industry configuration
  const industryConfig = industryUtils.getIndustryConfig(
    exampleUserInput.industry
  );
  console.log('Industry Config:', {
    name: industryConfig?.displayName,
    commonFeatures: industryConfig?.commonFeatures.slice(0, 3),
    colorSchemes: industryConfig?.colorSchemes,
  });

  // Get industry template
  const template = getIndustryTemplate(exampleUserInput.industry);
  console.log('Template Sections:', Object.keys(template?.sections || {}));

  // Get feature mapping
  const featureMapping = getIndustryFeatureMapping(exampleUserInput.industry);
  console.log(
    'Required Features:',
    featureMapping?.requiredFeatures.slice(0, 3)
  );
  console.log(
    'Technical Stack:',
    featureMapping?.technicalStack.required.slice(0, 3)
  );
}

/**
 * Example: Build industry context from user input
 */
export function demonstrateContextBuilding() {
  console.log('=== Context Building Demo ===');

  // Build comprehensive industry context
  const context = industryUtils.buildIndustryContext(exampleUserInput);
  console.log('Industry Context:', {
    sector: context?.sector,
    layoutPatterns: context?.commonPatterns.layouts,
    frameworks: context?.technicalConsiderations.frameworks,
  });

  // Get recommended features
  const features = industryUtils.getRecommendedFeatures(exampleUserInput);
  console.log('Feature Recommendations:', {
    required: features.required.slice(0, 2),
    recommended: features.recommended.slice(0, 2),
  });
}

/**
 * Example: Get technical recommendations
 */
export function demonstrateTechnicalRecommendations() {
  console.log('=== Technical Recommendations Demo ===');

  const techRecommendations =
    industryUtils.getTechnicalRecommendations(exampleUserInput);
  console.log('Technical Stack:', {
    required: techRecommendations.required,
    recommended: techRecommendations.recommended.slice(0, 3),
    reasoning: techRecommendations.reasoning,
  });

  // Infer target audience
  const audience = industryUtils.inferTargetAudience(exampleUserInput);
  console.log('Target Audience:', audience);
}

/**
 * Example: Industry validation and suggestions
 */
export function demonstrateValidationAndSuggestions() {
  console.log('=== Validation and Suggestions Demo ===');

  // Validate industry
  const isValid = industryUtils.validateIndustry(exampleUserInput.industry);
  console.log('Industry Valid:', isValid);

  // Get industry suggestions based on description
  const suggestions = industryUtils.suggestIndustries(
    'A creative agency that designs websites and brands for clients'
  );
  console.log('Industry Suggestions:', suggestions);

  // Get display information
  const displayInfo = industryUtils.getIndustryDisplayInfo('agency');
  console.log('Agency Display Info:', {
    name: displayInfo?.name,
    keyFeatures: displayInfo?.keyFeatures.slice(0, 2),
    colorOptions: displayInfo?.colorOptions,
  });
}

/**
 * Example: Complete workflow demonstration
 */
export function demonstrateCompleteWorkflow() {
  console.log('=== Complete Workflow Demo ===');

  // Step 1: Validate and get industry info
  if (!industryUtils.validateIndustry(exampleUserInput.industry)) {
    console.log('Invalid industry, suggesting alternatives...');
    const suggestions = industryUtils.suggestIndustries(
      exampleUserInput.aboutInfo
    );
    console.log('Suggested industries:', suggestions);
    return;
  }

  // Step 2: Build context and get recommendations
  const context = industryUtils.buildIndustryContext(exampleUserInput);
  const features = industryUtils.getRecommendedFeatures(exampleUserInput);
  const techStack = industryUtils.getTechnicalRecommendations(exampleUserInput);
  const audience = industryUtils.inferTargetAudience(exampleUserInput);

  // Step 3: Get design recommendations
  const colorSchemes = industryUtils.getColorSchemeRecommendations(
    exampleUserInput.industry
  );
  const layouts = industryUtils.getLayoutRecommendations(
    exampleUserInput.industry
  );

  // Step 4: Compile comprehensive recommendations
  const recommendations = {
    industry: context?.sector,
    targetAudience: audience,
    requiredFeatures: features.required.slice(0, 3),
    recommendedFeatures: features.recommended.slice(0, 3),
    technicalStack: {
      required: techStack.required.slice(0, 3),
      recommended: techStack.recommended.slice(0, 3),
    },
    design: {
      colorSchemes: colorSchemes.slice(0, 3),
      layouts: layouts.slice(0, 2),
    },
  };

  console.log(
    'Complete Recommendations:',
    JSON.stringify(recommendations, null, 2)
  );
}

// Export all demonstration functions
export const industryExamples = {
  demonstrateIndustryInfo,
  demonstrateContextBuilding,
  demonstrateTechnicalRecommendations,
  demonstrateValidationAndSuggestions,
  demonstrateCompleteWorkflow,
};
