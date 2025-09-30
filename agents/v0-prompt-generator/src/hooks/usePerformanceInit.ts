/**
 * Hook for initializing performance monitoring and optimizations
 */

import { useEffect } from 'react';
import { performanceMonitor } from '../lib/performance-monitor';
import { cacheManager } from '../lib/cache-manager';
import { setupProgressiveLoading } from '../lib/progressive-loader';

export const usePerformanceInit = () => {
  useEffect(() => {
    // Initialize performance monitoring
    const initPerformance = async () => {
      try {
        // Setup progressive loading
        setupProgressiveLoading();

        // Start periodic performance logging in development
        if (process.env.NODE_ENV === 'development') {
          const logInterval = setInterval(() => {
            const metrics = performanceMonitor.getAllMetrics();
            if (Object.keys(metrics).length > 0) {
              performanceMonitor.logSummary();
            }
          }, 30000); // Every 30 seconds

          // Cleanup function
          return () => {
            clearInterval(logInterval);
          };
        }
      } catch (error) {
        console.warn('Failed to initialize performance monitoring:', error);
      }
    };

    initPerformance();
  }, []);

  // Return performance utilities
  return {
    recordTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    endTiming: performanceMonitor.endTiming.bind(performanceMonitor),
    recordAIGeneration:
      performanceMonitor.recordAIGeneration.bind(performanceMonitor),
    getAllMetrics: performanceMonitor.getAllMetrics.bind(performanceMonitor),
    getCacheStats: () => {
      try {
        return cacheManager.getStats();
      } catch {
        return null;
      }
    },
  };
};

export default usePerformanceInit;
