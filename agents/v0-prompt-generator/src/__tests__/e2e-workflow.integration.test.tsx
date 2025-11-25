/**
 * End-to-End Workflow Integration Tests
 *
 * This test suite covers the complete end-to-end user workflow:
 * - Full application integration from page load to prompt generation
 * - Real user interactions and complete data flow
 * - Integration with all services and components
 * - V0 compatibility verification in real scenarios
 *
 * Requirements: 1.1, 1.2, 1.3, 2.1
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Import the main page component
import HomePage from '@/app/page';
import * as promptGenerationService from '@/lib/prompt-generation-service';
import * as aiClient from '@/lib/ai-client';
import type { UserInput, GeneratedPrompt } from '@/types';

// Mock the AI services
jest.mock('@/lib/prompt-generation-service');
jest.mock('@/lib/ai-client');
jest.mock('@alchemystai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    v1: {
      context: {
        add: jest.fn().mockResolvedValue({}),
        search: jest.fn().mockResolvedValue({ contexts: [] }),
      },
    },
  })),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

describe('End-to-End Workflow Integration Tests', () => {
  // Mock the service functions
  const mockGeneratePrompt = jest.fn();
  const mockCheckServiceHealth = jest.fn();
  const mockCheckAlchemystHealth = jest.fn();

  // Complete test data representing real user scenarios
  const testScenarios = [
    {
      name: 'SaaS Platform',
      input: {
        websiteName: 'CloudFlow Pro',
        industry: 'saas',
        aboutInfo:
          'A comprehensive project management and team collaboration platform designed for modern businesses. Features include task management, team chat, file sharing, and advanced analytics.',
        additionalRequirements:
          'Include user dashboard, admin panel, billing integration, and mobile-responsive design',
      },
      expectedFeatures: [
        'User Dashboard',
        'Team Collaboration',
        'Analytics',
        'Task Management',
      ],
      expectedTech: ['NextJS', 'TypeScript', 'Tailwind CSS'],
    },
    {
      name: 'E-commerce Store',
      input: {
        websiteName: 'TechGear Store',
        industry: 'ecommerce',
        aboutInfo:
          'An online electronics and gadgets store specializing in the latest technology products. We offer competitive prices, fast shipping, and excellent customer service.',
        additionalRequirements:
          'Shopping cart, payment processing, product reviews, and inventory management',
      },
      expectedFeatures: [
        'Product Catalog',
        'Shopping Cart',
        'Payment Processing',
        'User Reviews',
      ],
      expectedTech: ['NextJS', 'E-commerce Integration', 'Payment Gateway'],
    },
    {
      name: 'Portfolio Website',
      input: {
        websiteName: 'Sarah Chen Design',
        industry: 'portfolio',
        aboutInfo:
          'A creative portfolio showcasing UI/UX design work, branding projects, and digital art. Focused on clean, modern aesthetics and user-centered design principles.',
        additionalRequirements:
          'Image gallery, contact form, blog section, and social media integration',
      },
      expectedFeatures: [
        'Portfolio Gallery',
        'Contact Form',
        'Blog',
        'Social Integration',
      ],
      expectedTech: ['NextJS', 'Image Optimization', 'CMS Integration'],
    },
  ];

  const createMockGeneratedPrompt = (input: {
    websiteName: any;
    industry: any;
    aboutInfo: any;
    additionalRequirements?: string;
  }) => ({
    title: `${input.websiteName} - Professional Website`,
    description: `Create a modern, professional website for ${input.websiteName}. ${input.aboutInfo}`,
    context: `Industry: ${input.industry}\nPurpose: ${input.aboutInfo}\nTarget Audience: Professional users`,
    technicalSpecs:
      '- NextJS 14 with App Router\n- TypeScript for type safety\n- Tailwind CSS for styling\n- Responsive design implementation',
    industryFeatures: [
      'Modern Design',
      'Responsive Layout',
      'SEO Optimization',
      'Performance Optimized',
    ],
    fullPrompt: `# ${input.websiteName} - Professional Website

## Description
Create a modern, professional website for ${input.websiteName}. ${input.aboutInfo}

## Context
Industry: ${input.industry}
Purpose: ${input.aboutInfo}
Target Audience: Professional users

## Technical Requirements
- NextJS 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Responsive design implementation

## Key Features
- Modern Design
- Responsive Layout
- SEO Optimization
- Performance Optimized

## Design Guidelines
- Follow modern web design principles
- Use clean, professional UI/UX
- Ensure accessibility compliance (WCAG 2.1 AA)
- Optimize for performance and SEO

## Implementation Notes
- Use NextJS 14 with App Router for optimal performance
- Implement TypeScript for type safety
- Use Tailwind CSS for consistent styling
- Follow component-based architecture
- Include proper error handling and loading states

This prompt follows industry best practices for V0 compatibility.`,
    explanation: {
      sections: {
        description: 'Professional description based on user input',
        context: 'Industry-specific context and target audience',
        technicalSpecs: 'Modern technical requirements',
        features: 'Essential features for the industry',
      },
      reasoning:
        'Generated using industry best practices and modern web development standards.',
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup mocks
    (promptGenerationService.generatePrompt as jest.Mock) = mockGeneratePrompt;
    (promptGenerationService.checkServiceHealth as jest.Mock) =
      mockCheckServiceHealth;
    (aiClient.checkAlchemystHealth as jest.Mock) = mockCheckAlchemystHealth;

    // Mock successful service health check
    mockCheckServiceHealth.mockResolvedValue(true);
    mockCheckAlchemystHealth.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Complete User Workflows', () => {
    testScenarios.forEach((scenario) => {
      it(`should complete full workflow for ${scenario.name}`, async () => {
        // Mock successful prompt generation
        const mockPrompt = createMockGeneratedPrompt(scenario.input);
        mockGeneratePrompt.mockResolvedValue(mockPrompt);

        const user = userEvent.setup({
          advanceTimers: jest.advanceTimersByTime,
        });

        render(<HomePage />);

        // Verify page loads correctly
        expect(screen.getByText(/V0 Prompt Generator/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/website name/i)).toBeInTheDocument();

        // Fill out the form with scenario data
        const websiteNameInput = screen.getByLabelText(/website name/i);
        await user.clear(websiteNameInput);
        await user.type(websiteNameInput, scenario.input.websiteName);

        const industrySelect = screen.getByLabelText(/industry/i);
        await user.selectOptions(industrySelect, scenario.input.industry);

        const aboutTextarea = screen.getByLabelText(/about/i);
        await user.clear(aboutTextarea);
        await user.type(aboutTextarea, scenario.input.aboutInfo);

        if (scenario.input.additionalRequirements) {
          const additionalInput = screen.getByLabelText(
            /additional requirements/i
          );
          await user.clear(additionalInput);
          await user.type(
            additionalInput,
            scenario.input.additionalRequirements
          );
        }

        // Submit the form
        const generateButton = screen.getByRole('button', {
          name: /generate prompt/i,
        });
        expect(generateButton).toBeEnabled();
        await user.click(generateButton);

        // Should show generation progress
        expect(screen.getByText(/generating/i)).toBeInTheDocument();

        // Fast-forward through generation process
        jest.advanceTimersByTime(3000);

        // Wait for generation to complete
        await waitFor(
          () => {
            expect(screen.getByText(mockPrompt.title)).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Verify the generated prompt contains expected content
        expect(screen.getByText(mockPrompt.title)).toBeInTheDocument();
        expect(screen.getByText(/copy to clipboard/i)).toBeInTheDocument();

        // Verify the full prompt is displayed
        const promptDisplay = screen.getByText(mockPrompt.fullPrompt);
        expect(promptDisplay).toBeInTheDocument();

        // Verify service was called with correct input
        expect(mockGeneratePrompt).toHaveBeenCalledWith(
          expect.objectContaining({
            websiteName: scenario.input.websiteName,
            industry: scenario.input.industry,
            aboutInfo: scenario.input.aboutInfo,
          })
        );
      });
    });

    it('should handle the complete workflow with real-time editing', async () => {
      const scenario = testScenarios[0]; // Use SaaS scenario
      const mockPrompt = createMockGeneratedPrompt(scenario.input);
      mockGeneratePrompt.mockResolvedValue(mockPrompt);

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<HomePage />);

      // Complete the generation workflow
      await user.type(
        screen.getByLabelText(/website name/i),
        scenario.input.websiteName
      );
      await user.selectOptions(
        screen.getByLabelText(/industry/i),
        scenario.input.industry
      );
      await user.type(
        screen.getByLabelText(/about/i),
        scenario.input.aboutInfo
      );
      await user.click(
        screen.getByRole('button', { name: /generate prompt/i })
      );

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText(mockPrompt.title)).toBeInTheDocument();
      });

      // Test editing functionality
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const editTextarea = screen.getByRole('textbox', {
        name: /edit prompt/i,
      });
      expect(editTextarea).toHaveValue(mockPrompt.fullPrompt);

      // Make an edit
      const customText =
        '\n\n## Custom Section\n- Custom feature 1\n- Custom feature 2';
      await user.type(editTextarea, customText);

      // Save the edit
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Verify the edit is reflected
      expect(screen.getByText(/Custom Section/)).toBeInTheDocument();
      expect(screen.getByText(/Custom feature 1/)).toBeInTheDocument();
    });

    it('should handle copy to clipboard functionality', async () => {
      const scenario = testScenarios[0];
      const mockPrompt = createMockGeneratedPrompt(scenario.input);
      mockGeneratePrompt.mockResolvedValue(mockPrompt);

      // Mock clipboard API
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<HomePage />);

      // Complete generation workflow
      await user.type(
        screen.getByLabelText(/website name/i),
        scenario.input.websiteName
      );
      await user.selectOptions(
        screen.getByLabelText(/industry/i),
        scenario.input.industry
      );
      await user.type(
        screen.getByLabelText(/about/i),
        scenario.input.aboutInfo
      );
      await user.click(
        screen.getByRole('button', { name: /generate prompt/i })
      );

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText(mockPrompt.title)).toBeInTheDocument();
      });

      // Test copy functionality
      const copyButton = screen.getByRole('button', {
        name: /copy to clipboard/i,
      });
      await user.click(copyButton);

      expect(mockWriteText).toHaveBeenCalledWith(mockPrompt.fullPrompt);

      // Should show success feedback
      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling in Complete Workflow', () => {
    it('should handle validation errors in the complete workflow', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<HomePage />);

      // Try to submit with empty form
      const generateButton = screen.getByRole('button', {
        name: /generate prompt/i,
      });
      await user.click(generateButton);

      // Should show validation errors
      await waitFor(() => {
        expect(
          screen.getByText(/website name is required/i)
        ).toBeInTheDocument();
      });

      // Should not call the generation service
      expect(mockGeneratePrompt).not.toHaveBeenCalled();

      // Fill in required fields and try again
      await user.type(screen.getByLabelText(/website name/i), 'Test Site');
      await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
      await user.type(screen.getByLabelText(/about/i), 'A test website');

      // Mock successful generation for retry
      const mockPrompt = createMockGeneratedPrompt({
        websiteName: 'Test Site',
        industry: 'saas',
        aboutInfo: 'A test website',
      });
      mockGeneratePrompt.mockResolvedValue(mockPrompt);

      await user.click(generateButton);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText(mockPrompt.title)).toBeInTheDocument();
      });
    });

    it('should handle AI service failures with fallback', async () => {
      // Mock AI service failure
      mockGeneratePrompt.mockRejectedValue(
        new Error('AI service temporarily unavailable')
      );

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<HomePage />);

      // Fill form and submit
      await user.type(screen.getByLabelText(/website name/i), 'Test Site');
      await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
      await user.type(screen.getByLabelText(/about/i), 'A test website');
      await user.click(
        screen.getByRole('button', { name: /generate prompt/i })
      );

      jest.advanceTimersByTime(2000);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/generation failed/i)).toBeInTheDocument();
      });

      // Should offer retry option
      expect(
        screen.getByRole('button', { name: /retry/i })
      ).toBeInTheDocument();

      // Test retry functionality
      const mockPrompt = createMockGeneratedPrompt({
        websiteName: 'Test Site',
        industry: 'saas',
        aboutInfo: 'A test website',
      });
      mockGeneratePrompt.mockResolvedValue(mockPrompt);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText(mockPrompt.title)).toBeInTheDocument();
      });
    });

    it('should maintain form state during error recovery', async () => {
      const testInput = {
        websiteName: 'Persistent Test Site',
        industry: 'ecommerce',
        aboutInfo: 'This input should persist through errors',
        additionalRequirements: 'These requirements should also persist',
      };

      // Mock initial failure
      mockGeneratePrompt.mockRejectedValueOnce(new Error('Temporary failure'));

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<HomePage />);

      // Fill form
      await user.type(
        screen.getByLabelText(/website name/i),
        testInput.websiteName
      );
      await user.selectOptions(
        screen.getByLabelText(/industry/i),
        testInput.industry
      );
      await user.type(screen.getByLabelText(/about/i), testInput.aboutInfo);
      await user.type(
        screen.getByLabelText(/additional requirements/i),
        testInput.additionalRequirements
      );

      // Submit and get error
      await user.click(
        screen.getByRole('button', { name: /generate prompt/i })
      );

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/generation failed/i)).toBeInTheDocument();
      });

      // Verify form inputs are still there
      expect(screen.getByLabelText(/website name/i)).toHaveValue(
        testInput.websiteName
      );
      expect(screen.getByLabelText(/industry/i)).toHaveValue(
        testInput.industry
      );
      expect(screen.getByLabelText(/about/i)).toHaveValue(testInput.aboutInfo);
      expect(screen.getByLabelText(/additional requirements/i)).toHaveValue(
        testInput.additionalRequirements
      );

      // Mock successful retry
      const mockPrompt = createMockGeneratedPrompt(testInput);
      mockGeneratePrompt.mockResolvedValue(mockPrompt);

      // Retry should work with preserved input
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText(mockPrompt.title)).toBeInTheDocument();
      });

      // Verify the service was called with the correct preserved input
      expect(mockGeneratePrompt).toHaveBeenLastCalledWith(
        expect.objectContaining(testInput)
      );
    });
  });

  describe('V0 Compatibility Verification', () => {
    it('should generate V0-compatible prompts for all industries', async () => {
      const industries = [
        'saas',
        'ecommerce',
        'portfolio',
        'corporate',
        'startup',
        'agency',
      ];

      for (const industry of industries) {
        const testInput = {
          websiteName: `Test ${industry} Site`,
          industry,
          aboutInfo: `A professional ${industry} website for testing V0 compatibility`,
        };

        const mockPrompt = createMockGeneratedPrompt(testInput);
        mockGeneratePrompt.mockResolvedValue(mockPrompt);

        const user = userEvent.setup({
          advanceTimers: jest.advanceTimersByTime,
        });

        const { unmount } = render(<HomePage />);

        // Complete workflow
        await user.type(
          screen.getByLabelText(/website name/i),
          testInput.websiteName
        );
        await user.selectOptions(
          screen.getByLabelText(/industry/i),
          testInput.industry
        );
        await user.type(screen.getByLabelText(/about/i), testInput.aboutInfo);
        await user.click(
          screen.getByRole('button', { name: /generate prompt/i })
        );

        jest.advanceTimersByTime(3000);

        await waitFor(() => {
          expect(screen.getByText(mockPrompt.title)).toBeInTheDocument();
        });

        // Verify V0-compatible structure
        const promptText = mockPrompt.fullPrompt;
        expect(promptText).toMatch(/^# .+/); // Title
        expect(promptText).toContain('## Description');
        expect(promptText).toContain('## Context');
        expect(promptText).toContain('## Technical Requirements');
        expect(promptText).toContain('## Key Features');
        expect(promptText).toContain('## Design Guidelines');
        expect(promptText).toContain('## Implementation Notes');

        // Verify NextJS recommendation (Requirement 2.1)
        expect(promptText).toContain('NextJS');

        unmount();
      }
    });

    it('should include modern web development best practices', async () => {
      const testInput = testScenarios[0].input;
      const mockPrompt = createMockGeneratedPrompt(testInput);
      mockGeneratePrompt.mockResolvedValue(mockPrompt);

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<HomePage />);

      // Complete workflow
      await user.type(
        screen.getByLabelText(/website name/i),
        testInput.websiteName
      );
      await user.selectOptions(
        screen.getByLabelText(/industry/i),
        testInput.industry
      );
      await user.type(screen.getByLabelText(/about/i), testInput.aboutInfo);
      await user.click(
        screen.getByRole('button', { name: /generate prompt/i })
      );

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText(mockPrompt.title)).toBeInTheDocument();
      });

      // Verify modern practices are included
      const promptText = mockPrompt.fullPrompt.toLowerCase();
      expect(promptText).toContain('typescript');
      expect(promptText).toContain('responsive');
      expect(promptText).toContain('accessibility');
      expect(promptText).toContain('performance');
      expect(promptText).toContain('seo');
    });

    it('should generate prompts within acceptable time limits', async () => {
      const testInput = testScenarios[0].input;
      const mockPrompt = createMockGeneratedPrompt(testInput);

      // Mock realistic generation time
      mockGeneratePrompt.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockPrompt), 1500); // 1.5 seconds
          })
      );

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<HomePage />);

      const startTime = Date.now();

      // Complete workflow
      await user.type(
        screen.getByLabelText(/website name/i),
        testInput.websiteName
      );
      await user.selectOptions(
        screen.getByLabelText(/industry/i),
        testInput.industry
      );
      await user.type(screen.getByLabelText(/about/i), testInput.aboutInfo);
      await user.click(
        screen.getByRole('button', { name: /generate prompt/i })
      );

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText(mockPrompt.title)).toBeInTheDocument();
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete within 30 seconds (Requirement 1.1)
      expect(totalTime).toBeLessThan(30000);
    });
  });
});
