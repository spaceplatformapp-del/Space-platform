// This is a smarter service worker to make the app installable (PWA)

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

self.addEventListener('fetch', (event) => {
  // We only want to intercept *navigation* requests (the HTML page itself).
  if (event.request.mode === 'navigate') {
    // Fetch the page from the network.
    event.respondWith(fetch(event.request));
    return;
  }

  // For all other requests (JavaScript, images, API calls, Firebase),
  // we do *nothing*. This lets the browser handle them normally.
  return;
});
