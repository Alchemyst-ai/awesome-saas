import {
  AlchemystClient,
  alchemystClient,
  generatePrompt,
  checkAlchemystHealth,
} from '../ai-client';
import type { UserInput, IndustryConfig, PromptTemplate } from '@/types';

// Mock the Alchemyst AI SDK
jest.mock('@alchemystai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    v1: {
      context: {
        add: jest.fn(),
        search: jest.fn(),
      },
    },
  })),
}));

// Mock utility functions
jest.mock('@/utils/industry-utils', () => ({
  getIndustryConfig: jest.fn(),
}));

jest.mock('../prompt-templates', () => ({
  getPromptTemplate: jest.fn(),
}));

// Shared test data
let mockClient: any;
let mockUserInput: UserInput;
let mockIndustryConfig: IndustryConfig;
let mockPromptTemplate: PromptTemplate;

describe('AlchemystClient', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock data
    mockUserInput = {
      websiteName: 'Test Website',
      industry: 'saas',
      aboutInfo: 'A test SaaS application',
      additionalRequirements: 'Modern design',
    };

    mockIndustryConfig = {
      name: 'SaaS',
      displayName: 'Software as a Service',
      commonFeatures: ['User authentication', 'Dashboard', 'API integration'],
      technicalRequirements: ['NextJS 14', 'TypeScript', 'Tailwind CSS'],
      designPatterns: ['Clean interface', 'Sidebar navigation'],
      examplePrompts: ['Create a SaaS dashboard'],
      colorSchemes: ['blue-gray'],
      layoutTypes: ['dashboard'],
    };

    mockPromptTemplate = {
      structure: {
        introduction: 'Introduction template',
        context: 'Context template',
        technicalSpecs: 'Technical specs template',
        designRequirements: 'Design requirements template',
        functionalRequirements: 'Functional requirements template',
      },
      placeholders: {
        websiteName: '{websiteName}',
        industry: '{industry}',
      },
      industrySpecific: {
        saas: ['Feature 1', 'Feature 2'],
      },
    };

    // Setup mock client
    mockClient = {
      v1: {
        context: {
          add: jest.fn().mockResolvedValue({}),
          search: jest.fn().mockResolvedValue({
            contexts: [
              { content: '{"features": ["Additional feature"]}' },
              { content: 'Some text context' },
            ],
          }),
        },
      },
    };

  // Mock the AlchemystAI constructor to return our mock client
  const AlchemystAI = require('@alchemystai/sdk').default;
  AlchemystAI.mockImplementation(() => mockClient);
  });

  describe('generatePrompt', () => {
    it('should generate a prompt with AI enhancement', async () => {
      const request = {
        userInput: mockUserInput,
        industryContext: mockIndustryConfig,
        templateStructure: mockPromptTemplate,
      };

      const result = await alchemystClient.generatePrompt(request);

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Website - Software as a Service Website');
      expect(result.description).toContain('Test Website');
      expect(result.fullPrompt).toContain(
        '# Test Website - Software as a Service Website'
      );
      expect(result.explanation.reasoning).toContain(
        'Alchemyst AI context enrichment'
      );
    });

    it('should handle context addition failure gracefully', async () => {
      mockClient.v1.context.add.mockRejectedValue(
        new Error('Context addition failed')
      );

      const request = {
        userInput: mockUserInput,
        industryContext: mockIndustryConfig,
        templateStructure: mockPromptTemplate,
      };

      const result = await alchemystClient.generatePrompt(request);

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Website - Software as a Service Website');
    });

    it('should handle context search failure gracefully', async () => {
      mockClient.v1.context.search.mockRejectedValue(
        new Error('Context search failed')
      );

      const request = {
        userInput: mockUserInput,
        industryContext: mockIndustryConfig,
        templateStructure: mockPromptTemplate,
      };

      const result = await alchemystClient.generatePrompt(request);

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Website - Software as a Service Website');
    });

    it('should fall back to template generation on complete failure', async () => {
      // Mock the enrichPromptWithContext method to throw an error
      const originalMethod = alchemystClient['enrichPromptWithContext'];
      alchemystClient['enrichPromptWithContext'] = jest
        .fn()
        .mockRejectedValue(new Error('Enrichment failed'));

      const request = {
        userInput: mockUserInput,
        industryContext: mockIndustryConfig,
        templateStructure: mockPromptTemplate,
      };

      const result = await alchemystClient.generatePrompt(request);

      expect(result).toBeDefined();
      expect(result.explanation.reasoning).toContain('fallback templates');

      // Restore the original method
      alchemystClient['enrichPromptWithContext'] = originalMethod;
    });
  });

  describe('context management', () => {
    it('should attempt to add context with proper structure', async () => {
      // Create a fresh mock client for this test
      const contextMockClient = {
        v1: {
          context: {
            add: jest.fn().mockResolvedValue({}),
            search: jest.fn().mockResolvedValue({
              contexts: [{ content: '{"features": ["Additional feature"]}' }],
            }),
          },
        },
      };

  const AlchemystAI = require('@alchemystai/sdk').default;
  AlchemystAI.mockImplementation(() => contextMockClient);

      // Create a new client instance
      const testClient = new AlchemystClient();

      const request = {
        userInput: mockUserInput,
        industryContext: mockIndustryConfig,
        templateStructure: mockPromptTemplate,
      };

      await testClient.generatePrompt(request);

      expect(contextMockClient.v1.context.add).toHaveBeenCalledWith({
        context_type: 'resource',
        scope: 'internal',
        source: 'v0-prompt-generator-saas',
        documents: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('SaaS'),
          }),
        ]),
        metadata: expect.objectContaining({
          fileName: 'saas-context.json',
          fileType: 'application/json',
        }),
      });
    });

    it('should attempt to search context with proper parameters', async () => {
      // Create a fresh mock client for this test
      const contextMockClient = {
        v1: {
          context: {
            add: jest.fn().mockResolvedValue({}),
            search: jest.fn().mockResolvedValue({
              contexts: [{ content: '{"features": ["Additional feature"]}' }],
            }),
          },
        },
      };

  const AlchemystAI = require('@alchemystai/sdk').default;
  AlchemystAI.mockImplementation(() => contextMockClient);

      // Create a new client instance
      const testClient = new AlchemystClient();

      const request = {
        userInput: mockUserInput,
        industryContext: mockIndustryConfig,
        templateStructure: mockPromptTemplate,
      };

      await testClient.generatePrompt(request);

      expect(contextMockClient.v1.context.search).toHaveBeenCalledWith({
        query: 'Test Website saas A test SaaS application',
        minimum_similarity_threshold: 0.3,
        similarity_threshold: 0.8,
        scope: 'internal',
      });
    });
  });

  describe('prompt assembly', () => {
    it('should include all required sections in the prompt', async () => {
      const request = {
        userInput: mockUserInput,
        industryContext: mockIndustryConfig,
        templateStructure: mockPromptTemplate,
      };

      const result = await alchemystClient.generatePrompt(request);

      expect(result.fullPrompt).toContain('## Description');
      expect(result.fullPrompt).toContain('## Context');
      expect(result.fullPrompt).toContain('## Technical Requirements');
      expect(result.fullPrompt).toContain('## Key Features');
      expect(result.fullPrompt).toContain('## Design Guidelines');
      expect(result.fullPrompt).toContain('## Implementation Notes');
    });

    it('should include industry-specific features', async () => {
      const request = {
        userInput: mockUserInput,
        industryContext: mockIndustryConfig,
        templateStructure: mockPromptTemplate,
      };

      const result = await alchemystClient.generatePrompt(request);

      expect(result.industryFeatures).toContain('User authentication');
      expect(result.industryFeatures).toContain('Dashboard');
    });

    it('should include technical requirements', async () => {
      const request = {
        userInput: mockUserInput,
        industryContext: mockIndustryConfig,
        templateStructure: mockPromptTemplate,
      };

      const result = await alchemystClient.generatePrompt(request);

      expect(result.technicalSpecs).toContain('NextJS 14');
      expect(result.technicalSpecs).toContain('TypeScript');
    });
  });
});

