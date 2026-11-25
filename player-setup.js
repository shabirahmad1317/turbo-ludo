// ==========================================
// TURBO LUDO V2.6
// OPTIONAL PLAYER NAMES
// DEVELOPED BY NOORTECH
// ==========================================

(function () {

    "use strict";

    const NAME_KEY = "turboLudoPlayerNames";

    const playerColors = [
        "blue",
        "red",
        "green",
        "yellow"
    ];

    const defaultNames = {
        blue: "Blue",
        red: "Red",
        green: "Green",
        yellow: "Yellow"
    };

    let activeNames = {
        ...defaultNames
    };

    // ======================================
    // VALIDATE PLAYER NAMES
    // ======================================

    function normalizeNames(names = {}) {

        const result = {};

        playerColors.forEach(color => {

            const value =
                typeof names[color] === "string"
                    ? names[color].trim().slice(0, 20)
                    : "";

            result[color] =
                value || defaultNames[color];

        });

        return result;

    }

    // ======================================
    // LOAD PREVIOUS NAMES
    // ======================================

    function loadPreviousNames() {

        try {

            const raw =
                localStorage.getItem(NAME_KEY);

            if (!raw) return {};

            return JSON.parse(raw) || {};

        } catch (error) {

            return {};

        }

    }

    // ======================================
    // REMEMBER CUSTOM NAMES
    // ======================================

    function rememberNames(names) {

        try {

            localStorage.setItem(
                NAME_KEY,
                JSON.stringify(names)
            );

        } catch (error) {

            console.warn(
                "Cannot remember names:",
                error
            );

        }

    }

    // ======================================
    // GET PLAYER NAME
    // ======================================

    window.getPlayerName = function (color) {

        return activeNames[color] ||
            defaultNames[color] ||
            color;

    };

    // ======================================
    // UPDATE PLAYER PANELS
    // ======================================

    function applyNames(names) {

        activeNames = normalizeNames(names);

        playerColors.forEach(color => {

            const panel =
                document.getElementById(
                    `player-${color}`
                );

            if (panel) {

                const nameElement =
                    panel.querySelector(
                        ".player-info strong"
                    );

                if (nameElement) {

                    nameElement.textContent =
                        activeNames[color];

                    nameElement.title =
                        activeNames[color];

                }

            }

            // Existing save system automatically
            // saves the complete gameState object.

            if (gameState[color]) {

                gameState[color].playerName =
                    activeNames[color];

            }

        });

    }

    // ======================================
    // UPDATE TURN MESSAGE
    // ======================================

    function updateNameTurnMessage() {

        const message =
            document.getElementById(
                "turnMessage"
            );

        if (message && matchStarted) {

            message.textContent =
                `${getPlayerName(currentPlayer)}'s TURN`;

        }

    }

    // ======================================
    // DELAY ORIGINAL MATCH INITIALIZATION
    // ======================================

    const originalInitializeMatch =
        initializeMatch;

    initializeMatch = function () {

        rollButton.disabled = true;

        document.querySelectorAll(".player")
            .forEach(panel => {

                panel.classList.remove("active");

            });

        document.getElementById("turnMessage")
            .textContent = "Match Setup";

    };

    // ======================================
    // START MATCH AFTER SETUP
    // ======================================

    function continueToGame(names) {

        applyNames(names);

        originalInitializeMatch();

        if (matchStarted) {

            updateNameTurnMessage();

            saveGame();

        }

    }

    // ======================================
    // CREATE SETUP DIALOG
    // ======================================

    function showPlayerSetup() {

        const existing =
            document.getElementById(
                "playerSetupDialog"
            );

        if (existing) return;

        const dialog =
            document.createElement("dialog");

        dialog.id = "playerSetupDialog";

        dialog.innerHTML = `

            <div class="setup-crown">👑</div>

            <h1 class="setup-title">
                MATCH SETUP
            </h1>

            <p class="setup-description">
                Play instantly or personalize
                your match with player names.
            </p>

            <div id="setupOptions">

                <button
                    id="quickStartButton"
                    class="setup-button">

                    🎲 QUICK START

                </button>

                <button
                    id="customNamesButton"
                    class="setup-button secondary">

                    👤 ENTER PLAYER NAMES

                </button>

            </div>

            <div id="customNamesForm" hidden>

                ${playerColors.map(color => `

                    <div class="setup-player-row">

                        <div class="setup-color ${color}">
                        </div>

                        <div class="setup-input-area">

                            <label for="name-${color}">

                                ${defaultNames[color]} Player

                            </label>

                            <input
                                id="name-${color}"
                                type="text"
                                maxlength="20"
                                autocomplete="off"
                                placeholder="${defaultNames[color]}">

                        </div>

                    </div>

                `).join("")}

                <button
                    id="confirmNamesButton"
                    class="setup-button">

                    CONTINUE

                </button>

                <button
                    id="setupBackButton"
                    class="setup-button secondary">

                    BACK

                </button>

            </div>

            ${mode === "turbo" ? `

                <div class="setup-teams">

                    <strong>TEAM A</strong>

                    <div>🔵 Blue + 🟢 Green</div>

                    <strong>TEAM B</strong>

                    <div>🔴 Red + 🟡 Yellow</div>

                </div>

            ` : ""}

            <div class="setup-footer">
                POWERED BY NOORTECH
            </div>

        `;

        document.body.appendChild(dialog);

        const previousNames =
            loadPreviousNames();

        playerColors.forEach(color => {

            const input =
                dialog.querySelector(
                    `#name-${color}`
                );

            input.value =
                typeof previousNames[color] === "string"
                    ? previousNames[color].slice(0, 20)
                    : "";

        });

        const options =
            dialog.querySelector("#setupOptions");

        const form =
            dialog.querySelector("#customNamesForm");

        // QUICK START

        dialog.querySelector("#quickStartButton")
            .addEventListener("click", () => {

                dialog.close();

                dialog.remove();

                continueToGame(defaultNames);

            });

        // CUSTOM NAMES

        dialog.querySelector("#customNamesButton")
            .addEventListener("click", () => {

                options.hidden = true;

                form.hidden = false;

            });

        // BACK

        dialog.querySelector("#setupBackButton")
            .addEventListener("click", () => {

                form.hidden = true;

                options.hidden = false;

            });

        // CONFIRM PLAYER NAMES

        dialog.querySelector("#confirmNamesButton")
            .addEventListener("click", () => {

                const names = {};

                playerColors.forEach(color => {

                    names[color] =
                        dialog.querySelector(
                            `#name-${color}`
                        ).value.trim();

                });

                rememberNames(names);

                dialog.close();

                dialog.remove();

                continueToGame(names);

            });

        dialog.addEventListener(
            "cancel",
            event => event.preventDefault()
        );

        dialog.showModal();

    }

    // ======================================
    // INTEGRATE WITH EXISTING GAME
    // ======================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            // Update player name on every turn.

            const previousUpdateCurrentPlayer =
                updateCurrentPlayer;

            updateCurrentPlayer = function () {

                previousUpdateCurrentPlayer();

                updateNameTurnMessage();

            };

            // Personalize the roll instruction.

            const previousPrepareTurn =
                prepareTurn;

            prepareTurn = function () {

                previousPrepareTurn();

                updateNameTurnMessage();

                document.getElementById(
                    "gameMessage"
                ).textContent =
                    `${getPlayerName(currentPlayer)}, roll the dice.`;

            };

            // Display the Lucky Spin winner's name.

            const spinResultElement =
                document.getElementById(
                    "spinResult"
                );

            const spinObserver =
                new MutationObserver(() => {

                    if (!spinWinner ||
                        spinInProgress) return;

                    const originalText =
                        `${spinWinner.toUpperCase()} PLAYER STARTS!`;

                    if (
                        spinResultElement.textContent ===
                        originalText
                    ) {

                        spinResultElement.textContent =
                            `${getPlayerName(spinWinner)} STARTS!`;

                    }

                });

            spinObserver.observe(
                spinResultElement,
                {
                    childList: true,
                    characterData: true,
                    subtree: true
                }
            );

            // Restore names belonging to saved match.

            const previousRestoreGame =
                restoreGame;

            restoreGame = async function (data) {

                const savedNames = {};

                playerColors.forEach(color => {

                    savedNames[color] =
                        data.gameState[color].playerName ||
                        defaultNames[color];

                });

                applyNames(savedNames);

                await previousRestoreGame(data);

                updateNameTurnMessage();

                if (turnPhase === "roll") {

                    document.getElementById(
                        "gameMessage"
                    ).textContent =
                        `${getPlayerName(currentPlayer)}, roll the dice.`;

                }

            };

            // If a saved match exists, the existing
            // resume dialog takes priority.

            const resumeDialog =
                document.querySelector(
                    ".resume-dialog[open]"
                );

            if (resumeDialog) {

                return;

            }

            // Otherwise show optional player setup.

            showPlayerSetup();

        }
    );

})();