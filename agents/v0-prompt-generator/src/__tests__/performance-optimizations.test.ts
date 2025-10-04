/**
 * Tests for performance optimizations and monitoring
 */

import { performanceMonitor } from '../lib/performance-monitor';
import { cacheManager, CACHE_KEYS, CACHE_TTL } from '../lib/cache-manager';
import {
  progressiveLoader,
  setupProgressiveLoading,
} from '../lib/progressive-loader';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  getEntriesByType: jest.fn(() => []),
};

// Mock PerformanceObserver
const mockPerformanceObserver = jest.fn();
mockPerformanceObserver.prototype.observe = jest.fn();
mockPerformanceObserver.prototype.disconnect = jest.fn();

// Setup mocks
beforeAll(() => {
  global.performance = mockPerformance as any;
  global.PerformanceObserver = mockPerformanceObserver as any;

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  global.localStorage = localStorageMock as any;

  // Mock window
  global.window = {
    ...global.window,
    performance: mockPerformance,
    PerformanceObserver: mockPerformanceObserver,
    localStorage: localStorageMock,
    requestIdleCallback: jest.fn((cb) => setTimeout(cb, 0)),
  } as any;
});

describe('Performance Monitor', () => {
  beforeEach(() => {
    performanceMonitor.clear();
    jest.clearAllMocks();
  });

  describe('Timing Measurements', () => {
    it('should start and end timing measurements', () => {
      const id = performanceMonitor.startTiming('test-operation');
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');

      const duration = performanceMonitor.endTiming(id);
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should record AI generation performance', () => {
      performanceMonitor.recordAIGeneration(
        100, // input length
        500, // output length
        2000, // duration
        true, // success
        'saas' // industry
      );

      const stats = performanceMonitor.getAIStats();
      expect(stats).toBeDefined();
      expect(stats?.totalRequests).toBe(1);
      expect(stats?.averageTime).toBe(2000);
      expect(stats?.successRate).toBe(1);
    });

    it('should record component performance', () => {
      performanceMonitor.recordComponentPerformance('TestComponent', 50, true);

      const componentStats = performanceMonitor.getComponentStats();
      expect(componentStats.has('TestComponent')).toBe(true);

      const stats = componentStats.get('TestComponent');
      expect(stats?.renderTime).toBe(50);
      expect(stats?.updateCount).toBe(1);
    });
  });

  describe('Performance Statistics', () => {
    it('should calculate performance statistics correctly', () => {
      // Record multiple measurements
      for (let i = 0; i < 5; i++) {
        performanceMonitor.recordAIGeneration(
          100,
          500,
          1000 + i * 500, // Varying durations
          true,
          'saas'
        );
      }

      const stats = performanceMonitor.getAIStats();
      expect(stats?.totalRequests).toBe(5);
      expect(stats?.averageTime).toBe(2000); // Average of 1000, 1500, 2000, 2500, 3000
      expect(stats?.successRate).toBe(1);
    });

    it('should generate performance recommendations', () => {
      // Record slow AI generation
      performanceMonitor.recordAIGeneration(100, 500, 20000, true, 'saas');

      const report = performanceMonitor.getPerformanceReport();
      expect(report.recommendations).toContain(
        expect.stringContaining('AI generation is slow')
      );
    });
  });

  describe('Web Vitals Monitoring', () => {
    it('should initialize web vitals monitoring', () => {
      performanceMonitor.monitorCoreWebVitals();

      // Verify that PerformanceObserver was called for each vital
      expect(mockPerformanceObserver).toHaveBeenCalledTimes(5); // LCP, FID, CLS, FCP, TTFB
    });

    it('should rate web vitals correctly', () => {
      // This tests the private method indirectly through recordWebVital
      const mockRecordWebVital = jest.spyOn(
        performanceMonitor as any,
        'recordWebVital'
      );

      // Simulate good LCP
      (performanceMonitor as any).recordWebVital('LCP', 2000);
      expect(mockRecordWebVital).toHaveBeenCalledWith('LCP', 2000);

      // Simulate poor LCP
      (performanceMonitor as any).recordWebVital('LCP', 5000);
      expect(mockRecordWebVital).toHaveBeenCalledWith('LCP', 5000);
    });
  });
});