describe('generatePrompt function', () => {
  beforeEach(() => {
    const { getIndustryConfig } = require('@/utils/industry-utils');
    const { getPromptTemplate } = require('../prompt-templates');

    getIndustryConfig.mockReturnValue(mockIndustryConfig);
    getPromptTemplate.mockReturnValue(mockPromptTemplate);
  });

  it('should generate a prompt for valid input', async () => {
    const result = await generatePrompt(mockUserInput);

    expect(result).toBeDefined();
    expect(result.title).toBe('Test Website - Software as a Service Website');
  });

  it('should throw error for unsupported industry', async () => {
    const { getIndustryConfig } = require('@/utils/industry-utils');
    getIndustryConfig.mockReturnValue(null);

    const invalidInput = { ...mockUserInput, industry: 'invalid' };

    await expect(generatePrompt(invalidInput)).rejects.toThrow(
      'Unsupported industry: invalid'
    );
  });
});

describe('checkAlchemystHealth', () => {
  it('should return true when service is healthy', async () => {
    // Mock the client property directly on the singleton instance
    const originalClient = alchemystClient['client'];
    alchemystClient['client'] = {
      v1: {
        context: {
          search: jest.fn().mockResolvedValue({ contexts: [] }),
        },
      },
    };

    const result = await checkAlchemystHealth();

    expect(result).toBe(true);

    // Restore the original client
    alchemystClient['client'] = originalClient;
  });

  it('should return false when service is unhealthy', async () => {
    // Mock the client property directly on the singleton instance
    const originalClient = alchemystClient['client'];
    alchemystClient['client'] = {
      v1: {
        context: {
          search: jest.fn().mockRejectedValue(new Error('Service unavailable')),
        },
      },
    };

    const result = await checkAlchemystHealth();

    expect(result).toBe(false);

    // Restore the original client
    alchemystClient['client'] = originalClient;
  });
});
