/* eslint-env serviceworker */
// Service Worker for Kaduna Court Management System PWA

const CACHE_NAME = 'kaduna-court-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/index.css',
  '/src/index.tsx'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(err => console.error('[SW] Failed to cache static assets:', err))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests, APIs, sockets, and unsupported schemes
  if (
    request.method !== 'GET' ||
    url.pathname.includes('/api/') ||
    url.pathname.includes('/socket.io/') ||
    url.protocol.startsWith('chrome-extension:') ||
    url.protocol.startsWith('edge-extension:') ||
    url.protocol.startsWith('ms-browser-extension:')
  ) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Only cache http/https requests
            if (url.protocol === 'http:' || url.protocol === 'https:') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache).catch(err => {
                  console.warn('[SW] Cache put failed, skipping:', request.url, err);
                });
              });
            }

            return networkResponse;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            return caches.match('/index.html');
          });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(syncFormSubmissions());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New notification from Kaduna Court System',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'kaduna-court-notification',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' }
    ]
  };
  event.waitUntil(self.registration.showNotification('Kaduna Court System', options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(clients.openWindow('/'));
  }
});

// Message handler from main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

// Helper function to sync form submissions
async function syncFormSubmissions() {
  console.log('[SW] Syncing form submissions...');
}

console.log('[SW] Service Worker loaded');
