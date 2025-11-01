/**
 * Integration Tests for AI Workflow React Components
 *
 * This test suite covers the React components involved in the AI workflow:
 * - GenerationEngine component integration with AI services
 * - PromptGenerator component end-to-end workflow
 * - Error handling and user feedback in UI components
 * - Real-time progress updates and user interactions
 *
 * Requirements: 1.1, 1.2, 1.3, 2.1
 */

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import GenerationEngine from '../GenerationEngine';
import PromptGenerator from '../PromptGenerator';
import { promptGenerationService } from '@/lib/prompt-generation-service';
import { ApiError } from '@/lib/error-handling';
import { UserInput, GeneratedPrompt } from '@/types';

// Mock the prompt generation service
jest.mock('@/lib/prompt-generation-service', () => ({
  promptGenerationService: {
    generatePrompt: jest.fn(),
    checkServiceHealth: jest.fn(),
  },
}));

// Mock the error handling hook
jest.mock('@/hooks/useErrorHandling', () => ({
  useErrorHandling: () => ({
    executeWithErrorHandling: jest.fn((fn, options) => {
      return fn()
        .then(options?.onSuccess)
        .catch((error) => {
          if (options?.onRetry) options.onRetry(1);
          throw error;
        });
    }),
    networkStatus: {
      isOnline: true,
      isSlowConnection: false,
    },
  }),
}));

// Mock the network status hook
jest.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
    isSlowConnection: false,
    connectionType: 'wifi',
  }),
}));

