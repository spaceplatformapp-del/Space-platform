// This is a basic service worker to make the app installable (PWA)

self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  // Skip waiting to activate new SW immediately
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');
  // Take control of all pages
  event.waitUntil(self.clients.claim());
});

// A simple fetch handler
// This just fetches from the network, but it's required by most browsers
// to trigger the "Add to Home Screen" prompt.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
