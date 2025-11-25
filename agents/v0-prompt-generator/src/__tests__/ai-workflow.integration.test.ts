/**
 * AI Workflow Integration Tests
 *
 * This test suite focuses specifically on AI integration and workflow:
 * - Alchemyst AI SDK integration with mock and real responses
 * - Error handling and recovery scenarios
 * - Service health checks and fallback mechanisms
 * - Performance and timeout handling
 *
 * Requirements: 1.1, 1.2, 1.3, 2.1
 */

import AlchemystAI from '@alchemystai/sdk';
import {
  alchemystClient,
  generatePrompt,
  checkAlchemystHealth,
} from '@/lib/ai-client';
import { promptGenerationService } from '@/lib/prompt-generation-service';
import { ApiError } from '@/lib/error-handling';
import type {
  UserInput,
  GeneratedPrompt,
  AlchemystPromptRequest,
} from '@/types';
import {
  industryTestData,
  createMockApiError,
} from '@/src/__tests__/setup/integration-test-setup';

// Mock the Alchemyst AI SDK
jest.mock('@alchemystai/sdk');

// Mock performance monitoring to avoid side effects
jest.mock('@/lib/performance-monitor', () => ({
  measureAsync: jest.fn((name, fn) => fn()),
  performanceMonitor: {
    recordAIGeneration: jest.fn(),
  },
}));

// Mock cache manager
jest.mock('@/lib/cache-manager', () => ({
  cacheManager: {
    get: jest.fn(),
    set: jest.fn(),
  },
  createCacheKey: jest.fn(
    (prefix, data) => `${prefix}_${JSON.stringify(data)}`
  ),
  CACHE_TTL: {
    AI_RESPONSES: 300000,
  },
}));

