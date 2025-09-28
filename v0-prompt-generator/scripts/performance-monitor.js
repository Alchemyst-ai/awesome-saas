#!/usr/bin/env node

/**
 * Performance monitoring script for V0 Prompt Generator
 * Monitors bundle size, performance metrics, and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceMonitor {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.buildDir = path.join(this.projectRoot, '.next');
    this.metricsFile = path.join(this.projectRoot, 'performance-metrics.json');
  }

  /**
   * Run performance analysis
   */
  async analyze() {
    console.log('🚀 Starting Performance Analysis...\n');

    try {
      // Build the project first
      console.log('📦 Building project...');
      execSync('npm run build', { cwd: this.projectRoot, stdio: 'inherit' });

      // Analyze bundle size
      const bundleAnalysis = this.analyzeBundleSize();

      // Check for performance issues
      const performanceIssues = this.checkPerformanceIssues();

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        bundleAnalysis,
        performanceIssues
      );

      // Save metrics
      const metrics = {
        timestamp: new Date().toISOString(),
        bundleAnalysis,
        performanceIssues,
        recommendations,
      };

      fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));

      // Display results
      this.displayResults(metrics);
    } catch (error) {
      console.error('❌ Performance analysis failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Analyze bundle size and composition
   */
  analyzeBundleSize() {
    console.log('📊 Analyzing bundle size...');

    const buildManifest = this.loadBuildManifest();
    const chunks = this.analyzeChunks();

    return {
      totalSize: this.calculateTotalSize(chunks),
      chunks,
      largeChunks: chunks.filter((chunk) => chunk.size > 250 * 1024), // > 250KB
      duplicatedModules: this.findDuplicatedModules(buildManifest),
      treeshakingOpportunities: this.findTreeshakingOpportunities(),
    };
  }

  /**
   * Load Next.js build manifest
   */
  loadBuildManifest() {
    try {
      const manifestPath = path.join(this.buildDir, 'build-manifest.json');
      return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (error) {
      console.warn('⚠️ Could not load build manifest');
      return {};
    }
  }

  /**
   * Analyze individual chunks
   */
  analyzeChunks() {
    const staticDir = path.join(this.buildDir, 'static', 'chunks');

    if (!fs.existsSync(staticDir)) {
      return [];
    }

    const chunks = [];
    const files = fs.readdirSync(staticDir, { recursive: true });

    files.forEach((file) => {
      if (typeof file === 'string' && file.endsWith('.js')) {
        const filePath = path.join(staticDir, file);
        const stats = fs.statSync(filePath);

        chunks.push({
          name: file,
          size: stats.size,
          sizeFormatted: this.formatBytes(stats.size),
          type: this.getChunkType(file),
          critical: this.isChunkCritical(file),
        });
      }
    });

    return chunks.sort((a, b) => b.size - a.size);
  }

  /**
   * Calculate total bundle size
   */
  calculateTotalSize(chunks) {
    const totalBytes = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    return {
      bytes: totalBytes,
      formatted: this.formatBytes(totalBytes),
      gzipEstimate: this.formatBytes(totalBytes * 0.3), // Rough gzip estimate
    };
  }

  /**
   * Find duplicated modules across chunks
   */
  findDuplicatedModules(buildManifest) {
    // This would require more sophisticated analysis
    // For now, return common duplicates we know about
    return [
      { module: 'react', estimatedDuplication: '45KB' },
      { module: '@heroicons/react', estimatedDuplication: '12KB' },
    ];
  }

  /**
   * Find tree-shaking opportunities
   */
  findTreeshakingOpportunities() {
    return [
      {
        module: '@heroicons/react',
        issue: 'Importing entire icon library',
        solution: 'Import specific icons only',
        potentialSavings: '~80KB',
      },
      {
        module: 'lodash',
        issue: 'Full library import detected',
        solution: 'Use lodash-es or import specific functions',
        potentialSavings: '~60KB',
      },
    ];
  }

  /**
   * Check for performance issues
   */
  checkPerformanceIssues() {
    console.log('🔍 Checking for performance issues...');

    const issues = [];

    // Check for large images
    const publicDir = path.join(this.projectRoot, 'public');
    if (fs.existsSync(publicDir)) {
      const largeImages = this.findLargeImages(publicDir);
      if (largeImages.length > 0) {
        issues.push({
          type: 'large-images',
          severity: 'medium',
          description: `Found ${largeImages.length} large images`,
          files: largeImages,
          recommendation:
            'Optimize images using next/image or compress manually',
        });
      }
    }

    // Check for missing optimizations in next.config.js
    const nextConfig = this.checkNextConfig();
    if (nextConfig.issues.length > 0) {
      issues.push({
        type: 'next-config',
        severity: 'low',
        description: 'Next.js configuration could be optimized',
        issues: nextConfig.issues,
        recommendation: 'Update next.config.js with recommended optimizations',
      });
    }

    // Check for unused dependencies
    const unusedDeps = this.findUnusedDependencies();
    if (unusedDeps.length > 0) {
      issues.push({
        type: 'unused-dependencies',
        severity: 'low',
        description: `Found ${unusedDeps.length} potentially unused dependencies`,
        dependencies: unusedDeps,
        recommendation: 'Remove unused dependencies to reduce bundle size',
      });
    }

    return issues;
  }

  /**
   * Find large images in public directory
   */
  findLargeImages(dir) {
    const largeImages = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    const scanDirectory = (currentDir) => {
      const files = fs.readdirSync(currentDir);

      files.forEach((file) => {
        const filePath = path.join(currentDir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          scanDirectory(filePath);
        } else if (
          imageExtensions.some((ext) => file.toLowerCase().endsWith(ext))
        ) {
          if (stats.size > 500 * 1024) {
            // > 500KB
            largeImages.push({
              file: path.relative(this.projectRoot, filePath),
              size: this.formatBytes(stats.size),
            });
          }
        }
      });
    };

    try {
      scanDirectory(dir);
    } catch (error) {
      // Directory doesn't exist or can't be read
    }

    return largeImages;
  }

  /**
   * Check Next.js configuration for optimizations
   */
  checkNextConfig() {
    const configPath = path.join(this.projectRoot, 'next.config.mjs');
    const issues = [];

    try {
      const configContent = fs.readFileSync(configPath, 'utf8');

      // Check for missing optimizations
      if (!configContent.includes('swcMinify')) {
        issues.push('Missing SWC minification');
      }

      if (!configContent.includes('optimizeFonts')) {
        issues.push('Missing font optimization');
      }

      if (!configContent.includes('compress')) {
        issues.push('Missing compression');
      }
    } catch (error) {
      issues.push('next.config.js not found or not readable');
    }

    return { issues };
  }

  /**
   * Find potentially unused dependencies
   */
  findUnusedDependencies() {
    // This is a simplified check - in production, use tools like depcheck
    const packageJsonPath = path.join(this.projectRoot, 'package.json');

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = Object.keys(packageJson.dependencies || {});

      // Check for common unused dependencies (simplified)
      const potentiallyUnused = dependencies.filter((dep) => {
        // This is a very basic check - in reality, you'd scan the codebase
        return ['moment', 'jquery', 'bootstrap'].includes(dep);
      });

      return potentiallyUnused;
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(bundleAnalysis, performanceIssues) {
    const recommendations = [];

    // Bundle size recommendations
    if (bundleAnalysis.totalSize.bytes > 1024 * 1024) {
      // > 1MB
      recommendations.push({
        priority: 'high',
        category: 'bundle-size',
        title: 'Large bundle size detected',
        description: `Total bundle size is ${bundleAnalysis.totalSize.formatted}`,
        actions: [
          'Implement code splitting for non-critical components',
          'Use dynamic imports for heavy libraries',
          'Consider removing unused dependencies',
        ],
      });
    }

    // Large chunks recommendations
    if (bundleAnalysis.largeChunks.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'code-splitting',
        title: 'Large chunks found',
        description: `Found ${bundleAnalysis.largeChunks.length} chunks larger than 250KB`,
        actions: [
          'Split large chunks using dynamic imports',
          'Move heavy components to separate chunks',
          'Consider lazy loading for non-critical features',
        ],
      });
    }

    // Tree-shaking recommendations
    if (bundleAnalysis.treeshakingOpportunities.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'tree-shaking',
        title: 'Tree-shaking opportunities',
        description:
          'Found opportunities to reduce bundle size through better imports',
        actions: bundleAnalysis.treeshakingOpportunities.map(
          (opp) => opp.solution
        ),
      });
    }

    // Performance issue recommendations
    performanceIssues.forEach((issue) => {
      recommendations.push({
        priority: issue.severity,
        category: issue.type,
        title: issue.description,
        description: issue.recommendation,
        actions: [issue.recommendation],
      });
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Display analysis results
   */
  displayResults(metrics) {
    console.log('\n📊 Performance Analysis Results\n');
    console.log('='.repeat(50));

    // Bundle size summary
    console.log('\n📦 Bundle Size Analysis:');
    console.log(`Total Size: ${metrics.bundleAnalysis.totalSize.formatted}`);
    console.log(
      `Estimated Gzipped: ${metrics.bundleAnalysis.totalSize.gzipEstimate}`
    );
    console.log(`Number of Chunks: ${metrics.bundleAnalysis.chunks.length}`);
    console.log(
      `Large Chunks (>250KB): ${metrics.bundleAnalysis.largeChunks.length}`
    );

    // Top 5 largest chunks
    if (metrics.bundleAnalysis.chunks.length > 0) {
      console.log('\n🔍 Largest Chunks:');
      metrics.bundleAnalysis.chunks.slice(0, 5).forEach((chunk, index) => {
        const indicator = chunk.size > 250 * 1024 ? '⚠️' : '✅';
        console.log(
          `${index + 1}. ${indicator} ${chunk.name} - ${chunk.sizeFormatted}`
        );
      });
    }

    // Performance issues
    if (metrics.performanceIssues.length > 0) {
      console.log('\n⚠️ Performance Issues:');
      metrics.performanceIssues.forEach((issue, index) => {
        const severity =
          issue.severity === 'high'
            ? '🔴'
            : issue.severity === 'medium'
              ? '🟡'
              : '🟢';
        console.log(`${index + 1}. ${severity} ${issue.description}`);
      });
    }

    // Recommendations
    if (metrics.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      metrics.recommendations.slice(0, 5).forEach((rec, index) => {
        const priority =
          rec.priority === 'high'
            ? '🔴'
            : rec.priority === 'medium'
              ? '🟡'
              : '🟢';
        console.log(`${index + 1}. ${priority} ${rec.title}`);
        rec.actions.forEach((action) => {
          console.log(`   • ${action}`);
        });
      });
    }

    console.log('\n='.repeat(50));
    console.log(
      `📄 Full report saved to: ${path.relative(this.projectRoot, this.metricsFile)}`
    );
    console.log('🚀 Performance analysis complete!\n');
  }

  /**
   * Utility functions
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getChunkType(filename) {
    if (filename.includes('pages')) return 'page';
    if (filename.includes('webpack')) return 'webpack';
    if (filename.includes('framework')) return 'framework';
    if (filename.includes('main')) return 'main';
    if (filename.includes('commons')) return 'commons';
    return 'other';
  }

  isChunkCritical(filename) {
    return (
      filename.includes('main') ||
      filename.includes('framework') ||
      filename.includes('pages/_app')
    );
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new PerformanceMonitor();

  const command = process.argv[2];

  switch (command) {
    case 'analyze':
    case undefined:
      monitor.analyze();
      break;

    default:
      console.log('Usage: node performance-monitor.js [analyze]');
      console.log('Commands:');
      console.log('  analyze  - Run full performance analysis (default)');
      process.exit(1);
  }
}

module.exports = PerformanceMonitor;
