import {
  PromptGenerationService,
  promptGenerationService,
  generatePrompt,
  getAvailableIndustries,
  getIndustryDisplayNames,
} from '../prompt-generation-service';
import { ApiError } from '../error-handling';
import type { UserInput } from '@/types';

// Mock dependencies
jest.mock('../ai-client', () => ({
  alchemystClient: {
    generatePrompt: jest.fn(),
  },
  checkAlchemystHealth: jest.fn(),
}));

jest.mock('@/utils/industry-utils', () => ({
  getIndustryConfig: jest.fn(),
}));

jest.mock('../prompt-templates', () => ({
  getPromptTemplate: jest.fn(),
}));

describe('PromptGenerationService', () => {
  let service: PromptGenerationService;
  let mockUserInput: UserInput;

  beforeEach(() => {
    jest.clearAllMocks();
    service = PromptGenerationService.getInstance();

    mockUserInput = {
      websiteName: 'Test Website',
      industry: 'saas',
      aboutInfo: 'A test SaaS application',
      additionalRequirements: 'Modern design',
    };

    // Setup default mocks
    const { getIndustryConfig } = require('@/utils/industry-utils');
    const { getPromptTemplate } = require('../prompt-templates');
    const { checkAlchemystHealth, alchemystClient } = require('../ai-client');

    getIndustryConfig.mockReturnValue({
      name: 'SaaS',
      displayName: 'Software as a Service',
      commonFeatures: ['User authentication', 'Dashboard'],
      technicalRequirements: ['NextJS 14', 'TypeScript'],
      designPatterns: ['Clean interface'],
      examplePrompts: ['Create a SaaS dashboard'],
      colorSchemes: ['blue-gray'],
      layoutTypes: ['dashboard'],
    });

    getPromptTemplate.mockReturnValue({
      structure: {
        introduction: 'Introduction',
        context: 'Context',
        technicalSpecs: 'Technical specs',
        designRequirements: 'Design requirements',
        functionalRequirements: 'Functional requirements',
      },
      placeholders: {},
      industrySpecific: {},
    });

    checkAlchemystHealth.mockResolvedValue(true);
    alchemystClient.generatePrompt.mockResolvedValue({
      title: 'Test Website - Software as a Service Website',
      description: 'A test description',
      context: 'Test context',
      technicalSpecs: 'Test specs',
      industryFeatures: ['Feature 1', 'Feature 2'],
      fullPrompt: 'Full prompt content',
      explanation: {
        sections: {},
        reasoning: 'AI-enhanced prompt',
      },
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PromptGenerationService.getInstance();
      const instance2 = PromptGenerationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('generatePrompt', () => {
    it('should generate a prompt successfully', async () => {
      const result = await service.generatePrompt(mockUserInput);

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Website - Software as a Service Website');
      expect(result.explanation.reasoning).toContain('AI-enhanced');
    });

    it('should validate user input', async () => {
      const invalidInput = {
        websiteName: '',
        industry: 'saas',
        aboutInfo: 'Test',
      };

      await expect(service.generatePrompt(invalidInput)).rejects.toThrow(
        ApiError
      );
      await expect(service.generatePrompt(invalidInput)).rejects.toThrow(
        'Website name is required'
      );
    });

    it('should handle unsupported industry', async () => {
      const { getIndustryConfig } = require('@/utils/industry-utils');
      getIndustryConfig.mockReturnValue(null);

      const invalidInput = { ...mockUserInput, industry: 'invalid' };

      await expect(service.generatePrompt(invalidInput)).rejects.toThrow(
        ApiError
      );
      await expect(service.generatePrompt(invalidInput)).rejects.toThrow(
        'Unsupported industry'
      );
    });

    it('should use fallback when AI service fails', async () => {
      const { alchemystClient } = require('../ai-client');
      alchemystClient.generatePrompt.mockRejectedValue(
        new Error('AI service failed')
      );

      const result = await service.generatePrompt(mockUserInput);

      expect(result).toBeDefined();
      expect(result.explanation.reasoning).toContain('template-based fallback');
    });

    it('should use fallback when AI service fails with retryable error', async () => {
      const { alchemystClient } = require('../ai-client');
      alchemystClient.generatePrompt.mockRejectedValue(
        new ApiError('Timeout', 'TIMEOUT', 408)
      );

      const result = await service.generatePrompt(mockUserInput);

      expect(result.title).toContain('Test Website');
      expect(result.explanation.reasoning).toContain('template-based fallback');
    });
  });

  describe('input validation', () => {
    it('should validate website name', async () => {
      const inputs = [
        { ...mockUserInput, websiteName: '' },
        { ...mockUserInput, websiteName: 'a'.repeat(101) },
      ];

      for (const input of inputs) {
        await expect(service.generatePrompt(input)).rejects.toThrow(ApiError);
      }
    });

    it('should validate industry', async () => {
      const input = { ...mockUserInput, industry: '' };
      await expect(service.generatePrompt(input)).rejects.toThrow(
        'Industry is required'
      );
    });

    it('should validate about info', async () => {
      const inputs = [
        { ...mockUserInput, aboutInfo: '' },
        { ...mockUserInput, aboutInfo: 'a'.repeat(1001) },
      ];

      for (const input of inputs) {
        await expect(service.generatePrompt(input)).rejects.toThrow(ApiError);
      }
    });

    it('should validate additional requirements length', async () => {
      const input = {
        ...mockUserInput,
        additionalRequirements: 'a'.repeat(501),
      };
      await expect(service.generatePrompt(input)).rejects.toThrow(
        'Additional requirements must be less than 500 characters'
      );
    });
  });

  describe('fallback generation', () => {
    it('should generate fallback prompt with correct structure', async () => {
      const { alchemystClient } = require('../ai-client');
      alchemystClient.generatePrompt.mockRejectedValue(
        new Error('Service unavailable')
      );

      const result = await service.generatePrompt(mockUserInput);

      expect(result).toBeDefined();
      expect(result.title).toContain('Test Website');
      expect(result.fullPrompt).toContain('## Description');
      expect(result.fullPrompt).toContain('## Context');
      expect(result.fullPrompt).toContain('## Technical Requirements');
      expect(result.explanation.reasoning).toContain('template-based fallback');
    });

    it('should include industry-specific content in fallback', async () => {
      const { alchemystClient } = require('../ai-client');
      alchemystClient.generatePrompt.mockRejectedValue(
        new Error('Service unavailable')
      );

      const result = await service.generatePrompt(mockUserInput);

      expect(result.industryFeatures).toContain('User authentication');
      expect(result.technicalSpecs).toContain('NextJS 14');
    });
  });

  describe('utility methods', () => {
    it('should return available industries', () => {
      const industries = service.getAvailableIndustries();
      expect(industries).toContain('saas');
      expect(industries).toContain('ecommerce');
      expect(industries).toContain('portfolio');
    });

    it('should return industry display names', () => {
      const displayNames = service.getIndustryDisplayNames();
      expect(displayNames.saas).toBe('Software as a Service');
      expect(displayNames.ecommerce).toBe('E-commerce & Retail');
    });
  });
});

describe('exported functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    const { getIndustryConfig } = require('@/utils/industry-utils');
    const { getPromptTemplate } = require('../prompt-templates');
    const { checkAlchemystHealth, alchemystClient } = require('../ai-client');

    getIndustryConfig.mockReturnValue({
      name: 'SaaS',
      displayName: 'Software as a Service',
      commonFeatures: ['Feature 1'],
      technicalRequirements: ['NextJS 14'],
      designPatterns: ['Pattern 1'],
      examplePrompts: ['Example 1'],
      colorSchemes: ['blue'],
      layoutTypes: ['dashboard'],
    });

    getPromptTemplate.mockReturnValue({
      structure: {
        introduction: 'Introduction',
        context: 'Context',
        technicalSpecs: 'Technical specs',
        designRequirements: 'Design requirements',
        functionalRequirements: 'Functional requirements',
      },
      placeholders: {},
      industrySpecific: {},
    });

    checkAlchemystHealth.mockResolvedValue(true);
    alchemystClient.generatePrompt.mockResolvedValue({
      title: 'Test',
      description: 'Test',
      context: 'Test',
      technicalSpecs: 'Test',
      industryFeatures: [],
      fullPrompt: 'Test',
      explanation: { sections: {}, reasoning: 'Test' },
    });
  });

  describe('generatePrompt', () => {
    it('should generate prompt using service', async () => {
      const userInput = {
        websiteName: 'Test',
        industry: 'saas',
        aboutInfo: 'Test app',
      };

      const result = await generatePrompt(userInput);
      expect(result).toBeDefined();
    });
  });

  describe('getAvailableIndustries', () => {
    it('should return list of industries', () => {
      const industries = getAvailableIndustries();
      expect(Array.isArray(industries)).toBe(true);
      expect(industries.length).toBeGreaterThan(0);
    });
  });

  describe('getIndustryDisplayNames', () => {
    it('should return industry display names', () => {
      const displayNames = getIndustryDisplayNames();
      expect(typeof displayNames).toBe('object');
      expect(displayNames.saas).toBeDefined();
    });
  });
});
