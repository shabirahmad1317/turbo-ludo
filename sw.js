
// ==========================================
// TURBO LUDO - OFFLINE SERVICE WORKER
// ==========================================

const CACHE_NAME = "turbo-ludo-v1.0.0";

const APP_FILES = [

    "./",
    "./index.html",
    "./style.css",
    "./app.js",

    "./game.html",
    "./game.css",
    "./game.js",

    "./spin.css",
    "./spin.js",

    "./engine.js",
    "./save.js",
    "./pwa.js",

    "./manifest.json",

    "./icon-192.png",
    "./icon-512.png",
    "./apple-touch-icon.png"

];

// ==========================================
// INSTALL AND CACHE GAME FILES
// ==========================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache => {

                console.log(
                    "Downloading Turbo Ludo files..."
                );

                return cache.addAll(

                    APP_FILES.map(file =>

                        new Request(file, {
                            cache: "reload"
                        })

                    )

                );

            })

            .then(() => {

                console.log(
                    "Turbo Ludo is ready for offline use."
                );

                return self.skipWaiting();

            })

    );

});

// ==========================================
// REMOVE OLD CACHE VERSIONS
// ==========================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()

            .then(cacheNames => {

                return Promise.all(

                    cacheNames

                        .filter(name =>

                            name.startsWith("turbo-ludo-") &&

                            name !== CACHE_NAME

                        )

                        .map(name =>

                            caches.delete(name)

                        )

                );

            })

            .then(() => {

                return self.clients.claim();

            })

    );

});

// ==========================================
// SERVE GAME FILES OFFLINE
// ==========================================

self.addEventListener("fetch", event => {

    const request = event.request;

    if (request.method !== "GET") {

        return;

    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {

        return;

    }

    if (
        !url.href.startsWith(
            self.registration.scope
        )
    ) {

        return;

    }

    event.respondWith(

        caches.open(CACHE_NAME)

            .then(async cache => {

                // Use downloaded files first.

                const cachedResponse =
                    await cache.match(request);

                if (cachedResponse) {

                    return cachedResponse;

                }

                // Download missing files if online.

                try {

                    const response =
                        await fetch(request);

                    if (
                        response.ok &&
                        response.type === "basic"
                    ) {

                        await cache.put(
                            request,
                            response.clone()
                        );

                    }

                    return response;

                } catch (error) {

                    // Offline navigation fallback.

                    if (
                        request.mode === "navigate"
                    ) {

                        const fallback =
                            await cache.match(
                                "./index.html"
                            );

                        if (fallback) {

                            return fallback;

                        }

                    }

                    return new Response(

                        "Turbo Ludo file unavailable.",

                        {
                            status: 503,

                            headers: {

                                "Content-Type":
                                    "text/plain"

                            }

                        }

                    );

                }

            })

    );

});
