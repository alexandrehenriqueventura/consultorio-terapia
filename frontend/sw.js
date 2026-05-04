const CACHE = 'consultorio-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/js/script.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request)
        .then(res => {
          const resClone = res.clone();
          caches.open(CACHE).then(cache => {
            cache.put(e.request, resClone);
          });
          return res;
        })
        .catch(() => caches.match('/index.html')))
      );
});
