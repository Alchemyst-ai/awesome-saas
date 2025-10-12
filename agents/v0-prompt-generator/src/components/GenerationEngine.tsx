'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UserInput, GeneratedPrompt } from '@/types';
import { promptGenerationService } from '@/lib/prompt-generation-service';
import { ApiError } from '@/lib/error-handling';
import { useErrorHandling } from '@/hooks/useErrorHandling';

interface GenerationEngineProps {
  userInput: UserInput;
  onGenerated: (prompt: GeneratedPrompt) => void;
  onError: (error: string) => void;
  onProgress?: (stage: GenerationStage, progress: number) => void;
}

export interface GenerationStage {
  name: string;
  description: string;
  progress: number;
  isActive: boolean;
  isComplete: boolean;
  hasError: boolean;
}

interface GenerationState {
  isGenerating: boolean;
  currentStage: number;
  stages: GenerationStage[];
  error: string | null;
  retryCount: number;
  maxRetries: number;
}

const GENERATION_STAGES: Omit<
  GenerationStage,
  'progress' | 'isActive' | 'isComplete' | 'hasError'
>[] = [
  {
    name: 'validation',
    description: 'Validating input data',
  },
  {
    name: 'industry-context',
    description: 'Loading industry context',
  },
  {
    name: 'ai-processing',
    description: 'Processing with AI',
  },
  {
    name: 'prompt-structuring',
    description: 'Structuring V0 prompt',
  },
  {
    name: 'finalization',
    description: 'Finalizing output',
  },
];

