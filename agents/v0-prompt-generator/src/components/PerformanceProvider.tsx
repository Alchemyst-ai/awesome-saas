'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { performanceMonitor } from '../lib/performance-monitor';
import { cacheManager } from '../lib/cache-manager';
import {
  setupProgressiveLoading,
  progressiveLoader,
} from '../lib/progressive-loader';

interface PerformanceContextType {
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  getStats: () => any;
  recordMetric: (
    name: string,
    duration: number,
    metadata?: Record<string, any>
  ) => void;
  warmUpCache: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
};

interface PerformanceProviderProps {
  children: ReactNode;
}

const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Auto-start monitoring in development
    if (process.env.NODE_ENV === 'development') {
      setIsMonitoring(true);
    }

    // Initialize performance optimizations
    initializePerformanceOptimizations();
  }, []);

  const initializePerformanceOptimizations = useCallback(async () => {
    try {
      // Initialize progressive loading
      setupProgressiveLoading();

      // Warm up cache with frequently used data
      cacheManager.warmUp();

      // Register service worker for caching
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered successfully:', registration);

          // Send performance data to service worker
          if (registration.active) {
            registration.active.postMessage({
              type: 'PERFORMANCE_LOG',
              data: performanceMonitor.getAllMetrics(),
            });
          }
        } catch (error) {
          console.warn('Service Worker registration failed:', error);
        }
      }

      // Setup performance monitoring intervals
      if (isMonitoring) {
        setupPerformanceMonitoring();
      }

      // Preload critical resources
      preloadCriticalResources();
    } catch (error) {
      console.warn('Performance optimization initialization failed:', error);
    }
  }, [isMonitoring]);

  const setupPerformanceMonitoring = useCallback(() => {
    // Monitor memory usage
    if (
      typeof window !== 'undefined' &&
      'performance' in window &&
      'memory' in performance
    ) {
      const checkMemoryUsage = () => {
        const memory = (performance as any).memory;
        if (memory) {
          performanceMonitor.recordComponentPerformance(
            'memory',
            memory.usedJSHeapSize
          );

          // Alert if memory usage is high
          if (memory.usedJSHeapSize > 50 * 1024 * 1024) {
            // 50MB
            console.warn('High memory usage detected:', {
              used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
              total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
              limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
            });
          }
        }
      };

      // Check memory every 30 seconds
      const memoryInterval = setInterval(checkMemoryUsage, 30000);

      // Cleanup on unmount
      return () => clearInterval(memoryInterval);
    }
  }, []);

  const preloadCriticalResources = useCallback(() => {
    // Preload critical components
    const criticalComponents = [
      () => import('./InputForm'),
      () => import('./GenerationEngine'),
      () => import('./OutputDisplay'),
    ];

    // Load components with delay to avoid blocking initial render
    setTimeout(() => {
      criticalComponents.forEach((loader, index) => {
        setTimeout(() => {
          loader().catch(() => {
            // Fail silently
          });
        }, index * 500); // Stagger loading
      });
    }, 2000);
  }, []);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    setupPerformanceMonitoring();
  }, [setupPerformanceMonitoring]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const getStats = useCallback(() => {
    return {
      performance: performanceMonitor.getAllMetrics(),
      cache: cacheManager.getStats(),
      progressive: progressiveLoader.getStats(),
      timestamp: new Date().toISOString(),
    };
  }, []);

  const recordMetric = useCallback(
    (name: string, duration: number, metadata?: Record<string, any>) => {
      if (isMonitoring) {
        const id = performanceMonitor.startTiming(name, metadata);
        // Simulate the duration by ending immediately with the provided duration
        performanceMonitor.endTiming(id, true);
      }
    },
    [isMonitoring]
  );

  const warmUpCache = useCallback(() => {
    cacheManager.warmUp();
  }, []);

  // Performance monitoring for React components
  useEffect(() => {
    if (isMonitoring && typeof window !== 'undefined') {
      // Monitor page load performance
      const measurePageLoad = () => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          performanceMonitor.recordComponentPerformance(
            'page-load',
            navigation.loadEventEnd - navigation.fetchStart
          );

          // Log detailed timing
          console.log('Page Load Performance:', {
            'DNS Lookup': `${navigation.domainLookupEnd - navigation.domainLookupStart}ms`,
            'TCP Connection': `${navigation.connectEnd - navigation.connectStart}ms`,
            'Request/Response': `${navigation.responseEnd - navigation.requestStart}ms`,
            'DOM Processing': `${navigation.domContentLoadedEventEnd - navigation.responseEnd}ms`,
            'Total Load Time': `${navigation.loadEventEnd - navigation.fetchStart}ms`,
          });
        }
      };

      // Measure after page is fully loaded
      if (document.readyState === 'complete') {
        measurePageLoad();
      } else {
        window.addEventListener('load', measurePageLoad);
      }

      // Monitor largest contentful paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              performanceMonitor.recordComponentPerformance(
                'lcp',
                lastEntry.startTime
              );
              console.log(
                'Largest Contentful Paint:',
                `${lastEntry.startTime.toFixed(2)}ms`
              );
            }
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // Monitor cumulative layout shift
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            if (clsValue > 0) {
              performanceMonitor.recordComponentPerformance('cls', clsValue);
              if (clsValue > 0.1) {
                console.warn(
                  'High Cumulative Layout Shift detected:',
                  clsValue.toFixed(4)
                );
              }
            }
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });

          return () => {
            lcpObserver.disconnect();
            clsObserver.disconnect();
          };
        } catch (error) {
          console.warn('Performance Observer setup failed:', error);
        }
      }
    }
  }, [isMonitoring]);

  // Log performance summary in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isMonitoring) {
      const interval = setInterval(() => {
        const stats = performanceMonitor.getAllMetrics();
        if (Object.keys(stats).length > 0) {
          performanceMonitor.logSummary();
        }
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  // Add performance monitoring to window for debugging
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      (window as any).performanceMonitor = performanceMonitor;
      (window as any).cacheManager = cacheManager;
      (window as any).progressiveLoader = progressiveLoader;
    }
  }, []);

  return (
    <PerformanceContext.Provider
      value={{
        isMonitoring,
        startMonitoring,
        stopMonitoring,
        getStats,
        recordMetric,
        warmUpCache,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
};

export default PerformanceProvider;
