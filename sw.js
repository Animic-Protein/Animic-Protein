const CACHE = 'codex-viu-canonical-v21';
const ASSETS = [
  './', './index.html', './styles.css', './cartographia.css',
  './germinacio.css', './app.js', './foundation.js', './core.js', './germinacio.js', './phase3.js', './seed-bridge.js', './compost-cycle.js', './metabolism.js', './homeostasis.js', './lineage.js', './breathing.js', './attention.js', './context-propi.js',
  './promocio.js', './promocio.css', './branques.js', './branques.css',
  './manifest.webmanifest', './assets/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      })
  );
});
