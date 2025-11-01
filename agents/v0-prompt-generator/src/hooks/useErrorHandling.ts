'use client';

import { useCallback, useEffect } from 'react';
import {
  ApiError,
  EnhancedErrorHandler,
  EnhancedRetryHandler,
  setupGlobalErrorHandling,
} from '../lib/error-handling';
import { useFeedback } from '../components/UserFeedback';
import { useNetworkAwareOperation } from './useNetworkStatus';

/**
 * Comprehensive error handling hook
 */
export function useErrorHandling() {
  const feedback = useFeedback();
  const { networkStatus, executeOperation } = useNetworkAwareOperation();

  // Setup global error handling on mount
  useEffect(() => {
    const cleanup = setupGlobalErrorHandling((error, context) => {
      feedback.showError(
        'Unexpected Error',
        `An unexpected error occurred: ${error.message}`,
        true
      );
    });

    return cleanup;
  }, [feedback]);

  /**
   * Handle errors with user feedback
   */
  const handleError = useCallback(
    (
      error: unknown,
      context?: string,
      options: {
        showFeedback?: boolean;
        persistent?: boolean;
        customMessage?: string;
      } = {}
    ) => {
      const { showFeedback = true, persistent = true, customMessage } = options;

      const apiError = EnhancedErrorHandler.handleErrorWithFeedback(
        error,
        context,
        showFeedback
          ? (feedbackData) => {
              if (feedbackData.type === 'error') {
                feedback.showError(
                  feedbackData.title,
                  customMessage || feedbackData.message,
                  persistent
                );
              } else {
                feedback.showWarning(
                  feedbackData.title,
                  customMessage || feedbackData.message
                );
              }
            }
          : undefined
      );

      return apiError;
    },
    [feedback]
  );

  /**
   * Execute operation with comprehensive error handling and retry logic
   */
  const executeWithErrorHandling = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: {
        operationName?: string;
        maxRetries?: number;
        showRetryFeedback?: boolean;
        customErrorMessage?: string;
        onRetry?: (attempt: number) => void;
        onSuccess?: (result: T) => void;
        fallbackValue?: T;
      } = {}
    ): Promise<T | undefined> => {
      const {
        operationName = 'Operation',
        maxRetries = 3,
        showRetryFeedback = true,
        customErrorMessage,
        onRetry,
        onSuccess,
        fallbackValue,
      } = options;

      try {
        // Execute with network awareness
        const result = await executeOperation(operation, {
          retryOnline: true,
          showOfflineMessage: true,
        });

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (networkError) {
        // If it's a network queue error, show appropriate message
        if (
          networkError instanceof Error &&
          networkError.message.includes('queued')
        ) {
          feedback.showInfo(
            'Queued for Later',
            'Your request will be processed when connection is restored'
          );
          return fallbackValue;
        }

        // Try with enhanced retry logic
        try {
          const result = await EnhancedRetryHandler.withRetryAndFeedback(
            operation,
            {
              maxAttempts: maxRetries,
              operationName,
              onRetry: (attempt, error) => {
                if (showRetryFeedback) {
                  feedback.showWarning(
                    'Retrying...',
                    `${operationName} failed, attempting retry ${attempt}/${maxRetries}`,
                    3000
                  );
                }
                if (onRetry) {
                  onRetry(attempt);
                }
              },
              onFinalFailure: (error) => {
                handleError(error, operationName, {
                  customMessage: customErrorMessage,
                });
              },
            }
          );

          if (onSuccess) {
            onSuccess(result);
          }

          return result;
        } catch (finalError) {
          // Final error handling
          handleError(finalError, operationName, {
            customMessage: customErrorMessage,
          });

          return fallbackValue;
        }
      }
    },
    [executeOperation, feedback, handleError]
  );

  /**
   * Handle validation errors specifically
   */
  const handleValidationError = useCallback(
    (
      errors: Array<{ field: string; message: string }>,
      title = 'Validation Error'
    ) => {
      const errorMessage =
        errors.length === 1
          ? errors[0].message
          : `Please fix the following issues:\n${errors.map((e) => `• ${e.message}`).join('\n')}`;

      feedback.showError(title, errorMessage, false);
    },
    [feedback]
  );

  /**
   * Show success feedback
   */
  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      feedback.showSuccess(title, message, duration);
    },
    [feedback]
  );

  /**
   * Show loading feedback with automatic cleanup
   */
  const showLoadingFeedback = useCallback(
    (title: string, message: string) => {
      const id = feedback.showInfo(title, message, 0); // Persistent

      return () => {
        feedback.hideFeedback(id);
      };
    },
    [feedback]
  );

  /**
   * Handle network-specific errors
   */
  const handleNetworkError = useCallback(
    (error: unknown) => {
      if (!networkStatus.isOnline) {
        feedback.showWarning(
          'Offline',
          'You are currently offline. The operation will be retried when connection is restored.',
          0 // Persistent
        );
        return;
      }

      if (networkStatus.isSlowConnection) {
        feedback.showWarning(
          'Slow Connection',
          'Your connection appears to be slow. Operations may take longer than usual.',
          8000
        );
      }

      handleError(error, 'Network Operation');
    },
    [networkStatus, feedback, handleError]
  );

  /**
   * Create error recovery actions
   */
  const createRecoveryActions = useCallback(
    (error: ApiError, onRetry?: () => void) => {
      const actions = EnhancedErrorHandler.getRecoveryActions(error);

      return actions.map((action) => ({
        ...action,
        action: action.label === 'Retry' && onRetry ? onRetry : action.action,
      }));
    },
    []
  );

  return {
    handleError,
    executeWithErrorHandling,
    handleValidationError,
    handleNetworkError,
    showSuccess,
    showLoadingFeedback,
    createRecoveryActions,
    networkStatus,
  };
}
