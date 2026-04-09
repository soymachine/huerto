// El Huerto — Service Worker v1.6
// Strategy: cache-first for static assets (JS/CSS/images have content hashes),
// network-only for HTML pages (no hash → always fetch fresh from server).

const CACHE = 'huerto-assets-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete any old caches (previous naming schemes)
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  // HTML pages: never cache — always fetch from network so users get updates.
  // The SW simply doesn't intercept these, letting the browser handle them.
  if (e.request.mode === 'navigate') return;

  // Static assets (JS, CSS, images, fonts): cache-first.
  // Astro adds a content hash to JS/CSS filenames so stale cache is never an issue.
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      });
    })
  );
});
