/**
 * Cache Manager for performance optimization
 * Handles caching of industry templates, AI responses, and frequently used data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  memoryUsage: number;
  topKeys: Array<{ key: string; accessCount: number; size: number }>;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  enablePersistence: boolean;
  compressionThreshold: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private stats = { hits: 0, misses: 0 };
  private config: CacheConfig = {
    maxSize: 200, // Increased cache size
    defaultTTL: 10 * 60 * 1000, // 10 minutes default TTL
    enablePersistence:
      typeof window !== 'undefined' && 'localStorage' in window,
    compressionThreshold: 1024, // Compress entries larger than 1KB
  };
  private persistenceKey = 'v0-prompt-cache';

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      // Try to load from persistent storage
      const persistedData = this.loadFromPersistence<T>(key);
      if (persistedData) {
        this.set(key, persistedData, this.config.defaultTTL);
        this.stats.hits++;
        return persistedData;
      }
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.removePersistence(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    this.stats.hits++;
    return this.decompressData(entry.data);
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttl: number = this.config.defaultTTL): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    const compressedData = this.compressData(data);
    const entry: CacheEntry<T> = {
      data: compressedData,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);

    // Persist important data
    if (this.shouldPersist(key)) {
      this.saveToPersistence(key, data, ttl);
    }
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? this.stats.hits / (this.stats.hits + this.stats.misses)
        : 0;

    // Calculate memory usage estimate
    let memoryUsage = 0;
    const topKeys: Array<{ key: string; accessCount: number; size: number }> =
      [];

    this.cache.forEach((entry, key) => {
      const entrySize = this.estimateSize(entry.data);
      memoryUsage += entrySize;
      topKeys.push({
        key,
        accessCount: entry.accessCount,
        size: entrySize,
      });
    });

    // Sort by access count and take top 10
    topKeys.sort((a, b) => b.accessCount - a.accessCount);
    topKeys.splice(10);

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage,
      topKeys,
    };
  }

  /**
   * Clean expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.removePersistence(key);
    });
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    this.cache.forEach((entry, key) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.removePersistence(oldestKey);
    }
  }

  /**
   * Compress data if it exceeds threshold
   */
  private compressData<T>(data: T): T {
    const dataStr = JSON.stringify(data);
    if (dataStr.length > this.config.compressionThreshold) {
      // Simple compression simulation - in real implementation, use actual compression
      return data; // For now, return as-is
    }
    return data;
  }

  /**
   * Decompress data
   */
  private decompressData<T>(data: T): T {
    // Simple decompression simulation
    return data;
  }

  /**
   * Estimate memory size of data
   */
  private estimateSize(data: any): number {
    return JSON.stringify(data).length * 2; // Rough estimate: 2 bytes per character
  }

  /**
   * Check if key should be persisted
   */
  private shouldPersist(key: string): boolean {
    if (!this.config.enablePersistence) return false;

    // Persist industry configs, templates, and examples
    return (
      key.includes('industry_config') ||
      key.includes('prompt_template') ||
      key.includes('example_prompts') ||
      key.includes('feature_mappings')
    );
  }

  /**
   * Save to persistent storage
   */
  private saveToPersistence<T>(key: string, data: T, ttl: number): void {
    if (!this.config.enablePersistence) return;

    try {
      const persistData = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(
        `${this.persistenceKey}:${key}`,
        JSON.stringify(persistData)
      );
    } catch (error) {
      // Storage quota exceeded or other error - fail silently
      console.warn('Failed to persist cache data:', error);
    }
  }

  /**
   * Load from persistent storage
   */
  private loadFromPersistence<T>(key: string): T | null {
    if (!this.config.enablePersistence) return null;

    try {
      const stored = localStorage.getItem(`${this.persistenceKey}:${key}`);
      if (!stored) return null;

      const persistData = JSON.parse(stored);

      // Check if expired
      if (Date.now() - persistData.timestamp > persistData.ttl) {
        localStorage.removeItem(`${this.persistenceKey}:${key}`);
        return null;
      }

      return persistData.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Remove from persistent storage
   */
  private removePersistence(key: string): void {
    if (!this.config.enablePersistence) return;

    try {
      localStorage.removeItem(`${this.persistenceKey}:${key}`);
    } catch (error) {
      // Fail silently
    }
  }

  /**
   * Preload frequently used data
   */
  preloadFrequentData(): void {
    // Preload common industry configurations
    const commonIndustries = [
      'saas',
      'ecommerce',
      'portfolio',
      'blog',
      'landing',
    ];

    commonIndustries.forEach((industry) => {
      const key = CACHE_KEYS.INDUSTRY_CONFIG(industry);
      if (!this.has(key)) {
        // Load industry config asynchronously
        import('../lib/industry-config')
          .then(({ getIndustryConfig }) => {
            const config = getIndustryConfig(industry);
            if (config) {
              this.set(key, config, CACHE_TTL.INDUSTRY_DATA);
            }
          })
          .catch(() => {
            // Fail silently
          });
      }
    });
  }

  /**
   * Warm up cache with essential data
   */
  warmUp(): void {
    this.preloadFrequentData();

    // Load example prompts for common industries
    import('../data/example-prompts')
      .then(({ EXAMPLE_PROMPTS }) => {
        ['saas', 'ecommerce', 'portfolio'].forEach((industry) => {
          const key = CACHE_KEYS.EXAMPLE_PROMPTS(industry);
          if (!this.has(key)) {
            const examples = EXAMPLE_PROMPTS.filter(prompt => prompt.industry === industry);
            if (examples && examples.length > 0) {
              this.set(key, examples, CACHE_TTL.EXAMPLES);
            }
          }
        });
      })
      .catch(() => {
        // Fail silently
      });
  }

  /**
   * Implement intelligent prefetching based on user behavior
   */
  intelligentPrefetch(
    currentIndustry: string,
    userHistory: string[] = []
  ): void {
    // Prefetch related industries based on common patterns
    const relatedIndustries = this.getRelatedIndustries(currentIndustry);

    relatedIndustries.forEach((industry) => {
      const configKey = CACHE_KEYS.INDUSTRY_CONFIG(industry);
      const examplesKey = CACHE_KEYS.EXAMPLE_PROMPTS(industry);

      if (!this.has(configKey)) {
        import('../lib/industry-config')
          .then(({ getIndustryConfig }) => {
            const config = getIndustryConfig(industry);
            if (config) {
              this.set(configKey, config, CACHE_TTL.INDUSTRY_DATA);
            }
          })
          .catch(() => {});
      }

      if (!this.has(examplesKey)) {
        import('../data/example-prompts')
          .then(({ EXAMPLE_PROMPTS }) => {
            const examples = EXAMPLE_PROMPTS.filter(prompt => prompt.industry === industry);
            if (examples && examples.length > 0) {
              this.set(examplesKey, examples, CACHE_TTL.EXAMPLES);
            }
          })
          .catch(() => {});
      }
    });

    // Prefetch based on user history
    const frequentIndustries = this.analyzeUserHistory(userHistory);
    frequentIndustries.forEach((industry) => {
      if (industry !== currentIndustry) {
        this.prefetchIndustryData(industry);
      }
    });
  }

  /**
   * Get related industries for intelligent prefetching
   */
  private getRelatedIndustries(industry: string): string[] {
    const industryRelations: Record<string, string[]> = {
      saas: ['tech', 'startup', 'b2b'],
      ecommerce: ['retail', 'marketplace', 'b2c'],
      portfolio: ['personal', 'creative', 'freelance'],
      blog: ['content', 'media', 'personal'],
      landing: ['marketing', 'saas', 'startup'],
      tech: ['saas', 'startup', 'b2b'],
      startup: ['saas', 'tech', 'landing'],
    };

    return industryRelations[industry] || [];
  }

  /**
   * Analyze user history to predict future needs
   */
  private analyzeUserHistory(history: string[]): string[] {
    const frequency: Record<string, number> = {};

    history.forEach((industry) => {
      frequency[industry] = (frequency[industry] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([industry]) => industry);
  }

  /**
   * Prefetch industry data
   */
  private prefetchIndustryData(industry: string): void {
    const configKey = CACHE_KEYS.INDUSTRY_CONFIG(industry);
    const examplesKey = CACHE_KEYS.EXAMPLE_PROMPTS(industry);
    const featuresKey = CACHE_KEYS.FEATURE_MAPPINGS(industry);

    // Use requestIdleCallback for non-blocking prefetch
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        this.prefetchSingleResource(configKey, () =>
          import('../lib/industry-config').then(({ getIndustryConfig }) =>
            getIndustryConfig(industry)
          )
        );

        this.prefetchSingleResource(examplesKey, () =>
          import('../data/example-prompts').then(({ EXAMPLE_PROMPTS }) =>
            EXAMPLE_PROMPTS.filter(prompt => prompt.industry === industry)
          )
        );

        this.prefetchSingleResource(featuresKey, () =>
          import('../lib/feature-mappings').then(({ getIndustryFeatureMapping }) =>
            getIndustryFeatureMapping(industry)
          )
        );
      });
    }
  }

  /**
   * Prefetch single resource with error handling
   */
  private async prefetchSingleResource<T>(
    key: string,
    loader: () => Promise<T>
  ): Promise<void> {
    if (this.has(key)) return;

    try {
      const data = await loader();
      if (data) {
        this.set(key, data, CACHE_TTL.INDUSTRY_DATA);
      }
    } catch (error) {
      // Fail silently for prefetch operations
    }
  }

  /**
   * Implement cache warming strategies
   */
  implementWarmingStrategies(): void {
    // Strategy 1: Time-based warming (warm cache during low usage periods)
    if (typeof window !== 'undefined') {
      const now = new Date();
      const hour = now.getHours();

      // Warm cache during typical low-usage hours (2-6 AM)
      if (hour >= 2 && hour <= 6) {
        this.aggressiveWarmUp();
      }
    }

    // Strategy 2: Progressive warming (warm most popular content first)
    this.progressiveWarmUp();

    // Strategy 3: Predictive warming (based on current trends)
    this.predictiveWarmUp();
  }

  /**
   * Aggressive cache warming for low-usage periods
   */
  private aggressiveWarmUp(): void {
    const allIndustries = [
      'saas',
      'ecommerce',
      'portfolio',
      'blog',
      'landing',
      'tech',
      'startup',
      'creative',
      'b2b',
      'b2c',
    ];

    allIndustries.forEach((industry, index) => {
      // Stagger the warming to avoid overwhelming the system
      setTimeout(() => {
        this.prefetchIndustryData(industry);
      }, index * 500); // 500ms delay between each industry
    });
  }

  /**
   * Progressive cache warming (most popular first)
   */
  private progressiveWarmUp(): void {
    const popularIndustries = [
      'saas',
      'ecommerce',
      'portfolio',
      'landing',
      'blog',
    ];

    popularIndustries.forEach((industry, index) => {
      setTimeout(() => {
        this.prefetchIndustryData(industry);
      }, index * 200); // 200ms delay between popular industries
    });
  }

  /**
   * Predictive cache warming based on trends
   */
  private predictiveWarmUp(): void {
    // This could be enhanced with actual analytics data
    const trendingIndustries = this.getTrendingIndustries();

    trendingIndustries.forEach((industry, index) => {
      setTimeout(() => {
        this.prefetchIndustryData(industry);
      }, index * 300);
    });
  }

  /**
   * Get trending industries (placeholder for analytics integration)
   */
  private getTrendingIndustries(): string[] {
    // In a real implementation, this would fetch from analytics
    return ['saas', 'tech', 'startup'];
  }

  /**
   * Implement cache compression for large entries
   */
  private compressLargeEntries(): void {
    this.cache.forEach((entry, key) => {
      const entrySize = this.estimateSize(entry.data);

      if (
        entrySize > this.config.compressionThreshold &&
        !this.isCompressed(entry.data)
      ) {
        // In a real implementation, use actual compression library
        const compressedData = this.compressData(entry.data);
        entry.data = compressedData;
      }
    });
  }

  /**
   * Check if data is already compressed
   */
  private isCompressed(data: any): boolean {
    // Simple check - in real implementation, use proper compression detection
    return typeof data === 'string' && data.startsWith('compressed:');
  }

  /**
   * Enhanced memory management
   */
  optimizeMemoryUsage(): void {
    // Remove expired entries
    this.cleanup();

    // Compress large entries
    this.compressLargeEntries();

    // If still over memory limit, remove least accessed items
    const stats = this.getStats();
    if (stats.memoryUsage > 5 * 1024 * 1024) {
      // 5MB limit
      this.evictLeastAccessedEntries();
    }
  }

  /**
   * Evict least accessed entries when memory is constrained
   */
  private evictLeastAccessedEntries(): void {
    const entries: Array<{ key: string; entry: any }> = [];
    this.cache.forEach((entry, key) => {
      entries.push({ key, entry });
    });
    entries.sort((a, b) => a.entry.accessCount - b.entry.accessCount);

    // Remove bottom 25% of entries by access count
    const toRemove = Math.ceil(entries.length * 0.25);

    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i].key);
    }
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

