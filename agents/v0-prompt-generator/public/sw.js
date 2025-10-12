/**
 * Service Worker for V0 Prompt Generator
 * Implements advanced caching strategies for better performance
 */

const CACHE_NAME = 'v0-prompt-generator-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/chunks/framework',
  '/_next/static/chunks/main',
  '/_next/static/chunks/pages/_app',
];

// API endpoints to cache
const CACHEABLE_APIS = ['/api/health', '/api/industries', '/api/examples'];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Resource patterns and their cache strategies
const RESOURCE_STRATEGIES = [
  {
    pattern: /\/_next\/static\//,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: STATIC_CACHE,
    maxAge: 365 * 24 * 60 * 60, // 1 year
  },
  {
    pattern: /\.(?:js|css|woff2?|ttf|eot)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: STATIC_CACHE,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  {
    pattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: STATIC_CACHE,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  {
    pattern: /\/api\/(industries|examples|templates)/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cacheName: API_CACHE,
    maxAge: 60 * 60, // 1 hour
  },
  {
    pattern: /\/api\/generate/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: API_CACHE,
    maxAge: 10 * 60, // 10 minutes
  },
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS.filter(Boolean));
      }),
      self.skipWaiting(),
    ])
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== API_CACHE
              );
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
      self.clients.claim(),
    ])
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Find matching strategy
  const strategy = findStrategy(request.url);

  if (strategy) {
    event.respondWith(handleRequest(request, strategy));
  }
});

/**
 * Find appropriate caching strategy for a request
 */
function findStrategy(url) {
  for (const strategy of RESOURCE_STRATEGIES) {
    if (strategy.pattern.test(url)) {
      return strategy;
    }
  }

  // Default strategy for HTML pages
  if (url.includes('.html') || !url.includes('.')) {
    return {
      strategy: CACHE_STRATEGIES.NETWORK_FIRST,
      cacheName: DYNAMIC_CACHE,
      maxAge: 5 * 60, // 5 minutes
    };
  }

  return null;
}

/**
 * Handle request based on caching strategy
 */
async function handleRequest(request, strategyConfig) {
  const { strategy, cacheName, maxAge } = strategyConfig;

  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName, maxAge);

    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName, maxAge);

    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName, maxAge);

    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);

    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request);

    default:
      return fetch(request);
  }
}

/**
 * Cache First strategy
 */
async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Clone the response before caching
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    // Return cached response if network fails
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Network First strategy
 */
async function networkFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Clone the response before caching
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    // Fallback to cache if network fails
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

/**
 * Stale While Revalidate strategy
 */
async function staleWhileRevalidate(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Always try to fetch from network in background
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const responseToCache = networkResponse.clone();
        cache.put(request, responseToCache);
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, but we might have cache
    });

  // Return cached response immediately if available
  if (cachedResponse) {
    // Don't await the network promise, let it update cache in background
    networkPromise;
    return cachedResponse;
  }

  // No cache available, wait for network
  return networkPromise;
}

/**
 * Check if cached response is expired
 */
function isExpired(response, maxAge) {
  if (!maxAge) return false;

  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;

  const responseTime = new Date(dateHeader).getTime();
  const now = Date.now();
  const age = (now - responseTime) / 1000; // age in seconds

  return age > maxAge;
}

/**
 * Background sync for failed requests
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

/**
 * Handle background sync
 */
async function doBackgroundSync() {
  // Retry failed API requests
  const cache = await caches.open('failed-requests');
  const requests = await cache.keys();

  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
      }
    } catch (error) {
      // Keep in cache for next sync
    }
  }
}

/**
 * Handle push notifications (for future use)
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'v0-prompt-generator',
    renotify: true,
    actions: [
      {
        action: 'open',
        title: 'Open App',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(clients.openWindow('/'));
  }
});

/**
 * Periodic cache cleanup
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CLEANUP') {
    event.waitUntil(cleanupCaches());
  }
});

/**
 * Clean up expired cache entries
 */
async function cleanupCaches() {
  const cacheNames = await caches.keys();

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response && isExpired(response, 24 * 60 * 60)) {
        // 24 hours default
        await cache.delete(request);
      }
    }
  }
}

/**
 * Performance monitoring
 */
self.addEventListener('fetch', (event) => {
  // Track cache hit/miss rates
  const url = event.request.url;

  if (url.includes('/_next/static/')) {
    event.waitUntil(
      caches.match(event.request).then((response) => {
        // Send performance data to main thread
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'CACHE_PERFORMANCE',
              data: {
                url,
                cached: !!response,
                timestamp: Date.now(),
              },
            });
          });
        });
      })
    );
  }
});

console.log('Service Worker loaded successfully');
