'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

/**
 * Hook to monitor network connectivity and connection quality
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
  });

  const updateNetworkStatus = useCallback(() => {
    const isOnline = navigator.onLine;
    let connectionInfo = {
      connectionType: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      isSlowConnection: false,
    };

    // Check for Network Information API support
    if ('connection' in navigator) {
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

      if (connection) {
        connectionInfo = {
          connectionType: connection.type || 'unknown',
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          isSlowConnection:
            connection.effectiveType === 'slow-2g' ||
            connection.effectiveType === '2g' ||
            (connection.downlink && connection.downlink < 1.5),
        };
      }
    }

    setNetworkStatus({
      isOnline,
      ...connectionInfo,
    });
  }, []);

  useEffect(() => {
    // Initial status check
    updateNetworkStatus();

    // Event listeners for online/offline status
    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes if supported
    if ('connection' in navigator) {
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

      if (connection && connection.addEventListener) {
        connection.addEventListener('change', updateNetworkStatus);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if ('connection' in navigator) {
        const connection =
          (navigator as any).connection ||
          (navigator as any).mozConnection ||
          (navigator as any).webkitConnection;

        if (connection && connection.removeEventListener) {
          connection.removeEventListener('change', updateNetworkStatus);
        }
      }
    };
  }, [updateNetworkStatus]);

  return networkStatus;
}

/**
 * Hook for handling offline functionality
 */
export function useOfflineHandler() {
  const networkStatus = useNetworkStatus();
  const [offlineQueue, setOfflineQueue] = useState<Array<() => Promise<any>>>(
    []
  );

  const addToOfflineQueue = useCallback(
    (operation: () => Promise<any>) => {
      if (!networkStatus.isOnline) {
        setOfflineQueue((prev) => [...prev, operation]);
        return true; // Added to queue
      }
      return false; // Not added, execute immediately
    },
    [networkStatus.isOnline]
  );

  const processOfflineQueue = useCallback(async () => {
    if (networkStatus.isOnline && offlineQueue.length > 0) {
      console.log(`Processing ${offlineQueue.length} queued operations`);

      const operations = [...offlineQueue];
      setOfflineQueue([]);

      for (const operation of operations) {
        try {
          await operation();
        } catch (error) {
          console.error('Failed to process queued operation:', error);
          // Re-add failed operations to queue
          setOfflineQueue((prev) => [...prev, operation]);
        }
      }
    }
  }, [networkStatus.isOnline, offlineQueue]);

  // Process queue when coming back online
  useEffect(() => {
    if (networkStatus.isOnline) {
      processOfflineQueue();
    }
  }, [networkStatus.isOnline, processOfflineQueue]);

  const clearOfflineQueue = useCallback(() => {
    setOfflineQueue([]);
  }, []);

  return {
    networkStatus,
    offlineQueue,
    addToOfflineQueue,
    processOfflineQueue,
    clearOfflineQueue,
  };
}

/**
 * Hook for network-aware operations with automatic retry
 */
export function useNetworkAwareOperation() {
  const { networkStatus, addToOfflineQueue } = useOfflineHandler();

  const executeOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: {
        retryOnline?: boolean;
        showOfflineMessage?: boolean;
      } = {}
    ): Promise<T> => {
      const { retryOnline = true, showOfflineMessage = true } = options;

      if (!networkStatus.isOnline) {
        if (showOfflineMessage) {
          console.warn('Operation attempted while offline');
        }

        if (retryOnline) {
          const wasQueued = addToOfflineQueue(operation);
          if (wasQueued) {
            throw new Error('Operation queued for when connection is restored');
          }
        } else {
          throw new Error('No internet connection available');
        }
      }

      // Check for slow connection warning
      if (networkStatus.isSlowConnection) {
        console.warn('Slow connection detected, operation may take longer');
      }

      return await operation();
    },
    [networkStatus, addToOfflineQueue]
  );

  return {
    networkStatus,
    executeOperation,
  };
}
