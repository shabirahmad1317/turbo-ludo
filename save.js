
// ==========================================
// TURBO LUDO - MILESTONE 10
// AUTOMATIC SAVE AND RESUME
// ==========================================

const SAVE_KEY = `turboLudoSave_${mode}`;

const SAVE_VERSION = 1;

let savingEnabled = false;
let lastSavedTime = null;

// ==========================================
// SAVE GAME
// ==========================================

function saveGame() {

    if (!savingEnabled) return false;

    if (!matchStarted) return false;

    // Save only stable game states.
    // Never save halfway through an animation.

    if (
        turnPhase !== "roll" &&
        turnPhase !== "move"
    ) {
        return false;
    }

    const saveData = {

        version: SAVE_VERSION,

        mode: mode,

        savedAt: new Date().toISOString(),

        currentPlayer: currentPlayer,

        turnNumber: turnNumber,

        turnPhase: turnPhase,

        matchStarted: matchStarted,

        diceValues: [...diceValues],

        remainingDice: remainingDice.map(
            die => ({ ...die })
        ),

        selectedDie: selectedDie,

        bonusRolls: bonusRolls,

        luckRollActive: luckRollActive,

        openingBonusPending:
            openingBonusPending,

        captureLocks: [...captureLocks],

        gameState: JSON.parse(
            JSON.stringify(gameState)
        )

    };

    try {

        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(saveData)
        );

        lastSavedTime = saveData.savedAt;

        updateSaveIndicator();

        return true;

    } catch (error) {

        console.error("Save failed:", error);

        const indicator =
            document.getElementById(
                "saveIndicator"
            );

        if (indicator) {

            indicator.textContent =
                "⚠ SAVE FAILED";

        }

        return false;

    }

}

// ==========================================
// LOAD SAVED DATA
// ==========================================

function getSavedGame() {

    try {

        const raw =
            localStorage.getItem(SAVE_KEY);

        if (!raw) return null;

        const data = JSON.parse(raw);

        if (data.version !== SAVE_VERSION) {
            return null;
        }

        if (data.mode !== mode) {
            return null;
        }

        if (!data.gameState) {
            return null;
        }

        if (!players.includes(data.currentPlayer)) {
            return null;
        }

        if (
            data.turnPhase !== "roll" &&
            data.turnPhase !== "move"
        ) {
            return null;
        }

        for (const color of players) {

            const savedPlayer =
                data.gameState[color];

            if (
                !savedPlayer ||
                !Array.isArray(savedPlayer.tokens) ||
                savedPlayer.tokens.length !== 4
            ) {
                return null;
            }

            for (const token of savedPlayer.tokens) {

                if (
                    !gameState[color].tokens.some(
                        original => original.id === token.id
                    )
                ) {
                    return null;
                }

                if (
                    !["home", "board", "prison",
                      "finished"].includes(token.status)
                ) {
                    return null;
                }

            }

        }

        return data;

    } catch (error) {

        console.error(
            "Cannot read saved game:",
            error
        );

        return null;

    }

}

// ==========================================
// DELETE SAVED GAME
// ==========================================

function deleteSavedGame() {

    try {

        localStorage.removeItem(SAVE_KEY);

    } catch (error) {

        console.error(error);

    }

    lastSavedTime = null;

    updateSaveIndicator();

}

// ==========================================
// SAVE INDICATOR
// ==========================================

function createSaveIndicator() {

    const indicator =
        document.createElement("div");

    indicator.id = "saveIndicator";

    indicator.className = "save-indicator";

    indicator.textContent =
        "💾 AUTO SAVE ENABLED";

    luckStatus.before(indicator);

}

function updateSaveIndicator() {

    const indicator =
        document.getElementById(
            "saveIndicator"
        );

    if (!indicator) return;

    if (!lastSavedTime) {

        indicator.textContent =
            "💾 AUTO SAVE ENABLED";

        return;

    }

    const time = new Date(
        lastSavedTime
    ).toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit"

    });

    indicator.textContent =
        `✓ GAME SAVED · ${time}`;

}

// ==========================================
// RESTORE GAME
// ==========================================

