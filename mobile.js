
// ==========================================
// TURBO LUDO - MOBILE SCREEN CONTROLLER
// ==========================================

(function () {

    const viewport = document.querySelector(
        'meta[name="viewport"]'
    );

    if (viewport) {

        viewport.content =
            "width=device-width," +
            "initial-scale=1.0," +
            "maximum-scale=1.0," +
            "minimum-scale=1.0," +
            "user-scalable=no," +
            "viewport-fit=cover";

    }

    // Prevent accidental double-tap zoom.

    let lastTouchEnd = 0;

    document.addEventListener(
        "touchend",
        function (event) {

            const now = Date.now();

            if (now - lastTouchEnd < 300) {

                if (event.cancelable) {

                    event.preventDefault();

                }

            }

            lastTouchEnd = now;

        },
        { passive: false }
    );

    // Prevent pinch zoom on supported browsers.

    ["gesturestart",
     "gesturechange",
     "gestureend"].forEach(type => {

        document.addEventListener(
            type,
            event => {

                if (event.cancelable) {

                    event.preventDefault();

                }

            },
            { passive: false }
        );

    });

    document.addEventListener(
        "touchmove",
        event => {

            if (event.touches.length > 1) {

                if (event.cancelable) {

                    event.preventDefault();

                }

            }

        },
        { passive: false }
    );

    // Prevent accidental context menu.

    document.addEventListener(
        "contextmenu",
        event => event.preventDefault()
    );

    // Calculate the board size.

    function fitGameScreen() {

        if (window.innerWidth > 600) {

            document.documentElement.style
                .removeProperty(
                    "--mobile-board-size"
                );

            return;

        }

        const container =
            document.querySelector(
                ".game-container"
            );

        const board =
            document.querySelector(
                ".board-frame"
            );

        if (!container || !board) return;

        const style =
            getComputedStyle(container);

        const paddingX =
            parseFloat(style.paddingLeft) +
            parseFloat(style.paddingRight);

        const paddingY =
            parseFloat(style.paddingTop) +
            parseFloat(style.paddingBottom);

        const gap =
            parseFloat(style.rowGap) || 0;

        const children =
            Array.from(container.children)
                .filter(element =>

                    getComputedStyle(element)
                        .display !== "none"

                );

        let occupiedHeight = paddingY;

        children.forEach(element => {

            if (element !== board) {

                occupiedHeight +=
                    element.getBoundingClientRect()
                        .height;

                const elementStyle =
                    getComputedStyle(element);

                occupiedHeight +=
                    parseFloat(
                        elementStyle.marginTop
                    ) || 0;

                occupiedHeight +=
                    parseFloat(
                        elementStyle.marginBottom
                    ) || 0;

            }

        });

        occupiedHeight +=
            gap * Math.max(
                0, children.length - 1
            );

        const availableWidth =
            container.clientWidth - paddingX;

        const availableHeight =
            container.clientHeight -
            occupiedHeight - 4;

        const size = Math.max(

            1,

            Math.floor(

                Math.min(
                    availableWidth,
                    availableHeight
                )

            )

        );

        const value = `${size}px`;

        if (
            document.documentElement.style
                .getPropertyValue(
                    "--mobile-board-size"
                ) !== value
        ) {

            document.documentElement.style
                .setProperty(
                    "--mobile-board-size",
                    value
                );

        }

    }

    // Recalculate when screen size changes.

    window.addEventListener(
        "resize",
        fitGameScreen
    );

    window.addEventListener(
        "orientationchange",
        () => setTimeout(fitGameScreen, 200)
    );

    window.addEventListener(
        "load",
        fitGameScreen
    );

    window.addEventListener(
        "pageshow",
        fitGameScreen
    );

    if (window.visualViewport) {

        window.visualViewport.addEventListener(
            "resize",
            fitGameScreen
        );

    }

    // Resize when prisoners or player
    // information change.

    if ("ResizeObserver" in window) {

        const observer =
            new ResizeObserver(() => {

                requestAnimationFrame(
                    fitGameScreen
                );

            });

        document.querySelectorAll(
            ".players-row," +
            ".game-controls," +
            ".team-progress," +
            ".game-header"
        ).forEach(element => {

            observer.observe(element);

        });

    }

    fitGameScreen();

    setTimeout(fitGameScreen, 300);

})();
