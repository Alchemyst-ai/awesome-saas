import type { ApiError as ApiErrorType, ErrorRecoveryStrategy } from '@/types';

/**
 * Custom API Error class for structured error handling
 */
export class ApiError extends Error implements ApiErrorType {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON(): ApiErrorType {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'RATE_LIMIT',
      'SERVICE_UNAVAILABLE',
    ];
    return (
      retryableCodes.includes(this.code) ||
      (this.statusCode >= 500 && this.statusCode < 600)
    );
  }
}

/**
 * Error recovery strategies for different error types
 */
export const ERROR_RECOVERY_STRATEGIES: Record<string, ErrorRecoveryStrategy> =
  {
    VALIDATION_ERROR: {
      retryAttempts: 0,
      fallbackTemplates: [],
      userNotification: {
        message: 'Please check your input and try again.',
        actionable: true,
        retryOption: false,
      },
    },
    INVALID_INDUSTRY: {
      retryAttempts: 0,
      fallbackTemplates: [],
      userNotification: {
        message: 'Please select a valid industry from the available options.',
        actionable: true,
        retryOption: false,
      },
    },
    NETWORK_ERROR: {
      retryAttempts: 3,
      fallbackTemplates: [],
      userNotification: {
        message:
          'Network connection issue. Please check your connection and try again.',
        actionable: true,
        retryOption: true,
      },
    },
    TIMEOUT: {
      retryAttempts: 2,
      fallbackTemplates: [],
      userNotification: {
        message: 'Request timed out. Please try again.',
        actionable: true,
        retryOption: true,
      },
    },
    RATE_LIMIT: {
      retryAttempts: 1,
      fallbackTemplates: [],
      userNotification: {
        message: 'Too many requests. Please wait a moment and try again.',
        actionable: true,
        retryOption: true,
      },
    },
    SERVICE_UNAVAILABLE: {
      retryAttempts: 1,
      fallbackTemplates: [],
      userNotification: {
        message:
          'AI service is temporarily unavailable. Using template-based generation.',
        actionable: false,
        retryOption: true,
      },
    },
    GENERATION_FAILED: {
      retryAttempts: 1,
      fallbackTemplates: [],
      userNotification: {
        message:
          'Failed to generate prompt. Please try again or contact support.',
        actionable: true,
        retryOption: true,
      },
    },
  };

/**
 * Retry utility with exponential backoff
 */
export class RetryHandler {
  private static readonly DEFAULT_BASE_DELAY = 1000; // 1 second
  private static readonly DEFAULT_MAX_DELAY = 30000; // 30 seconds
  private static readonly DEFAULT_BACKOFF_FACTOR = 2;

  /**
   * Execute operation with retry logic
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      baseDelay?: number;
      maxDelay?: number;
      backoffFactor?: number;
      shouldRetry?: (error: Error) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = RetryHandler.DEFAULT_BASE_DELAY,
      maxDelay = RetryHandler.DEFAULT_MAX_DELAY,
      backoffFactor = RetryHandler.DEFAULT_BACKOFF_FACTOR,
      shouldRetry = (error: Error) =>
        error instanceof ApiError && error.isRetryable(),
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on last attempt or if error is not retryable
        if (attempt === maxAttempts || !shouldRetry(lastError)) {
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt - 1),
          maxDelay
        );

        console.warn(
          `Attempt ${attempt} failed, retrying in ${delay}ms:`,
          lastError.message
        );
        await RetryHandler.delay(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Delay utility
   */
  public static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Error handler for API operations
 */
export class ErrorHandler {
  /**
   * Handle and transform errors into ApiError instances
   */
  static handleError(error: unknown, context?: string): ApiError {
    // If already an ApiError, return as-is
    if (error instanceof ApiError) {
      return error;
    }

    // Handle different error types
    if (error instanceof Error) {
      return ErrorHandler.transformError(error, context);
    }

    // Handle unknown error types
    return new ApiError(
      `Unknown error${context ? ` in ${context}` : ''}`,
      'UNKNOWN_ERROR',
      500,
      { originalError: error }
    );
  }

  /**
   * Transform standard errors into ApiError instances
   */
  private static transformError(error: Error, context?: string): ApiError {
    const message = error.message || 'An error occurred';
    const contextMessage = context ? `${context}: ${message}` : message;

    // Network-related errors
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('ENOTFOUND')
    ) {
      return new ApiError(contextMessage, 'NETWORK_ERROR', 503);
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
      return new ApiError(contextMessage, 'TIMEOUT', 408);
    }

