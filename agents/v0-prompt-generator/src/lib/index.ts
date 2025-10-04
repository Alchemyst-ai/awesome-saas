// Industry Knowledge Base Exports
export {
  INDUSTRY_CONFIGS,
  getAvailableIndustries,
  getIndustryDisplayNames,
} from './industry-config';
export {
  BASE_PROMPT_TEMPLATE,
  INDUSTRY_TEMPLATES,
  getIndustryTemplate,
  getTemplateTypes,
} from './prompt-templates';
export {
  INDUSTRY_FEATURE_MAPPINGS,
  getIndustryFeatureMapping,
  getRequiredFeatures,
  getOptionalFeatures,
  getTechnicalStack,
  getDesignGuidelines,
} from './feature-mappings';

// Utility Functions
export { industryUtils } from '../utils/industry-utils';

// Re-export types for convenience
export type {
  IndustryConfig,
  IndustryContext,
  IndustryFeatureMapping,
  IndustryTemplate,
} from '../types/industry';