describe('AI Workflow Components Integration Tests', () => {
  const mockPromptGenerationService = promptGenerationService;

  const validUserInput = {
    websiteName: 'TechFlow Solutions',
    industry: 'saas',
    aboutInfo:
      'A modern SaaS platform for project management and team collaboration',
    additionalRequirements:
      'Include dashboard, user management, and real-time notifications',
  };

  const mockGeneratedPrompt = {
    title: 'TechFlow Solutions - Software as a Service Website',
    description:
      'Create a modern, professional software as a service website for TechFlow Solutions.',
    context:
      'Industry: Software as a Service\nPurpose: A modern SaaS platform for project management\nTarget Audience: Business professionals',
    technicalSpecs:
      '- NextJS 14 with App Router\n- TypeScript for type safety\n- Tailwind CSS for styling',
    industryFeatures: [
      'User Dashboard',
      'Team Collaboration',
      'Real-time Notifications',
      'Project Management',
    ],
    fullPrompt: `# TechFlow Solutions - Software as a Service Website

## Description
Create a modern, professional software as a service website for TechFlow Solutions. A modern SaaS platform for project management and team collaboration

## Context
Industry: Software as a Service
Purpose: A modern SaaS platform for project management
Target Audience: Business professionals

## Technical Requirements
- NextJS 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling

## Key Features
- User Dashboard
- Team Collaboration
- Real-time Notifications
- Project Management

## Design Guidelines
- Follow software as a service industry best practices
- Use modern, responsive design principles
- Implement clean, professional UI/UX
- Ensure accessibility compliance (WCAG 2.1 AA)
- Optimize for performance and SEO

## Implementation Notes
- Use NextJS 14 with App Router for optimal performance
- Implement TypeScript for type safety
- Use Tailwind CSS for consistent styling
- Follow component-based architecture
- Include proper error handling and loading states`,
    explanation: {
      sections: {
        description: 'AI-enhanced description based on industry context',
        context: 'Enriched context using industry knowledge',
        technicalSpecs: 'Technical requirements optimized for SaaS',
        features: 'Industry-specific features selected based on context',
      },
      reasoning: 'This prompt was generated using AI context enrichment.',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('GenerationEngine Component Integration', () => {
    it('should complete full generation workflow with progress updates', async () => {
      // Mock successful generation
      mockPromptGenerationService.generatePrompt.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockGeneratedPrompt), 2000);
          })
      );

      const mockOnGenerated = jest.fn();
      const mockOnError = jest.fn();
      const mockOnProgress = jest.fn();

      render(
        <GenerationEngine
          userInput={validUserInput}
          onGenerated={mockOnGenerated}
          onError={mockOnError}
          onProgress={mockOnProgress}
        />
      );

      // Should show initial progress stage
      expect(screen.getByText('Generating Your V0 Prompt')).toBeInTheDocument();
      expect(screen.getByText('Validating input data')).toBeInTheDocument();

      // Fast-forward through the generation process
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(mockOnGenerated).toHaveBeenCalledWith(mockGeneratedPrompt);
      });

      // Verify progress callback was called
      expect(mockOnProgress).toHaveBeenCalled();
    });

    it('should handle AI service errors with proper user feedback', async () => {
      // Mock AI service error
      const aiError = new ApiError(
        'AI service temporarily unavailable',
        'AI_SERVICE_ERROR',
        503
      );
      mockPromptGenerationService.generatePrompt.mockRejectedValue(aiError);

      const mockOnGenerated = jest.fn();
      const mockOnError = jest.fn();

      render(
        <GenerationEngine
          userInput={validUserInput}
          onGenerated={mockOnGenerated}
          onError={mockOnError}
        />
      );

      // Fast-forward through the generation attempt
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Generation Failed')).toBeInTheDocument();
      });

      // Should show retry option
      expect(screen.getByText('Retry Generation')).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalled();
    });

    it('should show different progress stages during generation', async () => {
      // Mock slow generation to observe stages
      mockPromptGenerationService.generatePrompt.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockGeneratedPrompt), 5000);
          })
      );

      const mockOnGenerated = jest.fn();
      const mockOnError = jest.fn();

      render(
        <GenerationEngine
          userInput={validUserInput}
          onGenerated={mockOnGenerated}
          onError={mockOnError}
        />
      );

      // Check initial stage
      expect(screen.getByText('Validating input data')).toBeInTheDocument();

      // Advance to next stage
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(
          screen.getByText('Loading industry context')
        ).toBeInTheDocument();
      });

      // Advance to AI processing stage
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Processing with AI')).toBeInTheDocument();
      });

      // Complete generation
      act(() => {
        jest.advanceTimersByTime(4000);
      });

      await waitFor(() => {
        expect(mockOnGenerated).toHaveBeenCalled();
      });
    });

    it('should handle retry logic correctly', async () => {
      let attemptCount = 0;
      mockPromptGenerationService.generatePrompt.mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          return Promise.reject(new Error('Temporary network error'));
        }
        return Promise.resolve(mockGeneratedPrompt);
      });

      const mockOnGenerated = jest.fn();
      const mockOnError = jest.fn();

      render(
        <GenerationEngine
          userInput={validUserInput}
          onGenerated={mockOnGenerated}
          onError={mockOnError}
        />
      );

      // Fast-forward through initial attempt and retry
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockOnGenerated).toHaveBeenCalledWith(mockGeneratedPrompt);
      });

      expect(attemptCount).toBe(2); // Should have retried once
    });

    it('should validate input before starting generation', async () => {
      const invalidInput: UserInput = {
        websiteName: '',
        industry: '',
        aboutInfo: '',
      };

      const mockOnGenerated = jest.fn();
      const mockOnError = jest.fn();

      render(
        <GenerationEngine
          userInput={invalidInput}
          onGenerated={mockOnGenerated}
          onError={mockOnError}
        />
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Generation Failed')).toBeInTheDocument();
      });

      expect(mockOnError).toHaveBeenCalled();
      expect(mockOnGenerated).not.toHaveBeenCalled();
    });
  });

  describe('PromptGenerator Component Integration', () => {
    it('should complete full user workflow from input to output', async () => {
      mockPromptGenerationService.generatePrompt.mockResolvedValue(
        mockGeneratedPrompt
      );

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<PromptGenerator />);

      // Fill in the form
      const websiteNameInput = screen.getByLabelText(/website name/i);
      const industrySelect = screen.getByLabelText(/industry/i);
      const aboutTextarea = screen.getByLabelText(/about/i);

      await user.type(websiteNameInput, validUserInput.websiteName);
      await user.selectOptions(industrySelect, validUserInput.industry);
      await user.type(aboutTextarea, validUserInput.aboutInfo);

      // Submit the form
      const generateButton = screen.getByRole('button', {
        name: /generate prompt/i,
      });
      await user.click(generateButton);

      // Should show generation progress
      expect(screen.getByText('Generating Your V0 Prompt')).toBeInTheDocument();

      // Fast-forward through generation
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Should show the generated prompt
      await waitFor(() => {
        expect(screen.getByText(mockGeneratedPrompt.title)).toBeInTheDocument();
      });

      expect(screen.getByText(/copy to clipboard/i)).toBeInTheDocument();
    });

    it('should handle form validation errors', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<PromptGenerator />);

      // Try to submit empty form
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

      expect(mockPromptGenerationService.generatePrompt).not.toHaveBeenCalled();
    });

    it('should allow editing of generated prompt', async () => {
      mockPromptGenerationService.generatePrompt.mockResolvedValue(
        mockGeneratedPrompt
      );

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<PromptGenerator />);

      // Complete generation workflow (simplified)
      const websiteNameInput = screen.getByLabelText(/website name/i);
      await user.type(websiteNameInput, validUserInput.websiteName);

      const industrySelect = screen.getByLabelText(/industry/i);
      await user.selectOptions(industrySelect, validUserInput.industry);

      const aboutTextarea = screen.getByLabelText(/about/i);
      await user.type(aboutTextarea, validUserInput.aboutInfo);

      const generateButton = screen.getByRole('button', {
        name: /generate prompt/i,
      });
      await user.click(generateButton);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Wait for prompt to be generated and displayed
      await waitFor(() => {
        expect(screen.getByText(mockGeneratedPrompt.title)).toBeInTheDocument();
      });

      // Find and click edit button
      const editButton = screen.getByRole('button', { name: /edit prompt/i });
      await user.click(editButton);

      // Should show editable textarea
      const editTextarea = screen.getByRole('textbox', {
        name: /edit prompt/i,
      });
      expect(editTextarea).toBeInTheDocument();
      expect(editTextarea).toHaveValue(mockGeneratedPrompt.fullPrompt);

      // Make an edit
      await user.clear(editTextarea);
      await user.type(editTextarea, 'Modified prompt content');

      // Save changes
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Should show updated content
      expect(screen.getByText('Modified prompt content')).toBeInTheDocument();
    });

    it('should handle copy to clipboard functionality', async () => {
      mockPromptGenerationService.generatePrompt.mockResolvedValue(
        mockGeneratedPrompt
      );

      // Mock clipboard API
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<PromptGenerator />);

      // Complete generation workflow (simplified)
      const websiteNameInput = screen.getByLabelText(/website name/i);
      await user.type(websiteNameInput, validUserInput.websiteName);

      const industrySelect = screen.getByLabelText(/industry/i);
      await user.selectOptions(industrySelect, validUserInput.industry);

      const aboutTextarea = screen.getByLabelText(/about/i);
      await user.type(aboutTextarea, validUserInput.aboutInfo);

      const generateButton = screen.getByRole('button', {
        name: /generate prompt/i,
      });
      await user.click(generateButton);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText(mockGeneratedPrompt.title)).toBeInTheDocument();
      });

      // Click copy button
      const copyButton = screen.getByRole('button', {
        name: /copy to clipboard/i,
      });
      await user.click(copyButton);

      // Should call clipboard API
      expect(mockWriteText).toHaveBeenCalledWith(
        mockGeneratedPrompt.fullPrompt
      );

      // Should show success feedback
      await waitFor(() => {
        expect(screen.getByText(/copied to clipboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery and User Experience', () => {
    it('should handle network connectivity issues', async () => {
      // Mock network error
      const networkError = new Error('Network request failed');
      mockPromptGenerationService.generatePrompt.mockRejectedValue(
        networkError
      );

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<PromptGenerator />);

      // Complete form and submit
      const websiteNameInput = screen.getByLabelText(/website name/i);
      await user.type(websiteNameInput, validUserInput.websiteName);

      const industrySelect = screen.getByLabelText(/industry/i);
      await user.selectOptions(industrySelect, validUserInput.industry);

      const aboutTextarea = screen.getByLabelText(/about/i);
      await user.type(aboutTextarea, validUserInput.aboutInfo);

      const generateButton = screen.getByRole('button', {
        name: /generate prompt/i,
      });
      await user.click(generateButton);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Should show network error message
      await waitFor(() => {
        expect(screen.getByText(/network/i)).toBeInTheDocument();
      });

      // Should offer retry option
      expect(
        screen.getByRole('button', { name: /retry/i })
      ).toBeInTheDocument();
    });

    it('should provide helpful error messages for different failure types', async () => {
      const testCases = [
        {
          error: new ApiError('Rate limit exceeded', 'RATE_LIMIT_ERROR', 429),
          expectedMessage: /rate limit/i,
        },
        {
          error: new ApiError(
            'Service temporarily unavailable',
            'SERVICE_UNAVAILABLE',
            503
          ),
          expectedMessage: /temporarily unavailable/i,
        },
        {
          error: new ApiError('Invalid API key', 'AUTHENTICATION_ERROR', 401),
          expectedMessage: /authentication/i,
        },
      ];

      for (const testCase of testCases) {
        mockPromptGenerationService.generatePrompt.mockRejectedValue(
          testCase.error
        );

        const { unmount } = render(
          <GenerationEngine
            userInput={validUserInput}
            onGenerated={jest.fn()}
            onError={jest.fn()}
          />
        );

        act(() => {
          jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
          expect(
            screen.getByText(testCase.expectedMessage)
          ).toBeInTheDocument();
        });

        unmount();
      }
    });

    it('should maintain user input during error recovery', async () => {
      // Mock initial failure then success
      let callCount = 0;
      mockPromptGenerationService.generatePrompt.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Temporary error'));
        }
        return Promise.resolve(mockGeneratedPrompt);
      });

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<PromptGenerator />);

      // Fill form
      const websiteNameInput = screen.getByLabelText(/website name/i);
      await user.type(websiteNameInput, validUserInput.websiteName);

      const industrySelect = screen.getByLabelText(/industry/i);
      await user.selectOptions(industrySelect, validUserInput.industry);

      const aboutTextarea = screen.getByLabelText(/about/i);
      await user.type(aboutTextarea, validUserInput.aboutInfo);

      // Submit and get error
      const generateButton = screen.getByRole('button', {
        name: /generate prompt/i,
      });
      await user.click(generateButton);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/generation failed/i)).toBeInTheDocument();
      });

      // Retry should work with same input
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText(mockGeneratedPrompt.title)).toBeInTheDocument();
      });

      // Verify the form inputs are still there
      expect(websiteNameInput).toHaveValue(validUserInput.websiteName);
      expect(industrySelect).toHaveValue(validUserInput.industry);
      expect(aboutTextarea).toHaveValue(validUserInput.aboutInfo);
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should provide proper ARIA labels and roles', async () => {
      mockPromptGenerationService.generatePrompt.mockResolvedValue(
        mockGeneratedPrompt
      );

      render(
        <GenerationEngine
          userInput={validUserInput}
          onGenerated={jest.fn()}
          onError={jest.fn()}
        />
      );

      // Check for progress indicators with proper ARIA attributes
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label');
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should announce progress updates to screen readers', async () => {
      mockPromptGenerationService.generatePrompt.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockGeneratedPrompt), 2000);
          })
      );

      render(
        <GenerationEngine
          userInput={validUserInput}
          onGenerated={jest.fn()}
          onError={jest.fn()}
        />
      );

      // Check for live regions
      const liveRegions = screen.getAllByRole('status', { hidden: true });
      expect(liveRegions.length).toBeGreaterThan(0);
    });

    it('should handle keyboard navigation properly', async () => {
      mockPromptGenerationService.generatePrompt.mockResolvedValue(
        mockGeneratedPrompt
      );

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<PromptGenerator />);

      // Test tab navigation through form
      await user.tab();
      expect(screen.getByLabelText(/website name/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/industry/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/about/i)).toHaveFocus();

      await user.tab();
      expect(
        screen.getByRole('button', { name: /generate prompt/i })
      ).toHaveFocus();
    });
  });
});
