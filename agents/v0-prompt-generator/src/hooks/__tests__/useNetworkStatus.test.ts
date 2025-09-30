import { renderHook, act } from '@testing-library/react';
import {
  useNetworkStatus,
  useOfflineHandler,
  useNetworkAwareOperation,
} from '../useNetworkStatus';

// Mock navigator and connection API
const mockNavigator = {
  onLine: true,
  connection: {
    type: 'wifi',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
};

// Mock window event listeners
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

beforeEach(() => {
  Object.defineProperty(window, 'navigator', {
    value: mockNavigator,
    writable: true,
  });

  Object.defineProperty(window, 'addEventListener', {
    value: mockAddEventListener,
    writable: true,
  });

  Object.defineProperty(window, 'removeEventListener', {
    value: mockRemoveEventListener,
    writable: true,
  });

  jest.clearAllMocks();
});

describe('useNetworkStatus', () => {
  it('returns initial network status', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.connectionType).toBe('wifi');
    expect(result.current.effectiveType).toBe('4g');
    expect(result.current.downlink).toBe(10);
    expect(result.current.rtt).toBe(50);
    expect(result.current.isSlowConnection).toBe(false);
  });

  it('detects slow connection', () => {
    mockNavigator.connection.effectiveType = '2g';
    mockNavigator.connection.downlink = 0.5;

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isSlowConnection).toBe(true);
  });

  it('sets up event listeners on mount', () => {
    renderHook(() => useNetworkStatus());

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );
    expect(mockNavigator.connection.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useNetworkStatus());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );
    expect(mockNavigator.connection.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('handles missing connection API gracefully', () => {
    const navigatorWithoutConnection = { onLine: true };
    Object.defineProperty(window, 'navigator', {
      value: navigatorWithoutConnection,
      writable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.connectionType).toBe('unknown');
    expect(result.current.effectiveType).toBe('unknown');
  });
});

describe('useOfflineHandler', () => {
  it('adds operations to queue when offline', () => {
    mockNavigator.onLine = false;

    const { result } = renderHook(() => useOfflineHandler());

    const mockOperation = jest.fn().mockResolvedValue('result');

    act(() => {
      const wasQueued = result.current.addToOfflineQueue(mockOperation);
      expect(wasQueued).toBe(true);
    });

    expect(result.current.offlineQueue).toHaveLength(1);
  });

  it('does not queue operations when online', () => {
    mockNavigator.onLine = true;

    const { result } = renderHook(() => useOfflineHandler());

    const mockOperation = jest.fn().mockResolvedValue('result');

    act(() => {
      const wasQueued = result.current.addToOfflineQueue(mockOperation);
      expect(wasQueued).toBe(false);
    });

    expect(result.current.offlineQueue).toHaveLength(0);
  });

  it('processes queue when coming back online', async () => {
    const { result, rerender } = renderHook(() => useOfflineHandler());

    // Start offline
    mockNavigator.onLine = false;
    rerender();

    const mockOperation1 = jest.fn().mockResolvedValue('result1');
    const mockOperation2 = jest.fn().mockResolvedValue('result2');

    act(() => {
      result.current.addToOfflineQueue(mockOperation1);
      result.current.addToOfflineQueue(mockOperation2);
    });

    expect(result.current.offlineQueue).toHaveLength(2);

    // Come back online
    mockNavigator.onLine = true;
    rerender();

    // Wait for queue processing
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockOperation1).toHaveBeenCalled();
    expect(mockOperation2).toHaveBeenCalled();
    expect(result.current.offlineQueue).toHaveLength(0);
  });

  it('handles failed operations by re-queuing them', async () => {
    const { result, rerender } = renderHook(() => useOfflineHandler());

    // Start offline
    mockNavigator.onLine = false;
    rerender();

    const mockFailedOperation = jest
      .fn()
      .mockRejectedValue(new Error('Operation failed'));

    act(() => {
      result.current.addToOfflineQueue(mockFailedOperation);
    });

    // Come back online
    mockNavigator.onLine = true;
    rerender();

    // Wait for queue processing
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockFailedOperation).toHaveBeenCalled();
    expect(result.current.offlineQueue).toHaveLength(1); // Re-queued
  });

  it('clears offline queue', () => {
    mockNavigator.onLine = false;

    const { result } = renderHook(() => useOfflineHandler());

    const mockOperation = jest.fn().mockResolvedValue('result');

    act(() => {
      result.current.addToOfflineQueue(mockOperation);
      expect(result.current.offlineQueue).toHaveLength(1);

      result.current.clearOfflineQueue();
      expect(result.current.offlineQueue).toHaveLength(0);
    });
  });
});

describe('useNetworkAwareOperation', () => {
  it('executes operation when online', async () => {
    mockNavigator.onLine = true;

    const { result } = renderHook(() => useNetworkAwareOperation());

    const mockOperation = jest.fn().mockResolvedValue('success');

    await act(async () => {
      const response = await result.current.executeOperation(mockOperation);
      expect(response).toBe('success');
    });

    expect(mockOperation).toHaveBeenCalled();
  });

  it('throws error when offline and not retrying', async () => {
    mockNavigator.onLine = false;

    const { result } = renderHook(() => useNetworkAwareOperation());

    const mockOperation = jest.fn().mockResolvedValue('success');

    await act(async () => {
      await expect(
        result.current.executeOperation(mockOperation, { retryOnline: false })
      ).rejects.toThrow('No internet connection available');
    });

    expect(mockOperation).not.toHaveBeenCalled();
  });

  it('queues operation when offline and retrying enabled', async () => {
    mockNavigator.onLine = false;

    const { result } = renderHook(() => useNetworkAwareOperation());

    const mockOperation = jest.fn().mockResolvedValue('success');

    await act(async () => {
      await expect(
        result.current.executeOperation(mockOperation, { retryOnline: true })
      ).rejects.toThrow('Operation queued for when connection is restored');
    });

    expect(mockOperation).not.toHaveBeenCalled();
  });

  it('warns about slow connection', async () => {
    mockNavigator.onLine = true;
    mockNavigator.connection.effectiveType = '2g';

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => useNetworkAwareOperation());

    const mockOperation = jest.fn().mockResolvedValue('success');

    await act(async () => {
      await result.current.executeOperation(mockOperation);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Slow connection detected')
    );

    consoleSpy.mockRestore();
  });
});
