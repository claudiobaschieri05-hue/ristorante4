const CACHE_NAME = 'ristoranti-pwa-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './offline.html',
  './style.css',
  './app.js',
  './data.js',
  './features_addon.js',
  './premium_effects.js',
  './advanced_features.js',
  './ultimate_premium.js',
  './manifest.json'
];

// Installa il Service Worker e salva nella cache gli asset principali
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Attiva il Service Worker e rimuove vecchie cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercetta le richieste di rete
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Ritorna la risposta dalla cache se esiste, altrimenti fa la richiesta di rete
      return response || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          // Opzionale: aggiungiamo i nuovi file alla cache dinamicamente
          // (per i file locali, non le chiamate API esterne)
          if(event.request.url.indexOf(self.location.origin) === 0) {
            cache.put(event.request.url, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    }).catch(() => {
      // In caso di errore di rete e risorsa non in cache
      if (event.request.headers.get('accept').includes('text/html')) {
        return caches.match('./offline.html');
      }
    })
  );
});
