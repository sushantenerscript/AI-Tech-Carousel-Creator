const CACHE_NAME = 'tech-carousel-creator-v2';
const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon.svg'
];

// On install, cache the app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache and caching app shell');
            return cache.addAll(APP_SHELL_URLS);
        })
    );
});

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// On fetch, use a stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cachedResponse = await cache.match(event.request);

            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // If the request is successful, clone it and put it in the cache.
                if (networkResponse.ok) {
                    cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
            }).catch(err => {
                // fetch failed, maybe network error
                console.error('Fetch failed:', err);
                // if there's a cached response, we can use it as a fallback.
            });

            // Return the cached response immediately if it exists,
            // otherwise wait for the network response.
            return cachedResponse || fetchPromise;
        })
    );
});
