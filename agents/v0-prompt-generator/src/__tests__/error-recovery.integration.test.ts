/**
 * Error Recovery Integration Tests
 *
 * This test suite focuses on error handling and recovery scenarios:
 * - Network failures and connectivity issues
 * - API rate limiting and service unavailability
 * - Malformed responses and data corruption
 * - Fallback mechanisms and graceful degradation
 *
 * Requirements: 1.1, 1.2, 1.3, 2.1
 */

import { promptGenerationService } from '@/lib/prompt-generation-service';
import { alchemystClient, checkAlchemystHealth } from '@/lib/ai-client';
import {
  ApiError,
  ErrorHandler,
  RetryHandler,
  CircuitBreaker,
} from '@/lib/error-handling';
import type { UserInput } from '@/types';
import {
  industryTestData,
  createMockApiError,
  simulateNetworkConditions,
  measurePerformance,
} from '@/src/__tests__/setup/integration-test-setup';

// Mock the Alchemyst AI SDK
jest.mock('@alchemystai/sdk');

// Mock performance monitoring
jest.mock('@/lib/performance-monitor', () => ({
  measureAsync: jest.fn((name, fn, metadata) => fn()),
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

describe('Error Recovery Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Network Failure Recovery', () => {
    it('should handle complete network failure with fallback generation', async () => {
      const testInput: UserInput = industryTestData.saas;

      // Simulate complete network failure
      const networkSimulation = simulateNetworkConditions.offline();

      try {
        const result = await promptGenerationService.generatePrompt(testInput);

        expect(result).toBeDefined();
        expect(result.title).toContain(testInput.websiteName);
        expect(result.fullPrompt).toContain('NextJS'); // Requirement 2.1
        expect(result.explanation.reasoning).toContain('fallback');

        // Should complete within acceptable time even with network issues
        const { duration } = await measurePerformance(async () => {
          return promptGenerationService.generatePrompt(testInput);
        });
        expect(duration).toBeLessThan(30000); // Requirement 1.1
      } finally {
        networkSimulation.cleanup();
      }
    });

    it('should handle intermittent network connectivity', async () => {
      const testInput: UserInput = industryTestData.ecommerce;

      // Simulate unstable network
      const networkSimulation = simulateNetworkConditions.unstable();

      try {
        const result = await promptGenerationService.generatePrompt(testInput);

        expect(result).toBeDefined();
        expect(result.title).toContain(testInput.websiteName);

        // Should eventually succeed or provide fallback
        expect(result.fullPrompt).toMatch(/^# .+/);
      } finally {
        networkSimulation.cleanup();
      }
    });

    it('should handle slow network conditions gracefully', async () => {
      const testInput: UserInput = industryTestData.portfolio;

      // Simulate slow network
      const networkSimulation = simulateNetworkConditions.slow();

      try {
        const startTime = Date.now();
        const result = await promptGenerationService.generatePrompt(testInput);
        const endTime = Date.now();

        expect(result).toBeDefined();

        // Should not hang indefinitely on slow network
        expect(endTime - startTime).toBeLessThan(35000);
      } finally {
        networkSimulation.cleanup();
      }
    });
  });

  describe('API Error Recovery', () => {
    it('should handle 429 rate limiting with exponential backoff', async () => {
      const testInput: UserInput = industryTestData.startup;

      // Mock rate limiting error
      const rateLimitError = createMockApiError(
        'Rate limit exceeded',
        'RATE_LIMIT',
        429
      );

      // Mock the AI client to fail with rate limit initially
      const originalGeneratePrompt = alchemystClient.generatePrompt;
      let callCount = 0;

      jest
        .spyOn(alchemystClient, 'generatePrompt')
        .mockImplementation(async (request) => {
          callCount++;
          if (callCount <= 2) {
            throw rateLimitError;
          }
          // Fallback to original implementation or mock success
          return {
            title: `${request.userInput.websiteName} - Professional Website`,
            description: `Fallback prompt for ${request.userInput.websiteName}`,
            context: `Industry: ${request.userInput.industry}`,
            technicalSpecs:
              '- NextJS 14 with App Router\n- TypeScript for type safety',
            industryFeatures: ['Modern Design', 'Responsive Layout'],
            fullPrompt: `# ${request.userInput.websiteName} - Professional Website\n\n## Description\nFallback prompt generated after rate limit recovery.`,
            explanation: {
              sections: {
                description: 'Fallback description',
                context: 'Fallback context',
                technicalSpecs: 'Fallback technical specs',
                features: 'Fallback features',
              },
              reasoning: 'Generated using fallback after rate limit recovery.',
            },
          };
        });

      const result = await promptGenerationService.generatePrompt(testInput);

      expect(result).toBeDefined();
      expect(result.title).toContain(testInput.websiteName);
      expect(callCount).toBeGreaterThan(1); // Should have retried
    });

    it('should handle 503 service unavailable with circuit breaker', async () => {
      const testInput: UserInput = industryTestData.agency;

      // Mock service unavailable error
      const serviceError = createMockApiError(
        'Service temporarily unavailable',
        'SERVICE_UNAVAILABLE',
        503
      );

      jest
        .spyOn(alchemystClient, 'generatePrompt')
        .mockRejectedValue(serviceError);

      // Make multiple requests to trigger circuit breaker
      const requests = Array(6)
        .fill(null)
        .map(() => promptGenerationService.generatePrompt(testInput));

      const results = await Promise.all(requests);

      // All should succeed with fallback
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.title).toContain(testInput.websiteName);
        expect(result.explanation.reasoning).toContain('fallback');
      });
    });

    it('should handle 401 authentication errors', async () => {
      const testInput: UserInput = industryTestData.corporate;

      // Mock authentication error
      const authError = createMockApiError(
        'Invalid API key',
        'AUTHENTICATION_ERROR',
        401
      );

      jest
        .spyOn(alchemystClient, 'generatePrompt')
        .mockRejectedValue(authError);

      const result = await promptGenerationService.generatePrompt(testInput);

      expect(result).toBeDefined();
      expect(result.title).toContain(testInput.websiteName);
      expect(result.explanation.reasoning).toContain('fallback');
    });

    it('should handle timeout errors with retry logic', async () => {
      const testInput: UserInput = industryTestData.saas;

      // Mock timeout error
      const timeoutError = new Error('Request timeout');
      (timeoutError as any).code = 'TIMEOUT';

      let callCount = 0;
      jest
        .spyOn(alchemystClient, 'generatePrompt')
        .mockImplementation(async (request) => {
          callCount++;
          if (callCount === 1) {
            throw timeoutError;
          }
          // Success on retry
          return {
            title: `${request.userInput.websiteName} - Professional Website`,
            description: `Retry success for ${request.userInput.websiteName}`,
            context: `Industry: ${request.userInput.industry}`,
            technicalSpecs:
              '- NextJS 14 with App Router\n- TypeScript for type safety',
            industryFeatures: ['Modern Design', 'Responsive Layout'],
            fullPrompt: `# ${request.userInput.websiteName} - Professional Website\n\n## Description\nGenerated successfully after timeout retry.`,
            explanation: {
              sections: {
                description: 'Retry success description',
                context: 'Retry success context',
                technicalSpecs: 'Retry success technical specs',
                features: 'Retry success features',
              },
              reasoning: 'Generated successfully after timeout retry.',
            },
          };
        });

      const result = await promptGenerationService.generatePrompt(testInput);

      expect(result).toBeDefined();
      expect(result.title).toContain(testInput.websiteName);
      expect(callCount).toBe(2); // Should have retried once
    });
  });

  describe('Data Corruption and Malformed Response Recovery', () => {
    it('should handle malformed JSON responses from AI service', async () => {
      const testInput: UserInput = industryTestData.ecommerce;

      // Mock malformed response
      jest
        .spyOn(alchemystClient, 'generatePrompt')
        .mockImplementation(async () => {
          // Return malformed data
          return {
            title: '', // Missing required data
            description: null as any,
            context: undefined as any,
            technicalSpecs: 123 as any, // Wrong type
            industryFeatures: 'not an array' as any,
            fullPrompt: {}, // Wrong type
            explanation: 'not an object' as any,
          };
        });

      const result = await promptGenerationService.generatePrompt(testInput);

      expect(result).toBeDefined();
      expect(result.title).toContain(testInput.websiteName);
      expect(result.fullPrompt).toMatch(/^# .+/);
      expect(result.explanation.reasoning).toContain('fallback');
    });

    it('should handle partial response corruption', async () => {
      const testInput: UserInput = industryTestData.portfolio;

      // Mock partially corrupted response
      jest
        .spyOn(alchemystClient, 'generatePrompt')
        .mockImplementation(async (request) => {
          return {
            title: `${request.userInput.websiteName} - Professional Website`,
            description: `Valid description for ${request.userInput.websiteName}`,
            context: null as any, // Corrupted field
            technicalSpecs: '- NextJS 14 with App Router',
            industryFeatures: ['Modern Design'], // Valid
            fullPrompt: '', // Missing content
            explanation: {
              sections: {
                description: 'Valid section',
                context: null as any, // Corrupted
                technicalSpecs: 'Valid section',
                features: 'Valid section',
              },
              reasoning: 'Partially corrupted response',
            },
          };
        });

      const result = await promptGenerationService.generatePrompt(testInput);

      expect(result).toBeDefined();
      expect(result.title).toContain(testInput.websiteName);
      expect(result.fullPrompt).toMatch(/^# .+/);
      expect(result.context).toBeTruthy(); // Should be reconstructed
    });

    it('should handle empty or null responses', async () => {
      const testInput: UserInput = industryTestData.startup;

      // Mock empty response
      jest
        .spyOn(alchemystClient, 'generatePrompt')
        .mockResolvedValue(null as any);

      const result = await promptGenerationService.generatePrompt(testInput);

      expect(result).toBeDefined();
      expect(result.title).toContain(testInput.websiteName);
      expect(result.fullPrompt).toMatch(/^# .+/);
      expect(result.explanation.reasoning).toContain('fallback');
    });
  });

  describe('Validation Error Recovery', () => {
    it('should handle invalid user input gracefully', async () => {
      const invalidInputs = [
        {
          websiteName: '', // Empty name
          industry: 'saas',
          aboutInfo: 'Valid about info',
        },
        {
          websiteName: 'Valid Name',
          industry: '', // Empty industry
          aboutInfo: 'Valid about info',
        },
        {
          websiteName: 'Valid Name',
          industry: 'saas',
          aboutInfo: '', // Empty about info
        },
        {
          websiteName: 'A'.repeat(200), // Too long
          industry: 'saas',
          aboutInfo: 'Valid about info',
        },
      ];

      for (const invalidInput of invalidInputs) {
        await expect(
          promptGenerationService.generatePrompt(invalidInput as UserInput)
        ).rejects.toThrow(ApiError);
      }
    });

    it('should handle unsupported industry gracefully', async () => {
      const testInput: UserInput = {
        websiteName: 'Test Site',
        industry: 'unsupported-industry',
        aboutInfo: 'A test website',
      };

      await expect(
        promptGenerationService.generatePrompt(testInput)
      ).rejects.toThrow(ApiError);
    });

    it('should validate input lengths correctly', async () => {
      const testInput: UserInput = {
        websiteName: 'Valid Name',
        industry: 'saas',
        aboutInfo: 'A'.repeat(1500), // Too long
        additionalRequirements: 'B'.repeat(600), // Too long
      };

      await expect(
        promptGenerationService.generatePrompt(testInput)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('Service Health and Recovery', () => {
    it('should detect service health correctly', async () => {
      // Mock healthy service
      jest
        .spyOn(alchemystClient['client'].v1.context, 'search')
        .mockResolvedValue({
          contexts: [],
        });

      const isHealthy = await checkAlchemystHealth();
      expect(isHealthy).toBe(true);
    });

    it('should detect unhealthy service', async () => {
      // Mock unhealthy service
      jest
        .spyOn(alchemystClient['client'].v1.context, 'search')
        .mockRejectedValue(new Error('Service unavailable'));

      const isHealthy = await checkAlchemystHealth();
      expect(isHealthy).toBe(false);
    });

    it('should cache health check results appropriately', async () => {
      const searchSpy = jest
        .spyOn(alchemystClient['client'].v1.context, 'search')
        .mockResolvedValue({ contexts: [] });

      // First health check
      await promptGenerationService.checkServiceHealth();

      // Second health check within cache interval
      await promptGenerationService.checkServiceHealth();

      // Should only call the actual health check once due to caching
      expect(searchSpy).toHaveBeenCalledTimes(1);

      // Fast forward past cache interval
      jest.advanceTimersByTime(6 * 60 * 1000); // 6 minutes

      // Third health check should call again
      await promptGenerationService.checkServiceHealth();
      expect(searchSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle health check failures gracefully', async () => {
      // Mock health check failure
      jest
        .spyOn(alchemystClient['client'].v1.context, 'search')
        .mockRejectedValue(new Error('Health check failed'));

      const isHealthy = await promptGenerationService.checkServiceHealth();
      expect(isHealthy).toBe(false);

      // Should still be able to generate prompts using fallback
      const testInput: UserInput = industryTestData.saas;
      const result = await promptGenerationService.generatePrompt(testInput);

      expect(result).toBeDefined();
      expect(result.explanation.reasoning).toContain('fallback');
    });
  });

  describe('Performance Under Error Conditions', () => {
    it('should maintain performance during error recovery', async () => {
      const testInput: UserInput = industryTestData.corporate;

      // Mock initial failure followed by success
      let callCount = 0;
      jest
        .spyOn(alchemystClient, 'generatePrompt')
        .mockImplementation(async (request) => {
          callCount++;
          if (callCount === 1) {
            throw new Error('Temporary failure');
          }

          return {
            title: `${request.userInput.websiteName} - Professional Website`,
            description: `Recovery success for ${request.userInput.websiteName}`,
            context: `Industry: ${request.userInput.industry}`,
            technicalSpecs:
              '- NextJS 14 with App Router\n- TypeScript for type safety',
            industryFeatures: ['Modern Design', 'Responsive Layout'],
            fullPrompt: `# ${request.userInput.websiteName} - Professional Website\n\n## Description\nGenerated successfully after error recovery.`,
            explanation: {
              sections: {
                description: 'Recovery success description',
                context: 'Recovery success context',
                technicalSpecs: 'Recovery success technical specs',
                features: 'Recovery success features',
              },
              reasoning: 'Generated successfully after error recovery.',
            },
          };
        });

      const { result, duration } = await measurePerformance(async () => {
        return promptGenerationService.generatePrompt(testInput);
      });

      expect(result).toBeDefined();
      expect(result.title).toContain(testInput.websiteName);
      expect(duration).toBeLessThan(30000); // Should still meet performance requirements
    });

    it('should handle concurrent errors efficiently', async () => {
      const testInputs = [
        industryTestData.saas,
        industryTestData.ecommerce,
        industryTestData.portfolio,
      ];

      // Mock different types of errors for each request
      const errors = [
        createMockApiError('Rate limit', 'RATE_LIMIT', 429),
        createMockApiError('Service unavailable', 'SERVICE_UNAVAILABLE', 503),
        new Error('Network timeout'),
      ];

      let callCount = 0;
      jest
        .spyOn(alchemystClient, 'generatePrompt')
        .mockImplementation(async (request) => {
          const errorIndex = callCount % errors.length;
          callCount++;

          if (callCount <= 3) {
            throw errors[errorIndex];
          }

          // Success after errors
          return {
            title: `${request.userInput.websiteName} - Professional Website`,
            description: `Concurrent recovery for ${request.userInput.websiteName}`,
            context: `Industry: ${request.userInput.industry}`,
            technicalSpecs: '- NextJS 14 with App Router',
            industryFeatures: ['Modern Design'],
            fullPrompt: `# ${request.userInput.websiteName} - Professional Website\n\n## Description\nConcurrent error recovery success.`,
            explanation: {
              sections: {
                description: 'Concurrent recovery description',
                context: 'Concurrent recovery context',
                technicalSpecs: 'Concurrent recovery technical specs',
                features: 'Concurrent recovery features',
              },
              reasoning:
                'Generated successfully after concurrent error recovery.',
            },
          };
        });

      const { result: results, duration } = await measurePerformance(
        async () => {
          const promises = testInputs.map((input) =>
            promptGenerationService.generatePrompt(input)
          );
          return Promise.all(promises);
        }
      );

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result).toBeDefined();
        expect(result.title).toContain(testInputs[index].websiteName);
      });

      // Should handle concurrent errors efficiently
      expect(duration).toBeLessThan(45000);
    });
  });
});
