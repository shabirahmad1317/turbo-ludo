
// ==========================================
// TURBO LUDO - PWA INSTALLATION
// ==========================================

(function () {

    // ======================================
    // CREATE PWA METADATA
    // ======================================

    function addMeta(name, content) {

        let meta = document.querySelector(
            `meta[name="${name}"]`
        );

        if (!meta) {

            meta = document.createElement("meta");

            meta.name = name;

            document.head.appendChild(meta);

        }

        meta.content = content;

    }

    function addLink(rel, href) {

        let link = document.querySelector(
            `link[rel="${rel}"]`
        );

        if (!link) {

            link = document.createElement("link");

            link.rel = rel;

            document.head.appendChild(link);

        }

        link.href = href;

    }

    addMeta(
        "apple-mobile-web-app-capable",
        "yes"
    );

    addMeta(
        "apple-mobile-web-app-status-bar-style",
        "black-translucent"
    );

    addMeta(
        "apple-mobile-web-app-title",
        "Turbo Ludo"
    );

    addMeta(
        "theme-color",
        "#10265d"
    );

    addLink(
        "manifest",
        "./manifest.json"
    );

    addLink(
        "apple-touch-icon",
        "./apple-touch-icon.png"
    );

    addLink(
        "icon",
        "./icon-192.png"
    );

    // ======================================
    // DETECT INSTALLED APPLICATION
    // ======================================

    const installed =

        window.matchMedia(
            "(display-mode: standalone)"
        ).matches ||

        window.navigator.standalone === true;

    // ======================================
    // OFFLINE STATUS
    // ======================================

    const status =
        document.createElement("div");

    status.id = "pwaStatus";

    status.style.cssText = `

        text-align: center;
        font-size: 10px;
        font-weight: bold;
        padding: 8px;
        color: #ffc83d;

    `;

    document.body.appendChild(status);

    let offlineReady = false;

    function updateStatus() {

        if (offlineReady) {

            status.textContent =
                navigator.onLine

                ? "✓ OFFLINE READY"

                : "✓ PLAYING OFFLINE";

            status.style.color = "#86efac";

        } else {

            status.textContent =
                "OFFLINE SETUP PENDING";

        }

    }

    // ======================================
    // REGISTER SERVICE WORKER
    // ======================================

    async function registerOfflineGame() {

        if (
            !("serviceWorker" in navigator) ||
            !window.isSecureContext
        ) {

            status.textContent =
                "Use HTTPS or localhost for offline installation.";

            return;

        }

        try {

            status.textContent =
                "Downloading offline game files...";

            const registration =

                await navigator.serviceWorker.register(

                    "./sw.js"

                );

            await navigator.serviceWorker.ready;

            offlineReady = true;

            updateStatus();

            console.log(
                "Turbo Ludo service worker registered:",
                registration.scope
            );

        } catch (error) {

            offlineReady = false;

            status.textContent =
                "Offline setup failed. Check game files.";

            status.style.color = "#f87171";

            console.error(
                "PWA installation failed:",
                error
            );

        }

    }

    // ======================================
    // IPHONE INSTALLATION BUTTON
    // ======================================

    const isIOS =

        /iPhone|iPad|iPod/.test(
            navigator.userAgent
        ) ||

        (
            navigator.platform === "MacIntel" &&
            navigator.maxTouchPoints > 1
        );

    const isHomePage =

        location.pathname.endsWith("/") ||

        location.pathname.endsWith(
            "/index.html"
        );

    if (
        isIOS &&
        !installed &&
        isHomePage
    ) {

        const installButton =
            document.createElement("button");

        installButton.textContent =
            "📱 INSTALL TURBO LUDO";

        installButton.style.cssText = `

            display: block;
            margin: 12px auto;
            padding: 12px 20px;
            border: 1px solid #ffc83d;
            border-radius: 12px;
            background: #10265d;
            color: #ffc83d;
            font-weight: bold;
            cursor: pointer;

        `;

        installButton.onclick = function () {

            alert(

                "Install Turbo Ludo on your iPhone:\n\n" +

                "1. Open this website in Safari.\n" +

                "2. Tap the Share button.\n" +

                "3. Select Add to Home Screen.\n" +

                "4. Tap Add.\n" +

                "5. Open Turbo Ludo from your Home Screen.\n" +

                "6. Wait until OFFLINE READY appears."

            );

        };

        document.body.appendChild(
            installButton
        );

    }

    // ======================================
    // IPHONE SAFE AREA
    // ======================================

    const pwaStyle =
        document.createElement("style");

    pwaStyle.textContent = `

        body {

            padding-top:
                env(safe-area-inset-top);

            padding-bottom:
                env(safe-area-inset-bottom);

            overscroll-behavior: none;

        }

        button {

            -webkit-tap-highlight-color:
                transparent;

            touch-action: manipulation;

        }

        @media (display-mode: standalone) {

            body {

                min-height: 100dvh;

            }

        }

    `;

    document.head.appendChild(pwaStyle);

    // ======================================
    // INTERNET STATUS EVENTS
    // ======================================

    window.addEventListener(
        "online",
        updateStatus
    );

    window.addEventListener(
        "offline",
        updateStatus
    );

    // ======================================
    // START PWA
    // ======================================

    registerOfflineGame();

})();
