import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
    optimizeCss: true,
    serverComponentsExternalPackages: ['@alchemystai/sdk'],
  },

  // Bundle analyzer for monitoring bundle size
  webpack: (config, { dev, isServer, webpack }) => {
    // Enable bundle splitting for better caching
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        minSize: 20000,
        maxSize: 250000,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Separate vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          // Separate AI SDK chunk
          aiSdk: {
            test: /[\\/]node_modules[\\/]@alchemystai[\\/]/,
            name: 'ai-sdk',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          // React chunks
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // Common utilities chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          // Component chunks
          components: {
            test: /[\\/]src[\\/]components[\\/]/,
            name: 'components',
            chunks: 'all',
            priority: 8,
            minChunks: 2,
          },
          // Utilities chunk
          utils: {
            test: /[\\/]src[\\/](utils|lib)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 7,
            minChunks: 2,
          },
        },
      };

      // Add performance monitoring plugin
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.PERFORMANCE_MONITORING': JSON.stringify(
            process.env.NODE_ENV === 'production'
          ),
        })
      );
    }

    // Next.js handles tree shaking optimization internally

    return config;
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Headers for better caching and performance
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // Enable compression and optimization
  swcMinify: true,

  // Optimize fonts
  optimizeFonts: true,
};

export default withBundleAnalyzer(nextConfig);
