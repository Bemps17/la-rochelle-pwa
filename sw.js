// Version 6.0 - Déplacé à la racine pour résoudre les problèmes de scope
const CACHE_NAME = 'la-rochelle-pwa-v6';
const DYNAMIC_CACHE = 'la-rochelle-dynamic-v6';
const urlsToCache = [
    '/',
    '/index.html',
    '/offline.html', // Page de fallback
    '/src/css/styles.css',
    '/src/js/app.js',
    '/src/js/weather.js',
    '/src/js/storage.js',
    '/src/components/header.js',
    // Police d'icônes
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    // Favicon et autres ressources statiques
    '/public/favicon.ico',
    '/public/manifest.json'
];

self.addEventListener('install', event => {
    console.log('[Service Worker] Installation en cours...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Mise en cache des ressources statiques');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[Service Worker] Installation terminée');
                return self.skipWaiting();
            })
    );
});

self.addEventListener('fetch', event => {
    // Ignorer les requêtes non-GET et les requêtes chrome-extension
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
        return;
    }

    // Gestion des requêtes API
    const isApiRequest = event.request.url.startsWith('https://api.openweathermap.org');
    
    if (isApiRequest) {
        // Stratégie Network First pour les données météo
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Mettre en cache la réponse
                    const responseToCache = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => cache.put(event.request, responseToCache));
                    return response;
                })
                .catch(() => {
                    // En cas d'échec, utiliser le cache
                    return caches.match(event.request);
                })
        );
    } else {
        // Stratégie Cache First pour les assets statiques
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    return cachedResponse || fetch(event.request).then(fetchResponse => {
                        // Ne pas mettre en cache les réponses d'erreur
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }
                        const responseToCache = fetchResponse.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => cache.put(event.request, responseToCache));
                        return fetchResponse;
                    });
                }).catch(() => {
                    // Si tout échoue (même le fetch), renvoyer la page offline
                    // Uniquement pour les navigations
                    if (event.request.mode === 'navigate') {
                        return caches.match('/offline.html');
                    }
                })
        );
    }
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activation en cours...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Supprimer les anciens caches
                    if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
                        console.log('[Service Worker] Suppression de l\'ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Prendre le contrôle de tous les clients (onglets)
            console.log('[Service Worker] Prêt à gérer les requêtes');
            return self.clients.claim();
        })
    );
});

// Gérer les messages depuis l'application
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
