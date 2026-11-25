// =====================================
// NOORTECH BRANDING
// TURBO LUDO V2.4.0
// =====================================

(() => {

    const BRAND = {

        name: "NoorTech",

        slogan: "Innovation Beyond Limits",

        founder: "Shabir Ahmad Salehi",

        version: "2.4.0",

        year: "2026",

        logo: "./noortech-logo.png"

    };

    const isGamePage =
        document.getElementById("ludoBoard") !== null;

    // =================================
    // STARTUP SPLASH SCREEN
    // =================================

    function showSplash() {

        if (isGamePage) return;

        try {

            if (
                sessionStorage.getItem(
                    "noortechSplashShown"
                )
            ) return;

            sessionStorage.setItem(
                "noortechSplashShown",
                "true"
            );

        } catch (error) {

            console.warn(error);

        }

        const splash =
            document.createElement("div");

        splash.id = "noortech-splash";

        splash.innerHTML = `

            <img
                class="noortech-splash-logo"
                src="${BRAND.logo}"
                alt="NoorTech"
            >

            <div class="noortech-presents">
                PRESENTS
            </div>

            <div class="noortech-game-title">
                TURBO LUDO
            </div>

            <div class="noortech-loading">

                <div class="noortech-loading-bar">
                </div>

            </div>

        `;

        document.body.appendChild(splash);

        setTimeout(() => {

            splash.classList.add("hide");

            setTimeout(() => {

                splash.remove();

            }, 500);

        }, 2000);

    }

    // =================================
    // ABOUT NOORTECH
    // =================================

    function showAbout() {

        if (
            document.getElementById(
                "noortech-about"
            )
        ) return;

        const about =
            document.createElement("div");

        about.id = "noortech-about";

        about.className = "noortech-about";

        about.innerHTML = `

            <div
                class="noortech-about-card"
                role="dialog"
                aria-modal="true"
                aria-label="About Turbo Ludo"
            >

                <img
                    src="${BRAND.logo}"
                    alt="NoorTech"
                >

                <h2>TURBO LUDO</h2>

                <p>
                    Version ${BRAND.version}
                </p>

                <p>
                    Developed by
                    <strong>${BRAND.name}</strong>
                </p>

                <p>
                    Founder<br>
                    <strong>${BRAND.founder}</strong>
                </p>

                <p>
                    Afghanistan
                </p>

                <p>
                    100% Offline Gameplay
                </p>

                <p>
                    ${BRAND.slogan}
                </p>

                <p>
                    © ${BRAND.year} ${BRAND.name}
                    <br>
                    All rights reserved.
                </p>

                <button
                    type="button"
                    id="close-noortech-about"
                >
                    CLOSE
                </button>

            </div>

        `;

        document.body.appendChild(about);

        document.getElementById(
            "close-noortech-about"
        ).addEventListener("click", () => {

            about.remove();

        });

        about.addEventListener("click", event => {

            if (event.target === about) {

                about.remove();

            }

        });

    }

    // =================================
    // MAIN MENU BRANDING
    // =================================

    function addMenuBranding() {

        if (isGamePage) return;

        const footer =
            document.createElement("footer");

        footer.className = "noortech-footer";

        footer.innerHTML = `

            <div>DEVELOPED BY</div>

            <img
                src="${BRAND.logo}"
                alt="NoorTech"
            >

            <small>
                © ${BRAND.year} ${BRAND.name}
            </small>

            <small>
                Version ${BRAND.version}
            </small>

            <button
                type="button"
                class="noortech-about-button"
            >
                About NoorTech
            </button>

        `;

        document.body.appendChild(footer);

        footer.querySelector(
            ".noortech-about-button"
        ).addEventListener("click", showAbout);

    }

    // =================================
    // IN-GAME BRANDING
    // =================================

    function addGameBranding() {

        if (!isGamePage) return;

        const controls =
            document.querySelector(".game-controls");

        if (!controls) return;

        const credit =
            document.createElement("div");

        credit.className =
            "noortech-game-credit";

        credit.textContent =
            "POWERED BY NOORTECH";

        controls.appendChild(credit);

    }

    // =================================
    // INITIALIZE
    // =================================

    function initializeBranding() {

        showSplash();

        addMenuBranding();

        addGameBranding();

    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeBranding
        );

    } else {

        initializeBranding();

    }

})();