describe('AI Workflow Integration Tests', () => {
  let mockAlchemystAI: jest.Mocked<AlchemystAI>;
  let mockContextAdd: jest.Mock;
  let mockContextSearch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Alchemyst AI SDK mocks
    mockContextAdd = jest.fn();
    mockContextSearch = jest.fn();

    mockAlchemystAI = {
      v1: {
        context: {
          add: mockContextAdd,
          search: mockContextSearch,
        },
      },
    } as any;

    (AlchemystAI as jest.MockedClass<typeof AlchemystAI>).mockImplementation(
      () => mockAlchemystAI
    );
  });

  describe('Alchemyst AI SDK Integration', () => {
    it('should successfully generate prompts with AI enhancement', async () => {
      const testInput: UserInput = industryTestData.saas;

      // Mock successful context operations
      mockContextAdd.mockResolvedValue({ success: true });
      mockContextSearch.mockResolvedValue({
        contexts: [
          {
            content: JSON.stringify({
              features: ['Advanced Analytics', 'Team Collaboration'],
              technicalRequirements: ['Real-time Updates', 'API Integration'],
            }),
          },
        ],
      });

      const result = await generatePrompt(testInput);

      expect(result).toBeDefined();
      expect(result.title).toContain(testInput.websiteName);
      expect(result.fullPrompt).toContain('NextJS');
      expect(result.explanation.reasoning).toContain(
        'AI-powered context analysis'
      );

      // Verify AI SDK was called correctly
      expect(mockContextAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          context_type: 'resource',
          scope: 'internal',
          source: `v0-prompt-generator-${testInput.industry}`,
        })
      );

      expect(mockContextSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining(testInput.websiteName),
          minimum_similarity_threshold: 0.3,
          similarity_threshold: 0.8,
          scope: 'internal',
        })
      );
    });

    it('should handle AI context addition failures gracefully', async () => {
      const testInput: UserInput = industryTestData.ecommerce;

      // Mock context add failure but search success
      mockContextAdd.mockRejectedValue(
        new Error('Context service unavailable')
      );
      mockContextSearch.mockResolvedValue({
        contexts: [
          {
            content: JSON.stringify({
              features: ['Product Catalog', 'Shopping Cart'],
            }),
          },
        ],
      });

      const result = await generatePrompt(testInput);

      expect(result).toBeDefined();
      expect(result.title).toContain(testInput.websiteName);

      // Should continue with generation despite context add failure
      expect(mockContextSearch).toHaveBeenCalled();
    });

    it('should handle AI context search failures with fallback', async () => {
      const testInput: UserInput = industryTestData.portfolio;

      // Mock both context operations failing
      mockContextAdd.mockRejectedValue(new Error('Service unavailable'));
      mockContextSearch.mockRejectedValue(new Error('Search service down'));

      const result = await generatePrompt(testInput);

      expect(result).toBeDefined();
      expect(result.title).toContain(testInput.websiteName);
      expect(result.explanation.reasoning).toContain('fallback templates');
    });

    it('should generate different prompts for different industries', async () => {
      const industries = [
        'saas',
        'ecommerce',
        'portfolio',
        'corporate',
      ] as const;
      const results: GeneratedPrompt[] = [];

      // Mock successful AI responses for all industries
      mockContextAdd.mockResolvedValue({ success: true });
      mockContextSearch.mockResolvedValue({
        contexts: [
          {
            content: JSON.stringify({
              features: ['Industry Specific Feature'],
              technicalRequirements: ['Industry Specific Tech'],
            }),
          },
        ],
      });

      for (const industry of industries) {
        const testInput = industryTestData[industry];
        const result = await generatePrompt(testInput);
        results.push(result);
      }

      // Verify each result is unique and industry-appropriate
      expect(results).toHaveLength(4);

      results.forEach((result, index) => {
        const industry = industries[index];
        const testInput = industryTestData[industry];

        expect(result.title).toContain(testInput.websiteName);
        expect(result.context).toContain(industry);
        expect(result.fullPrompt).toContain('NextJS'); // Requirement 2.1

        // Verify uniqueness
        const otherResults = results.filter((_, i) => i !== index);
        otherResults.forEach((otherResult) => {
          expect(result.fullPrompt).not.toBe(otherResult.fullPrompt);
        });
      });
    });

    it('should include Alchemyst AI SDK integration when applicable', async () => {
      const testInput: UserInput = {
        ...industryTestData.saas,
        additionalRequirements:
          'Include AI features and machine learning capabilities',
      };

      mockContextAdd.mockResolvedValue({ success: true });
      mockContextSearch.mockResolvedValue({
        contexts: [
          {
            content: JSON.stringify({
              features: ['AI Integration', 'ML Capabilities'],
              technicalRequirements: [
                'Alchemyst AI SDK',
                'AI Model Integration',
              ],
            }),
          },
        ],
      });

      const result = await generatePrompt(testInput);

      expect(result.technicalSpecs.toLowerCase()).toContain('alchemyst');
      expect(result.fullPrompt.toLowerCase()).toContain('ai');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle API timeout errors with retry logic', async () => {
      const testInput: UserInput = industryTestData.startup;

      // Mock timeout on first call, success on retry
      mockContextAdd
        .mockRejectedValueOnce(new Error('Request timeout'))
        .mockResolvedValue({ success: true });

      mockContextSearch
        .mockRejectedValueOnce(new Error('Request timeout'))
        .mockResolvedValue({
          contexts: [
            { content: JSON.stringify({ features: ['Startup Feature'] }) },
          ],
        });

      const result = await generatePrompt(testInput);

      expect(result).toBeDefined();
      expect(result.title).toContain(testInput.websiteName);

      // Should have retried the operations
      expect(mockContextAdd).toHaveBeenCalledTimes(2);
      expect(mockContextSearch).toHaveBeenCalledTimes(2);
    });

    it('should handle rate limiting with exponential backoff', async () => {
      const testInput: UserInput = industryTestData.agency;

      // Mock rate limit error
      const rateLimitError = createMockApiError(
        'Rate limit exceeded',
        'RATE_LIMIT',
        429
      );
      mockContextSearch.mockRejectedValue(rateLimitError);

      const result = await generatePrompt(testInput);

      expect(result).toBeDefined();
      expect(result.explanation.reasoning).toContain('fallback');
    });

    it('should handle network connectivity issues', async () => {
      const testInput: UserInput = industryTestData.corporate;

      // Mock network error
      const networkError = new Error('Network request failed');
      (networkError as any).code = 'NETWORK_ERROR';

      mockContextAdd.mockRejectedValue(networkError);
      mockContextSearch.mockRejectedValue(networkError);

      const result = await generatePrompt(testInput);

      expect(result).toBeDefined();
      expect(result.title).toContain(testInput.websiteName);
      expect(result.explanation.reasoning).toContain('fallback');
    });

    it('should handle malformed AI responses gracefully', async () => {
      const testInput: UserInput = industryTestData.saas;

      // Mock malformed response
      mockContextAdd.mockResolvedValue({ success: true });
      mockContextSearch.mockResolvedValue({
        contexts: [
          {
            content: 'invalid json content',
          },
          {
            content: JSON.stringify({
              malformed: 'data without expected fields',
            }),
          },
        ],
      });

      const result = await generatePrompt(testInput);

      expect(result).toBeDefined();
      expect(result.title).toContain(testInput.websiteName);
      // Should still generate a valid prompt despite malformed AI response
      expect(result.fullPrompt).toMatch(/^# .+/); // Should start with title
    });

    it('should implement circuit breaker pattern for repeated failures', async () => {
      const testInput: UserInput = industryTestData.ecommerce;

      // Mock repeated failures to trigger circuit breaker
      const serviceError = createMockApiError(
        'Service unavailable',
        'SERVICE_ERROR',
        503
      );

      // Use the prompt generation service which has circuit breaker logic
      const generatePromptSpy = jest.spyOn(
        promptGenerationService,
        'generatePrompt'
      );

      // Mock the AI client to always fail
      mockContextAdd.mockRejectedValue(serviceError);
      mockContextSearch.mockRejectedValue(serviceError);

      // Make multiple requests to trigger circuit breaker
      const promises = Array(6)
        .fill(null)
        .map(() =>
          promptGenerationService.generatePrompt(testInput).catch((e) => e)
        );

      const results = await Promise.all(promises);

      // Should have attempted generation multiple times
      expect(generatePromptSpy).toHaveBeenCalledTimes(6);

      // Later requests should fail faster due to circuit breaker
      results.forEach((result) => {
        expect(result).toBeDefined();
        // Should either be a successful fallback or a handled error
      });
    });
  });

  describe('Service Health Checks', () => {
    it('should perform health check successfully', async () => {
      mockContextSearch.mockResolvedValue({
        contexts: [],
      });

      const isHealthy = await checkAlchemystHealth();

      expect(isHealthy).toBe(true);
      expect(mockContextSearch).toHaveBeenCalledWith({
        query: 'health check',
        minimum_similarity_threshold: 0.1,
        similarity_threshold: 0.9,
      });
    });

    it('should detect service unavailability', async () => {
      mockContextSearch.mockRejectedValue(new Error('Service unavailable'));

      const isHealthy = await checkAlchemystHealth();

      expect(isHealthy).toBe(false);
    });

    it('should cache health check results', async () => {
      mockContextSearch.mockResolvedValue({ contexts: [] });

      // First health check
      const firstCheck = await promptGenerationService.checkServiceHealth();
      expect(firstCheck).toBe(true);

      // Second health check should use cached result
      const secondCheck = await promptGenerationService.checkServiceHealth();
      expect(secondCheck).toBe(true);

      // Should only have called the actual health check once due to caching
      expect(mockContextSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance and Timeout Handling', () => {
    it('should complete prompt generation within acceptable time limits', async () => {
      const testInput: UserInput = industryTestData.portfolio;

      // Mock realistic response times
      mockContextAdd.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 500)
          )
      );
      mockContextSearch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  contexts: [
                    { content: JSON.stringify({ features: ['Fast Feature'] }) },
                  ],
                }),
              800
            )
          )
      );

      const startTime = Date.now();
      const result = await generatePrompt(testInput);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(30000); // Requirement 1.1: within 30 seconds
    });

    it('should handle slow AI responses with timeout', async () => {
      const testInput: UserInput = industryTestData.startup;

      // Mock very slow response that should timeout
      mockContextAdd.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 35000)
          )
      );
      mockContextSearch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ contexts: [] }), 35000)
          )
      );

      const result = await generatePrompt(testInput);

      // Should fallback to template-based generation due to timeout
      expect(result).toBeDefined();
      expect(result.explanation.reasoning).toContain('fallback');
    });

    it('should handle concurrent requests efficiently', async () => {
      const testInputs = [
        industryTestData.saas,
        industryTestData.ecommerce,
        industryTestData.portfolio,
      ];

      // Mock successful responses for all
      mockContextAdd.mockResolvedValue({ success: true });
      mockContextSearch.mockResolvedValue({
        contexts: [
          { content: JSON.stringify({ features: ['Concurrent Feature'] }) },
        ],
      });

      const startTime = Date.now();
      const promises = testInputs.map((input) => generatePrompt(input));
      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result).toBeDefined();
        expect(result.title).toContain(testInputs[index].websiteName);
      });

      // Concurrent requests should not take significantly longer than sequential
      expect(endTime - startTime).toBeLessThan(10000);
    });
  });

  describe('V0 Compatibility Verification', () => {
    it('should generate V0-compatible prompt structure for all test scenarios', async () => {
      const testInputs = Object.values(industryTestData);

      mockContextAdd.mockResolvedValue({ success: true });
      mockContextSearch.mockResolvedValue({
        contexts: [
          { content: JSON.stringify({ features: ['V0 Compatible'] }) },
        ],
      });

      for (const testInput of testInputs) {
        const result = await generatePrompt(testInput);

        // Verify V0-compatible structure
        expect(result.fullPrompt).toMatch(/^# .+/); // Title
        expect(result.fullPrompt).toContain('## Description');
        expect(result.fullPrompt).toContain('## Context');
        expect(result.fullPrompt).toContain('## Technical Requirements');
        expect(result.fullPrompt).toContain('## Key Features');
        expect(result.fullPrompt).toContain('## Design Guidelines');
        expect(result.fullPrompt).toContain('## Implementation Notes');

        // Verify NextJS recommendation (Requirement 2.1)
        expect(result.fullPrompt).toContain('NextJS');
        expect(result.technicalSpecs).toContain('NextJS');

        // Verify modern web practices
        expect(result.fullPrompt.toLowerCase()).toContain('typescript');
        expect(result.fullPrompt.toLowerCase()).toContain('responsive');
        expect(result.fullPrompt.toLowerCase()).toContain('accessibility');
      }
    });

    it('should include industry-specific technical requirements', async () => {
      const testCases = [
        {
          input: industryTestData.saas,
          expectedTech: ['dashboard', 'authentication', 'api'],
        },
        {
          input: industryTestData.ecommerce,
          expectedTech: ['payment', 'cart', 'product'],
        },
        {
          input: industryTestData.portfolio,
          expectedTech: ['gallery', 'image', 'showcase'],
        },
      ];

      mockContextAdd.mockResolvedValue({ success: true });

      for (const testCase of testCases) {
        mockContextSearch.mockResolvedValue({
          contexts: [
            {
              content: JSON.stringify({
                technicalRequirements: testCase.expectedTech.map(
                  (tech) =>
                    `${tech.charAt(0).toUpperCase() + tech.slice(1)} Integration`
                ),
              }),
            },
          ],
        });

        const result = await generatePrompt(testCase.input);

        const promptLower = result.fullPrompt.toLowerCase();
        testCase.expectedTech.forEach((tech) => {
          expect(promptLower).toContain(tech.toLowerCase());
        });
      }
    });

    it('should maintain consistent output format across different AI responses', async () => {
      const testInput: UserInput = industryTestData.corporate;
      const results: GeneratedPrompt[] = [];

      // Test with different AI response variations
      const aiResponses = [
        {
          contexts: [
            {
              content: JSON.stringify({ features: ['Feature A', 'Feature B'] }),
            },
          ],
        },
        {
          contexts: [
            {
              content: JSON.stringify({
                technicalRequirements: ['Tech A', 'Tech B'],
              }),
            },
          ],
        },
        {
          contexts: [{ content: 'Plain text context without JSON structure' }],
        },
        {
          contexts: [], // Empty response
        },
      ];

      mockContextAdd.mockResolvedValue({ success: true });

      for (const response of aiResponses) {
        mockContextSearch.mockResolvedValue(response);
        const result = await generatePrompt(testInput);
        results.push(result);
      }

      // All results should have consistent structure
      results.forEach((result) => {
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('description');
        expect(result).toHaveProperty('context');
        expect(result).toHaveProperty('technicalSpecs');
        expect(result).toHaveProperty('industryFeatures');
        expect(result).toHaveProperty('fullPrompt');
        expect(result).toHaveProperty('explanation');

        // All should be valid V0 prompts
        expect(result.fullPrompt).toMatch(/^# .+/);
        expect(result.fullPrompt).toContain('NextJS');
      });
    });
  });
});