async function restoreGame(data) {

    savingEnabled = false;

    if (spinDialog.open) {

        spinDialog.close();

    }

    currentPlayer = data.currentPlayer;

    turnNumber = data.turnNumber;

    turnPhase = "restoring";

    matchStarted = true;

    spinInProgress = false;

    isRolling = false;

    automaticMovement = false;

    diceValues = [...data.diceValues];

    remainingDice = data.remainingDice.map(
        die => ({ ...die })
    );

    selectedDie = data.selectedDie;

    bonusRolls = data.bonusRolls;

    luckRollActive = data.luckRollActive;

    openingBonusPending =
        data.openingBonusPending;

    lastSavedTime = data.savedAt;

    // Restore original token objects.
    // This preserves existing click handlers.

    for (const color of players) {

        const savedPlayer =
            data.gameState[color];

        const player =
            gameState[color];

        player.captures =
            savedPlayer.captures;

        player.finished =
            savedPlayer.finished;

        player.turbo =
            savedPlayer.turbo;

        for (const token of player.tokens) {

            const savedToken =
                savedPlayer.tokens.find(
                    item => item.id === token.id
                );

            if (savedToken) {

                Object.assign(
                    token,
                    savedToken
                );

            }

        }

    }

    // Restore all token positions.

    for (const token of getAllTokens()) {

        renderTokenPosition(token);

    }

    // Restore capture locks.

    clearCaptureLocks();

    for (const id of data.captureLocks || []) {

        const token =
            getAllTokens().find(
                item => item.id === id
            );

        if (token) {

            lockCapturingToken(token);

        }

    }

    // Restore player scores.

    for (const color of players) {

        document.getElementById(
            `${color}-score`
        ).textContent =
            `${gameState[color].finished} / 4`;

        updateCaptureCounter(color);

    }

    updateCurrentPlayer();

    updateLuckStatus();

    updateBlockades();

    updatePrisonAreas();

    updateLastPoints();

    updateTurboStatus();

    updateTeamProgress();

    renderDice("dice1", diceValues[0]);

    if (mode === "turbo") {

        renderDice("dice2", diceValues[1]);

    }

    document.getElementById(
        "gameSubtitle"
    ).textContent = `TURN ${turnNumber}`;

    giftMessage.textContent =
        "💾 SAVED GAME RESTORED!";

    // Restore exact gameplay phase.

    if (data.turnPhase === "roll") {

        turnPhase = "roll";

        rollButton.disabled = false;

        rollButton.textContent =
            "🎲 ROLL DICE";

        gameMessage.textContent =
            `${currentPlayer.toUpperCase()}, roll the dice.`;

    } else {

        turnPhase = "move";

        rollButton.disabled = true;

        const die =
            remainingDice[selectedDie];

        if (
            die &&
            !die.used &&
            getLegalTokens(die.value).length > 0
        ) {

            updateDiceAppearance();

            highlightLegalTokens();

        } else {

            await checkRemainingMoves();

        }

    }

    savingEnabled = true;

    updateDiceAppearance();

    updateSaveIndicator();

    saveGame();

}

// ==========================================
// RESUME DIALOG
// ==========================================

function showResumeDialog(data) {

    savingEnabled = false;

    rollButton.disabled = true;

    if (spinDialog.open) {

        spinDialog.close();

    }

    const dialog =
        document.createElement("dialog");

    dialog.className = "resume-dialog";

    const scoreA =
        data.gameState.red.finished +
        data.gameState.green.finished;

    const scoreB =
        data.gameState.blue.finished +
        data.gameState.yellow.finished;

    const savedDate = new Date(
        data.savedAt
    ).toLocaleString();

    dialog.innerHTML = `

        <div class="resume-icon">💾</div>

        <h1>SAVED MATCH FOUND</h1>

        <p>Continue your previous match</p>

        <div class="resume-details">

            ${mode === "turbo" ? `

                <div class="resume-row">

                    <span>🔴 Red + 🟢 Green</span>

                    <strong>${scoreA} / 8</strong>

                </div>

                <div class="resume-track">

                    <div style="
                        width:${scoreA / 8 * 100}%
                    "></div>

                </div>

                <div class="resume-row">

                    <span>🔵 Blue + 🟡 Yellow</span>

                    <strong>${scoreB} / 8</strong>

                </div>

                <div class="resume-track">

                    <div style="
                        width:${scoreB / 8 * 100}%
                    "></div>

                </div>

            ` : ""}

            <div class="resume-row">

                <span>Current Player</span>

                <strong style="
                    color:${colors[data.currentPlayer]}
                ">

                    ${data.currentPlayer.toUpperCase()}

                </strong>

            </div>

            <div class="resume-row">

                <span>Turn</span>

                <strong>${data.turnNumber}</strong>

            </div>

            <small id="resumeSavedDate"></small>

        </div>

        <button id="continueSavedGame"
                class="resume-button">

            ▶ CONTINUE GAME

        </button>

        <button id="newSavedGame"
                class="resume-button secondary">

            START NEW GAME

        </button>

        <button id="resumeMainMenu"
                class="resume-button secondary">

            MAIN MENU

        </button>

    `;

    document.body.appendChild(dialog);

    dialog.querySelector(
        "#resumeSavedDate"
    ).textContent = `Saved: ${savedDate}`;

    dialog.addEventListener(
        "cancel",
        event => event.preventDefault()
    );

    // Continue saved match.

    dialog.querySelector(
        "#continueSavedGame"
    ).addEventListener("click", async () => {

        dialog.close();

        dialog.remove();

        await restoreGame(data);

    });

    // Start a completely new match.

    dialog.querySelector(
        "#newSavedGame"
    ).addEventListener("click", () => {

        const confirmed = confirm(
            "Delete the saved match and start a new game?"
        );

        if (!confirmed) return;

        deleteSavedGame();

        window.location.reload();

    });

    // Return to main menu without deleting save.

    dialog.querySelector(
        "#resumeMainMenu"
    ).addEventListener("click", () => {

        window.location.href = "index.html";

    });

    dialog.showModal();

}