    // Rate limit errors
    if (message.includes('rate limit') || message.includes('429')) {
      return new ApiError(contextMessage, 'RATE_LIMIT', 429);
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('401')) {
      return new ApiError(contextMessage, 'AUTHENTICATION_ERROR', 401);
    }

    // Permission errors
    if (message.includes('forbidden') || message.includes('403')) {
      return new ApiError(contextMessage, 'PERMISSION_DENIED', 403);
    }

    // Not found errors
    if (message.includes('not found') || message.includes('404')) {
      return new ApiError(contextMessage, 'NOT_FOUND', 404);
    }

    // Default to internal server error
    return new ApiError(contextMessage, 'INTERNAL_ERROR', 500, {
      originalError: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
  }

  /**
   * Get recovery strategy for error
   */
  static getRecoveryStrategy(error: ApiError): ErrorRecoveryStrategy {
    return (
      ERROR_RECOVERY_STRATEGIES[error.code] ||
      ERROR_RECOVERY_STRATEGIES.GENERATION_FAILED
    );
  }

  /**
   * Check if error should trigger fallback behavior
   */
  static shouldUseFallback(error: ApiError): boolean {
    const fallbackCodes = [
      'SERVICE_UNAVAILABLE',
      'TIMEOUT',
      'NETWORK_ERROR',
      'RATE_LIMIT',
    ];
    return fallbackCodes.includes(error.code);
  }

  /**
   * Format error for user display
   */
  static formatUserError(error: ApiError): string {
    const strategy = ErrorHandler.getRecoveryStrategy(error);
    return strategy.userNotification.message;
  }
}

/**
 * Circuit breaker for service health management
 */
export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeout: number = 60000, // 1 minute
    private readonly successThreshold: number = 2
  ) {}

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new ApiError(
          'Service circuit breaker is open',
          'SERVICE_UNAVAILABLE',
          503
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  /**
   * Get current circuit breaker state
   */
  getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    return this.state;
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}

/**
 * Enhanced retry handler with user feedback integration
 */
export class EnhancedRetryHandler extends RetryHandler {
  /**
   * Execute operation with retry logic and user feedback
   */
  static async withRetryAndFeedback<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      baseDelay?: number;
      maxDelay?: number;
      backoffFactor?: number;
      shouldRetry?: (error: Error) => boolean;
      onRetry?: (attempt: number, error: Error) => void;
      onFinalFailure?: (error: Error) => void;
      operationName?: string;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      backoffFactor = 2,
      shouldRetry = (error: Error) =>
        error instanceof ApiError && error.isRetryable(),
      onRetry,
      onFinalFailure,
      operationName = 'Operation',
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on last attempt or if error is not retryable
        if (attempt === maxAttempts || !shouldRetry(lastError)) {
          if (onFinalFailure) {
            onFinalFailure(lastError);
          }
          throw lastError;
        }

        // Notify about retry attempt
        if (onRetry) {
          onRetry(attempt, lastError);
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt - 1),
          maxDelay
        );

        console.warn(
          `${operationName} attempt ${attempt} failed, retrying in ${delay}ms:`,
          lastError.message
        );

        await RetryHandler.delay(delay);
      }
    }

    throw lastError!;
  }
}

/**
 * User-friendly error messages for different scenarios
 */
export const USER_FRIENDLY_MESSAGES = {
  NETWORK_ERROR: {
    title: 'Connection Problem',
    message:
      'Unable to connect to our servers. Please check your internet connection and try again.',
    suggestion: 'Check your internet connection',
  },
  TIMEOUT: {
    title: 'Request Timeout',
    message:
      'The request is taking longer than expected. This might be due to a slow connection.',
    suggestion: 'Try again or check your connection speed',
  },
  RATE_LIMIT: {
    title: 'Too Many Requests',
    message:
      "You've made too many requests recently. Please wait a moment before trying again.",
    suggestion: 'Wait a few minutes before retrying',
  },
  SERVICE_UNAVAILABLE: {
    title: 'Service Temporarily Unavailable',
    message:
      "Our AI service is temporarily unavailable. We're working to restore it quickly.",
    suggestion: 'Try again in a few minutes',
  },
  AUTHENTICATION_ERROR: {
    title: 'Authentication Failed',
    message:
      'There was a problem with your authentication. Please refresh the page and try again.',
    suggestion: 'Refresh the page',
  },
  VALIDATION_ERROR: {
    title: 'Invalid Input',
    message:
      'Please check your input and make sure all required fields are filled correctly.',
    suggestion: 'Review and correct your input',
  },
  GENERATION_FAILED: {
    title: 'Generation Failed',
    message:
      "We couldn't generate your prompt. This might be a temporary issue.",
    suggestion: 'Try again with different input or contact support',
  },
  UNKNOWN_ERROR: {
    title: 'Unexpected Error',
    message:
      "Something unexpected happened. We've been notified and are looking into it.",
    suggestion: 'Try refreshing the page or contact support',
  },
} as const;

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: ApiError) {
  const friendlyError =
    USER_FRIENDLY_MESSAGES[error.code as keyof typeof USER_FRIENDLY_MESSAGES] ||
    USER_FRIENDLY_MESSAGES.UNKNOWN_ERROR;

  return {
    ...friendlyError,
    originalError: error,
    errorId: `${error.code}_${Date.now()}`,
  };
}

