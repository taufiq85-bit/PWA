const CACHE_NAME = 'praktikum-pwa-v1.0.1';
const OFFLINE_URL = '/offline.html';

// Files yang akan di-cache untuk offline support
const STATIC_CACHE_FILES = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// API endpoints yang akan di-cache
const API_CACHE_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
  /^https:\/\/.*\.supabase\.co\/storage\/v1\/.*/
];

// Files yang tidak boleh di-cache
const NEVER_CACHE_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\/auth\/.*/,
  /\/api\/auth\/.*/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      try {
        // Cache files one by one to avoid network issues
        for (const file of STATIC_CACHE_FILES) {
          try {
            await cache.add(file);
            console.log(`[SW] Cached: ${file}`);
          } catch (error) {
            console.warn(`[SW] Failed to cache: ${file}`, error);
          }
        }
        console.log('[SW] Static files cached successfully');
      } catch (error) {
        console.error('[SW] Failed to cache static files:', error);
      }
      
      // Force activate new service worker
      self.skipWaiting();
    })()
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    (async () => {
      // Clean old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
      
      // Take control of all pages
      await self.clients.claim();
      console.log('[SW] Service worker activated');
    })()
  );
});

// Fetch event - handle requests with caching strategy
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
  
  // Skip auth endpoints - never cache
  if (NEVER_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

// Main fetch handler with different strategies
async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Network First for API calls
    if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
      return await networkFirst(request);
    }
    
    // Strategy 2: Cache First for static assets
    if (isStaticAsset(url)) {
      return await cacheFirst(request);
    }
    
    // Strategy 3: Stale While Revalidate for pages
    return await staleWhileRevalidate(request);
    
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    return await handleFetchError(request, error);
  }
}

// Network First strategy - for API calls
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // Only cache successful responses
    if (response.ok && response.status === 200) {
      // Clone BEFORE using the response
      const responseToCache = response.clone();
      
      const cache = await caches.open(CACHE_NAME);
      // Use the cloned response for caching
      cache.put(request, responseToCache).catch(err => {
        console.warn('[SW] Failed to cache response:', err);
      });
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache First strategy - for static assets
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    // Only cache successful responses
    if (response.ok && response.status === 200) {
      // Clone BEFORE using the response
      const responseToCache = response.clone();
      
      const cache = await caches.open(CACHE_NAME);
      // Use the cloned response for caching
      cache.put(request, responseToCache).catch(err => {
        console.warn('[SW] Failed to cache response:', err);
      });
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Failed to fetch and cache:', request.url, error);
    throw error;
  }
}

// Stale While Revalidate strategy - for pages
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Start fetch in background (don't await)
  const fetchPromise = fetch(request).then(response => {
    // Only cache successful responses
    if (response.ok && response.status === 200) {
      // Clone BEFORE using the response
      const responseToCache = response.clone();
      cache.put(request, responseToCache).catch(err => {
        console.warn('[SW] Failed to cache response:', err);
      });
    }
    return response;
  }).catch(error => {
    console.warn('[SW] Background fetch failed:', error);
    return null;
  });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    // Still update cache in background
    fetchPromise.catch(() => {
      // Ignore errors for background updates
    });
    return cachedResponse;
  }
  
  // If no cached response, wait for network
  try {
    return await fetchPromise;
  } catch (error) {
    console.error('[SW] Network request failed:', error);
    throw error;
  }
}

// Handle fetch errors - return offline page for navigation
async function handleFetchError(request, error) {
  // For navigation requests, return offline page
  if (request.destination === 'document') {
    try {
      const offlineResponse = await caches.match(OFFLINE_URL);
      if (offlineResponse) {
        return offlineResponse;
      }
    } catch (cacheError) {
      console.error('[SW] Failed to get offline page from cache:', cacheError);
    }
  }
  
  throw error;
}

// Check if URL is a static asset
function isStaticAsset(url) {
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|json)$/);
}

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-kuis-data') {
    event.waitUntil(syncQuizData());
  }
  
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync quiz data when back online
async function syncQuizData() {
  try {
    console.log('[SW] Syncing quiz data...');
    
    // Get offline quiz data from IndexedDB
    const dbRequest = indexedDB.open('praktikum-pwa-offline', 1);
    
    dbRequest.onsuccess = async (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offline-data'], 'readonly');
      const store = transaction.objectStore('offline-data');
      const index = store.index('type');
      const request = index.getAll('kuis-attempt');
      
      request.onsuccess = () => {
        const kuisAttempts = request.result.filter(item => !item.synced);
        console.log('[SW] Found', kuisAttempts.length, 'unsynced quiz attempts');
        
        // Process each quiz attempt
        kuisAttempts.forEach(async (attempt) => {
          try {
            // Send to server (implement based on your API)
            const response = await fetch('/api/kuis/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(attempt.data)
            });
            
            if (response.ok) {
              // Mark as synced
              const updateTransaction = db.transaction(['offline-data'], 'readwrite');
              const updateStore = updateTransaction.objectStore('offline-data');
              attempt.synced = true;
              updateStore.put(attempt);
              console.log('[SW] Synced quiz attempt:', attempt.id);
            }
          } catch (error) {
            console.error('[SW] Failed to sync quiz attempt:', error);
          }
        });
      };
    };
    
  } catch (error) {
    console.error('[SW] Failed to sync quiz data:', error);
  }
}

// Sync offline actions
async function syncOfflineActions() {
  try {
    console.log('[SW] Syncing offline actions...');
    // Implementation for syncing other offline user actions
  } catch (error) {
    console.error('[SW] Failed to sync offline actions:', error);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notificationData = {
    title: 'Sistem Praktikum PWA',
    body: 'Notifikasi baru tersedia',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png'
  };
  
  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      notificationData.body = event.data.text();
    }
  }
  
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: notificationData.id || '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Lihat',
      },
      {
        action: 'close',
        title: 'Tutup',
      }
    ],
    requireInteraction: true,
    tag: 'praktikum-notification'
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

// Handle service worker errors
self.addEventListener('error', (event) => {
  console.error('[SW] Service worker error:', event.error);
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent the default handling
});

console.log('[SW] Service worker script loaded - v1.0.1');