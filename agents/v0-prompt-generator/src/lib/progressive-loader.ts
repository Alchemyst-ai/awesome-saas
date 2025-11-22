/**
 * Progressive loading utilities for optimizing bundle size and loading performance
 */

import { preloadIndustryData } from './industry-config';

interface LoadingPriority {
  critical: string[];
  high: string[];
  medium: string[];
  low: string[];
}

interface ProgressiveLoadingConfig {
  enablePreloading: boolean;
  preloadDelay: number;
  chunkSize: number;
  enableServiceWorker: boolean;
}

class ProgressiveLoader {
  private config: ProgressiveLoadingConfig = {
    enablePreloading: true,
    preloadDelay: 2000, // 2 seconds after initial load
    chunkSize: 3, // Load 3 components at a time
    enableServiceWorker:
      typeof window !== 'undefined' && 'serviceWorker' in navigator,
  };

  private loadingQueue: Map<string, () => Promise<any>> = new Map();
  private loadedModules: Set<string> = new Set();
  private preloadingStarted = false;

  /**
   * Initialize progressive loading
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Start preloading after initial page load
    if (document.readyState === 'complete') {
      this.startProgressiveLoading();
    } else {
      window.addEventListener('load', () => {
        setTimeout(
          () => this.startProgressiveLoading(),
          this.config.preloadDelay
        );
      });
    }

    // Register service worker for caching
    if (this.config.enableServiceWorker) {
      this.registerServiceWorker();
    }
  }

  /**
   * Add module to loading queue
   */
  addToQueue(
    name: string,
    loader: () => Promise<any>,
    priority: keyof LoadingPriority = 'medium'
  ): void {
    this.loadingQueue.set(`${priority}:${name}`, loader);
  }

  /**
   * Preload critical modules immediately
   */
  preloadCritical(): void {
    const criticalModules: Array<[string, any]> = [];
    this.loadingQueue.forEach((value, key) => {
      if (key.startsWith('critical:')) {
        criticalModules.push([key, value]);
      }
    });

    this.loadModulesInBatches(criticalModules);
  }

  /**
   * Start progressive loading based on priority
   */
  private async startProgressiveLoading(): Promise<void> {
    if (this.preloadingStarted) return;
    this.preloadingStarted = true;

    // Load in priority order
    const priorities: (keyof LoadingPriority)[] = [
      'critical',
      'high',
      'medium',
      'low',
    ];

    for (const priority of priorities) {
      const modules: Array<[string, any]> = [];
      this.loadingQueue.forEach((value, key) => {
        if (key.startsWith(`${priority}:`)) {
          modules.push([key, value]);
        }
      });

      if (modules.length > 0) {
        await this.loadModulesInBatches(modules);

        // Add delay between priority levels to avoid blocking
        if (priority !== 'low') {
          await this.delay(500);
        }
      }
    }

    // Preload industry data
    if (this.config.enablePreloading) {
      preloadIndustryData();
    }
  }

  /**
   * Load modules in batches to avoid overwhelming the browser
   */
  private async loadModulesInBatches(
    modules: [string, () => Promise<any>][]
  ): Promise<void> {
    for (let i = 0; i < modules.length; i += this.config.chunkSize) {
      const batch = modules.slice(i, i + this.config.chunkSize);

      await Promise.allSettled(
        batch.map(async ([name, loader]) => {
          try {
            if (!this.loadedModules.has(name)) {
              await loader();
              this.loadedModules.add(name);
            }
          } catch (error) {
            console.warn(`Failed to preload module ${name}:`, error);
          }
        })
      );

      // Small delay between batches
      if (i + this.config.chunkSize < modules.length) {
        await this.delay(100);
      }
    }
  }

  /**
   * Register service worker for caching
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      }
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if module is loaded
   */
  isLoaded(name: string): boolean {
    return this.loadedModules.has(name);
  }

  /**
   * Get loading statistics
   */
  getStats(): {
    totalModules: number;
    loadedModules: number;
    loadingProgress: number;
  } {
    return {
      totalModules: this.loadingQueue.size,
      loadedModules: this.loadedModules.size,
      loadingProgress:
        this.loadingQueue.size > 0
          ? (this.loadedModules.size / this.loadingQueue.size) * 100
          : 100,
    };
  }
}

// Create singleton instance
export const progressiveLoader = new ProgressiveLoader();

/**
 * Setup progressive loading for the application
 */
