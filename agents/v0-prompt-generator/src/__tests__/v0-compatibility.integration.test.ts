/**
 * V0 Compatibility Integration Tests
 *
 * This test suite verifies that generated prompts are fully compatible with Vercel V0:
 * - Output format compatibility with V0 requirements
 * - NextJS framework recommendations (Requirement 2.1)
 * - Modern web development best practices
 * - Industry-specific optimizations for V0
 *
 * Requirements: 1.1, 1.2, 1.3, 2.1
 */

import { generatePrompt } from '@/lib/ai-client';
import { promptGenerationService } from '@/lib/prompt-generation-service';
import type { UserInput, GeneratedPrompt } from '@/types';
import { industryTestData } from '@/src/__tests__/setup/integration-test-setup';

// Mock the Alchemyst AI SDK
jest.mock('@alchemystai/sdk');

// Mock performance monitoring
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

describe('V0 Compatibility Integration Tests', () => {
  // V0-compatible prompt structure requirements
  const V0_REQUIRED_SECTIONS = [
    '# ', // Title (markdown h1)
    '## Description',
    '## Context',
    '## Technical Requirements',
    '## Key Features',
    '## Design Guidelines',
    '## Implementation Notes',
  ];

  const V0_REQUIRED_TECHNOLOGIES = [
    'NextJS', // Requirement 2.1
    'TypeScript',
    'Tailwind CSS',
  ];

  const V0_BEST_PRACTICES = [
    'responsive',
    'accessibility',
    'performance',
    'seo',
    'modern',
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Prompt Structure Compatibility', () => {
    it('should generate V0-compatible structure for all industries', async () => {
      const industries = Object.keys(
        industryTestData
      ) as (keyof typeof industryTestData)[];

      for (const industry of industries) {
        const testInput = industryTestData[industry];
        const result = await generatePrompt(testInput);

        // Verify required sections are present
        V0_REQUIRED_SECTIONS.forEach((section) => {
          expect(result.fullPrompt).toContain(section);
        });

        // Verify proper markdown formatting
        expect(result.fullPrompt).toMatch(/^# .+/); // Starts with h1
        expect(result.fullPrompt).toMatch(/## Description\n[^\n]/); // Description has content
        expect(result.fullPrompt).toMatch(/## Context\n[^\n]/); // Context has content
        expect(result.fullPrompt).toMatch(/## Technical Requirements\n[^\n]/); // Tech specs have content

        // Verify bullet points are properly formatted
        expect(result.fullPrompt).toMatch(/^- .+/m); // Contains bullet points
      }
    });

    it('should maintain consistent section ordering', async () => {
      const testInput = industryTestData.saas;
      const result = await generatePrompt(testInput);

      const sections = V0_REQUIRED_SECTIONS.slice(1); // Remove title marker
      let lastIndex = -1;

      sections.forEach((section) => {
        const currentIndex = result.fullPrompt.indexOf(section);
        expect(currentIndex).toBeGreaterThan(lastIndex);
        lastIndex = currentIndex;
      });
    });

    it('should include proper metadata in prompt headers', async () => {
      const testInput = industryTestData.ecommerce;
      const result = await generatePrompt(testInput);

      // Title should include website name and context
      expect(result.title).toContain(testInput.websiteName);
      expect(result.fullPrompt).toMatch(/^# .+ - .+ Website/);

      // Description should be comprehensive
      expect(result.description).toContain(testInput.websiteName);
      expect(result.description).toContain(testInput.aboutInfo);

      // Context should include industry information
      expect(result.context).toContain(testInput.industry);
    });

    it('should format technical requirements as proper bullet lists', async () => {
      const testInput = industryTestData.portfolio;
      const result = await generatePrompt(testInput);

      // Technical specs should be formatted as bullet points
      const techSection = result.fullPrompt.match(
        /## Technical Requirements\n([\s\S]*?)(?=\n## |$)/
      );
      expect(techSection).toBeTruthy();

      if (techSection) {
        const techContent = techSection[1];
        const bulletPoints = techContent.match(/^- .+/gm);
        expect(bulletPoints).toBeTruthy();
        expect(bulletPoints!.length).toBeGreaterThan(0);
      }
    });

    it('should format features as proper bullet lists', async () => {
      const testInput = industryTestData.corporate;
      const result = await generatePrompt(testInput);

      // Features should be formatted as bullet points
      const featuresSection = result.fullPrompt.match(
        /## Key Features\n([\s\S]*?)(?=\n## |$)/
      );
      expect(featuresSection).toBeTruthy();

      if (featuresSection) {
        const featuresContent = featuresSection[1];
        const bulletPoints = featuresContent.match(/^- .+/gm);
        expect(bulletPoints).toBeTruthy();
        expect(bulletPoints!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Technology Stack Compatibility', () => {
    it('should always recommend NextJS as primary framework', async () => {
      const testInputs = Object.values(industryTestData);

      for (const testInput of testInputs) {
        const result = await generatePrompt(testInput);

        // Requirement 2.1: NextJS recommendation
        expect(result.fullPrompt.toLowerCase()).toContain('nextjs');
        expect(result.technicalSpecs.toLowerCase()).toContain('nextjs');

        // Should specify NextJS 14 with App Router
        expect(result.fullPrompt).toContain('NextJS 14');
        expect(result.fullPrompt).toContain('App Router');
      }
    });

    it('should include TypeScript for type safety', async () => {
      const testInput = industryTestData.startup;
      const result = await generatePrompt(testInput);

      expect(result.fullPrompt.toLowerCase()).toContain('typescript');
      expect(result.technicalSpecs.toLowerCase()).toContain('typescript');
      expect(result.fullPrompt).toContain('type safety');
    });

    it('should recommend Tailwind CSS for styling', async () => {
      const testInput = industryTestData.agency;
      const result = await generatePrompt(testInput);

      expect(result.fullPrompt.toLowerCase()).toContain('tailwind');
      expect(result.technicalSpecs.toLowerCase()).toContain('tailwind');
    });

    it('should include Alchemyst AI SDK when AI features are requested', async () => {
      const testInput: UserInput = {
        ...industryTestData.saas,
        additionalRequirements:
          'Include AI-powered features, machine learning capabilities, and intelligent automation',
      };

      const result = await generatePrompt(testInput);

      expect(result.fullPrompt.toLowerCase()).toContain('alchemyst');
      expect(result.technicalSpecs.toLowerCase()).toContain('alchemyst');
    });

    it('should recommend appropriate integrations for each industry', async () => {
      const industryIntegrations = {
        saas: ['authentication', 'dashboard', 'api'],
        ecommerce: ['payment', 'cart', 'inventory'],
        portfolio: ['gallery', 'cms', 'contact'],
        corporate: ['cms', 'forms', 'analytics'],
        startup: ['analytics', 'feedback', 'growth'],
        agency: ['portfolio', 'client', 'showcase'],
      };

      for (const [industry, expectedIntegrations] of Object.entries(
        industryIntegrations
      )) {
        const testInput =
          industryTestData[industry as keyof typeof industryTestData];
        const result = await generatePrompt(testInput);

        const promptLower = result.fullPrompt.toLowerCase();
        expectedIntegrations.forEach((integration) => {
          expect(promptLower).toContain(integration);
        });
      }
    });
  });

  describe('Modern Web Development Best Practices', () => {
    it('should include responsive design requirements', async () => {
      const testInput = industryTestData.ecommerce;
      const result = await generatePrompt(testInput);

      expect(result.fullPrompt.toLowerCase()).toContain('responsive');
      expect(result.fullPrompt.toLowerCase()).toContain('mobile');
    });

    it('should include accessibility compliance', async () => {
      const testInput = industryTestData.portfolio;
      const result = await generatePrompt(testInput);

      expect(result.fullPrompt.toLowerCase()).toContain('accessibility');
      expect(result.fullPrompt).toContain('WCAG');
      expect(result.fullPrompt).toContain('2.1 AA');
    });

    it('should include performance optimization guidelines', async () => {
      const testInput = industryTestData.startup;
      const result = await generatePrompt(testInput);

      expect(result.fullPrompt.toLowerCase()).toContain('performance');
      expect(result.fullPrompt.toLowerCase()).toContain('optimization');
      expect(result.fullPrompt.toLowerCase()).toContain('loading');
    });

    it('should include SEO best practices', async () => {
      const testInput = industryTestData.corporate;
      const result = await generatePrompt(testInput);

      expect(result.fullPrompt.toLowerCase()).toContain('seo');
      expect(result.fullPrompt.toLowerCase()).toContain('search engine');
    });

    it('should include component-based architecture guidance', async () => {
      const testInput = industryTestData.agency;
      const result = await generatePrompt(testInput);

      expect(result.fullPrompt.toLowerCase()).toContain('component');
      expect(result.fullPrompt.toLowerCase()).toContain('architecture');
      expect(result.fullPrompt.toLowerCase()).toContain('reusable');
    });

    it('should include error handling and loading states', async () => {
      const testInput = industryTestData.saas;
      const result = await generatePrompt(testInput);

      expect(result.fullPrompt.toLowerCase()).toContain('error handling');
      expect(result.fullPrompt.toLowerCase()).toContain('loading states');
    });
  });

  describe('Industry-Specific V0 Optimizations', () => {
    it('should generate SaaS-optimized prompts for V0', async () => {
      const testInput = industryTestData.saas;
      const result = await generatePrompt(testInput);

      const saasFeatures = [
        'dashboard',
        'authentication',
        'billing',
        'analytics',
        'user management',
      ];
      const promptLower = result.fullPrompt.toLowerCase();

      saasFeatures.forEach((feature) => {
        expect(promptLower).toContain(feature);
      });

      // Should include SaaS-specific technical requirements
      expect(promptLower).toContain('user roles');
      expect(promptLower).toContain('subscription');
    });

    it('should generate e-commerce-optimized prompts for V0', async () => {
      const testInput = industryTestData.ecommerce;
      const result = await generatePrompt(testInput);

      const ecommerceFeatures = [
        'product catalog',
        'shopping cart',
        'payment',
        'checkout',
        'inventory',
      ];
      const promptLower = result.fullPrompt.toLowerCase();

      ecommerceFeatures.forEach((feature) => {
        expect(promptLower).toContain(feature);
      });

      // Should include e-commerce-specific technical requirements
      expect(promptLower).toContain('payment gateway');
      expect(promptLower).toContain('product management');
    });

    it('should generate portfolio-optimized prompts for V0', async () => {
      const testInput = industryTestData.portfolio;
      const result = await generatePrompt(testInput);

      const portfolioFeatures = [
        'gallery',
        'showcase',
        'contact',
        'about',
        'projects',
      ];
      const promptLower = result.fullPrompt.toLowerCase();

      portfolioFeatures.forEach((feature) => {
        expect(promptLower).toContain(feature);
      });

      // Should include portfolio-specific technical requirements
      expect(promptLower).toContain('image optimization');
      expect(promptLower).toContain('portfolio management');
    });

    it('should generate corporate-optimized prompts for V0', async () => {
      const testInput = industryTestData.corporate;
      const result = await generatePrompt(testInput);

      const corporateFeatures = [
        'team',
        'services',
        'case studies',
        'contact',
        'about',
      ];
      const promptLower = result.fullPrompt.toLowerCase();

      corporateFeatures.forEach((feature) => {
        expect(promptLower).toContain(feature);
      });

      // Should include corporate-specific technical requirements
      expect(promptLower).toContain('content management');
      expect(promptLower).toContain('professional');
    });
  });

  describe('V0 Prompt Quality and Completeness', () => {
    it('should generate comprehensive prompts with sufficient detail', async () => {
      const testInput = industryTestData.startup;
      const result = await generatePrompt(testInput);

      // Prompt should be comprehensive (minimum length)
      expect(result.fullPrompt.length).toBeGreaterThan(500);

      // Should have detailed sections
      const sections = result.fullPrompt.split('## ');
      expect(sections.length).toBeGreaterThan(5);

      // Each section should have meaningful content
      sections.slice(1).forEach((section) => {
        const content = section.split('\n').slice(1).join('\n').trim();
        expect(content.length).toBeGreaterThan(20);
      });
    });

    it('should generate actionable implementation guidance', async () => {
      const testInput = industryTestData.agency;
      const result = await generatePrompt(testInput);

      // Should include specific implementation notes
      expect(result.fullPrompt).toContain('Implementation Notes');

      const implementationSection = result.fullPrompt.match(
        /## Implementation Notes\n([\s\S]*?)(?=\n## |$)/
      );
      expect(implementationSection).toBeTruthy();

      if (implementationSection) {
        const implementationContent = implementationSection[1];
        expect(implementationContent).toContain('NextJS');
        expect(implementationContent).toContain('TypeScript');
        expect(implementationContent).toContain('component');
      }
    });

    it('should include clear design guidelines for V0', async () => {
      const testInput = industryTestData.corporate;
      const result = await generatePrompt(testInput);

      // Should include design guidelines section
      expect(result.fullPrompt).toContain('Design Guidelines');

      const designSection = result.fullPrompt.match(
        /## Design Guidelines\n([\s\S]*?)(?=\n## |$)/
      );
      expect(designSection).toBeTruthy();

      if (designSection) {
        const designContent = designSection[1];
        expect(designContent.toLowerCase()).toContain('modern');
        expect(designContent.toLowerCase()).toContain('professional');
        expect(designContent.toLowerCase()).toContain('ui/ux');
      }
    });

    it('should generate prompts that are ready for immediate V0 use', async () => {
      const testInput = industryTestData.saas;
      const result = await generatePrompt(testInput);

      // Should be copy-paste ready
      expect(result.fullPrompt).toMatch(/^# .+/); // Proper title
      expect(result.fullPrompt).not.toContain('TODO'); // No placeholders
      expect(result.fullPrompt).not.toContain('[PLACEHOLDER]'); // No placeholders
      expect(result.fullPrompt).not.toContain('{{'); // No template variables

      // Should include V0 compatibility note
      expect(result.fullPrompt.toLowerCase()).toContain('v0');
    });

    it('should maintain consistency across multiple generations', async () => {
      const testInput = industryTestData.ecommerce;
      const results: GeneratedPrompt[] = [];

      // Generate multiple prompts for the same input
      for (let i = 0; i < 3; i++) {
        const result = await generatePrompt(testInput);
        results.push(result);
      }

      // All should have consistent structure
      results.forEach((result) => {
        V0_REQUIRED_SECTIONS.forEach((section) => {
          expect(result.fullPrompt).toContain(section);
        });

        V0_REQUIRED_TECHNOLOGIES.forEach((tech) => {
          expect(result.fullPrompt).toContain(tech);
        });
      });

      // Should have similar quality metrics
      const lengths = results.map((r) => r.fullPrompt.length);
      const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;

      lengths.forEach((length) => {
        expect(Math.abs(length - avgLength) / avgLength).toBeLessThan(0.5); // Within 50% of average
      });
    });
  });

  describe('Performance Requirements for V0 Compatibility', () => {
    it('should generate V0-compatible prompts within time limits', async () => {
      const testInput = industryTestData.portfolio;

      const startTime = Date.now();
      const result = await generatePrompt(testInput);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(30000); // Requirement 1.1

      // Should still be V0-compatible despite time constraints
      V0_REQUIRED_SECTIONS.forEach((section) => {
        expect(result.fullPrompt).toContain(section);
      });
    });

    it('should handle concurrent V0 prompt generation efficiently', async () => {
      const testInputs = Object.values(industryTestData).slice(0, 3);

      const startTime = Date.now();
      const promises = testInputs.map((input) => generatePrompt(input));
      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(3);
      expect(endTime - startTime).toBeLessThan(45000);

      // All results should be V0-compatible
      results.forEach((result) => {
        V0_REQUIRED_SECTIONS.forEach((section) => {
          expect(result.fullPrompt).toContain(section);
        });
      });
    });
  });
});
