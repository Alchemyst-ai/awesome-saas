'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { UserInput, GeneratedPrompt } from '../types';
import { ApiError } from '../lib/error-handling';
import { useErrorHandling } from '../hooks/useErrorHandling';
import { useFeedback } from './UserFeedback';
import { usePerformanceMonitor } from '../lib/performance-monitor';
import { preloadComponent } from '../lib/progressive-loader';
import { usePerformanceInit } from '../hooks/usePerformanceInit';
import InputForm from './InputForm';
import {
  GenerationEngine,
  OutputDisplay,
  ExampleGallery,
} from './LazyComponents';

// Application phases
type AppPhase = 'input' | 'generation' | 'output' | 'examples';

// Global error types
interface GlobalError {
  message: string;
  type: 'validation' | 'generation' | 'network' | 'unknown';
  recoverable: boolean;
  timestamp: Date;
}

// Application state interface
interface AppState {
  currentPhase: AppPhase;
  userInput: UserInput | null;
  generatedPrompt: GeneratedPrompt | null;
  isLoading: boolean;
  globalError: GlobalError | null;
  showExamples: boolean;
}

// Initial state
const initialState: AppState = {
  currentPhase: 'input',
  userInput: null,
  generatedPrompt: null,
  isLoading: false,
  globalError: null,
  showExamples: false,
};

