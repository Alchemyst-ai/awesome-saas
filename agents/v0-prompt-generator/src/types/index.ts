// Core type definitions for the V0 Prompt Generator

// Re-export industry types first
export type {
  IndustryConfig,
  IndustryContext,
  IndustryFeatureMapping,
  IndustryTemplate,
} from './industry';

// Re-export example types
export type {
  ExamplePrompt,
  ExamplePromptTemplate,
  GalleryFilters,
  InteractiveExample,
} from './examples';

export interface UserInput {
  websiteName: string;
  industry: string;
  aboutInfo: string;
  additionalRequirements?: string;
}

export interface GeneratedPrompt {
  title: string;
  description: string;
  context: string;
  technicalSpecs: string;
  industryFeatures: string[];
  fullPrompt: string;
  explanation: PromptExplanation;
}

export interface PromptExplanation {
  sections: {
    [key: string]: string;
  };
  reasoning: string;
}

export interface PromptTemplate {
  structure: {
    introduction: string;
    context: string;
    technicalSpecs: string;
    designRequirements: string;
    functionalRequirements: string;
  };
  placeholders: Record<string, string>;
  industrySpecific: Record<string, string[]>;
}

// V0 Optimized Prompt Structure
export interface V0OptimizedPrompt {
  header: {
    title: string;
    description: string;
  };
  context: {
    industry: string;
    purpose: string;
    targetAudience: string;
  };
  technical: {
    framework: string;
    styling: string;
    components: string[];
    integrations: string[];
  };
  functional: {
    coreFeatures: string[];
    userFlows: string[];
    interactions: string[];
  };
  design: {
    style: string;
    colorScheme: string;
    layout: string;
    responsiveness: string;
  };
}

// Alchemyst AI SDK Integration Types
import type {
  IndustryConfig as IConfig,
  IndustryContext as IContext,
} from './industry';

export interface AlchemystPromptRequest {
  userInput: UserInput;
  industryContext: IConfig;
  templateStructure: PromptTemplate;
}

export interface AlchemystPromptResponse {
  generatedSections: {
    description: string;
    context: string;
    technicalSpecs: string;
    features: string[];
  };
  confidence: number;
  suggestions: string[];
}

// Error Handling Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface ErrorRecoveryStrategy {
  retryAttempts: number;
  fallbackTemplates: PromptTemplate[];
  userNotification: {
    message: string;
    actionable: boolean;
    retryOption: boolean;
  };
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface InputValidationRules {
  websiteName: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  industry: {
    required: boolean;
    allowedValues?: string[];
  };
  aboutInfo: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  additionalRequirements: {
    required: boolean;
    maxLength: number;
  };
}

// Additional Supporting Types (IndustryContext moved to industry.ts)

export interface ProcessedInput {
  original: UserInput;
  enriched: {
    industryContext: IContext;
    inferredFeatures: string[];
    technicalRequirements: TechRequirement[];
    designPreferences: DesignPreference[];
  };
}

export interface TechRequirement {
  category: 'framework' | 'library' | 'integration' | 'tool';
  name: string;
  version?: string;
  required: boolean;
  reason: string;
}

export interface DesignPreference {
  category: 'layout' | 'color' | 'typography' | 'spacing' | 'component';
  preference: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}