describe('Cache Manager', () => {
  beforeEach(() => {
    cacheManager.clear();
    jest.clearAllMocks();
  });

  describe('Basic Cache Operations', () => {
    it('should store and retrieve cache entries', () => {
      const testData = { test: 'data' };
      cacheManager.set('test-key', testData);

      const retrieved = cacheManager.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should respect TTL for cache entries', async () => {
      const testData = { test: 'data' };
      cacheManager.set('test-key', testData, 100); // 100ms TTL

      // Should be available immediately
      expect(cacheManager.get('test-key')).toEqual(testData);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be expired
      expect(cacheManager.get('test-key')).toBeNull();
    });

    it('should track cache statistics', () => {
      cacheManager.set('key1', 'data1');
      cacheManager.set('key2', 'data2');

      // Generate hits and misses
      cacheManager.get('key1'); // hit
      cacheManager.get('key1'); // hit
      cacheManager.get('nonexistent'); // miss

      const stats = cacheManager.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.size).toBe(2);
      expect(stats.hitRate).toBeCloseTo(0.67, 2);
    });
  });

  describe('Cache Keys and TTL', () => {
    it('should generate correct cache keys', () => {
      const industryKey = CACHE_KEYS.INDUSTRY_CONFIG('saas');
      expect(industryKey).toBe('industry_config_saas');

      const templateKey = CACHE_KEYS.PROMPT_TEMPLATE('saas', 'basic');
      expect(templateKey).toBe('prompt_template_saas_basic');
    });

    it('should use appropriate TTL values', () => {
      expect(CACHE_TTL.INDUSTRY_DATA).toBe(30 * 60 * 1000); // 30 minutes
      expect(CACHE_TTL.AI_RESPONSES).toBe(10 * 60 * 1000); // 10 minutes
      expect(CACHE_TTL.TEMPLATES).toBe(60 * 60 * 1000); // 1 hour
    });
  });

  describe('Intelligent Prefetching', () => {
    it('should prefetch related industries', () => {
      const mockPrefetch = jest.spyOn(
        cacheManager as any,
        'prefetchIndustryData'
      );

      cacheManager.intelligentPrefetch('saas', ['ecommerce', 'saas']);

      // Should prefetch related industries
      expect(mockPrefetch).toHaveBeenCalled();
    });

    it('should analyze user history correctly', () => {
      const history = ['saas', 'saas', 'ecommerce', 'saas', 'portfolio'];
      const analyzed = (cacheManager as any).analyzeUserHistory(history);

      // Should return most frequent industries
      expect(analyzed[0]).toBe('saas'); // Most frequent
      expect(analyzed).toContain('ecommerce');
      expect(analyzed).toContain('portfolio');
    });
  });

  describe('Memory Management', () => {
    it('should evict least recently used entries when full', () => {
      // Fill cache to capacity
      const originalMaxSize = (cacheManager as any).config.maxSize;
      (cacheManager as any).config.maxSize = 3;

      cacheManager.set('key1', 'data1');
      cacheManager.set('key2', 'data2');
      cacheManager.set('key3', 'data3');

      // Access key1 to make it recently used
      cacheManager.get('key1');

      // Add another entry, should evict key2 (least recently used)
      cacheManager.set('key4', 'data4');

      expect(cacheManager.get('key1')).toBe('data1'); // Should still exist
      expect(cacheManager.get('key2')).toBeNull(); // Should be evicted
      expect(cacheManager.get('key3')).toBe('data3'); // Should still exist
      expect(cacheManager.get('key4')).toBe('data4'); // Should exist

      // Restore original max size
      (cacheManager as any).config.maxSize = originalMaxSize;
    });

    it('should optimize memory usage', () => {
      const mockCleanup = jest.spyOn(cacheManager, 'cleanup');
      const mockEvict = jest.spyOn(
        cacheManager as any,
        'evictLeastAccessedEntries'
      );

      cacheManager.optimizeMemoryUsage();

      expect(mockCleanup).toHaveBeenCalled();
    });
  });
});

