'use client';

import React, { useState, useEffect } from 'react';
import { usePerformance } from './PerformanceProvider';

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    getStats,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    warmUpCache,
  } = usePerformance();
  const [stats, setStats] = useState<any>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    if (isOpen) {
      // Initial load
      setStats(getStats());

      // Auto-refresh every 5 seconds
      const interval = setInterval(() => {
        setStats(getStats());
      }, 5000);

      setRefreshInterval(interval);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [isOpen, getStats]);

  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <h2 className="text-xl font-semibold text-gray-900">
              Performance Dashboard
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className={`px-3 py-1 rounded text-sm font-medium ${
                isMonitoring
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
            <button
              onClick={warmUpCache}
              className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              Warm Cache
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {stats ? (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800">
                    Cache Performance
                  </h3>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-blue-900">
                      {(stats.cache?.hitRate * 100 || 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-blue-600">
                      {stats.cache?.hits || 0} hits, {stats.cache?.misses || 0}{' '}
                      misses
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800">
                    Memory Usage
                  </h3>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-green-900">
                      {formatBytes(stats.cache?.memoryUsage || 0)}
                    </div>
                    <div className="text-sm text-green-600">
                      {stats.cache?.size || 0} cached items
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-800">
                    Loading Progress
                  </h3>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-purple-900">
                      {(stats.progressive?.loadingProgress || 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-600">
                      {stats.progressive?.loadedModules || 0} /{' '}
                      {stats.progressive?.totalModules || 0} modules
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Performance */}
              {stats.performance?.ai_generation?.stats && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    AI Generation Performance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Average Time</div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatDuration(
                          stats.performance.ai_generation.stats.averageTime
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                      <div className="text-xl font-bold text-gray-900">
                        {(
                          stats.performance.ai_generation.stats.successRate *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        Total Requests
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {stats.performance.ai_generation.stats.totalRequests}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Tokens/sec</div>
                      <div className="text-xl font-bold text-gray-900">
                        {stats.performance.ai_generation.stats.averageTokensPerSecond?.toFixed(
                          1
                        ) || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Performance Distribution */}
                  {stats.performance.ai_generation.stats
                    .performanceDistribution && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-2">
                        Performance Grades
                      </div>
                      <div className="flex space-x-2">
                        {Object.entries(
                          stats.performance.ai_generation.stats
                            .performanceDistribution
                        ).map(([grade, count]) => (
                          <div
                            key={grade}
                            className="flex items-center space-x-1"
                          >
                            <span
                              className={`w-3 h-3 rounded-full ${
                                grade === 'A'
                                  ? 'bg-green-500'
                                  : grade === 'B'
                                    ? 'bg-blue-500'
                                    : grade === 'C'
                                      ? 'bg-yellow-500'
                                      : grade === 'D'
                                        ? 'bg-orange-500'
                                        : 'bg-red-500'
                              }`}
                            ></span>
                            <span className="text-sm text-gray-700">
                              {grade}: {String(count)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Component Performance */}
              {stats.performance?.components &&
                Object.keys(stats.performance.components).length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Component Performance
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Component
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Render Time
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Updates
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Last Render
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.entries(stats.performance.components).map(
                            ([name, data]: [string, any]) => (
                              <tr key={name}>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                  {name}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {formatDuration(data.renderTime)}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {data.updateCount}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {new Date(
                                    data.lastRender
                                  ).toLocaleTimeString()}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Cache Details */}
              {stats.cache?.topKeys && stats.cache.topKeys.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Top Cached Items
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Key
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Access Count
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Size
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.cache.topKeys.map((item: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 truncate max-w-xs">
                              {item.key}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {item.accessCount}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {formatBytes(item.size)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Raw Data (Collapsible) */}
              <details className="bg-gray-50 p-4 rounded-lg">
                <summary className="text-lg font-semibold text-gray-900 cursor-pointer">
                  Raw Performance Data
                </summary>
                <pre className="mt-4 text-xs text-gray-600 overflow-auto max-h-64 bg-white p-3 rounded border">
                  {JSON.stringify(stats, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  Loading performance data...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
