/**
 * Types for the Example Gallery and Templates Showcase
 */

export interface ExamplePrompt {
  id: string;
  title: string;
  industry: string;
  description: string;
  fullPrompt: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  explanation: {
    why: string;
    keyElements: string[];
    tips: string[];
  };
}

export interface ExamplePromptTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  template: string;
  placeholders: Record<string, string>;
  instructions: string[];
  examples: {
    websiteName: string;
    aboutInfo: string;
    result: string;
  }[];
}

export interface GalleryFilters {
  industry?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  searchQuery?: string;
}

export interface InteractiveExample {
  id: string;
  title: string;
  description: string;
  initialInput: {
    websiteName: string;
    industry: string;
    aboutInfo: string;
  };
  expectedOutput: string;
  modifications: {
    name: string;
    description: string;
    changes: Partial<{
      websiteName: string;
      industry: string;
      aboutInfo: string;
    }>;
    expectedResult: string;
  }[];
}
