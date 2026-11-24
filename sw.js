
// ==========================================
// TURBO LUDO - VERSION 1.1.0
// MOBILE OPTIMIZED OFFLINE CACHE
// ==========================================

const CACHE_NAME = "turbo-ludo-v1.1.0";

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

    "./mobile.css",
    "./mobile.js",

    "./manifest.json",

    "./icon-192.png",
    "./icon-512.png",
    "./apple-touch-icon.png"

];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache =>

                cache.addAll(

                    APP_FILES.map(file =>

                        new Request(

                            new URL(
                                file,
                                self.registration.scope
                            ),

                            { cache: "reload" }

                        )

                    )

                )

            )

            .then(() => self.skipWaiting())

    );

});

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()

            .then(names =>

                Promise.all(

                    names.filter(name =>

                        name.startsWith("turbo-ludo-") &&

                        name !== CACHE_NAME

                    ).map(name => caches.delete(name))

                )

            )

            .then(() => self.clients.claim())

    );

});

self.addEventListener("fetch", event => {

    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) return;

    if (!url.href.startsWith(
        self.registration.scope
    )) return;

    event.respondWith(

        caches.open(CACHE_NAME)

            .then(async cache => {

                const cached =
                    await cache.match(request);

                if (cached) return cached;

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

                    if (request.mode === "navigate") {

                        const fallback =
                            await cache.match(
                                "./index.html"
                            );

                        if (fallback) return fallback;

                    }

                    return new Response(

                        "Turbo Ludo is unavailable.",

                        { status: 503 }

                    );

                }

            })

    );

});