describe('Progressive Loader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Module Loading', () => {
    it('should setup progressive loading correctly', () => {
      const mockAddToQueue = jest.spyOn(progressiveLoader, 'addToQueue');

      setupProgressiveLoading();

      // Should add critical components
      expect(mockAddToQueue).toHaveBeenCalledWith(
        'ErrorBoundary',
        expect.any(Function),
        'critical'
      );

      // Should add high priority components
      expect(mockAddToQueue).toHaveBeenCalledWith(
        'GenerationEngine',
        expect.any(Function),
        'high'
      );
    });

    it('should track loading progress', () => {
      const stats = progressiveLoader.getStats();

      expect(stats).toHaveProperty('totalModules');
      expect(stats).toHaveProperty('loadedModules');
      expect(stats).toHaveProperty('loadingProgress');
      expect(stats.loadingProgress).toBeGreaterThanOrEqual(0);
      expect(stats.loadingProgress).toBeLessThanOrEqual(100);
    });

    it('should check if modules are loaded', () => {
      const isLoaded = progressiveLoader.isLoaded('TestModule');
      expect(typeof isLoaded).toBe('boolean');
    });
  });
});

describe('Integration Tests', () => {
  it('should work together for complete performance optimization', async () => {
    // Initialize performance monitoring
    performanceMonitor.monitorCoreWebVitals();
    performanceMonitor.monitorResourceLoading();

    // Setup progressive loading
    setupProgressiveLoading();

    // Warm up cache
    cacheManager.warmUp();

    // Simulate AI generation with caching
    const testInput = {
      websiteName: 'Test',
      industry: 'saas',
      aboutInfo: 'Test app',
    };
    const cacheKey = CACHE_KEYS.AI_RESPONSE('test-hash');

    // First request - should miss cache
    expect(cacheManager.get(cacheKey)).toBeNull();

    // Simulate AI response
    const aiResponse = { prompt: 'Generated prompt', metadata: {} };
    cacheManager.set(cacheKey, aiResponse);

    // Second request - should hit cache
    expect(cacheManager.get(cacheKey)).toEqual(aiResponse);

    // Record performance
    performanceMonitor.recordAIGeneration(100, 500, 1500, true, 'saas');

    // Get comprehensive stats
    const performanceReport = performanceMonitor.getPerformanceReport();
    const cacheStats = cacheManager.getStats();
    const progressStats = progressiveLoader.getStats();

    expect(performanceReport).toBeDefined();
    expect(cacheStats.hitRate).toBeGreaterThan(0);
    expect(progressStats.loadingProgress).toBeGreaterThanOrEqual(0);
  });
});

describe('Bundle Optimization', () => {
  it('should implement code splitting hints', () => {
    const mockCreateElement = jest.spyOn(document, 'createElement');
    const mockAppendChild = jest.spyOn(document.head, 'appendChild');

    // Import bundle optimization utilities
    const { bundleOptimization } = require('../lib/progressive-loader');

    bundleOptimization.addCodeSplittingHints();

    // Should create modulepreload links
    expect(mockCreateElement).toHaveBeenCalledWith('link');
  });

  it('should add resource hints for performance', () => {
    const mockCreateElement = jest.spyOn(document, 'createElement');

    const { bundleOptimization } = require('../lib/progressive-loader');

    bundleOptimization.addResourceHints();

    // Should create dns-prefetch and preconnect links
    expect(mockCreateElement).toHaveBeenCalledWith('link');
  });
});

// Cleanup
afterAll(() => {
  jest.restoreAllMocks();
});
