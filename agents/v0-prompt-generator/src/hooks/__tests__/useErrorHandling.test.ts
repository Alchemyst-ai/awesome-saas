import { renderHook, act } from '@testing-library/react';
import { useErrorHandling } from '../useErrorHandling';
import { ApiError } from '../../lib/error-handling';

// Mock the feedback hook
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
const mockShowWarning = jest.fn();
const mockShowInfo = jest.fn();
const mockHideFeedback = jest.fn();
const mockClearAllFeedback = jest.fn();

jest.mock('../components/UserFeedback', () => ({
  useFeedback: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
    showWarning: mockShowWarning,
    showInfo: mockShowInfo,
    hideFeedback: mockHideFeedback,
    clearAllFeedback: mockClearAllFeedback,
  }),
}));

// Mock the network status hook
const mockNetworkStatus = {
  isOnline: true,
  isSlowConnection: false,
  connectionType: 'wifi',
  effectiveType: '4g',
  downlink: 10,
  rtt: 50,
};

const mockExecuteOperation = jest.fn();

jest.mock('../useNetworkStatus', () => ({
  useNetworkAwareOperation: () => ({
    networkStatus: mockNetworkStatus,
    executeOperation: mockExecuteOperation,
  }),
}));

describe('useErrorHandling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecuteOperation.mockImplementation((operation) => operation());
  });

  it('handles basic errors with feedback', async () => {
    const { result } = renderHook(() => useErrorHandling());

    const testError = new Error('Test error');

    act(() => {
      result.current.handleError(testError, 'Test context');
    });

    expect(mockShowError).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Test error'),
      true
    );
  });

  it('handles API errors with appropriate feedback', async () => {
    const { result } = renderHook(() => useErrorHandling());

    const apiError = new ApiError('Network error', 'NETWORK_ERROR', 503);

    act(() => {
      result.current.handleError(apiError, 'API call');
    });

    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining('Connection Problem'),
      expect.any(String),
      true
    );
  });

  it('executes operations with error handling', async () => {
    const { result } = renderHook(() => useErrorHandling());

    const mockOperation = jest.fn().mockResolvedValue('success');
    const mockOnSuccess = jest.fn();

    await act(async () => {
      const response = await result.current.executeWithErrorHandling(
        mockOperation,
        {
          operationName: 'Test Operation',
          onSuccess: mockOnSuccess,
        }
      );

      expect(response).toBe('success');
      expect(mockOnSuccess).toHaveBeenCalledWith('success');
    });
  });

  it('handles operation failures with retry', async () => {
    const { result } = renderHook(() => useErrorHandling());

    const mockOperation = jest
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValue('success');

    await act(async () => {
      const response = await result.current.executeWithErrorHandling(
        mockOperation,
        {
          operationName: 'Test Operation',
          maxRetries: 2,
        }
      );

      expect(response).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });
  });

  it('returns fallback value on final failure', async () => {
    const { result } = renderHook(() => useErrorHandling());

    const mockOperation = jest
      .fn()
      .mockRejectedValue(new Error('Persistent failure'));

    await act(async () => {
      const response = await result.current.executeWithErrorHandling(
        mockOperation,
        {
          operationName: 'Test Operation',
          maxRetries: 1,
          fallbackValue: 'fallback',
        }
      );

      expect(response).toBe('fallback');
    });
  });

  it('handles validation errors', () => {
    const { result } = renderHook(() => useErrorHandling());

    const validationErrors = [
      { field: 'email', message: 'Invalid email format' },
      { field: 'password', message: 'Password too short' },
    ];

    act(() => {
      result.current.handleValidationError(validationErrors);
    });

    expect(mockShowError).toHaveBeenCalledWith(
      'Validation Error',
      expect.stringContaining('Invalid email format'),
      false
    );
  });

  it('shows success feedback', () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.showSuccess('Success Title', 'Success message', 3000);
    });

    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Success Title',
      'Success message',
      3000
    );
  });

  it('handles network errors appropriately', () => {
    const { result } = renderHook(() => useErrorHandling());

    // Test offline scenario
    mockNetworkStatus.isOnline = false;

    act(() => {
      result.current.handleNetworkError(new Error('Network error'));
    });

    expect(mockShowWarning).toHaveBeenCalledWith(
      'Offline',
      expect.stringContaining('currently offline'),
      0
    );

    // Reset for next test
    mockNetworkStatus.isOnline = true;
  });

  it('handles slow connection warnings', () => {
    const { result } = renderHook(() => useErrorHandling());

    // Test slow connection scenario
    mockNetworkStatus.isSlowConnection = true;

    act(() => {
      result.current.handleNetworkError(new Error('Network error'));
    });

    expect(mockShowWarning).toHaveBeenCalledWith(
      'Slow Connection',
      expect.stringContaining('connection appears to be slow'),
      8000
    );

    // Reset for next test
    mockNetworkStatus.isSlowConnection = false;
  });

  it('creates loading feedback with cleanup', () => {
    const { result } = renderHook(() => useErrorHandling());

    mockShowInfo.mockReturnValue('feedback-id');

    let cleanup: (() => void) | undefined;

    act(() => {
      cleanup = result.current.showLoadingFeedback('Loading', 'Please wait...');
    });

    expect(mockShowInfo).toHaveBeenCalledWith('Loading', 'Please wait...', 0);

    // Test cleanup
    act(() => {
      cleanup!();
    });

    expect(mockHideFeedback).toHaveBeenCalledWith('feedback-id');
  });

  it('creates recovery actions for API errors', () => {
    const { result } = renderHook(() => useErrorHandling());

    const apiError = new ApiError('Network error', 'NETWORK_ERROR', 503);
    const mockOnRetry = jest.fn();

    const actions = result.current.createRecoveryActions(apiError, mockOnRetry);

    expect(actions).toHaveLength(2);
    expect(actions[0].label).toBe('Retry');
    expect(actions[0].primary).toBe(true);

    // Test retry action
    act(() => {
      actions[0].action();
    });

    expect(mockOnRetry).toHaveBeenCalled();
  });
});
