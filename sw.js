// Service Worker for Space PWA
// Version 1.0.0

const CACHE_NAME = ‘space-v1.0.0’;
const OFFLINE_URL = ‘/’;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
‘/’,
‘/index.html’,
‘/manifest.json’,
‘/icons/icon-192.png’,
‘/icons/icon-512.png’
];

// Install event - cache essential assets
self.addEventListener(‘install’, (event) => {
console.log(’[SW] Installing Service Worker…’);
event.waitUntil(
caches.open(CACHE_NAME)
.then((cache) => {
console.log(’[SW] Precaching app shell’);
return cache.addAll(PRECACHE_ASSETS);
})
.then(() => self.skipWaiting()) // Activate immediately
);
});

// Activate event - clean up old caches
self.addEventListener(‘activate’, (event) => {
console.log(’[SW] Activating Service Worker…’);
event.waitUntil(
caches.keys().then((cacheNames) => {
return Promise.all(
cacheNames.map((cacheName) => {
if (cacheName !== CACHE_NAME) {
console.log(’[SW] Deleting old cache:’, cacheName);
return caches.delete(cacheName);
}
})
);
}).then(() => self.clients.claim()) // Take control immediately
);
});

// Fetch event - network first, then cache, with offline fallback
self.addEventListener(‘fetch’, (event) => {
const { request } = event;
const url = new URL(request.url);

// Skip non-GET requests
if (request.method !== ‘GET’) {
return;
}

// Skip Chrome extensions and non-http(s) requests
if (!url.protocol.startsWith(‘http’)) {
return;
}

// Skip Firebase, Cloudinary, and external API calls (always network)
if (
url.hostname.includes(‘firebaseio.com’) ||
url.hostname.includes(‘firebase.com’) ||
url.hostname.includes(‘googleapis.com’) ||
url.hostname.includes(‘cloudinary.com’) ||
url.hostname.includes(‘gstatic.com’) ||
url.hostname.includes(‘jsdelivr.net’) ||
url.hostname.includes(‘cdn.’)
) {
event.respondWith(fetch(request));
return;
}

// For same-origin requests: Network First strategy
if (url.origin === location.origin) {
event.respondWith(
fetch(request)
.then((response) => {
// Clone the response before caching
const responseToCache = response.clone();
caches.open(CACHE_NAME).then((cache) => {
cache.put(request, responseToCache);
});
return response;
})
.catch(() => {
// Network failed, try cache
return caches.match(request).then((cachedResponse) => {
if (cachedResponse) {
return cachedResponse;
}
// If not in cache and network failed, return offline page
if (request.mode === ‘navigate’) {
return caches.match(OFFLINE_URL);
}
});
})
);
return;
}

// For external resources: Cache First strategy
event.respondWith(
caches.match(request).then((cachedResponse) => {
if (cachedResponse) {
// Return cached version and update cache in background
fetch(request).then((response) => {
caches.open(CACHE_NAME).then((cache) => {
cache.put(request, response);
});
}).catch(() => {
// Network failed, but we have cache
});
return cachedResponse;
}

```
  // Not in cache, fetch from network
  return fetch(request).then((response) => {
    // Cache the new resource
    const responseToCache = response.clone();
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(request, responseToCache);
    });
    return response;
  });
})
```

);
});

// Background sync for offline posts (optional - future enhancement)
self.addEventListener(‘sync’, (event) => {
if (event.tag === ‘sync-posts’) {
event.waitUntil(syncPosts());
}
});

async function syncPosts() {
// Placeholder for syncing offline posts when connection is restored
console.log(’[SW] Syncing offline posts…’);
// Implementation would retrieve queued posts from IndexedDB and send to Firebase
}

// Push notification handler (optional - future enhancement)
self.addEventListener(‘push’, (event) => {
const options = {
body: event.data ? event.data.text() : ‘New notification from Space’,
icon: ‘/icons/icon-192.png’,
badge: ‘/icons/icon-72.png’,
vibrate: [200, 100, 200],
data: {
dateOfArrival: Date.now(),
primaryKey: 1
},
actions: [
{
action: ‘explore’,
title: ‘Open Space’,
icon: ‘/icons/icon-192.png’
},
{
action: ‘close’,
title: ‘Close’,
icon: ‘/icons/icon-192.png’
}
]
};

event.waitUntil(
self.registration.showNotification(‘Space’, options)
);
});

// Notification click handler
self.addEventListener(‘notificationclick’, (event) => {
event.notification.close();

if (event.action === ‘explore’) {
event.waitUntil(
clients.openWindow(’/’)
);
} else {
// Default action - open app
event.waitUntil(
clients.matchAll({ type: ‘window’, includeUncontrolled: true })
.then((clientList) => {
// If app is already open, focus it
for (let client of clientList) {
if (client.url === ‘/’ && ‘focus’ in client) {
return client.focus();
}
}
// Otherwise open new window
if (clients.openWindow) {
return clients.openWindow(’/’);
}
})
);
}
});

// Message handler (for communication with main app)
self.addEventListener(‘message’, (event) => {
if (event.data && event.data.type === ‘SKIP_WAITING’) {
self.skipWaiting();
}

if (event.data && event.data.type === ‘CACHE_URLS’) {
const urlsToCache = event.data.payload;
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
return cache.addAll(urlsToCache);
})
);
}
});

console.log(’[SW] Service Worker loaded successfully’);