const PromptGenerator: React.FC = () => {
  const [state, setState] = useState<AppState>(initialState);
  const { handleError, showSuccess, showLoadingFeedback } = useErrorHandling();
  const feedback = useFeedback();
  const { recordRender } = usePerformanceMonitor('PromptGenerator');
  const performanceUtils = usePerformanceInit();

  // Global error handler
  const handleGlobalError = useCallback(
    (
      error: string | Error | ApiError,
      type: GlobalError['type'] = 'unknown'
    ) => {
      // Use the enhanced error handling
      const apiError = handleError(error, `PromptGenerator.${type}`, {
        showFeedback: true,
        persistent: type === 'generation' || type === 'network',
      });

      setState((prevState) => ({
        ...prevState,
        globalError: {
          message: apiError.message,
          type,
          recoverable: apiError.isRetryable(),
          timestamp: new Date(),
        },
        isLoading: false,
      }));
    },
    [handleError]
  );

  // Clear global error
  const clearGlobalError = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      globalError: null,
    }));
    feedback.clearAllFeedback();
  }, [feedback]);

  // Navigate to specific phase with preloading
  const navigateToPhase = useCallback((phase: AppPhase) => {
    setState((prevState) => ({
      ...prevState,
      currentPhase: phase,
      globalError: null, // Clear errors when navigating
    }));

    // Preload components for the next phase
    if (phase === 'generation') {
      preloadComponent('GenerationEngine');
      preloadComponent('OutputDisplay');
    } else if (phase === 'examples') {
      preloadComponent('ExampleGallery');
    }
  }, []);

  // Handle form submission from InputForm
  const handleFormSubmit = useCallback(
    async (userInput: UserInput) => {
      try {
        clearGlobalError();

        // Show loading feedback
        const hideLoading = showLoadingFeedback(
          'Processing Input',
          'Preparing to generate your prompt...'
        );

        setState((prevState) => ({
          ...prevState,
          userInput,
          isLoading: true,
          currentPhase: 'generation',
        }));

        // Hide loading after a short delay (generation component will show its own loading)
        setTimeout(hideLoading, 1000);
      } catch (error) {
        handleGlobalError(
          error instanceof Error ? error : new Error(String(error)),
          'validation'
        );
      }
    },
    [clearGlobalError, handleGlobalError, showLoadingFeedback]
  );

  // Handle successful prompt generation
  const handlePromptGenerated = useCallback(
    (prompt: GeneratedPrompt) => {
      showSuccess(
        'Prompt Generated Successfully',
        'Your V0 prompt is ready! You can now copy it or make edits.',
        4000
      );

      setState((prevState) => ({
        ...prevState,
        generatedPrompt: prompt,
        isLoading: false,
        currentPhase: 'output',
      }));
    },
    [showSuccess]
  );

  // Handle generation error
  const handleGenerationError = useCallback(
    (error: string) => {
      handleGlobalError(error, 'generation');

      // Stay in generation phase to allow retry
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
      }));
    },
    [handleGlobalError]
  );

  // Handle prompt editing
  const handlePromptEdit = useCallback(
    (editedPrompt: string) => {
      if (!state.generatedPrompt) return;

      setState((prevState) => ({
        ...prevState,
        generatedPrompt: prevState.generatedPrompt
          ? {
              ...prevState.generatedPrompt,
              fullPrompt: editedPrompt,
            }
          : null,
      }));
    },
    [state.generatedPrompt]
  );

  // Handle copy action
  const handleCopy = useCallback(() => {
    showSuccess(
      'Copied to Clipboard',
      'Your prompt has been copied and is ready to use with V0!',
      3000
    );
  }, [showSuccess]);

  // Handle example selection
  const handleExampleSelect = useCallback((_examplePrompt: string) => {
    // Parse example prompt to extract user input (simplified)
    // In a real implementation, you might want to store structured data with examples
    const mockUserInput: UserInput = {
      websiteName: 'Example Website',
      industry: 'saas',
      aboutInfo: 'This is an example based on the selected prompt template.',
    };

    setState((prevState) => ({
      ...prevState,
      userInput: mockUserInput,
      showExamples: false,
      currentPhase: 'input',
    }));
  }, []);

  // Handle template selection
  const handleTemplateSelect = useCallback(
    (template: { name?: string; industry?: string; description?: string }) => {
      // Similar to example selection but with template data
      const mockUserInput: UserInput = {
        websiteName: template.name || 'Template Website',
        industry: template.industry || 'saas',
        aboutInfo:
          template.description || 'Website based on selected template.',
      };

      setState((prevState) => ({
        ...prevState,
        userInput: mockUserInput,
        showExamples: false,
        currentPhase: 'input',
      }));
    },
    []
  );

  // Start over functionality
  const handleStartOver = useCallback(() => {
    setState(initialState);
  }, []);

  // Toggle examples view
  const toggleExamples = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      showExamples: !prevState.showExamples,
      currentPhase: prevState.showExamples ? 'input' : 'examples',
    }));
  }, []);

  // Retry generation
  const retryGeneration = useCallback(() => {
    if (!state.userInput) return;

    clearGlobalError();

    const hideLoading = showLoadingFeedback(
      'Retrying Generation',
      'Attempting to generate your prompt again...'
    );

    setState((prevState) => ({
      ...prevState,
      currentPhase: 'generation',
      isLoading: true,
      globalError: null,
    }));

    // Hide loading after a short delay
    setTimeout(hideLoading, 1000);
  }, [state.userInput, clearGlobalError, showLoadingFeedback]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to clear errors or go back
      if (event.key === 'Escape') {
        if (state.globalError) {
          clearGlobalError();
        } else if (state.currentPhase !== 'input') {
          navigateToPhase('input');
        }
      }

      // Ctrl/Cmd + R to retry generation
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === 'r' &&
        state.currentPhase === 'generation' &&
        state.globalError
      ) {
        event.preventDefault();
        retryGeneration();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state.globalError,
    state.currentPhase,
    clearGlobalError,
    navigateToPhase,
    retryGeneration,
  ]);

  // Record render performance
  useEffect(() => {
    recordRender(false);
  });

  // Render global error overlay
  const renderGlobalError = () => {
    if (!state.globalError) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-title"
        aria-describedby="error-description"
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-slide-up">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-600"
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
            <div className="ml-3 flex-1">
              <h3
                id="error-title"
                className="text-lg font-medium text-gray-900"
              >
                {state.globalError.type === 'network'
                  ? 'Connection Error'
                  : state.globalError.type === 'generation'
                    ? 'Generation Error'
                    : state.globalError.type === 'validation'
                      ? 'Validation Error'
                      : 'Unexpected Error'}
              </h3>
            </div>
          </div>

          <div className="mb-6">
            <p
              id="error-description"
              className="text-sm text-gray-700 leading-relaxed"
            >
              {state.globalError.message}
            </p>
          </div>

          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            {state.globalError.recoverable && (
              <button
                onClick={
                  state.currentPhase === 'generation'
                    ? retryGeneration
                    : clearGlobalError
                }
                className="flex-1 btn-primary"
                autoFocus
              >
                {state.currentPhase === 'generation'
                  ? 'Retry Generation'
                  : 'Try Again'}
              </button>
            )}

            <button onClick={handleStartOver} className="flex-1 btn-secondary">
              Start Over
            </button>

            <button onClick={clearGlobalError} className="flex-1 btn-outline">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render navigation header
  const renderNavigation = () => (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 safe-area-top shadow-sm">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo/Title */}
          <div className="flex items-center min-w-0 flex-1">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-responsive-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                V0 Prompt Generator
              </h1>
            </div>
          </div>

          {/* Navigation Steps - Desktop */}
          <nav
            className="hidden lg:flex items-center space-x-6"
            aria-label="Progress navigation"
          >
            <div className="flex items-center space-x-4">
              {[
                {
                  phase: 'input' as AppPhase,
                  label: 'Input',
                  step: 1,
                  description: 'Enter website details',
                },
                {
                  phase: 'generation' as AppPhase,
                  label: 'Generate',
                  step: 2,
                  description: 'AI generates prompt',
                },
                {
                  phase: 'output' as AppPhase,
                  label: 'Output',
                  step: 3,
                  description: 'Review and copy prompt',
                },
              ].map(({ phase, label, step, description }) => {
                const isActive = state.currentPhase === phase;
                const isCompleted =
                  (phase === 'input' && state.userInput) ||
                  (phase === 'generation' && state.generatedPrompt) ||
                  (phase === 'output' && state.generatedPrompt);
                const isAccessible =
                  phase === 'input' ||
                  (phase === 'generation' && state.userInput) ||
                  (phase === 'output' && state.generatedPrompt);

                return (
                  <button
                    key={phase}
                    onClick={() => isAccessible && navigateToPhase(phase)}
                    disabled={!isAccessible}
                    aria-current={isActive ? 'step' : undefined}
                    aria-describedby={`step-${phase}-description`}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 focus:ring-blue-500'
                        : isCompleted
                          ? 'text-green-600 hover:bg-green-50 focus:ring-green-500'
                          : isAccessible
                            ? 'text-gray-600 hover:bg-gray-50 focus:ring-gray-500'
                            : 'text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-300 text-gray-600'
                      }`}
                      aria-hidden="true"
                    >
                      {isCompleted ? (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        step
                      )}
                    </span>
                    <span className="hidden xl:block">{label}</span>
                    <span id={`step-${phase}-description`} className="sr-only">
                      {description}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Mobile Navigation Steps */}
          <div
            className="flex lg:hidden items-center space-x-2"
            aria-label="Progress indicator"
          >
            {[
              { phase: 'input' as AppPhase, step: 1 },
              { phase: 'generation' as AppPhase, step: 2 },
              { phase: 'output' as AppPhase, step: 3 },
            ].map(({ phase, step }) => {
              const isActive = state.currentPhase === phase;
              const isCompleted =
                (phase === 'input' && state.userInput) ||
                (phase === 'generation' && state.generatedPrompt) ||
                (phase === 'output' && state.generatedPrompt);

              return (
                <div
                  key={phase}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    isActive
                      ? 'bg-blue-600'
                      : isCompleted
                        ? 'bg-green-600'
                        : 'bg-gray-300'
                  }`}
                  aria-label={`Step ${step} ${isActive ? '(current)' : isCompleted ? '(completed)' : ''}`}
                />
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
            <button
              onClick={toggleExamples}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${
                state.currentPhase === 'examples'
                  ? 'bg-purple-100 text-purple-700 focus:ring-purple-500'
                  : 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
              }`}
              aria-pressed={state.currentPhase === 'examples'}
            >
              <span className="hidden sm:inline">
                {state.currentPhase === 'examples'
                  ? 'Hide Examples'
                  : 'View Examples'}
              </span>
              <span className="sm:hidden">
                {state.currentPhase === 'examples' ? 'Hide' : 'Examples'}
              </span>
            </button>

            {state.currentPhase !== 'input' && (
              <button
                onClick={handleStartOver}
                className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Start over with new input"
              >
                <span className="hidden sm:inline">Start Over</span>
                <span className="sm:hidden">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  // Render main content based on current phase
  const renderMainContent = () => {
    switch (state.currentPhase) {
      case 'input':
        return (
          <InputForm
            onSubmit={handleFormSubmit}
            isLoading={state.isLoading}
            initialValues={state.userInput || undefined}
          />
        );

      case 'generation':
        if (!state.userInput) {
          navigateToPhase('input');
          return null;
        }
        return (
          <GenerationEngine
            userInput={state.userInput}
            onGenerated={handlePromptGenerated}
            onError={handleGenerationError}
          />
        );

      case 'output':
        if (!state.generatedPrompt) {
          navigateToPhase('input');
          return null;
        }
        return (
          <OutputDisplay
            prompt={state.generatedPrompt}
            onEdit={handlePromptEdit}
            onCopy={handleCopy}
          />
        );

      case 'examples':
        return (
          <ExampleGallery
            onSelectExample={handleExampleSelect}
            onSelectTemplate={handleTemplateSelect}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {renderNavigation()}

      {/* Hero Section - Only show on input phase */}
      {state.currentPhase === 'input' && (
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-blue-300/20 rounded-full blur-xl animate-pulse delay-500"></div>
          
          <div className="relative container-responsive py-16 sm:py-20 lg:py-24">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm border border-white/30">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  AI-Powered Prompt Generation
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Create Perfect
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  V0 Prompts
                </span>
                in Seconds
              </h1>
              
              <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Transform your website ideas into comprehensive, professional prompts that generate stunning results with Vercel V0
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <div className="flex items-center text-white/90">
                  <svg className="w-5 h-5 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Industry-specific templates
                </div>
                <div className="flex items-center text-white/90">
                  <svg className="w-5 h-5 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  AI-optimized prompts
                </div>
                <div className="flex items-center text-white/90">
                  <svg className="w-5 h-5 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Instant results
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <main
        id="main-content"
        className={`flex-1 ${state.currentPhase === 'input' ? 'py-12 sm:py-16 lg:py-20' : 'py-6 sm:py-8 lg:py-12'} safe-area-bottom`}
        role="main"
        aria-label="V0 Prompt Generator Application"
      >
        <div className="container-responsive">
          <div className="animate-fade-in">{renderMainContent()}</div>
        </div>
      </main>

      {renderGlobalError()}

      {/* Loading overlay for better UX */}
      {state.isLoading && (
        <div
          className="loading-overlay animate-fade-in"
          role="status"
          aria-live="polite"
          aria-label="Generating prompt, please wait"
        >
          <div className="text-center">
            <svg
              className="loading-spinner mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
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
            <p className="text-white text-lg font-medium">
              Generating your prompt...
            </p>
            <p className="text-gray-300 text-sm mt-2">
              This may take a few moments
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptGenerator;
