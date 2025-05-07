// Service Worker for Push Notifications

// Cache name
const CACHE_NAME = 'forex-market-tracker-v1';

// Files to cache
const filesToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css'
];

// Install event - caching the app shell
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(filesToCache);
      })
  );
});

// Activate event - cleaning up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Fetch event - serving cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received.');
  
  let data = { title: 'Forex Market Update', body: 'A market status has changed' };
  
  // Try to parse the data from the push event
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Error parsing push notification data:', e);
    }
  }
  
  const options = {
    body: data.body,
    icon: '/notification-icon.png',
    badge: '/badge-icon.png',
    data: {
      url: data.url || '/'
    },
    vibrate: [100, 50, 100],
    actions: [
      {
        action: 'open',
        title: 'View Details'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received.');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data && event.notification.data.url ? 
    event.notification.data.url : '/';
  
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});