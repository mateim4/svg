// SVG Designer Service Worker - Optimized for icon SVG caching
const CACHE_NAME = 'svg-designer-v1.0.0';
const PRECACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// SVG and GitHub API specific caches
const SVG_CACHE_NAME = 'svg-content-v1.0.0';
const GITHUB_API_CACHE_NAME = 'github-api-v1.0.0';

// Cache strategies
const SVG_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const API_CACHE_MAX_AGE = 1 * 60 * 60 * 1000; // 1 hour
const STATIC_CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-caching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate event');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches that don't match current version
          if (cacheName !== CACHE_NAME && 
              cacheName !== SVG_CACHE_NAME && 
              cacheName !== GITHUB_API_CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Handle different types of requests with appropriate caching strategies
  if (isSvgRequest(requestUrl)) {
    event.respondWith(handleSvgRequest(event.request));
  } else if (isGitHubApiRequest(requestUrl)) {
    event.respondWith(handleApiRequest(event.request));
  } else if (isStaticAsset(requestUrl)) {
    event.respondWith(handleStaticAsset(event.request));
  } else {
    // Default handling for other requests
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});

// SVG file caching strategy - Cache-first with long expiration
async function handleSvgRequest(request) {
  const cache = await caches.open(SVG_CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    const cacheDate = new Date(cached.headers.get('sw-cached-date') || 0);
    const isExpired = Date.now() - cacheDate.getTime() > SVG_CACHE_MAX_AGE;
    
    if (!isExpired) {
      console.log('[ServiceWorker] Serving SVG from cache:', request.url);
      return cached;
    }
  }
  
  try {
    const response = await fetch(request);
    if (response.ok && response.headers.get('content-type')?.includes('svg')) {
      // Clone response and add cache timestamp
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-date', new Date().toISOString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers
      });
      
      await cache.put(request, cachedResponse);
      console.log('[ServiceWorker] Cached new SVG:', request.url);
    }
    return response;
  } catch (error) {
    console.error('[ServiceWorker] SVG fetch failed:', error);
    return cached || new Response('SVG not available', { status: 404 });
  }
}

// GitHub API caching strategy - Network-first with short expiration
async function handleApiRequest(request) {
  const cache = await caches.open(GITHUB_API_CACHE_NAME);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-date', new Date().toISOString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers
      });
      
      await cache.put(request, cachedResponse);
      console.log('[ServiceWorker] Cached API response:', request.url);
    }
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache for API:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      const cacheDate = new Date(cached.headers.get('sw-cached-date') || 0);
      const isExpired = Date.now() - cacheDate.getTime() > API_CACHE_MAX_AGE;
      
      if (!isExpired) {
        return cached;
      }
    }
    
    throw error;
  }
}

// Static asset caching strategy - Cache-first
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      console.log('[ServiceWorker] Cached static asset:', request.url);
    }
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Static asset fetch failed:', error);
    throw error;
  }
}

// Helper functions to identify request types
function isSvgRequest(url) {
  return url.pathname.endsWith('.svg') || 
         url.hostname.includes('raw.githubusercontent.com') ||
         url.searchParams.has('svg') ||
         url.pathname.includes('/assets/') && url.pathname.includes('.svg');
}

function isGitHubApiRequest(url) {
  return url.hostname === 'api.github.com' ||
         url.hostname === 'raw.githubusercontent.com' ||
         url.pathname.startsWith('/repos/');
}

function isStaticAsset(url) {
  return url.pathname.startsWith('/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.woff2') ||
         url.pathname.endsWith('.woff') ||
         url.pathname.endsWith('.ttf');
}

// Background sync for failed icon loads
self.addEventListener('sync', (event) => {
  if (event.tag === 'retry-icon-loads') {
    event.waitUntil(retryFailedIconLoads());
  }
});

async function retryFailedIconLoads() {
  console.log('[ServiceWorker] Retrying failed icon loads');
  // Implementation would depend on storing failed requests
  // This is a placeholder for future enhancement
}

// Periodic cache cleanup
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEANUP_CACHE') {
    event.waitUntil(cleanupExpiredCache());
  }
});

async function cleanupExpiredCache() {
  console.log('[ServiceWorker] Cleaning up expired cache entries');
  
  const svgCache = await caches.open(SVG_CACHE_NAME);
  const apiCache = await caches.open(GITHUB_API_CACHE_NAME);
  
  const cleanupCache = async (cache, maxAge) => {
    const requests = await cache.keys();
    const deletePromises = [];
    
    for (const request of requests) {
      const response = await cache.match(request);
      const cacheDate = new Date(response.headers.get('sw-cached-date') || 0);
      const isExpired = Date.now() - cacheDate.getTime() > maxAge;
      
      if (isExpired) {
        deletePromises.push(cache.delete(request));
      }
    }
    
    return Promise.all(deletePromises);
  };
  
  await Promise.all([
    cleanupCache(svgCache, SVG_CACHE_MAX_AGE),
    cleanupCache(apiCache, API_CACHE_MAX_AGE)
  ]);
  
  console.log('[ServiceWorker] Cache cleanup completed');
}