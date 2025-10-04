import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import {
  FeedbackProvider,
  NetworkStatusIndicator,
} from '../components/UserFeedback';
import ErrorBoundary from '../components/ErrorBoundary';
import PerformanceProvider from '../components/PerformanceProvider';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'V0 Prompt Generator - Create Perfect Prompts for Vercel V0',
  description:
    'Generate comprehensive, optimized prompts for Vercel V0 with AI assistance. Transform your basic website ideas into detailed prompts that produce better results.',
  keywords: 'V0, Vercel, prompt generator, AI, website builder, NextJS, React',
  authors: [{ name: 'V0 Prompt Generator Team' }],
  creator: 'V0 Prompt Generator',
  publisher: 'V0 Prompt Generator',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: '#2563eb',
  colorScheme: 'light dark',
  openGraph: {
    type: 'website',
    title: 'V0 Prompt Generator',
    description:
      'Generate comprehensive, optimized prompts for Vercel V0 with AI assistance.',
    siteName: 'V0 Prompt Generator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'V0 Prompt Generator',
    description:
      'Generate comprehensive, optimized prompts for Vercel V0 with AI assistance.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#2563eb" />
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded-md z-50 transition-all duration-200"
        >
          Skip to main content
        </a>

        {/* Main application content */}
        <div id="root" className="min-h-screen flex flex-col">
          <ErrorBoundary>
            <PerformanceProvider>
              <FeedbackProvider>
                {children}
                <NetworkStatusIndicator />
              </FeedbackProvider>
            </PerformanceProvider>
          </ErrorBoundary>
        </div>

        {/* Performance monitoring initialization script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize performance monitoring
              if (typeof window !== 'undefined') {
                // Start Core Web Vitals monitoring
                if (window.performance && 'PerformanceObserver' in window) {
                  // This will be handled by the performance monitor
                  console.log('Performance monitoring initialized');
                }
                
                // Initialize service worker for caching
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js')
                      .then(registration => {
                        console.log('SW registered: ', registration);
                      })
                      .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
                
                // Initialize cache warming
                setTimeout(() => {
                  if (window.cacheManager) {
                    window.cacheManager.warmUp();
                  }
                }, 2000);
              }
            `,
          }}
        />

        {/* Screen reader announcements */}
        <div
          id="announcements"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* Loading announcements for screen readers */}
        <div
          id="loading-announcements"
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        />
      </body>
    </html>
  );
}
