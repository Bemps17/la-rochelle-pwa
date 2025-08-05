const CACHE_NAME = 'la-rochelle-pwa-v1';
const DYNAMIC_CACHE = 'la-rochelle-dynamic-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/src/css/styles.css',
    '/src/js/app.js',
    '/src/js/sw.js',
    '/src/pages/home.html',
    '/src/pages/about.html',
    '/src/components/header.js',
    // '/src/assets/icons/icon-192x192.png',
    // '/src/assets/icons/icon-512x512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js'
];
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// Amélioration de la stratégie de cache
self.addEventListener('fetch', event => {
    const strategies = {
        // Stratégie Cache First pour les assets statiques
        cacheFirst: async (cacheName) => {
            const cache = await caches.open(cacheName);
            try {
                const cached = await cache.match(event.request);
                if (cached) return cached;
                const fetched = await fetch(event.request);
                cache.put(event.request, fetched.clone());
                return fetched;
            } catch (error) {
                const fallback = await cache.match('/offline.html');
                return fallback;
            }
        },
        // Stratégie Network First pour les données API
        networkFirst: async (cacheName) => {
            try {
                const fetched = await fetch(event.request);
                const cache = await caches.open(cacheName);
                cache.put(event.request, fetched.clone());
                return fetched;
            } catch (error) {
                const cached = await caches.match(event.request);
                return cached || caches.match('/offline.html');
            }
        }
    };

    // Choix de la stratégie selon l'URL
    if (event.request.url.includes('/api/')) {
        event.respondWith(strategies.networkFirst(DYNAMIC_CACHE));
    } else {
        event.respondWith(strategies.cacheFirst(CACHE_NAME));
    }
});

// Nettoyage périodique du cache
self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            caches.keys().then(keys => Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
                        return caches.delete(key);
                    }
                })
            )),
            self.clients.claim()
        ])
    );
});