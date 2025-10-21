/**
 * Simple AI Workflow Integration Test
 *
 * A minimal integration test to verify the AI workflow functionality
 * Requirements: 1.1, 1.2, 1.3, 2.1
 */

import { generatePrompt, checkAlchemystHealth } from '@/lib/ai-client';
import { promptGenerationService } from '@/lib/prompt-generation-service';

// Mock the Alchemyst AI SDK
jest.mock('@alchemystai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    v1: {
      context: {
        add: jest.fn().mockResolvedValue({}),
        search: jest.fn().mockResolvedValue({
          contexts: [
            {
              content: JSON.stringify({
                features: ['User Dashboard', 'Team Collaboration'],
                technicalRequirements: ['NextJS 14', 'TypeScript'],
              }),
            },
          ],
        }),
      },
    },
  })),
}));

describe('Simple AI Workflow Integration Tests', () => {
  const validUserInput = {
    websiteName: 'Test Website',
    industry: 'saas',
    aboutInfo: 'A test website for integration testing',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ALCHEMYST_AI_API_KEY = 'test-api-key';
  });

  describe('Basic AI Integration', () => {
    it('should generate a prompt with valid input', async () => {
      const result = await generatePrompt(validUserInput);

      expect(result).toBeDefined();
      expect(result.title).toContain(validUserInput.websiteName);
      expect(result.description).toContain(validUserInput.aboutInfo);
      expect(result.fullPrompt).toBeDefined();
      expect(result.explanation).toBeDefined();
    });

    it('should include NextJS in technical specifications', async () => {
      const result = await generatePrompt(validUserInput);

      expect(result.fullPrompt).toContain('NextJS');
      expect(result.technicalSpecs).toContain('NextJS');
    });

    it('should generate V0-compatible prompt structure', async () => {
      const result = await generatePrompt(validUserInput);

      expect(result.fullPrompt).toMatch(/^# .+/); // Title
      expect(result.fullPrompt).toContain('## Description');
      expect(result.fullPrompt).toContain('## Context');
      expect(result.fullPrompt).toContain('## Technical Requirements');
      expect(result.fullPrompt).toContain('## Key Features');
    });

    it('should handle service health check', async () => {
      const isHealthy = await checkAlchemystHealth();
      expect(typeof isHealthy).toBe('boolean');
    });

    it('should work with prompt generation service', async () => {
      const result =
        await promptGenerationService.generatePrompt(validUserInput);

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.fullPrompt).toBeDefined();
      expect(Array.isArray(result.industryFeatures)).toBe(true);
    });

    it('should handle validation errors', async () => {
      const invalidInput = {
        websiteName: '',
        industry: '',
        aboutInfo: '',
      };

      await expect(
        promptGenerationService.generatePrompt(invalidInput)
      ).rejects.toThrow();
    });

    it('should complete generation within time limit', async () => {
      const startTime = Date.now();
      await generatePrompt(validUserInput);
      const endTime = Date.now();

      // Should complete within 30 seconds (Requirement 1.1)
      expect(endTime - startTime).toBeLessThan(30000);
    });

    it('should include modern web development practices', async () => {
      const result = await generatePrompt(validUserInput);

      const promptText = result.fullPrompt.toLowerCase();
      expect(promptText).toContain('typescript');
      expect(promptText).toContain('responsive');
      expect(promptText).toContain('accessibility');
    });
  });
});
