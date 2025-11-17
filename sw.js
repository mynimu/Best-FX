const CACHE_NAME = 'best-fx-v1';
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon.svg'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(CACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then(keyList => Promise.all(keyList.map(key => {
      if (key !== CACHE_NAME) {
        console.log('[Service Worker] Removing old cache', key);
        return caches.delete(key);
      }
    })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Cache first for app shell, fallback to network
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request)
        .then(fetchRes => {
          // Optionally cache new requests
          return fetchRes;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});
