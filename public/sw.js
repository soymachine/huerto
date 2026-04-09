// El Huerto — Service Worker
// Provides offline shell caching so the app is installable and loads fast.

const CACHE = 'huerto-v1.6';
const SHELL = ['/huerto/app/'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {}))
  );
});

self.addEventListener('activate', e => {
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

  // For navigation requests (HTML pages) GitHub Pages may redirect /path → /path/
  // Using e.request directly preserves redirect:'manual' which causes a network error.
  // Create a new request with redirect:'follow' so the SW can serve the final response.
  const fetchReq = e.request.mode === 'navigate'
    ? new Request(e.request.url, { redirect: 'follow' })
    : e.request;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(fetchReq).then(res => {
        if (res.ok && res.type !== 'opaqueredirect') {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => cached);
      return cached ?? network;
    })
  );
});
