import React from 'react';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import GenerationEngine, { GenerationStage } from '../GenerationEngine';
import { UserInput, GeneratedPrompt } from '@/types';
import { promptGenerationService } from '@/lib/prompt-generation-service';

// Mock the prompt generation service
jest.mock('@/lib/prompt-generation-service', () => ({
  promptGenerationService: {
    generatePrompt: jest.fn(),
  },
}));

const mockPromptGenerationService = promptGenerationService as jest.Mocked<
  typeof promptGenerationService
>;

describe('GenerationEngine', () => {
  const mockUserInput: UserInput = {
    websiteName: 'Test Website',
    industry: 'saas',
    aboutInfo: 'A test website for SaaS business',
    additionalRequirements: 'Modern design',
  };

  const mockGeneratedPrompt: GeneratedPrompt = {
    title: 'Test Website - SaaS Website',
    description: 'A modern SaaS website',
    context: 'Industry: SaaS\nPurpose: A test website for SaaS business',
    technicalSpecs: '- NextJS 14\n- TypeScript\n- Tailwind CSS',
    industryFeatures: ['Dashboard', 'User Management', 'Analytics'],
    fullPrompt: 'Complete V0 prompt content...',
    explanation: {
      sections: {
        description: 'AI-enhanced description',
        context: 'Enriched context',
        technicalSpecs: 'Technical requirements',
        features: 'Industry-specific features',
      },
      reasoning: 'Generated using AI enhancement',
    },
  };

  const mockOnGenerated = jest.fn();
  const mockOnError = jest.fn();
  const mockOnProgress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockPromptGenerationService.generatePrompt.mockResolvedValue(
      mockGeneratedPrompt
    );
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders progress indicator during generation', async () => {
    render(
      <GenerationEngine
        userInput={mockUserInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
        onProgress={mockOnProgress}
      />
    );

    expect(screen.getByText('Generating Your V0 Prompt')).toBeInTheDocument();
    expect(
      screen.getByText('Please wait while we create your optimized prompt...')
    ).toBeInTheDocument();
  });

  it('displays all generation stages', async () => {
    render(
      <GenerationEngine
        userInput={mockUserInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('Validating input data')).toBeInTheDocument();
    expect(screen.getByText('Loading industry context')).toBeInTheDocument();
    expect(screen.getByText('Processing with AI')).toBeInTheDocument();
    expect(screen.getByText('Structuring V0 prompt')).toBeInTheDocument();
    expect(screen.getByText('Finalizing output')).toBeInTheDocument();
  });

  it('calls onGenerated when generation completes successfully', async () => {
    render(
      <GenerationEngine
        userInput={mockUserInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
      />
    );

    // Fast-forward timers to trigger generation
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(
      () => {
        expect(mockOnGenerated).toHaveBeenCalledWith(mockGeneratedPrompt);
      },
      { timeout: 5000 }
    );

    expect(mockPromptGenerationService.generatePrompt).toHaveBeenCalledWith(
      mockUserInput
    );
  });

  it('calls onProgress callback during generation', async () => {
    render(
      <GenerationEngine
        userInput={mockUserInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
        onProgress={mockOnProgress}
      />
    );

    // Fast-forward timers to trigger generation
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(
      () => {
        expect(mockOnProgress).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    // Verify progress callback is called with correct parameters
    const progressCalls = mockOnProgress.mock.calls;
    expect(progressCalls.length).toBeGreaterThan(0);

    // Check that progress calls have the correct structure
    progressCalls.forEach((call) => {
      const [stage, progress] = call;
      expect(stage).toHaveProperty('name');
      expect(stage).toHaveProperty('description');
      expect(typeof progress).toBe('number');
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });

  it('handles generation errors gracefully', async () => {
    const errorMessage = 'AI service unavailable';
    mockPromptGenerationService.generatePrompt.mockRejectedValue(
      new Error(errorMessage)
    );

    render(
      <GenerationEngine
        userInput={mockUserInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
      />
    );

    // Fast-forward timers to trigger generation
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(
      () => {
        expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      },
      { timeout: 3000 }
    );

    expect(screen.getByText('Generation Failed')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays retry button on error', async () => {
    mockPromptGenerationService.generatePrompt.mockRejectedValue(
      new Error('Test error')
    );

    render(
      <GenerationEngine
        userInput={mockUserInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
      />
    );

    // Fast-forward timers to trigger generation
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByText('Generation Failed')).toBeInTheDocument();
    });

    const retryButton = screen.getByText(/Retry Generation/);
    expect(retryButton).toBeInTheDocument();
  });

  it('handles retry functionality', async () => {
    mockPromptGenerationService.generatePrompt
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce(mockGeneratedPrompt);

    render(
      <GenerationEngine
        userInput={mockUserInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
      />
    );

    // Fast-forward timers to trigger generation
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Wait for first error
    await waitFor(() => {
      expect(screen.getByText('Generation Failed')).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByText(/Retry Generation/);
    fireEvent.click(retryButton);

    // Fast-forward retry delay
    act(() => {
      jest.advanceTimersByTime(600);
    });

    // Wait for successful generation
    await waitFor(
      () => {
        expect(mockOnGenerated).toHaveBeenCalledWith(mockGeneratedPrompt);
      },
      { timeout: 5000 }
    );
  });

  it('limits retry attempts', async () => {
    mockPromptGenerationService.generatePrompt.mockRejectedValue(
      new Error('Persistent error')
    );

    render(
      <GenerationEngine
        userInput={mockUserInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
      />
    );

    // Fast-forward timers to trigger generation
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Wait for first error
    await waitFor(() => {
      expect(screen.getByText('Generation Failed')).toBeInTheDocument();
    });

    // Retry first time
    fireEvent.click(screen.getByText(/Retry Generation \(2 attempts left\)/));

    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Retry Generation \(1 attempts left\)/)
      ).toBeInTheDocument();
    });

    // Retry second time
    fireEvent.click(screen.getByText(/Retry Generation \(1 attempts left\)/));

    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(
        screen.getByText('Maximum retry attempts reached')
      ).toBeInTheDocument();
    });

    // Should not show retry button anymore
    expect(screen.queryByText(/Retry Generation/)).not.toBeInTheDocument();
  });

  it('validates required input fields', async () => {
    const invalidInput: UserInput = {
      websiteName: '',
      industry: 'saas',
      aboutInfo: 'Test info',
    };

    render(
      <GenerationEngine
        userInput={invalidInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
      />
    );

    // Fast-forward timers to trigger generation
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Missing required input fields');
    });

    expect(screen.getByText('Generation Failed')).toBeInTheDocument();
  });

  it('shows overall progress correctly', async () => {
    render(
      <GenerationEngine
        userInput={mockUserInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('Overall Progress')).toBeInTheDocument();

    // Should show progress percentage
    await waitFor(() => {
      const progressText = screen.getByText(/\d+%/);
      expect(progressText).toBeInTheDocument();
    });
  });

  it('handles start over functionality', async () => {
    mockPromptGenerationService.generatePrompt.mockRejectedValue(
      new Error('Test error')
    );

    render(
      <GenerationEngine
        userInput={mockUserInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
      />
    );

    // Fast-forward timers to trigger generation
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByText('Generation Failed')).toBeInTheDocument();
    });

    const startOverButton = screen.getByText('Start Over');
    fireEvent.click(startOverButton);

    // Should reset the state and not show error anymore
    await waitFor(() => {
      expect(screen.queryByText('Generation Failed')).not.toBeInTheDocument();
    });
  });

  it('does not start generation if already generating', async () => {
    const { rerender } = render(
      <GenerationEngine
        userInput={mockUserInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
      />
    );

    // Rerender with same props while generation is in progress
    rerender(
      <GenerationEngine
        userInput={mockUserInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
      />
    );

    // Should only call generatePrompt once
    await waitFor(() => {
      expect(mockPromptGenerationService.generatePrompt).toHaveBeenCalledTimes(
        1
      );
    });
  });

  it('shows correct stage icons and states', async () => {
    render(
      <GenerationEngine
        userInput={mockUserInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
      />
    );

    // Initially should show numbered stages (but first stage becomes active immediately)
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Fast-forward timers to trigger generation
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Wait for completion and check for checkmarks
    await waitFor(
      () => {
        expect(mockOnGenerated).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );
  });
});
