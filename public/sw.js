importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);

    // Cache CSS, JS, Images, Fonts with CacheFirst strategy
    workbox.routing.registerRoute(
        ({ request }) => request.destination === 'style' || request.destination === 'script' || request.destination === 'worker',
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'static-resources',
        })
    );

    workbox.routing.registerRoute(
        ({ request }) => request.destination === 'image' || request.destination === 'font',
        new workbox.strategies.CacheFirst({
            cacheName: 'image-font-resources',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 60,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                }),
            ],
        })
    );

    // API Routes - NetworkFirst
    workbox.routing.registerRoute(
        ({ url }) => url.pathname.startsWith('/api/'),
        new workbox.strategies.NetworkFirst({
            cacheName: 'api-cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 50,
                    maxAgeSeconds: 5 * 60, // 5 minutes
                }),
            ],
        })
    );

    // Offline Fallback
    const OFFLINE_URL = '/offline.html';

    self.addEventListener('install', (event) => {
        const urls = [OFFLINE_URL];
        const cacheName = workbox.core.cacheNames.runtime;
        event.waitUntil(
            caches.open(cacheName).then((cache) => cache.addAll(urls))
        );
    });

    // Navigation routing - NetworkFirst, fall back to offline.html
    workbox.routing.registerRoute(
        ({ request }) => request.mode === 'navigate',
        async (args) => {
            try {
                const response = await new workbox.strategies.NetworkFirst({
                    cacheName: 'pages-cache',
                }).handle(args);
                return response || caches.match(OFFLINE_URL);
            } catch (error) {
                return caches.match(OFFLINE_URL);
            }
        }
    );

} else {
    console.log(`Boo! Workbox didn't load 😬`);
}