// ==========================================
// SAVE INTERFACE STYLES
// ==========================================

const saveStyle =
    document.createElement("style");

saveStyle.textContent = `

    .save-indicator {

        text-align: center;

        color: #86efac;

        font-size: 10px;

        font-weight: bold;

        padding: 4px;

        letter-spacing: .5px;

    }

    .resume-dialog {

        width: min(90vw, 380px);

        box-sizing: border-box;

        padding: 22px;

        border: 2px solid #ffc83d;

        border-radius: 22px;

        background: linear-gradient(
            145deg,
            #193b85,
            #07132e
        );

        color: white;

        text-align: center;

    }

    .resume-dialog::backdrop {

        background: #000c;

        backdrop-filter: blur(5px);

    }

    .resume-icon {

        font-size: 55px;

        margin-bottom: 10px;

    }

    .resume-dialog h1 {

        color: #ffc83d;

        font-size: 23px;

        margin: 10px 0;

    }

    .resume-dialog p {

        color: #cbd5e1;

        font-size: 13px;

    }

    .resume-details {

        background: #ffffff0c;

        border: 1px solid #ffffff22;

        border-radius: 12px;

        padding: 12px;

        margin: 15px 0;

    }

    .resume-row {

        display: flex;

        justify-content: space-between;

        align-items: center;

        gap: 10px;

        font-size: 12px;

        margin: 12px 0;

    }

    .resume-track {

        height: 6px;

        background: #ffffff20;

        border-radius: 10px;

        overflow: hidden;

    }

    .resume-track div {

        height: 100%;

        background: #ffc83d;

        border-radius: 10px;

    }

    .resume-details small {

        color: #94a3b8;

        font-size: 10px;

    }

    .resume-button {

        width: 100%;

        padding: 13px;

        margin-top: 9px;

        border: 1px solid #ffc83d;

        border-radius: 10px;

        background: #ffc83d;

        color: #10265d;

        font-size: 13px;

        font-weight: bold;

        cursor: pointer;

    }

    .resume-button.secondary {

        background: transparent;

        color: #ffc83d;

    }

`;

document.head.appendChild(saveStyle);

// ==========================================
// AUTOMATIC SAVE HOOKS
// ==========================================

// Save after Lucky Spin starts the match.

const originalBeginMatch = beginMatch;

beginMatch = function () {

    originalBeginMatch();

    saveGame();

};

// Save whenever a new turn starts.

const originalPrepareTurn = prepareTurn;

prepareTurn = function () {

    originalPrepareTurn();

    saveGame();

};

// Save after an extra roll is awarded.

const originalAllowExtraRoll =
    allowExtraRoll;

allowExtraRoll = function (message) {

    originalAllowExtraRoll(message);

    saveGame();

};

// Save after processing a dice roll.

const originalShowDiceResult =
    showDiceResult;

showDiceResult = async function () {

    await originalShowDiceResult();

    saveGame();

};

// Save after a token finishes moving.

const originalExecuteSelectedMove =
    executeSelectedMove;

executeSelectedMove = async function (token) {

    await originalExecuteSelectedMove(token);

    saveGame();

};

// Save selected die.

const originalSelectDie = selectDie;

selectDie = function (index) {

    originalSelectDie(index);

    saveGame();

};

// ==========================================
// RESTART GAME
// ==========================================

restartGame = function () {

    const confirmed = confirm(

        "Restart the match? Your saved progress will be deleted."

    );

    if (!confirmed) return;

    savingEnabled = false;

    deleteSavedGame();

    window.location.reload();

};

// ==========================================
// RETURN TO MAIN MENU
// ==========================================

goHome = function () {

    saveGame();

    window.location.href = "index.html";

};

// ==========================================
// DELETE SAVE AFTER VICTORY
// ==========================================

const originalShowVictory = showVictory;

showVictory = function (
    team,
    winnerColor = null
) {

    savingEnabled = false;

    deleteSavedGame();

    originalShowVictory(
        team,
        winnerColor
    );

};

// ==========================================
// PERIODIC AUTO SAVE
// ==========================================

setInterval(() => {

    saveGame();

}, 2000);

// Save when the user closes or hides the app.

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) {

            saveGame();

        }

    }
);

window.addEventListener(
    "pagehide",
    () => saveGame()
);

window.addEventListener(
    "beforeunload",
    () => saveGame()
);

// ==========================================
// INITIALIZE SAVE SYSTEM
// ==========================================

function initializeSaveSystem() {

    createSaveIndicator();

    const savedGame = getSavedGame();

    if (savedGame) {

        showResumeDialog(savedGame);

    } else {

        savingEnabled = true;

        updateSaveIndicator();

        saveGame();

    }

}

initializeSaveSystem();