export const setupProgressiveLoading = (): void => {
  // Critical components (load immediately)
  progressiveLoader.addToQueue(
    'ErrorBoundary',
    () => import('../components/ErrorBoundary'),
    'critical'
  );

  progressiveLoader.addToQueue(
    'LoadingSpinner',
    () => import('../components/LoadingSpinner'),
    'critical'
  );

  // High priority components (load after critical)
  progressiveLoader.addToQueue(
    'GenerationEngine',
    () => import('../components/GenerationEngine'),
    'high'
  );

  progressiveLoader.addToQueue(
    'OutputDisplay',
    () => import('../components/OutputDisplay'),
    'high'
  );

  progressiveLoader.addToQueue(
    'UserFeedback',
    () => import('../components/UserFeedback'),
    'high'
  );

  // High priority utilities
  progressiveLoader.addToQueue(
    'IndustryUtils',
    () => import('../utils/industry-utils'),
    'high'
  );

  progressiveLoader.addToQueue(
    'FormHandling',
    () => import('../utils/form-handling'),
    'high'
  );

  progressiveLoader.addToQueue(
    'ValidationUtils',
    () => import('../utils/validation'),
    'high'
  );

  // Medium priority components
  progressiveLoader.addToQueue(
    'ExampleGallery',
    () => import('../components/ExampleGallery'),
    'medium'
  );

  progressiveLoader.addToQueue(
    'PerformanceDashboard',
    () => import('../components/PerformanceDashboard'),
    'medium'
  );

  // Medium priority utilities
  progressiveLoader.addToQueue(
    'ExampleUtils',
    () => import('../utils/example-utils'),
    'medium'
  );

  progressiveLoader.addToQueue(
    'FormattingUtils',
    () => import('../utils/formatting'),
    'medium'
  );

  // Medium priority data
  progressiveLoader.addToQueue(
    'ExamplePrompts',
    () => import('../data/example-prompts'),
    'medium'
  );

  progressiveLoader.addToQueue(
    'IndustryConfig',
    () => import('../lib/industry-config'),
    'medium'
  );

  // Low priority components and data
  progressiveLoader.addToQueue(
    'IndustryUsage',
    () => import('../examples/industry-usage'),
    'low'
  );

  progressiveLoader.addToQueue(
    'FeatureMappings',
    () => import('../lib/feature-mappings'),
    'low'
  );

  progressiveLoader.addToQueue(
    'PromptTemplates',
    () => import('../lib/prompt-templates'),
    'low'
  );

  // Initialize progressive loading
  progressiveLoader.init();
};

/**
 * Preload specific component
 */
export const preloadComponent = async (
  componentName: string
): Promise<void> => {
  const loaders: Record<string, () => Promise<any>> = {
    ExampleGallery: () => import('../components/ExampleGallery'),
    GenerationEngine: () => import('../components/GenerationEngine'),
    OutputDisplay: () => import('../components/OutputDisplay'),
    InputForm: () => import('../components/InputForm'),
  };

  const loader = loaders[componentName];
  if (loader && !progressiveLoader.isLoaded(componentName)) {
    try {
      await loader();
    } catch (error) {
      console.warn(`Failed to preload ${componentName}:`, error);
    }
  }
};

/**
 * Hook for component-level preloading
 */
export const usePreloader = () => {
  return {
    preloadComponent,
    isLoaded: progressiveLoader.isLoaded.bind(progressiveLoader),
    getStats: progressiveLoader.getStats.bind(progressiveLoader),
  };
};

/**
 * Bundle size optimization utilities
 */
export const bundleOptimization = {
  /**
   * Lazy load heavy dependencies
   */
  loadHeavyDependencies: async () => {
    // Load heavy libraries only when needed
    const modules = await Promise.allSettled([
      import('@heroicons/react/24/outline'),
      import('@heroicons/react/24/solid'),
    ]);

    return modules.map((result) =>
      result.status === 'fulfilled' ? result.value : null
    );
  },

  /**
   * Optimize images for better loading
   */
  optimizeImages: () => {
    if (typeof window === 'undefined') return;

    // Add intersection observer for lazy image loading
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              img.src = img.dataset.src || '';
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px', // Start loading 50px before image comes into view
          threshold: 0.1,
        }
      );

      images.forEach((img) => imageObserver.observe(img));
    }
  },

  /**
   * Prefetch critical resources
   */
  prefetchCriticalResources: () => {
    if (typeof window === 'undefined') return;

    const criticalResources = [
      '/api/health',
      // Add other critical API endpoints
    ];

    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  },

  /**
   * Implement resource hints for better performance
   */
  addResourceHints: () => {
    if (typeof window === 'undefined') return;

    // DNS prefetch for external domains
    const externalDomains = ['fonts.googleapis.com', 'fonts.gstatic.com'];

    externalDomains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });

    // Preconnect to critical origins
    const criticalOrigins = ['https://fonts.googleapis.com'];

    criticalOrigins.forEach((origin) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  },

  /**
   * Optimize font loading
   */
  optimizeFonts: () => {
    if (typeof window === 'undefined') return;

    // Add font-display: swap to existing font faces
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * Monitor and optimize bundle size
   */
  monitorBundleSize: () => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development')
      return;

    // Monitor script loading
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('_next/static/chunks/')) {
          const size = (entry as any).transferSize || 0;
          if (size > 250 * 1024) {
            // 250KB threshold
            console.warn(
              `Large chunk detected: ${entry.name} (${(size / 1024).toFixed(2)}KB)`
            );
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  },

  /**
   * Implement code splitting hints
   */
  addCodeSplittingHints: () => {
    if (typeof window === 'undefined') return;

    // Add modulepreload for critical chunks
    const criticalChunks = [
      '/_next/static/chunks/pages/_app.js',
      '/_next/static/chunks/main.js',
    ];

    criticalChunks.forEach((chunk) => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = chunk;
      document.head.appendChild(link);
    });
  },
};

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Setup progressive loading when module is imported
  setupProgressiveLoading();

  // Optimize bundle loading
  bundleOptimization.optimizeImages();
  bundleOptimization.prefetchCriticalResources();
  bundleOptimization.addResourceHints();
  bundleOptimization.optimizeFonts();
  bundleOptimization.monitorBundleSize();
  bundleOptimization.addCodeSplittingHints();
}