// Cache keys for different data types
export const CACHE_KEYS = {
  INDUSTRY_CONFIG: (industry: string) => `industry_config_${industry}`,
  PROMPT_TEMPLATE: (industry: string, type: string) =>
    `prompt_template_${industry}_${type}`,
  AI_RESPONSE: (inputHash: string) => `ai_response_${inputHash}`,
  EXAMPLE_PROMPTS: (industry: string) => `example_prompts_${industry}`,
  FEATURE_MAPPINGS: (industry: string) => `feature_mappings_${industry}`,
} as const;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  INDUSTRY_DATA: 30 * 60 * 1000, // 30 minutes - static data
  AI_RESPONSES: 10 * 60 * 1000, // 10 minutes - AI responses
  TEMPLATES: 60 * 60 * 1000, // 1 hour - templates
  EXAMPLES: 60 * 60 * 1000, // 1 hour - examples
} as const;

/**
 * Utility function to create cache key from object
 */
export function createCacheKey(
  prefix: string,
  obj: Record<string, any>
): string {
  const sortedKeys = Object.keys(obj).sort();
  const keyString = sortedKeys.map((key) => `${key}:${obj[key]}`).join('|');
  return `${prefix}_${btoa(keyString).replace(/[^a-zA-Z0-9]/g, '')}`;
}

/**
 * Decorator for caching function results
 */
export function cached<T extends (...args: any[]) => any>(
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = CACHE_TTL.INDUSTRY_DATA
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>) {
      const cacheKey = keyGenerator(...args);

      // Try to get from cache first
      const cached = cacheManager.get<ReturnType<T>>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await method.apply(this, args);

      // Cache the result
      cacheManager.set(cacheKey, result, ttl);

      return result;
    };
  };
}

// Periodic cleanup
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      cacheManager.cleanup();
    },
    5 * 60 * 1000
  ); // Cleanup every 5 minutes
}
