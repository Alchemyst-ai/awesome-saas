import {
  getAllTags,
  getExamplesByIndustry,
  getTemplatesByIndustry,
  searchExamples,
  filterExamples,
  getRecommendedExamples,
  getExampleStats,
  validateTemplate,
  fillTemplate,
  getTemplateExamples,
  getSimilarExamples,
} from '../example-utils';
import {
  ExamplePrompt,
  ExamplePromptTemplate,
  GalleryFilters,
} from '@/types/examples';

// Mock the data imports
jest.mock('@/data/example-prompts', () => ({
  EXAMPLE_PROMPTS: [
    {
      id: '1',
      title: 'SaaS Dashboard',
      description: 'A modern SaaS dashboard for project management',
      industry: 'saas',
      difficulty: 'intermediate',
      tags: ['dashboard', 'project-management', 'modern'],
      prompt: 'Create a SaaS dashboard...',
      explanation: 'This prompt creates...',
    },
    {
      id: '2',
      title: 'E-commerce Store',
      description: 'An online store for selling products',
      industry: 'ecommerce',
      difficulty: 'beginner',
      tags: ['store', 'products', 'shopping'],
      prompt: 'Create an e-commerce store...',
      explanation: 'This prompt creates...',
    },
    {
      id: '3',
      title: 'Portfolio Website',
      description: 'A creative portfolio for designers',
      industry: 'portfolio',
      difficulty: 'beginner',
      tags: ['creative', 'design', 'showcase'],
      prompt: 'Create a portfolio website...',
      explanation: 'This prompt creates...',
    },
    {
      id: '4',
      title: 'Advanced SaaS Platform',
      description: 'Complex SaaS platform with analytics',
      industry: 'saas',
      difficulty: 'advanced',
      tags: ['analytics', 'complex', 'dashboard'],
      prompt: 'Create an advanced SaaS platform...',
      explanation: 'This prompt creates...',
    },
  ] as ExamplePrompt[],
  PROMPT_TEMPLATES: [
    {
      id: 'saas-basic',
      title: 'Basic SaaS Template',
      description: 'Template for basic SaaS websites',
      industry: 'saas',
      difficulty: 'beginner',
      template: 'Create a {type} website for {name}',
      placeholders: {
        type: 'Type of website',
        name: 'Website name',
      },
      examples: [
        {
          values: { type: 'SaaS', name: 'TaskFlow' },
          result: 'Create a SaaS website for TaskFlow',
        },
      ],
    },
    {
      id: 'ecommerce-basic',
      title: 'Basic E-commerce Template',
      description: 'Template for basic e-commerce websites',
      industry: 'ecommerce',
      difficulty: 'beginner',
      template: 'Create an {type} store for {products}',
      placeholders: {
        type: 'Type of store',
        products: 'Products sold',
      },
      examples: [
        {
          values: { type: 'online', products: 'clothing' },
          result: 'Create an online store for clothing',
        },
      ],
    },
  ] as ExamplePromptTemplate[],
}));

