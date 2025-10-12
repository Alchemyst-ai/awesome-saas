/**
 * Performance monitoring system for tracking AI generation times and app performance
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  totalRequests: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  successRate: number;
  errorRate: number;
  lastUpdated: Date;
}

interface ComponentPerformance {
  renderTime: number;
  mountTime: number;
  updateCount: number;
  lastRender: Date;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private activeMetrics: Map<string, PerformanceMetric> = new Map();
  private componentMetrics: Map<string, ComponentPerformance> = new Map();
  private maxMetricsPerType = 100; // Keep last 100 metrics per type

  /**
   * Start timing a performance metric
   */
  startTiming(name: string, metadata?: Record<string, any>): string {
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
    };

    this.activeMetrics.set(id, metric);
    return id;
  }

  /**
   * End timing a performance metric
   */
  endTiming(id: string, success: boolean = true): number | null {
    const metric = this.activeMetrics.get(id);
    if (!metric) {
      console.warn(`Performance metric ${id} not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    // Complete the metric
    metric.endTime = endTime;
    metric.duration = duration;
    metric.metadata = {
      ...metric.metadata,
      success,
      timestamp: new Date().toISOString(),
    };

    // Store in metrics history
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }

    const metricsList = this.metrics.get(metric.name)!;
    metricsList.push(metric);

    // Keep only the last N metrics
    if (metricsList.length > this.maxMetricsPerType) {
      metricsList.shift();
    }

    // Remove from active metrics
    this.activeMetrics.delete(id);

    // Log slow operations
    if (duration > 5000) {
      // 5 seconds
      console.warn(
        `Slow operation detected: ${metric.name} took ${duration.toFixed(2)}ms`,
        metric.metadata
      );
    }

    return duration;
  }

  /**
   * Record AI generation performance
   */
  recordAIGeneration(
    inputLength: number,
    outputLength: number,
    duration: number,
    success: boolean,
    industry?: string,
    additionalMetadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      name: 'ai_generation',
      startTime: performance.now() - duration,
      endTime: performance.now(),
      duration,
      metadata: {
        inputLength,
        outputLength,
        success,
        industry,
        timestamp: new Date().toISOString(),
        tokensPerSecond: outputLength / (duration / 1000),
        efficiency: outputLength / inputLength, // Output to input ratio
        performanceGrade: this.calculatePerformanceGrade(
          duration,
          outputLength
        ),
        ...additionalMetadata,
      },
    };

    if (!this.metrics.has('ai_generation')) {
      this.metrics.set('ai_generation', []);
    }

    const metricsList = this.metrics.get('ai_generation')!;
    metricsList.push(metric);

    if (metricsList.length > this.maxMetricsPerType) {
      metricsList.shift();
    }

    // Log performance alerts
    this.checkPerformanceAlerts(metric);
  }

  /**
   * Calculate performance grade based on duration and output
   */
  private calculatePerformanceGrade(
    duration: number,
    outputLength: number
  ): 'A' | 'B' | 'C' | 'D' | 'F' {
    const tokensPerSecond = outputLength / (duration / 1000);

    if (tokensPerSecond > 50) return 'A';
    if (tokensPerSecond > 30) return 'B';
    if (tokensPerSecond > 20) return 'C';
    if (tokensPerSecond > 10) return 'D';
    return 'F';
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(metric: PerformanceMetric): void {
    const { duration, metadata } = metric;

    if (!duration) return; // Skip if duration is undefined

    // Alert for very slow generations
    if (duration > 15000) {
      // 15 seconds
      console.warn('🐌 Very slow AI generation detected:', {
        duration: `${duration.toFixed(2)}ms`,
        industry: metadata?.industry,
        tokensPerSecond: metadata?.tokensPerSecond?.toFixed(2),
      });
    }

    // Alert for failed generations
    if (!metadata?.success) {
      console.error('❌ AI generation failed:', {
        duration: `${duration.toFixed(2)}ms`,
        industry: metadata?.industry,
        error: metadata?.error,
      });
    }

    // Alert for low efficiency
    if (metadata?.efficiency && metadata.efficiency < 2) {
      console.warn('⚠️ Low AI generation efficiency:', {
        efficiency: metadata.efficiency.toFixed(2),
        inputLength: metadata.inputLength,
        outputLength: metadata.outputLength,
      });
    }
  }

  /**
   * Record component performance
   */
  recordComponentPerformance(
    componentName: string,
    renderTime: number,
    isMount: boolean = false
  ): void {
    const existing = this.componentMetrics.get(componentName);

    if (existing) {
      this.componentMetrics.set(componentName, {
        renderTime,
        mountTime: isMount ? renderTime : existing.mountTime,
        updateCount: existing.updateCount + 1,
        lastRender: new Date(),
      });
    } else {
      this.componentMetrics.set(componentName, {
        renderTime,
        mountTime: renderTime,
        updateCount: 1,
        lastRender: new Date(),
      });
    }
  }

  /**
   * Get performance statistics for a metric type
   */
  getStats(metricName: string): PerformanceStats | null {
    const metricsList = this.metrics.get(metricName);
    if (!metricsList || metricsList.length === 0) {
      return null;
    }

    const durations = metricsList
      .filter((m) => m.duration !== undefined)
      .map((m) => m.duration!);

    const successfulRequests = metricsList.filter(
      (m) => m.metadata?.success !== false
    ).length;

    return {
      totalRequests: metricsList.length,
      averageTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      minTime: Math.min(...durations),
      maxTime: Math.max(...durations),
      successRate: successfulRequests / metricsList.length,
      errorRate: (metricsList.length - successfulRequests) / metricsList.length,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get AI generation statistics
   */
  getAIStats():
    | (PerformanceStats & {
        averageTokensPerSecond: number;
        averageInputLength: number;
        averageOutputLength: number;
        averageEfficiency: number;
        performanceDistribution: Record<string, number>;
        industryBreakdown: Record<
          string,
          { count: number; avgTime: number; successRate: number }
        >;
      })
    | null {
    const baseStats = this.getStats('ai_generation');
    if (!baseStats) return null;

    const aiMetrics = this.metrics.get('ai_generation')!;
    const tokensPerSecond = aiMetrics
      .filter((m) => m.metadata?.tokensPerSecond)
      .map((m) => m.metadata!.tokensPerSecond);

    const inputLengths = aiMetrics
      .filter((m) => m.metadata?.inputLength)
      .map((m) => m.metadata!.inputLength);

    const outputLengths = aiMetrics
      .filter((m) => m.metadata?.outputLength)
      .map((m) => m.metadata!.outputLength);

    const efficiencies = aiMetrics
      .filter((m) => m.metadata?.efficiency)
      .map((m) => m.metadata!.efficiency);

    // Performance grade distribution
    const performanceDistribution: Record<string, number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    };
    aiMetrics.forEach((m) => {
      const grade = m.metadata?.performanceGrade || 'F';
      performanceDistribution[grade]++;
    });

    // Industry breakdown
    const industryBreakdown: Record<
      string,
      { count: number; avgTime: number; successRate: number }
    > = {};
    aiMetrics.forEach((m) => {
      const industry = m.metadata?.industry || 'unknown';
      if (!industryBreakdown[industry]) {
        industryBreakdown[industry] = { count: 0, avgTime: 0, successRate: 0 };
      }
      industryBreakdown[industry].count++;
      industryBreakdown[industry].avgTime += m.duration || 0;
    });

    // Calculate averages for industry breakdown
    Object.keys(industryBreakdown).forEach((industry) => {
      const data = industryBreakdown[industry];
      data.avgTime = data.avgTime / data.count;

      const industryMetrics = aiMetrics.filter(
        (m) => m.metadata?.industry === industry
      );
      const successfulCount = industryMetrics.filter(
        (m) => m.metadata?.success
      ).length;
      data.successRate = successfulCount / industryMetrics.length;
    });

    return {
      ...baseStats,
      averageTokensPerSecond:
        tokensPerSecond.length > 0
          ? tokensPerSecond.reduce((a, b) => a + b, 0) / tokensPerSecond.length
          : 0,
      averageInputLength:
        inputLengths.length > 0
          ? inputLengths.reduce((a, b) => a + b, 0) / inputLengths.length
          : 0,
      averageOutputLength:
        outputLengths.length > 0
          ? outputLengths.reduce((a, b) => a + b, 0) / outputLengths.length
          : 0,
      averageEfficiency:
        efficiencies.length > 0
          ? efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length
          : 0,
      performanceDistribution,
      industryBreakdown,
    };
  }

  /**
   * Get component performance data
   */
  getComponentStats(): Map<string, ComponentPerformance> {
    return new Map(this.componentMetrics);
  }

  /**
   * Get all performance data for debugging
   */
  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};

    this.metrics.forEach((metrics, name) => {
      result[name] = {
        stats: this.getStats(name),
        recentMetrics: metrics.slice(-10), // Last 10 metrics
      };
    });

    result.components = Object.fromEntries(this.componentMetrics);
    result.cacheStats =
      typeof window !== 'undefined' ? this.getCacheStats() : null;

    return result;
  }

  /**
   * Get cache performance stats if available
   */
  private getCacheStats(): any {
    try {
      // Try to get cache stats from cache manager
      const { cacheManager } = require('./cache-manager');
      return cacheManager.getStats();
    } catch {
      return null;
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.activeMetrics.clear();
    this.componentMetrics.clear();
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify(this.getAllMetrics(), null, 2);
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    console.group('🚀 Performance Summary');

    this.metrics.forEach((_, name) => {
      const stats = this.getStats(name);
      if (stats) {
        console.log(`📊 ${name}:`, {
          'Avg Time': `${stats.averageTime.toFixed(2)}ms`,
          'Total Requests': stats.totalRequests,
          'Success Rate': `${(stats.successRate * 100).toFixed(1)}%`,
          'Min/Max': `${stats.minTime.toFixed(2)}ms / ${stats.maxTime.toFixed(2)}ms`,
        });
      }
    });

    // Log AI-specific stats
    const aiStats = this.getAIStats();
    if (aiStats) {
      console.log('🤖 AI Generation:', {
        'Avg Tokens/sec': aiStats.averageTokensPerSecond.toFixed(2),
        'Avg Input Length': aiStats.averageInputLength.toFixed(0),
        'Avg Output Length': aiStats.averageOutputLength.toFixed(0),
      });
    }

    // Log component stats
    if (this.componentMetrics.size > 0) {
      console.log('⚛️ Component Performance:');
      this.componentMetrics.forEach((stats, name) => {
        console.log(
          `  ${name}: ${stats.renderTime.toFixed(2)}ms (${stats.updateCount} updates)`
        );
      });
    }

    console.groupEnd();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Performance monitoring hooks for React components
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();

  return {
    recordRender: (isMount: boolean = false) => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.recordComponentPerformance(
        componentName,
        renderTime,
        isMount
      );
    },
    startTiming: (operation: string, metadata?: Record<string, any>) => {
      return performanceMonitor.startTiming(
        `${componentName}.${operation}`,
        metadata
      );
    },
    endTiming: performanceMonitor.endTiming.bind(performanceMonitor),
  };
};

// Utility function to measure async operations
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const id = performanceMonitor.startTiming(name, metadata);

  try {
    const result = await operation();
    performanceMonitor.endTiming(id, true);
    return result;
  } catch (error) {
    performanceMonitor.endTiming(id, false);
    throw error;
  }
}

// Auto-log performance summary in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Log summary every 30 seconds in development
  setInterval(() => {
    if (
      performanceMonitor.getAllMetrics().ai_generation?.stats?.totalRequests > 0
    ) {
      performanceMonitor.logSummary();
    }
  }, 30000);
}
