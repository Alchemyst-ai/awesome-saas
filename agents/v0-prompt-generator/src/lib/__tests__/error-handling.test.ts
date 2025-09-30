import {
  ApiError,
  ErrorHandler,
  RetryHandler,
  CircuitBreaker,
  ERROR_RECOVERY_STRATEGIES,
  EnhancedRetryHandler,
  EnhancedErrorHandler,
  getUserFriendlyError,
  USER_FRIENDLY_MESSAGES,
} from '../error-handling';

describe('ApiError', () => {
  it('should create error with correct properties', () => {
    const error = new ApiError('Test error', 'TEST_CODE', 400, {
      detail: 'test',
    });

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ detail: 'test' });
  });

  it('should convert to JSON correctly', () => {
    const error = new ApiError('Test error', 'TEST_CODE', 400, {
      detail: 'test',
    });
    const json = error.toJSON();

    expect(json).toEqual({
      message: 'Test error',
      code: 'TEST_CODE',
      statusCode: 400,
      details: { detail: 'test' },
    });
  });

  it('should identify retryable errors', () => {
    const retryableError = new ApiError('Network error', 'NETWORK_ERROR', 503);
    const nonRetryableError = new ApiError(
      'Validation error',
      'VALIDATION_ERROR',
      400
    );

    expect(retryableError.isRetryable()).toBe(true);
    expect(nonRetryableError.isRetryable()).toBe(false);
  });
});

describe('ErrorHandler', () => {
  it('should handle ApiError instances', () => {
    const originalError = new ApiError('Original error', 'ORIGINAL_CODE', 500);
    const handledError = ErrorHandler.handleError(originalError);

    expect(handledError).toBe(originalError);
  });

  it('should transform network errors', () => {
    const networkError = new Error('fetch failed');
    const handledError = ErrorHandler.handleError(networkError, 'test context');

    expect(handledError).toBeInstanceOf(ApiError);
    expect(handledError.code).toBe('NETWORK_ERROR');
    expect(handledError.statusCode).toBe(503);
    expect(handledError.message).toContain('test context');
  });

  it('should transform timeout errors', () => {
    const timeoutError = new Error('timeout occurred');
    const handledError = ErrorHandler.handleError(timeoutError);

    expect(handledError).toBeInstanceOf(ApiError);
    expect(handledError.code).toBe('TIMEOUT');
    expect(handledError.statusCode).toBe(408);
  });

  it('should get recovery strategy', () => {
    const error = new ApiError('Validation error', 'VALIDATION_ERROR', 400);
    const strategy = ErrorHandler.getRecoveryStrategy(error);

    expect(strategy.retryAttempts).toBe(0);
    expect(strategy.userNotification.actionable).toBe(true);
  });

  it('should determine fallback usage', () => {
    const fallbackError = new ApiError(
      'Service unavailable',
      'SERVICE_UNAVAILABLE',
      503
    );
    const nonFallbackError = new ApiError(
      'Validation error',
      'VALIDATION_ERROR',
      400
    );

    expect(ErrorHandler.shouldUseFallback(fallbackError)).toBe(true);
    expect(ErrorHandler.shouldUseFallback(nonFallbackError)).toBe(false);
  });

  it('should format user errors', () => {
    const error = new ApiError('Network error', 'NETWORK_ERROR', 503);
    const userMessage = ErrorHandler.formatUserError(error);

    expect(userMessage).toBe(
      'Network connection issue. Please check your connection and try again.'
    );
  });
});

describe('RetryHandler', () => {
  it('should retry on retryable errors', async () => {
    let attempts = 0;
    const operation = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        throw new ApiError('Retryable error', 'NETWORK_ERROR', 503);
      }
      return 'success';
    });

    const result = await RetryHandler.withRetry(operation, {
      maxAttempts: 3,
      baseDelay: 10,
    });

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should not retry non-retryable errors', async () => {
    const operation = jest
      .fn()
      .mockRejectedValue(
        new ApiError('Validation error', 'VALIDATION_ERROR', 400)
      );

    await expect(
      RetryHandler.withRetry(operation, { maxAttempts: 3 })
    ).rejects.toThrow('Validation error');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should respect max attempts', async () => {
    const operation = jest
      .fn()
      .mockRejectedValue(new ApiError('Network error', 'NETWORK_ERROR', 503));

    await expect(
      RetryHandler.withRetry(operation, { maxAttempts: 2, baseDelay: 10 })
    ).rejects.toThrow('Network error');
    expect(operation).toHaveBeenCalledTimes(2);
  });
});

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker(2, 1000, 1);
  });

  it('should start in closed state', () => {
    expect(circuitBreaker.getState()).toBe('CLOSED');
  });

  it('should open after failure threshold', async () => {
    const failingOperation = jest
      .fn()
      .mockRejectedValue(new Error('Operation failed'));

    // First failure
    await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow(
      'Operation failed'
    );
    expect(circuitBreaker.getState()).toBe('CLOSED');

    // Second failure - should open circuit
    await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow(
      'Operation failed'
    );
    expect(circuitBreaker.getState()).toBe('OPEN');
  });

  it('should reject immediately when open', async () => {
    const failingOperation = jest
      .fn()
      .mockRejectedValue(new Error('Operation failed'));

    // Trigger failures to open circuit
    await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();
    await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();

    // Should now reject immediately
    await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow(
      'Service circuit breaker is open'
    );
    expect(failingOperation).toHaveBeenCalledTimes(2); // Should not call the third time
  });

  it('should reset on success', async () => {
    const operation = jest.fn().mockResolvedValue('success');

    const result = await circuitBreaker.execute(operation);

    expect(result).toBe('success');
    expect(circuitBreaker.getState()).toBe('CLOSED');
  });

  it('should reset circuit breaker', () => {
    circuitBreaker.reset();
    expect(circuitBreaker.getState()).toBe('CLOSED');
  });
});
describe('EnhancedRetryHandler', () => {
  it('should retry with user feedback', async () => {
    let attempts = 0;
    const onRetry = jest.fn();
    const onFinalFailure = jest.fn();

    const operation = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        throw new ApiError('Retryable error', 'NETWORK_ERROR', 503);
      }
      return 'success';
    });

    const result = await EnhancedRetryHandler.withRetryAndFeedback(operation, {
      maxAttempts: 3,
      baseDelay: 10,
      onRetry,
      onFinalFailure,
      operationName: 'Test Operation',
    });

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onFinalFailure).not.toHaveBeenCalled();
  });

  it('should call final failure callback on max attempts', async () => {
    const onRetry = jest.fn();
    const onFinalFailure = jest.fn();

    const operation = jest
      .fn()
      .mockRejectedValue(new ApiError('Network error', 'NETWORK_ERROR', 503));

    await expect(
      EnhancedRetryHandler.withRetryAndFeedback(operation, {
        maxAttempts: 2,
        baseDelay: 10,
        onRetry,
        onFinalFailure,
        operationName: 'Test Operation',
      })
    ).rejects.toThrow('Network error');

    expect(operation).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onFinalFailure).toHaveBeenCalledWith(expect.any(ApiError));
  });
});

