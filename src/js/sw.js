// Version 5.0 - Désenregistrement forcé
const CACHE_NAME = 'la-rochelle-pwa-v5';
const DYNAMIC_CACHE = 'la-rochelle-dynamic-v5';
const urlsToCache = [
    '/',
    '/index.html',
    '/src/css/styles.css',
    '/src/js/app.js',
    '/src/js/weather.js',
    '/src/js/storage.js',
    '/src/js/header.js',
    '/src/js/checklist.js',
    // DÉBOGAGE & REFACTORING: Ajout des pages HTML pour une navigation hors-ligne complète.
    '/src/pages/home.html',
    '/src/pages/photos.html',
    '/src/pages/planning.html',
    '/src/pages/about.html',
    // DÉBOGAGE & REFACTORING: L'URL de Tone.js a été supprimée car la librairie n'est plus utilisée.
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('fetch', event => {
    // DÉBOGAGE & REFACTORING: Correction de la stratégie de cache pour les API.
    // L'URL de l'API OpenWeatherMap est maintenant gérée par une stratégie "Network First"
    // pour garantir des données à jour, avec un fallback sur le cache si le réseau échoue.
    const isApiRequest = event.request.url.startsWith('https://api.openweathermap.org');

    if (isApiRequest) {
        event.respondWith(
            caches.open(DYNAMIC_CACHE).then(cache => {
                return fetch(event.request).then(response => {
                    cache.put(event.request, response.clone());
                    return response;
                }).catch(() => {
                    return cache.match(event.request);
                });
            })
        );
    } else {
        // Stratégie "Cache First" pour tous les autres assets statiques.
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    return response || fetch(event.request).then(fetchRes => {
                        return caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, fetchRes.clone());
                            return fetchRes;
                        });
                    });
                })
        );
    }
});

// Nettoyage des anciens caches lors de l'activation du nouveau Service Worker.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => {
                if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
                    return caches.delete(key);
                }
            }));
        }).then(() => self.clients.claim())
    );
});