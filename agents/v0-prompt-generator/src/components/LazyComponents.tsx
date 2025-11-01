'use client';

import { lazy, Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lazy load heavy components
const LazyExampleGallery = lazy(() =>
  import('./ExampleGallery').then((module) => ({
    default: module.ExampleGallery,
  }))
);
const LazyGenerationEngine = lazy(() => import('./GenerationEngine'));
const LazyOutputDisplay = lazy(() => import('./OutputDisplay'));

// Loading fallback component
const ComponentLoadingFallback = ({
  message = 'Loading component...',
}: {
  message?: string;
}) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

// Wrapped lazy components with suspense
export const ExampleGallery = (props: any) => (
  <Suspense
    fallback={<ComponentLoadingFallback message="Loading examples..." />}
  >
    <LazyExampleGallery {...props} />
  </Suspense>
);

export const GenerationEngine = (props: any) => (
  <Suspense
    fallback={<ComponentLoadingFallback message="Loading AI engine..." />}
  >
    <LazyGenerationEngine {...props} />
  </Suspense>
);

export const OutputDisplay = (props: any) => (
  <Suspense
    fallback={<ComponentLoadingFallback message="Loading output display..." />}
  >
    <LazyOutputDisplay {...props} />
  </Suspense>
);

// Preload components for better UX
export const preloadComponents = {
  exampleGallery: () => import('./ExampleGallery'),
  generationEngine: () => import('./GenerationEngine'),
  outputDisplay: () => import('./OutputDisplay'),
};