describe('Example Utils', () => {
  describe('getAllTags', () => {
    it('should return all unique tags sorted', () => {
      const tags = getAllTags();
      expect(tags).toEqual([
        'analytics',
        'complex',
        'creative',
        'dashboard',
        'design',
        'modern',
        'products',
        'project-management',
        'shopping',
        'showcase',
        'store',
      ]);
    });

    it('should not include duplicate tags', () => {
      const tags = getAllTags();
      const uniqueTags = [...new Set(tags)];
      expect(tags).toEqual(uniqueTags);
    });
  });

  describe('getExamplesByIndustry', () => {
    it('should return examples for specific industry', () => {
      const saasExamples = getExamplesByIndustry('saas');
      expect(saasExamples).toHaveLength(2);
      expect(saasExamples.every((example) => example.industry === 'saas')).toBe(
        true
      );
    });

    it('should return empty array for non-existent industry', () => {
      const examples = getExamplesByIndustry('nonexistent');
      expect(examples).toHaveLength(0);
    });

    it('should return correct examples for ecommerce', () => {
      const ecommerceExamples = getExamplesByIndustry('ecommerce');
      expect(ecommerceExamples).toHaveLength(1);
      expect(ecommerceExamples[0].title).toBe('E-commerce Store');
    });
  });

  describe('getTemplatesByIndustry', () => {
    it('should return templates for specific industry', () => {
      const saasTemplates = getTemplatesByIndustry('saas');
      expect(saasTemplates).toHaveLength(1);
      expect(saasTemplates[0].industry).toBe('saas');
    });

    it('should return empty array for non-existent industry', () => {
      const templates = getTemplatesByIndustry('nonexistent');
      expect(templates).toHaveLength(0);
    });
  });

  describe('searchExamples', () => {
    it('should find examples by title', () => {
      const results = searchExamples('dashboard');
      expect(results).toHaveLength(2);
      expect(results.some((r) => r.title.includes('Dashboard'))).toBe(true);
    });

    it('should find examples by description', () => {
      const results = searchExamples('project management');
      expect(results).toHaveLength(1);
      expect(results[0].description).toContain('project management');
    });

    it('should find examples by tags', () => {
      const results = searchExamples('creative');
      expect(results).toHaveLength(1);
      expect(results[0].tags).toContain('creative');
    });

    it('should be case insensitive', () => {
      const results = searchExamples('SAAS');
      expect(results).toHaveLength(2);
    });

    it('should return empty array for no matches', () => {
      const results = searchExamples('nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('filterExamples', () => {
    it('should filter by industry', () => {
      const filters: GalleryFilters = { industry: 'saas' };
      const results = filterExamples(filters);
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.industry === 'saas')).toBe(true);
    });

    it('should filter by difficulty', () => {
      const filters: GalleryFilters = { difficulty: 'beginner' };
      const results = filterExamples(filters);
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.difficulty === 'beginner')).toBe(true);
    });

    it('should filter by tags', () => {
      const filters: GalleryFilters = { tags: ['dashboard'] };
      const results = filterExamples(filters);
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.tags.includes('dashboard'))).toBe(true);
    });

    it('should filter by search query', () => {
      const filters: GalleryFilters = { searchQuery: 'portfolio' };
      const results = filterExamples(filters);
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Portfolio Website');
    });

    it('should apply multiple filters', () => {
      const filters: GalleryFilters = {
        industry: 'saas',
        difficulty: 'intermediate',
      };
      const results = filterExamples(filters);
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('SaaS Dashboard');
    });

    it('should return empty array when no examples match', () => {
      const filters: GalleryFilters = {
        industry: 'saas',
        difficulty: 'beginner',
      };
      const results = filterExamples(filters);
      expect(results).toHaveLength(0);
    });
  });

  describe('getRecommendedExamples', () => {
    it('should return recommended examples for industry', () => {
      const results = getRecommendedExamples('saas');
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.industry === 'saas')).toBe(true);
    });

    it('should return recommended examples for difficulty', () => {
      const results = getRecommendedExamples(undefined, 'beginner');
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.difficulty === 'beginner')).toBe(true);
    });

    it('should return recommended examples for both industry and difficulty', () => {
      const results = getRecommendedExamples('saas', 'advanced');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Advanced SaaS Platform');
    });

    it('should limit results to 3', () => {
      const results = getRecommendedExamples();
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getExampleStats', () => {
    it('should return correct statistics', () => {
      const stats = getExampleStats();
      expect(stats.totalExamples).toBe(4);
      expect(stats.totalTemplates).toBe(2);
      expect(stats.industries).toEqual(['saas', 'ecommerce', 'portfolio']);
      expect(stats.difficulties).toEqual([
        'intermediate',
        'beginner',
        'advanced',
      ]);
      expect(stats.industriesCovered).toBe(3);
      expect(stats.averageTagsPerExample).toBeGreaterThan(0);
    });
  });

  describe('validateTemplate', () => {
    const template: ExamplePromptTemplate = {
      id: 'test',
      title: 'Test Template',
      description: 'Test',
      industry: 'test',
      difficulty: 'beginner',
      template: 'Test {name} and {type}',
      placeholders: {
        name: 'Name placeholder',
        type: 'Type placeholder',
      },
      examples: [],
    };

    it('should validate complete template values', () => {
      const values = { name: 'Test Name', type: 'Test Type' };
      const result = validateTemplate(template, values);
      expect(result.isValid).toBe(true);
      expect(result.missingPlaceholders).toHaveLength(0);
      expect(result.extraValues).toHaveLength(0);
    });

    it('should detect missing placeholders', () => {
      const values = { name: 'Test Name' };
      const result = validateTemplate(template, values);
      expect(result.isValid).toBe(false);
      expect(result.missingPlaceholders).toEqual(['type']);
      expect(result.extraValues).toHaveLength(0);
    });

    it('should detect extra values', () => {
      const values = {
        name: 'Test Name',
        type: 'Test Type',
        extra: 'Extra Value',
      };
      const result = validateTemplate(template, values);
      expect(result.isValid).toBe(true); // Still valid if all required are present
      expect(result.missingPlaceholders).toHaveLength(0);
      expect(result.extraValues).toEqual(['extra']);
    });
  });

  describe('fillTemplate', () => {
    const template: ExamplePromptTemplate = {
      id: 'test',
      title: 'Test Template',
      description: 'Test',
      industry: 'test',
      difficulty: 'beginner',
      template: 'Create a {type} website for {name} with {features}',
      placeholders: {
        name: 'Name placeholder',
        type: 'Type placeholder',
        features: 'Features placeholder',
      },
      examples: [],
    };

    it('should fill template with provided values', () => {
      const values = {
        name: 'MyApp',
        type: 'SaaS',
        features: 'dashboard and analytics',
      };
      const result = fillTemplate(template, values);
      expect(result).toBe(
        'Create a SaaS website for MyApp with dashboard and analytics'
      );
    });

    it('should handle missing values by leaving placeholders', () => {
      const values = { name: 'MyApp', type: 'SaaS' };
      const result = fillTemplate(template, values);
      expect(result).toBe('Create a SaaS website for MyApp with {features}');
    });

    it('should handle multiple occurrences of same placeholder', () => {
      const multiTemplate: ExamplePromptTemplate = {
        ...template,
        template: '{name} is a {type} app. {name} helps users.',
      };
      const values = { name: 'MyApp', type: 'SaaS' };
      const result = fillTemplate(multiTemplate, values);
      expect(result).toBe('MyApp is a SaaS app. MyApp helps users.');
    });
  });

  describe('getTemplateExamples', () => {
    it('should return examples for existing template', () => {
      const examples = getTemplateExamples('saas-basic');
      expect(examples).toHaveLength(1);
      expect(examples[0].values).toEqual({ type: 'SaaS', name: 'TaskFlow' });
    });

    it('should return empty array for non-existent template', () => {
      const examples = getTemplateExamples('nonexistent');
      expect(examples).toHaveLength(0);
    });
  });

  describe('getSimilarExamples', () => {
    it('should return similar examples based on industry and tags', () => {
      const baseExample = {
        id: '1',
        title: 'SaaS Dashboard',
        description: 'A modern SaaS dashboard for project management',
        industry: 'saas',
        difficulty: 'intermediate' as const,
        tags: ['dashboard', 'project-management', 'modern'],
        prompt: 'Create a SaaS dashboard...',
        explanation: 'This prompt creates...',
      };

      const similar = getSimilarExamples(baseExample, 2);
      expect(similar).toHaveLength(1); // Only one other SaaS example
      expect(similar[0].id).toBe('4'); // Advanced SaaS Platform
    });

    it('should not include the base example itself', () => {
      const baseExample = {
        id: '1',
        title: 'SaaS Dashboard',
        description: 'A modern SaaS dashboard for project management',
        industry: 'saas',
        difficulty: 'intermediate' as const,
        tags: ['dashboard', 'project-management', 'modern'],
        prompt: 'Create a SaaS dashboard...',
        explanation: 'This prompt creates...',
      };

      const similar = getSimilarExamples(baseExample);
      expect(similar.every((ex) => ex.id !== baseExample.id)).toBe(true);
    });

    it('should respect the limit parameter', () => {
      const baseExample = {
        id: '1',
        title: 'SaaS Dashboard',
        description: 'A modern SaaS dashboard for project management',
        industry: 'saas',
        difficulty: 'intermediate' as const,
        tags: ['dashboard', 'project-management', 'modern'],
        prompt: 'Create a SaaS dashboard...',
        explanation: 'This prompt creates...',
      };

      const similar = getSimilarExamples(baseExample, 1);
      expect(similar).toHaveLength(1);
    });

    it('should return examples even when no perfect matches', () => {
      const uniqueExample = {
        id: '999',
        title: 'Unique Example',
        description: 'A completely unique example',
        industry: 'unique',
        difficulty: 'expert' as const,
        tags: ['unique', 'special'],
        prompt: 'Create something unique...',
        explanation: 'This is unique...',
      };

      const similar = getSimilarExamples(uniqueExample);
      expect(similar.length).toBeGreaterThan(0); // Should still return some examples
    });
  });
});
