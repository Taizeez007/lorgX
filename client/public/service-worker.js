// Service Worker for LorgX PWA
const CACHE_NAME = 'lorgx-cache-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/safari-pinned-tab.svg'
];

// API routes that should not be cached
const UNCACHEABLE_ROUTES = [
  '/api/login',
  '/api/logout',
  '/api/register',
  '/api/create-payment-intent',
  '/api/get-or-create-subscription',
  '/api/booking'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Helper function to check if a URL is an API request
const isApiRequest = url => {
  return url.pathname.startsWith('/api/');
};

// Helper function to check if a request should be cached
const shouldCacheRequest = url => {
  // Don't cache API routes that require fresh data
  if (isApiRequest(url)) {
    return !UNCACHEABLE_ROUTES.some(route => url.pathname.includes(route));
  }
  
  // Always cache assets and pages
  return true;
};

// Process fetch events - network first with cache fallback for API requests
// Cache first with network fallback for static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;
  
  // Handle API requests - Network first with cache fallback
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the response if it's valid and should be cached
          if (response.status === 200 && shouldCacheRequest(url)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Try to get from cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Handle page navigation - try cache first for better performance
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request)
            .then(fetchResponse => {
              // Cache the fetched response
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
              return fetchResponse;
            })
            .catch(() => {
              // If both cache and network fail, return the offline page
              return caches.match('/');
            });
        })
    );
    return;
  }
  
  // For all other requests - Cache first, network fallback
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request)
          .then(fetchResponse => {
            // Cache the fetched response if it should be cached
            if (shouldCacheRequest(url)) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return fetchResponse;
          });
      })
  );
});

// Background sync for offline booking submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

// Function to sync pending bookings
async function syncBookings() {
  // Open the indexedDB database and get pending bookings
  const dbPromise = indexedDB.open('lorgx-offline-db', 1);
  
  dbPromise.onupgradeneeded = function(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('pending-bookings')) {
      db.createObjectStore('pending-bookings', { keyPath: 'id', autoIncrement: true });
    }
  };
  
  try {
    const db = await new Promise((resolve, reject) => {
      dbPromise.onsuccess = e => resolve(e.target.result);
      dbPromise.onerror = reject;
    });
    
    const tx = db.transaction('pending-bookings', 'readwrite');
    const store = tx.objectStore('pending-bookings');
    const pendingBookings = await new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
    
    // Process each pending booking
    for (const booking of pendingBookings) {
      try {
        const response = await fetch('/api/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking)
        });
        
        if (response.ok) {
          // If successful, remove the booking from the pending store
          store.delete(booking.id);
        }
      } catch (error) {
        console.error('Failed to sync booking:', error);
        // Keep the booking in the store to retry later
      }
    }
    
    await new Promise((resolve) => {
      tx.oncomplete = resolve;
    });
    
  } catch (error) {
    console.error('Error syncing bookings:', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/favicon-32x32.png',
    data: data.url ? { url: data.url } : null
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});