const GenerationEngine: React.FC<GenerationEngineProps> = ({
  userInput,
  onGenerated,
  onError,
  onProgress,
}) => {
  const { executeWithErrorHandling, networkStatus } = useErrorHandling();

  const [state, setState] = useState<GenerationState>(() => ({
    isGenerating: false,
    currentStage: 0,
    stages: GENERATION_STAGES.map((stage) => ({
      ...stage,
      progress: 0,
      isActive: false,
      isComplete: false,
      hasError: false,
    })),
    error: null,
    retryCount: 0,
    maxRetries: networkStatus.isSlowConnection ? 1 : 2, // Fewer retries on slow connections
  }));

  // Update progress callback
  const updateProgress = useCallback(
    (stageIndex: number, progress: number) => {
      setState((prevState) => {
        const newStages = [...prevState.stages];
        newStages[stageIndex] = {
          ...newStages[stageIndex],
          progress,
          isActive: progress < 100,
          isComplete: progress === 100,
        };

        const newState = {
          ...prevState,
          stages: newStages,
          currentStage: stageIndex,
        };

        // Call external progress callback
        if (onProgress) {
          onProgress(newStages[stageIndex], progress);
        }

        return newState;
      });
    },
    [onProgress]
  );

  // Mark stage as error
  const markStageError = useCallback((stageIndex: number, error: string) => {
    setState((prevState) => {
      const newStages = [...prevState.stages];
      newStages[stageIndex] = {
        ...newStages[stageIndex],
        hasError: true,
        isActive: false,
        isComplete: false,
      };

      return {
        ...prevState,
        stages: newStages,
        error,
      };
    });
  }, []);

  // Reset generation state
  const resetState = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      isGenerating: false,
      currentStage: 0,
      stages: GENERATION_STAGES.map((stage) => ({
        ...stage,
        progress: 0,
        isActive: false,
        isComplete: false,
        hasError: false,
      })),
      error: null,
    }));
  }, []);

  // Main generation process
  const generatePrompt = useCallback(async () => {
    if (state.isGenerating) return;

    setState((prevState) => ({
      ...prevState,
      isGenerating: true,
      error: null,
    }));

    const result = await executeWithErrorHandling(
      async () => {
        // Stage 1: Validation
        updateProgress(0, 0);
        await simulateDelay(200);

        if (
          !userInput.websiteName?.trim() ||
          !userInput.industry?.trim() ||
          !userInput.aboutInfo?.trim()
        ) {
          throw new Error('Missing required input fields');
        }

        updateProgress(0, 100);
        await simulateDelay(100);

        // Stage 2: Industry Context Loading
        updateProgress(1, 0);
        await simulateDelay(networkStatus.isSlowConnection ? 500 : 300);

        // Simulate industry context loading progress
        const contextDelay = networkStatus.isSlowConnection ? 200 : 100;
        for (let i = 20; i <= 100; i += 20) {
          updateProgress(1, i);
          await simulateDelay(contextDelay);
        }

        // Stage 3: AI Processing
        updateProgress(2, 0);
        await simulateDelay(200);

        // Start the actual AI generation
        const generationPromise =
          promptGenerationService.generatePrompt(userInput);

        // Simulate AI processing progress
        const progressInterval = setInterval(
          () => {
            setState((prevState) => {
              const currentProgress = prevState.stages[2].progress;
              if (currentProgress < 90) {
                const newProgress = Math.min(
                  currentProgress + Math.random() * 15,
                  90
                );
                updateProgress(2, newProgress);
              }
              return prevState;
            });
          },
          networkStatus.isSlowConnection ? 1000 : 500
        );

        const generatedPrompt = await generationPromise;
        clearInterval(progressInterval);
        updateProgress(2, 100);
        await simulateDelay(200);

        // Stage 4: Prompt Structuring
        updateProgress(3, 0);
        await simulateDelay(300);

        // Simulate structuring progress
        const structuringDelay = networkStatus.isSlowConnection ? 250 : 150;
        for (let i = 25; i <= 100; i += 25) {
          updateProgress(3, i);
          await simulateDelay(structuringDelay);
        }

        // Stage 5: Finalization
        updateProgress(4, 0);
        await simulateDelay(200);

        for (let i = 50; i <= 100; i += 50) {
          updateProgress(4, i);
          await simulateDelay(100);
        }

        return generatedPrompt;
      },
      {
        operationName: 'Prompt Generation',
        maxRetries: state.maxRetries,
        showRetryFeedback: true,
        customErrorMessage:
          'Failed to generate your prompt. This might be due to network issues or high server load.',
        onRetry: (attempt) => {
          // Reset progress for retry
          setState((prevState) => ({
            ...prevState,
            stages: GENERATION_STAGES.map((stage) => ({
              ...stage,
              progress: 0,
              isActive: false,
              isComplete: false,
              hasError: false,
            })),
            currentStage: 0,
            retryCount: attempt,
          }));
        },
        onSuccess: (generatedPrompt) => {
          // Complete generation
          setState((prevState) => ({
            ...prevState,
            isGenerating: false,
          }));
          onGenerated(generatedPrompt);
        },
      }
    );

    // Handle final failure
    if (!result) {
      markStageError(
        state.currentStage,
        'Generation failed after all retry attempts'
      );
      setState((prevState) => ({
        ...prevState,
        isGenerating: false,
      }));
      onError('Failed to generate prompt after multiple attempts');
    }
  }, [
    userInput,
    state.isGenerating,
    state.currentStage,
    state.maxRetries,
    updateProgress,
    markStageError,
    onGenerated,
    onError,
    executeWithErrorHandling,
    networkStatus,
  ]);

  // Retry generation
  const retryGeneration = useCallback(() => {
    if (state.retryCount >= state.maxRetries) {
      onError('Maximum retry attempts reached. Please try again later.');
      return;
    }

    resetState();
    setTimeout(generatePrompt, 500);
  }, [state.retryCount, state.maxRetries, resetState, generatePrompt, onError]);

  // Auto-start generation when component mounts or userInput changes
  useEffect(() => {
    if (
      userInput &&
      !state.isGenerating &&
      state.currentStage === 0 &&
      !state.error
    ) {
      const timer = setTimeout(() => {
        generatePrompt();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [
    userInput,
    generatePrompt,
    state.isGenerating,
    state.currentStage,
    state.error,
  ]);

  // Render progress indicator
  const renderProgressIndicator = () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="mb-6 text-center sm:text-left">
          <h3 className="text-responsive-lg font-semibold text-gray-900 mb-2">
            Generating Your V0 Prompt
          </h3>
          <p className="text-gray-600 text-responsive-base">
            Please wait while we create your optimized prompt...
          </p>
        </div>

        <div
          className="space-y-4 sm:space-y-6"
          role="progressbar"
          aria-label="Prompt generation progress"
          aria-valuenow={Math.round(
            state.stages.reduce((acc, stage) => acc + stage.progress, 0) /
              state.stages.length
          )}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {state.stages.map((stage, index) => (
            <div
              key={stage.name}
              className="flex items-center space-x-3 sm:space-x-4"
            >
              {/* Stage Icon */}
              <div
                className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  stage.hasError
                    ? 'bg-red-100 text-red-600'
                    : stage.isComplete
                      ? 'bg-green-100 text-green-600'
                      : stage.isActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                }`}
                aria-hidden="true"
              >
                {stage.hasError ? (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : stage.isComplete ? (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : stage.isActive ? (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <span className="text-sm sm:text-base font-medium">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Stage Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                  <p
                    className={`text-sm sm:text-base font-medium truncate ${
                      stage.hasError
                        ? 'text-red-900'
                        : stage.isComplete
                          ? 'text-green-900'
                          : stage.isActive
                            ? 'text-blue-900'
                            : 'text-gray-500'
                    }`}
                  >
                    {stage.description}
                  </p>
                  <span
                    className={`text-xs sm:text-sm font-medium flex-shrink-0 ${
                      stage.hasError
                        ? 'text-red-600'
                        : stage.isComplete
                          ? 'text-green-600'
                          : stage.isActive
                            ? 'text-blue-600'
                            : 'text-gray-400'
                    }`}
                    aria-live={stage.isActive ? 'polite' : 'off'}
                  >
                    {stage.hasError
                      ? 'Error'
                      : stage.isComplete
                        ? 'Complete'
                        : stage.isActive
                          ? `${stage.progress}%`
                          : 'Pending'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div
                    className={`h-2 sm:h-3 rounded-full transition-all duration-500 ease-out ${
                      stage.hasError
                        ? 'bg-red-500'
                        : stage.isComplete
                          ? 'bg-green-500'
                          : stage.isActive
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                    }`}
                    style={{ width: `${stage.progress}%` }}
                    role="progressbar"
                    aria-label={`${stage.description} progress`}
                    aria-valuenow={stage.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Progress */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm sm:text-base font-medium text-gray-700">
              Overall Progress
            </span>
            <span
              className="text-sm sm:text-base text-gray-600 font-medium"
              aria-live="polite"
            >
              {Math.round(
                state.stages.reduce((acc, stage) => acc + stage.progress, 0) /
                  state.stages.length
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
            <div
              className="h-3 sm:h-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${state.stages.reduce((acc, stage) => acc + stage.progress, 0) / state.stages.length}%`,
              }}
              role="progressbar"
              aria-label="Overall generation progress"
              aria-valuenow={Math.round(
                state.stages.reduce((acc, stage) => acc + stage.progress, 0) /
                  state.stages.length
              )}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 sm:h-8 sm:w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h3 className="text-responsive-lg font-medium text-gray-900 mb-2">
            Generation Failed
          </h3>

          <p className="text-gray-600 text-responsive-base mb-6 max-w-md mx-auto">
            {state.error}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            {state.retryCount < state.maxRetries && (
              <button
                onClick={retryGeneration}
                className="btn-primary flex-1 sm:flex-none"
                aria-describedby="retry-help"
              >
                Retry Generation
                <span className="block text-xs opacity-90 mt-1">
                  ({state.maxRetries - state.retryCount} attempts left)
                </span>
              </button>
            )}

            <button
              onClick={resetState}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Start Over
            </button>
          </div>

          {state.retryCount >= state.maxRetries && (
            <div
              className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg animate-slide-up"
              role="alert"
            >
              <p className="text-sm text-yellow-800">
                Maximum retry attempts reached. Please check your input and try
                again later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Main render
  if (state.error && !state.isGenerating) {
    return renderErrorState();
  }

  if (
    state.isGenerating ||
    state.stages.some((stage) => stage.isActive || stage.isComplete)
  ) {
    return renderProgressIndicator();
  }

  return null;
};

// Utility function to simulate delays for better UX
const simulateDelay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default GenerationEngine;
