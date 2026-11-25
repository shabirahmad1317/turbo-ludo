// ==========================================
// TURBO LUDO V2.7.0
// CUSTOMIZATION ENGINE
// DEVELOPED BY NOORTECH
// ==========================================

(function () {

    "use strict";

    const THEME_KEY = "turboLudoTheme";
    const TOKEN_KEY = "turboLudoTokenStyle";

    const themes = {

        original: {

            name: "Royal Classic",

            red: "#ed2027",
            green: "#079e42",
            blue: "#078de2",
            yellow: "#ffd000",

            board: "#ffffff",
            line: "#84909c",
            frame: "#ffc83d",
            ink: "#334155"

        },

        gold: {

            name: "Royal Gold",

            red: "#a42c42",
            green: "#18745b",
            blue: "#294e91",
            yellow: "#c99b35",

            board: "#f1e4c5",
            line: "#aa9364",
            frame: "#b58a35",
            ink: "#46351b"

        },

        neon: {

            name: "Dark Neon",

            red: "#ff3265",
            green: "#00df8b",
            blue: "#00b8ff",
            yellow: "#ffdc00",

            board: "#202838",
            line: "#64748b",
            frame: "#6275a1",
            ink: "#ffffff"

        },

        pastel: {

            name: "Soft Pastel",

            red: "#ed939b",
            green: "#95caa1",
            blue: "#8db9ec",
            yellow: "#e7cb83",

            board: "#fff5ec",
            line: "#b9a89d",
            frame: "#d7b7a3",
            ink: "#334155"

        }

    };

    const tokenStyles = {

        original: "Original",

        classic: "Classic",

        royal: "Royal",

        diamond: "Diamond"

    };

    const originalColors = {

        red: "#e53935",
        blue: "#2478e5",
        green: "#24b34b",
        yellow: "#f4c51d"

    };

    const darkColors = {

        red: "#8f1010",
        blue: "#123d96",
        green: "#086524",
        yellow: "#ad7900"

    };

    const playerColors = [
        "red",
        "green",
        "blue",
        "yellow"
    ];

    // ======================================
    // LOAD PREFERENCES
    // ======================================

    function readPreference(key, fallback) {

        try {

            return localStorage.getItem(key)
                || fallback;

        } catch (error) {

            return fallback;

        }

    }

    let selectedTheme =
        readPreference(THEME_KEY, "original");

    let selectedToken =
        readPreference(TOKEN_KEY, "original");

    if (!themes[selectedTheme]) {

        selectedTheme = "original";

    }

    if (!tokenStyles[selectedToken]) {

        selectedToken = "original";

    }

    // ======================================
    // SAVE PREFERENCES
    // ======================================

    function savePreferences() {

        try {

            localStorage.setItem(
                THEME_KEY,
                selectedTheme
            );

            localStorage.setItem(
                TOKEN_KEY,
                selectedToken
            );

            return true;

        } catch (error) {

            alert(
                "Unable to save customization."
            );

            return false;

        }

    }

    // ======================================
    // TOKEN SVG GENERATOR
    // ======================================

    function createTokenSVG(
        playerColor,
        styleName,
        themeName
    ) {

        const theme =
            themes[themeName] ||
            themes.original;

        const color =
            themeName === "original"

                ? originalColors[playerColor]

                : theme[playerColor];

        const dark =
            darkColors[playerColor];

        let design = "";

        // ORIGINAL PIN

        if (styleName === "original") {

            design = `

                <ellipse
                    cx="20" cy="42"
                    rx="15" ry="6"
                    fill="${dark}"
                    stroke="${color}"
                    stroke-width="3"
                />

                <path
                    d="M20 42 C16 35 4 25 4 17
                       A16 16 0 1 1 36 17
                       C36 25 24 35 20 42Z"
                    fill="#f8fafc"
                    stroke="#26354a"
                    stroke-width="2"
                />

                <circle
                    cx="20" cy="17"
                    r="11"
                    fill="${color}"
                    stroke="${dark}"
                    stroke-width="2"
                />

                <ellipse
                    cx="16" cy="12"
                    rx="5" ry="3"
                    fill="white"
                    opacity=".5"
                />

            `;

        }

        // CLASSIC PAWN

        if (styleName === "classic") {

            design = `

                <ellipse
                    cx="20" cy="43"
                    rx="17" ry="6"
                    fill="${dark}"
                />

                <path
                    d="M5 40
                       Q16 30 15 19
                       L25 19
                       Q24 30 35 40
                       Q20 48 5 40Z"
                    fill="${color}"
                    stroke="${dark}"
                    stroke-width="2"
                />

                <circle
                    cx="20" cy="13"
                    r="11"
                    fill="${color}"
                    stroke="${dark}"
                    stroke-width="2"
                />

                <ellipse
                    cx="16" cy="9"
                    rx="5" ry="3"
                    fill="white"
                    opacity=".5"
                />

            `;

        }

        // ROYAL COIN

        if (styleName === "royal") {

            design = `

                <ellipse
                    cx="20" cy="44"
                    rx="15" ry="4"
                    fill="#00000055"
                />

                <circle
                    cx="20" cy="24"
                    r="18"
                    fill="${dark}"
                    stroke="#b88a20"
                    stroke-width="3"
                />

                <circle
                    cx="20" cy="22"
                    r="15"
                    fill="${color}"
                    stroke="#ffe9a1"
                    stroke-width="2"
                />

                <path
                    d="M9 16
                       L15 22
                       L20 12
                       L25 22
                       L31 16
                       L28 32
                       H12Z"
                    fill="#ffc83d"
                    stroke="#8c6210"
                    stroke-width="1"
                />

            `;

        }

        // DIAMOND

        if (styleName === "diamond") {

            design = `

                <ellipse
                    cx="20" cy="46"
                    rx="13" ry="3"
                    fill="#00000044"
                />

                <polygon
                    points="20,3 38,18 20,45 2,18"
                    fill="${color}"
                    stroke="${dark}"
                    stroke-width="2"
                />

                <polygon
                    points="20,3 11,18 20,45 2,18"
                    fill="#ffffff55"
                />

                <polygon
                    points="20,3 29,18 20,45 38,18"
                    fill="#00000044"
                />

                <polygon
                    points="20,3 11,18 29,18"
                    fill="#ffffff88"
                />

                <path
                    d="M2 18 H38"
                    stroke="${dark}"
                    stroke-width="1"
                />

            `;

        }

        return `

            <svg
                viewBox="0 0 40 50"
                aria-hidden="true"
            >

                ${design}

            </svg>

        `;

    }

    // ======================================
    // APPLY BOARD THEME
    // ======================================

    function applyBoardTheme() {

        const root =
            document.documentElement;

        root.dataset.ludoTheme =
            selectedTheme;

        const theme =
            themes[selectedTheme];

        playerColors.forEach(color => {

            root.style.setProperty(
                `--theme-${color}`,
                theme[color]
            );

        });

        root.style.setProperty(
            "--theme-board",
            theme.board
        );

        root.style.setProperty(
            "--theme-line",
            theme.line
        );

        root.style.setProperty(
            "--theme-frame",
            theme.frame
        );

        root.style.setProperty(
            "--theme-ink",
            theme.ink
        );

    }

    // ======================================
    // APPLY TOKEN DESIGNS
    // ======================================

    function updateToken(element) {

        if (!element.id) return;

        const color =
            element.id.split("-")[0];

        if (!playerColors.includes(color)) {

            return;

        }

        const appearance =
            selectedTheme + ":" +
            selectedToken;

        if (
            element.dataset.appearance ===
            appearance
        ) return;

        element.innerHTML = createTokenSVG(

            color,

            selectedToken,

            selectedTheme

        );

        element.dataset.appearance =
            appearance;

    }

    function applyTokenStyles() {

        document.querySelectorAll(
            ".token"
        ).forEach(updateToken);

    }

    // ======================================
    // APPLY GAME APPEARANCE
    // ======================================

    function applyAppearance() {

        applyBoardTheme();

        applyTokenStyles();

    }

    // ======================================
    // WATCH FOR NEW TOKENS
    // ======================================

    function watchTokens() {

        const observer =
            new MutationObserver(records => {

                records.forEach(record => {

                    record.addedNodes.forEach(node => {

                        if (
                            node.nodeType !== 1
                        ) return;

                        if (
                            node.matches(".token")
                        ) {

                            updateToken(node);

                        }

                        node.querySelectorAll(
                            ".token"
                        ).forEach(updateToken);

                    });

                });

            });

        observer.observe(

            document.body,

            {

                childList: true,

                subtree: true

            }

        );

    }

    // ======================================
    // CREATE BOARD PREVIEW
    // ======================================

    function createBoardPreview(
        themeName,
        styleName
    ) {

        const theme = themes[themeName];

        const board =
            document.createElement("div");

        board.className = "theme-preview";

        board.style.background =
            theme.board;

        board.style.borderColor =
            theme.frame;

        for (let row = 0; row < 15; row++) {

            for (let col = 0; col < 15; col++) {

                const cross =
                    (row >= 6 && row <= 8) ||
                    (col >= 6 && col <= 8);

                const center =
                    row >= 6 && row <= 8 &&
                    col >= 6 && col <= 8;

                if (!cross || center) continue;

                const cell =
                    document.createElement("div");

                cell.className =
                    "theme-preview-cell";

                cell.style.gridRow =
                    row + 1;

                cell.style.gridColumn =
                    col + 1;

                cell.style.borderColor =
                    theme.line;

                cell.style.background =
                    theme.board;

                let color = null;

                if (
                    row === 7 &&
                    col >= 1 && col <= 5
                ) color = "red";

                if (
                    col === 7 &&
                    row >= 1 && row <= 5
                ) color = "green";

                if (
                    col === 7 &&
                    row >= 9 && row <= 13
                ) color = "blue";

                if (
                    row === 7 &&
                    col >= 9 && col <= 13
                ) color = "yellow";

                if (row === 6 && col === 1)
                    color = "red";

                if (row === 1 && col === 8)
                    color = "green";

                if (row === 13 && col === 6)
                    color = "blue";

                if (row === 8 && col === 13)
                    color = "yellow";

                if (color) {

                    cell.style.background =
                        theme[color];

                }

                board.appendChild(cell);

            }

        }

        const homes = [

            ["red", 0, 0],

            ["green", 0, 9],

            ["blue", 9, 0],

            ["yellow", 9, 9]

        ];

        homes.forEach(([color, row, col]) => {

            const home =
                document.createElement("div");

            home.className =
                "theme-preview-home";

            home.style.gridRow =
                `${row + 1} / span 6`;

            home.style.gridColumn =
                `${col + 1} / span 6`;

            home.style.background =
                theme[color];

            const inner =
                document.createElement("div");

            inner.className =
                "theme-preview-inner";

            inner.style.background =
                theme.board;

            for (let i = 0; i < 4; i++) {

                const token =
                    document.createElement("div");

                token.className =
                    "theme-preview-token";

                token.innerHTML =
                    createTokenSVG(

                        color,

                        styleName,

                        themeName

                    );

                inner.appendChild(token);

            }

            home.appendChild(inner);

            board.appendChild(home);

        });

        const center =
            document.createElement("div");

        center.className =
            "theme-preview-center";

        center.style.background = `

            conic-gradient(

                from -45deg,

                ${theme.green} 0deg 90deg,

                ${theme.yellow} 90deg 180deg,

                ${theme.blue} 180deg 270deg,

                ${theme.red} 270deg 360deg

            )

        `;

        board.appendChild(center);

        return board;

    }

    // ======================================
    // CUSTOMIZATION DIALOG
    // ======================================

    function openCustomization() {

        if (
            document.getElementById(
                "customizationDialog"
            )
        ) return;

        let draftTheme = selectedTheme;

        let draftToken = selectedToken;

        const dialog =
            document.createElement("dialog");

        dialog.id =
            "customizationDialog";

        dialog.innerHTML = `

            <h2>🎨 CUSTOMIZATION</h2>

            <p>Make Turbo Ludo your own.</p>

            <div id="themePreview"></div>

            <h3>BOARD THEME</h3>

            <div
                id="themeOptions"
                class="custom-options">
            </div>

            <h3>TOKEN DESIGN</h3>

            <div
                id="tokenOptions"
                class="custom-options">
            </div>

            <button
                id="saveCustomization"
                class="custom-save">
                SAVE DESIGN
            </button>

            <button
                id="resetCustomization"
                class="custom-secondary">
                RESTORE DEFAULTS
            </button>

            <button
                id="cancelCustomization"
                class="custom-secondary">
                CANCEL
            </button>

        `;

        document.body.appendChild(dialog);

        function renderPreview() {

            dialog.querySelector(
                "#themePreview"
            ).replaceChildren(

                createBoardPreview(
                    draftTheme,
                    draftToken
                )

            );

            renderOptions();

        }

        function renderOptions() {

            const themeOptions =
                dialog.querySelector(
                    "#themeOptions"
                );

            const tokenOptions =
                dialog.querySelector(
                    "#tokenOptions"
                );

            themeOptions.replaceChildren();

            tokenOptions.replaceChildren();

            Object.entries(themes)
                .forEach(([key, theme]) => {

                    const button =
                        document.createElement("button");

                    button.className =
                        "custom-option";

                    button.classList.toggle(
                        "selected",
                        draftTheme === key
                    );

                    const palette =
                        document.createElement("div");

                    palette.className =
                        "custom-palette";

                    playerColors.forEach(color => {

                        const dot =
                            document.createElement("span");

                        dot.style.background =
                            theme[color];

                        palette.appendChild(dot);

                    });

                    const name =
                        document.createElement("span");

                    name.textContent =
                        theme.name;

                    button.append(
                        palette,
                        name
                    );

                    button.onclick = () => {

                        draftTheme = key;

                        renderPreview();

                    };

                    themeOptions.appendChild(
                        button
                    );

                });

            Object.entries(tokenStyles)
                .forEach(([key, name]) => {

                    const button =
                        document.createElement("button");

                    button.className =
                        "custom-option";

                    button.classList.toggle(
                        "selected",
                        draftToken === key
                    );

                    const icon =
                        document.createElement("div");

                    icon.className =
                        "custom-token-icon";

                    icon.innerHTML =
                        createTokenSVG(

                            "blue",

                            key,

                            draftTheme

                        );

                    const label =
                        document.createElement("span");

                    label.textContent = name;

                    button.append(
                        icon,
                        label
                    );

                    button.onclick = () => {

                        draftToken = key;

                        renderPreview();

                    };

                    tokenOptions.appendChild(
                        button
                    );

                });

        }

        dialog.querySelector(
            "#saveCustomization"
        ).onclick = () => {

            const previousTheme =
                selectedTheme;

            const previousToken =
                selectedToken;

            selectedTheme = draftTheme;

            selectedToken = draftToken;

            if (!savePreferences()) {

                selectedTheme =
                    previousTheme;

                selectedToken =
                    previousToken;

                return;

            }

            dialog.close();

        };

        dialog.querySelector(
            "#resetCustomization"
        ).onclick = () => {

            draftTheme = "original";

            draftToken = "original";

            renderPreview();

        };

        dialog.querySelector(
            "#cancelCustomization"
        ).onclick = () => {

            dialog.close();

        };

        dialog.addEventListener(
            "close",
            () => dialog.remove()
        );

        renderPreview();

        dialog.showModal();

    }

    // ======================================
    // ADD MAIN MENU BUTTON
    // ======================================

    function addCustomizationButton() {

        const menu =
            document.querySelector(".menu");

        if (!menu) return;

        if (
            document.getElementById(
                "customizationButton"
            )
        ) return;

        const button =
            document.createElement("button");

        button.id =
            "customizationButton";

        button.className =
            "rules-button";

        button.textContent =
            "🎨 CUSTOMIZATION";

        button.onclick = () => {

            if (
                typeof playSound === "function"
            ) {

                playSound();

            }

            openCustomization();

        };

        const rulesButton =
            menu.querySelector(
                '[onclick="showRules()"]'
            );

        if (rulesButton) {

            menu.insertBefore(
                button,
                rulesButton
            );

        } else {

            menu.appendChild(button);

        }

    }

    // ======================================
    // INITIALIZE
    // ======================================

    function initializeThemes() {

        const board =
            document.getElementById(
                "ludoBoard"
            );

        if (board) {

            applyAppearance();

            watchTokens();

        } else {

            addCustomizationButton();

        }

    }

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(

            "DOMContentLoaded",

            initializeThemes

        );

    } else {

        initializeThemes();

    }

})();