describe('EnhancedErrorHandler', () => {
  it('should handle error with user feedback', () => {
    const onUserFeedback = jest.fn();
    const error = new Error('Test error');

    const apiError = EnhancedErrorHandler.handleErrorWithFeedback(
      error,
      'Test context',
      onUserFeedback
    );

    expect(apiError).toBeInstanceOf(ApiError);
    expect(onUserFeedback).toHaveBeenCalledWith({
      type: 'error',
      title: expect.any(String),
      message: expect.any(String),
      actions: expect.any(Array),
    });
  });

  it('should create recovery actions for different error types', () => {
    const networkError = new ApiError('Network error', 'NETWORK_ERROR', 503);
    const actions = EnhancedErrorHandler.getRecoveryActions(networkError);

    expect(actions).toHaveLength(2);
    expect(actions[0].label).toBe('Retry');
    expect(actions[0].primary).toBe(true);
    expect(actions[1].label).toBe('Check Connection');
  });

  it('should create appropriate actions for validation errors', () => {
    const validationError = new ApiError(
      'Validation error',
      'VALIDATION_ERROR',
      400
    );
    const actions = EnhancedErrorHandler.getRecoveryActions(validationError);

    expect(actions).toHaveLength(1);
    expect(actions[0].label).toBe('Review Input');
    expect(actions[0].primary).toBe(true);
  });

  it('should create fallback actions for service unavailable', () => {
    const serviceError = new ApiError(
      'Service unavailable',
      'SERVICE_UNAVAILABLE',
      503
    );
    const actions = EnhancedErrorHandler.getRecoveryActions(serviceError);

    expect(actions).toHaveLength(2);
    expect(actions[0].label).toBe('Retry');
    expect(actions[1].label).toBe('Use Template');
  });
});

describe('getUserFriendlyError', () => {
  it('should return user-friendly error for known codes', () => {
    const apiError = new ApiError('Network error', 'NETWORK_ERROR', 503);
    const friendlyError = getUserFriendlyError(apiError);

    expect(friendlyError.title).toBe('Connection Problem');
    expect(friendlyError.message).toContain('Unable to connect to our servers');
    expect(friendlyError.suggestion).toBe('Check your internet connection');
    expect(friendlyError.originalError).toBe(apiError);
    expect(friendlyError.errorId).toContain('NETWORK_ERROR_');
  });

  it('should return default error for unknown codes', () => {
    const apiError = new ApiError('Unknown error', 'UNKNOWN_CODE', 500);
    const friendlyError = getUserFriendlyError(apiError);

    expect(friendlyError.title).toBe('Unexpected Error');
    expect(friendlyError.message).toContain('Something unexpected happened');
    expect(friendlyError.suggestion).toBe(
      'Try refreshing the page or contact support'
    );
  });
});

describe('USER_FRIENDLY_MESSAGES', () => {
  it('should have messages for all common error codes', () => {
    const expectedCodes = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'RATE_LIMIT',
      'SERVICE_UNAVAILABLE',
      'AUTHENTICATION_ERROR',
      'VALIDATION_ERROR',
      'GENERATION_FAILED',
      'UNKNOWN_ERROR',
    ];

    expectedCodes.forEach((code) => {
      expect(
        USER_FRIENDLY_MESSAGES[code as keyof typeof USER_FRIENDLY_MESSAGES]
      ).toBeDefined();
      expect(
        USER_FRIENDLY_MESSAGES[code as keyof typeof USER_FRIENDLY_MESSAGES]
          .title
      ).toBeTruthy();
      expect(
        USER_FRIENDLY_MESSAGES[code as keyof typeof USER_FRIENDLY_MESSAGES]
          .message
      ).toBeTruthy();
      expect(
        USER_FRIENDLY_MESSAGES[code as keyof typeof USER_FRIENDLY_MESSAGES]
          .suggestion
      ).toBeTruthy();
    });
  });
});