/**
 * Enhanced error handler with better categorization
 */
export class EnhancedErrorHandler extends ErrorHandler {
  /**
   * Handle error with user feedback integration
   */
  static handleErrorWithFeedback(
    error: unknown,
    context?: string,
    onUserFeedback?: (feedback: {
      type: 'error' | 'warning';
      title: string;
      message: string;
      actions?: Array<{ label: string; action: () => void }>;
    }) => void
  ): ApiError {
    const apiError = ErrorHandler.handleError(error, context);
    const friendlyError = getUserFriendlyError(apiError);

    // Provide user feedback if callback is provided
    if (onUserFeedback) {
      const actions: Array<{ label: string; action: () => void }> = [];

      // Add retry action for retryable errors
      if (apiError.isRetryable()) {
        actions.push({
          label: 'Retry',
          action: () => {
            // This would be handled by the calling component
            console.log('Retry requested for error:', apiError.code);
          },
        });
      }

      // Add refresh action for certain errors
      if (['AUTHENTICATION_ERROR', 'UNKNOWN_ERROR'].includes(apiError.code)) {
        actions.push({
          label: 'Refresh Page',
          action: () => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          },
        });
      }

      onUserFeedback({
        type: apiError.statusCode >= 500 ? 'error' : 'warning',
        title: friendlyError.title,
        message: friendlyError.message,
        actions: actions.length > 0 ? actions : undefined,
      });
    }

    return apiError;
  }

  /**
   * Create recovery actions for different error types
   */
  static getRecoveryActions(error: ApiError): Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }> {
    const actions: Array<{
      label: string;
      action: () => void;
      primary?: boolean;
    }> = [];

    switch (error.code) {
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
        actions.push({
          label: 'Retry',
          action: () => console.log('Retry network operation'),
          primary: true,
        });
        actions.push({
          label: 'Check Connection',
          action: () => {
            if (typeof window !== 'undefined') {
              window.open('https://www.google.com', '_blank');
            }
          },
        });
        break;

      case 'RATE_LIMIT':
        actions.push({
          label: 'Try Again Later',
          action: () => console.log('Rate limit retry scheduled'),
          primary: true,
        });
        break;

      case 'SERVICE_UNAVAILABLE':
        actions.push({
          label: 'Retry',
          action: () => console.log('Service retry'),
          primary: true,
        });
        actions.push({
          label: 'Use Template',
          action: () => console.log('Fallback to template'),
        });
        break;

      case 'VALIDATION_ERROR':
        actions.push({
          label: 'Review Input',
          action: () => console.log('Focus on form validation'),
          primary: true,
        });
        break;

      default:
        actions.push({
          label: 'Try Again',
          action: () => console.log('Generic retry'),
          primary: true,
        });
        actions.push({
          label: 'Refresh Page',
          action: () => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          },
        });
    }

    return actions;
  }
}

/**
 * Global error handler for unhandled promise rejections
 */
export const setupGlobalErrorHandling = (
  onError?: (error: Error, context: string) => void
): void => {
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);

      // Prevent default browser behavior
      event.preventDefault();

      // Handle the error
      const apiError = ErrorHandler.handleError(
        event.reason,
        'Unhandled Promise Rejection'
      );

      if (onError) {
        onError(apiError, 'unhandled_promise_rejection');
      }

      // You could send this to an error reporting service here
      // reportError(apiError);
    });

    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);

      // Handle the error
      const apiError = ErrorHandler.handleError(event.error, 'Global Error');

      if (onError) {
        onError(apiError, 'global_error');
      }

      // You could send this to an error reporting service here
      // reportError(apiError);
    });
  }
};
