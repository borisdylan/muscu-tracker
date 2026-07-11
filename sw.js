/* sw.js — service worker : app installable et 100% offline
   Stratégie : cache-first sur les assets de l'app (le "shell").
   Les données sont dans IndexedDB, jamais réseau → tout marche hors-ligne. */

const CACHE = 'muscu-shell-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/db.js',
  './js/data.js',
  './js/app.js',
  './fonts/inter.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // met en cache les nouvelles requêtes same-origin réussies
          if (res.ok && new URL(req.url).origin === location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html')); // fallback navigation offline
    })
  );
});
