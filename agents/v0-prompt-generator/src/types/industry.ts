// Industry-specific type definitions

export interface IndustryConfig {
  name: string;
  displayName: string;
  commonFeatures: string[];
  technicalRequirements: string[];
  designPatterns: string[];
  examplePrompts: string[];
  colorSchemes: string[];
  layoutTypes: string[];
}

export interface IndustryContext {
  sector: string;
  commonPatterns: {
    layouts: string[];
    components: string[];
    features: string[];
  };
  technicalConsiderations: {
    frameworks: string[];
    libraries: string[];
    integrations: string[];
  };
  designPrinciples: string[];
}

export interface IndustryFeatureMapping {
  industry: string;
  requiredFeatures: string[];
  optionalFeatures: string[];
  technicalStack: {
    required: string[];
    recommended: string[];
    optional: string[];
  };
  designGuidelines: {
    colorPalette: string[];
    layoutPreferences: string[];
    componentTypes: string[];
  };
}

export interface IndustryTemplate {
  industry: string;
  templateType: 'basic' | 'advanced' | 'enterprise';
  sections: {
    hero: string;
    features: string;
    about: string;
    contact: string;
    additional?: string[];
  };
  placeholders: Record<string, string>;
  customizations: {
    colors: string[];
    fonts: string[];
    layouts: string[];
  };
}
