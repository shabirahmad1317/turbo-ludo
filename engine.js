
// ==========================================
// TURBO LUDO - MILESTONE 9
// Complete Game Engine
// ==========================================

let luckRollActive = mode === "turbo";
let openingBonusPending = false;
let remainingDice = [];
let selectedDie = -1;
let bonusRolls = 0;
let automaticMovement = false;
let engineAudio = null;

const captureLocks = new Set();

const luckStatus =
    document.getElementById("luckStatus");

const gameMessage =
    document.getElementById("gameMessage");

// ==========================================
// TEAMS
// ==========================================

const teams = {
    red: "A",
    green: "A",
    blue: "B",
    yellow: "B"
};

const teammates = {
    red: "green",
    green: "red",
    blue: "yellow",
    yellow: "blue"
};

function isTeammate(first, second) {
    return mode === "turbo" &&
           first !== second &&
           teams[first] === teams[second];
}

function isOpponent(first, second) {
    return first !== second &&
           !isTeammate(first, second);
}

function canControlToken(token) {

    if (token.color === currentPlayer) {
        return true;
    }

    return mode === "turbo" &&
           gameState[currentPlayer].turbo &&
           isTeammate(currentPlayer, token.color);

}

// ==========================================
// BOARD CONFIGURATION
// ==========================================

const homeStops = {
    blue: [[6, 1], [8, 2]],
    green: [[1, 8], [2, 6]],
    yellow: [[8, 13], [6, 12]],
    red: [[13, 6], [12, 8]]
};

const mainPath = [

    [6, 1], [6, 2], [6, 3],
    [6, 4], [6, 5],

    [5, 6], [4, 6], [3, 6],
    [2, 6], [1, 6], [0, 6],
    [0, 7], [0, 8],

    [1, 8], [2, 8], [3, 8],
    [4, 8], [5, 8],

    [6, 9], [6, 10], [6, 11],
    [6, 12], [6, 13], [6, 14],
    [7, 14], [8, 14],

    [8, 13], [8, 12], [8, 11],
    [8, 10], [8, 9],

    [9, 8], [10, 8], [11, 8],
    [12, 8], [13, 8], [14, 8],
    [14, 7], [14, 6],

    [13, 6], [12, 6], [11, 6],
    [10, 6], [9, 6],

    [8, 5], [8, 4], [8, 3],
    [8, 2], [8, 1], [8, 0],
    [7, 0], [6, 0]

];

const startingIndexes = {
    blue: 0,
    green: 13,
    yellow: 26,
    red: 39
};

const startingPoints = {
    red: [13, 6],
    blue: [6, 1],
    green: [1, 8],
    yellow: [8, 13]
};

const lastPoints = {
    red: [14, 7],
    blue: [7, 0],
    green: [0, 7],
    yellow: [7, 14]
};

const homeLanes = {

    blue: [
        [7, 1], [7, 2], [7, 3],
        [7, 4], [7, 5]
    ],

    green: [
        [1, 7], [2, 7], [3, 7],
        [4, 7], [5, 7]
    ],

    yellow: [
        [7, 13], [7, 12], [7, 11],
        [7, 10], [7, 9]
    ],

    red: [
        [13, 7], [12, 7], [11, 7],
        [10, 7], [9, 7]
    ]

};

const LAST_POINT = 50;
const FINISH_POSITION = 56;

// ==========================================
// UTILITIES
// ==========================================

function wait(ms) {
    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}

function getAllTokens() {
    return Object.values(gameState)
        .flatMap(player => player.tokens);
}

function getHomeTokens(color) {
    return gameState[color].tokens.filter(
        token => token.status === "home"
    );
}

function getBoardTokens(color) {
    return gameState[color].tokens.filter(
        token => token.status === "board"
    );
}

function getPrisonTokens(color) {
    return gameState[color].tokens.filter(
        token => token.status === "prison"
    );
}

function getControlledTokens() {
    return getAllTokens().filter(
        token => canControlToken(token)
    );
}

function getControlledBoardTokens() {
    return getControlledTokens().filter(
        token => token.status === "board"
    );
}

function getTokenElement(token) {

    let element =
        document.getElementById(token.id);

    if (!element) {

        const slot =
            document.getElementById(
                `slot-${token.id}`
            );

        element = slot?.querySelector(".token");

        if (element) {
            element.id = token.id;
        }

    }

    return element;

}

function getTokenCoordinates(color, position) {

    if (position < 0) return null;

    if (position <= LAST_POINT) {

        return mainPath[
            (startingIndexes[color] + position)
            % mainPath.length
        ];

    }

    if (position < FINISH_POSITION) {

        return homeLanes[color][
            position - LAST_POINT - 1
        ];

    }

    return null;

}

function getTokensAtCell(row, col) {

    return getAllTokens().filter(token => {

        if (token.status !== "board") {
            return false;
        }

        const point = getTokenCoordinates(
            token.color,
            token.position
        );

        return point &&
               point[0] === row &&
               point[1] === col;

    });

}

// ==========================================
// STYLES
// ==========================================

const movementStyle =
    document.createElement("style");

movementStyle.textContent = `

    .game-dice {
        cursor: pointer;
        transition: opacity .2s, outline .2s;
    }

    .game-dice.selected-die {
        outline: 4px solid #ffc83d;
        outline-offset: 4px;
    }

    .game-dice.used-die {
        opacity: .3;
    }

    .token.legal-token {
        filter:
            drop-shadow(0 0 4px white)
            drop-shadow(0 0 6px #ffc83d);
        animation: legalPulse .8s infinite;
        z-index: 15;
    }

    .token.unavailable-token {
        opacity: .65;
    }

    .token.moving-token {
        z-index: 25;
    }

    .token.capture-locked {
        filter: grayscale(.65);
        opacity: .75;
        cursor: not-allowed;
    }

    .blockade-cell {
        position: relative;
        box-shadow:
            inset 0 0 0 2px #ffc83d,
            inset 0 0 8px #ffc83d;
    }

    .blockade-badge {
        position: absolute;
        top: -7px;
        right: -6px;
        z-index: 30;
        font-size: 9px;
        color: #ffc83d;
        background: #10265d;
        border: 1px solid #ffc83d;
        border-radius: 5px;
        padding: 1px 3px;
        pointer-events: none;
    }

    .prison-area {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 2px;
        padding: 3px;
        border: 1px solid #ffc83d;
        border-radius: 5px;
        background: #10265d;
        color: #ffc83d;
        font-size: 9px;
    }

    .prison-area[hidden] {
        display: none !important;
    }

    .prison-area .token {
        position: relative !important;
        width: 22px !important;
        height: 27px !important;
        transform: none !important;
        inset: auto !important;
        flex-shrink: 0;
    }

    .capture-counter {
        font-size: 10px;
        color: #ffc83d;
    }

    .last-point-locked {
        box-shadow: inset 0 0 0 2px #ef4444;
    }

    .last-point-open {
        box-shadow: inset 0 0 0 2px #22c55e;
    }

    .last-point-badge {
        position: absolute;
        top: -6px;
        left: -4px;
        font-size: 10px;
        z-index: 30;
        pointer-events: none;
    }

    .home-lane-locked {
        filter: brightness(.72);
    }

    #ludoBoard {
        position: relative;
    }

    .finish-area {
        position: absolute;
        width: 9%;
        height: 9%;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
        z-index: 35;
        pointer-events: none;
    }

    .finish-blue {
        left: 40%;
        top: 45.5%;
    }

    .finish-green {
        left: 45.5%;
        top: 40%;
    }

    .finish-yellow {
        left: 51%;
        top: 45.5%;
    }

    .finish-red {
        left: 45.5%;
        top: 51%;
    }

    .finish-area .token {
        position: relative !important;
        width: 100% !important;
        height: 100% !important;
        transform: none !important;
        inset: auto !important;
        pointer-events: none;
    }

    .turbo-badge {
        color: #ffc83d;
        font-size: 10px;
        font-weight: bold;
        margin-top: 3px;
    }

    .turbo-active {
        border: 2px solid #ffc83d !important;
        box-shadow: 0 0 14px #ffc83d88;
    }

    .team-progress {
        display: flex;
        gap: 8px;
        margin: 6px 0;
    }

    .team-progress-card {
        flex: 1;
        padding: 7px;
        background: #10265d;
        color: white;
        border: 1px solid #ffc83d;
        border-radius: 8px;
        font-size: 11px;
        text-align: center;
    }

    .team-track {
        height: 5px;
        background: #ffffff25;
        border-radius: 8px;
        overflow: hidden;
        margin-top: 5px;
    }

    .team-fill {
        height: 100%;
        width: 0%;
        background: #ffc83d;
        transition: width .4s;
    }

    .victory-dialog {
        width: min(90vw, 380px);
        box-sizing: border-box;
        padding: 25px;
        border: 2px solid #ffc83d;
        border-radius: 22px;
        background: linear-gradient(
            145deg, #193b85, #07132e
        );
        color: white;
        text-align: center;
    }

    .victory-dialog::backdrop {
        background: #000b;
    }

    .victory-dialog h1 {
        color: #ffc83d;
        margin: 12px 0;
    }

    .victory-trophy {
        font-size: 75px;
        animation: trophyPulse 1.2s infinite;
    }

    .victory-button {
        width: 100%;
        padding: 13px;
        margin-top: 12px;
        border: none;
        border-radius: 12px;
        background: #ffc83d;
        color: #10265d;
        font-weight: bold;
        cursor: pointer;
    }

    .double-one-bonus {
        animation: bonusFlash .4s 3;
    }

    @keyframes bonusFlash {
        50% {
            scale: 1.15;
            box-shadow: 0 0 20px #ffc83d;
        }
    }

    @keyframes legalPulse {
        50% { scale: 1.12; }
    }

    @keyframes trophyPulse {
        50% { scale: 1.12; }
    }

`;

document.head.appendChild(movementStyle);

// ==========================================
// PRISON INTERFACE
// ==========================================

function createPrisonAreas() {

    Object.keys(gameState).forEach(color => {

        const player =
            document.getElementById(
                `player-${color}`
            );

        if (!player) return;

        const info =
            player.querySelector(".player-info")
            || player;

        const counter =
            document.createElement("div");

        counter.id = `captures-${color}`;
        counter.className = "capture-counter";

        counter.textContent =
            "🔒 Home Locked | Captures: 0";

        const prison =
            document.createElement("div");

        prison.id = `prison-${color}`;
        prison.className = "prison-area";
        prison.hidden = true;

        const label =
            document.createElement("span");

        label.textContent = "🔒 Prison";

        prison.appendChild(label);

        const turboBadge =
            document.createElement("div");

        turboBadge.id = `turbo-${color}`;
        turboBadge.className = "turbo-badge";
        turboBadge.hidden = true;

        info.appendChild(counter);
        info.appendChild(prison);
        info.appendChild(turboBadge);

    });

}

function updatePrisonAreas() {

    Object.keys(gameState).forEach(color => {

        const prison =
            document.getElementById(
                `prison-${color}`
            );

        if (!prison) return;

        const prisoners =
            getAllTokens().filter(token =>

                token.status === "prison" &&
                token.capturedBy === color

            );

        prison.hidden =
            prisoners.length === 0;

    });

}

function updateCaptureCounter(color) {

    const counter =
        document.getElementById(
            `captures-${color}`
        );

    if (!counter) return;

    const captures =
        gameState[color].captures;

    counter.textContent =
        captures > 0

            ? `🔓 Home Open | Captures: ${captures}`

            : "🔒 Home Locked | Captures: 0";

}

// ==========================================
// TEAM PROGRESS
// ==========================================

function createTeamProgress() {

    if (mode !== "turbo") return;

    const panel =
        document.createElement("div");

    panel.className = "team-progress";

    panel.innerHTML = `

        <div class="team-progress-card">

            🔴 RED + 🟢 GREEN

            <div id="team-A-score">0 / 8</div>

            <div class="team-track">
                <div id="team-A-fill"
                     class="team-fill"></div>
            </div>

        </div>

        <div class="team-progress-card">

            🔵 BLUE + 🟡 YELLOW

            <div id="team-B-score">0 / 8</div>

            <div class="team-track">
                <div id="team-B-fill"
                     class="team-fill"></div>
            </div>

        </div>

    `;

    luckStatus.after(panel);

}

function getTeamScore(team) {

    return Object.keys(teams)
        .filter(color => teams[color] === team)
        .reduce((total, color) =>

            total + gameState[color].finished,

            0

        );

}

function updateTeamProgress() {

    if (mode !== "turbo") return;

    ["A", "B"].forEach(team => {

        const score = getTeamScore(team);

        const label =
            document.getElementById(
                `team-${team}-score`
            );

        const fill =
            document.getElementById(
                `team-${team}-fill`
            );

        if (label) {
            label.textContent = `${score} / 8`;
        }

        if (fill) {
            fill.style.width =
                `${score / 8 * 100}%`;
        }

    });

}

// ==========================================
// LAST POINT SYSTEM
// ==========================================

function isHomeUnlocked(color) {

    return mode === "classic" ||
           gameState[color].captures > 0;

}

function updateLastPoints() {

    if (mode !== "turbo") return;

    for (const color of Object.keys(lastPoints)) {

        const [row, col] = lastPoints[color];

        const cell =
            document.getElementById(
                `cell-${row}-${col}`
            );

        if (!cell) continue;

        const unlocked =
            isHomeUnlocked(color);

        cell.classList.toggle(
            "last-point-locked",
            !unlocked
        );

        cell.classList.toggle(
            "last-point-open",
            unlocked
        );

        cell.style.position = "relative";

        let badge =
            cell.querySelector(
                ".last-point-badge"
            );

        if (!badge) {

            badge =
                document.createElement("span");

            badge.className =
                "last-point-badge";

            cell.appendChild(badge);

        }

        badge.textContent =
            unlocked ? "🔓" : "🔒";

        for (const point of homeLanes[color]) {

            const lane =
                document.getElementById(
                    `cell-${point[0]}-${point[1]}`
                );

            lane?.classList.toggle(
                "home-lane-locked",
                !unlocked
            );

        }

    }

}

// ==========================================
// FINISH AREAS
// ==========================================

function createFinishAreas() {

    const board =
        document.getElementById("ludoBoard");

    for (const color of Object.keys(gameState)) {

        const area =
            document.createElement("div");

        area.id = `finish-${color}`;

        area.className =
            `finish-area finish-${color}`;

        board.appendChild(area);

    }

}

// ==========================================
// CORRECTED BLOCKADE SYSTEM
// ==========================================

function getHomeStopOwner(row, col) {

    for (const color of Object.keys(homeStops)) {

        if (homeStops[color].some(point =>

            point[0] === row &&
            point[1] === col

        )) {

            return color;

        }

    }

    return null;

}

function getBlockade(row, col) {

    if (mode !== "turbo") return null;

    const owner =
        getHomeStopOwner(row, col);

    if (!owner) return null;

    const tokens =
        getTokensAtCell(row, col).filter(
            token => token.color === owner
        );

    if (tokens.length < 2) return null;

    return {
        owner: owner,
        count: tokens.length
    };

}

function isCellBlocked(color, row, col) {

    const blockade = getBlockade(row, col);

    if (!blockade) return false;

    // NEW RULE:
    // Teammates can cross each other's borders.
    // Only opposing teams are blocked.

    return isOpponent(
        color,
        blockade.owner
    );

}

function isPathBlocked(token, steps) {

    if (mode !== "turbo") return false;

    for (let step = 1; step <= steps; step++) {

        const position =
            token.position + step;

        if (position > LAST_POINT) continue;

        const point = getTokenCoordinates(
            token.color,
            position
        );

        if (
            point &&
            isCellBlocked(
                token.color,
                point[0],
                point[1]
            )
        ) {

            return true;

        }

    }

    return false;

}

function updateBlockades() {

    document.querySelectorAll(".blockade-cell")
        .forEach(cell =>
            cell.classList.remove("blockade-cell")
        );

    document.querySelectorAll(".blockade-badge")
        .forEach(badge => badge.remove());

    if (mode !== "turbo") return;

    for (const color of Object.keys(homeStops)) {

        for (const [row, col] of homeStops[color]) {

            const blockade =
                getBlockade(row, col);

            if (!blockade) continue;

            const cell =
                document.getElementById(
                    `cell-${row}-${col}`
                );

            if (!cell) continue;

            cell.classList.add("blockade-cell");

            const badge =
                document.createElement("span");

            badge.className = "blockade-badge";

            badge.textContent =
                `🔒${blockade.count}`;

            cell.appendChild(badge);

        }

    }

}

// ==========================================
// CAPTURE MOVEMENT LOCK
// ==========================================

function lockCapturingToken(token) {

    if (mode !== "turbo") return;

    captureLocks.add(token.id);

    const element = getTokenElement(token);

    element?.classList.add("capture-locked");

    if (element) {

        element.title =
            "Captured an opponent. Wait for next roll.";

    }

}

function clearCaptureLocks() {

    captureLocks.clear();

    document.querySelectorAll(".capture-locked")
        .forEach(element => {

            element.classList.remove(
                "capture-locked"
            );

            element.removeAttribute("title");

        });

}

// ==========================================
// RENDER TOKEN
// ==========================================

function renderTokenPosition(token) {

    const element = getTokenElement(token);

    if (!element) return;

    element.style.display = "";

    element.disabled =
        token.status === "finished";

    if (token.status === "home") {

        const slot =
            document.getElementById(
                `slot-${token.id}`
            );

        slot?.appendChild(element);

    } else if (token.status === "prison") {

        const prison =
            document.getElementById(
                `prison-${token.capturedBy}`
            );

        prison?.appendChild(element);

    } else if (token.status === "finished") {

        const area =
            document.getElementById(
                `finish-${token.color}`
            );

        area?.appendChild(element);

    } else if (token.status === "board") {

        const point = getTokenCoordinates(
            token.color,
            token.position
        );

        if (!point) return;

        const [row, col] = point;

        token.row = row;
        token.col = col;

        const cell =
            document.getElementById(
                `cell-${row}-${col}`
            );

        cell?.appendChild(element);

    }

    updateBlockades();
    updatePrisonAreas();

}

// ==========================================
// SOUND EFFECTS
// ==========================================

function playEngineSound(
    frequency = 450,
    endFrequency = 900
) {

    if (!soundEnabled) return;

    const AudioClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioClass) return;

    try {

        if (!engineAudio) {
            engineAudio = new AudioClass();
        }

        engineAudio.resume().then(() => {

            const oscillator =
                engineAudio.createOscillator();

            const gain =
                engineAudio.createGain();

            const time =
                engineAudio.currentTime;

            oscillator.connect(gain);

            gain.connect(
                engineAudio.destination
            );

            oscillator.type = "sine";

            oscillator.frequency.setValueAtTime(
                frequency, time
            );

            oscillator.frequency
                .exponentialRampToValueAtTime(
                    endFrequency, time + .12
                );

            gain.gain.setValueAtTime(
                .06, time
            );

            gain.gain.exponentialRampToValueAtTime(
                .001, time + .16
            );

            oscillator.start(time);
            oscillator.stop(time + .17);

        }).catch(() => {});

    } catch (error) {

        console.warn("Sound unavailable.");

    }

}

function playReleaseSound() {
    playEngineSound(450, 900);
}

function playCaptureSound() {
    playEngineSound(800, 150);
}

// ==========================================
// CAPTURING SYSTEM
// ==========================================

function isSafeCell(row, col) {
    return getHomeStopOwner(row, col) !== null;
}

async function captureOpponents(token) {

    if (token.status !== "board") return;

    if (token.position > LAST_POINT) return;

    const point = getTokenCoordinates(
        token.color,
        token.position
    );

    if (!point) return;

    const [row, col] = point;

    if (isSafeCell(row, col)) return;

    const enemies =
        getTokensAtCell(row, col).filter(
            other =>
                isOpponent(
                    token.color,
                    other.color
                )
        );

    if (enemies.length === 0) return;

    for (const enemy of enemies) {

        enemy.position = -1;
        enemy.row = null;
        enemy.col = null;

        if (mode === "turbo") {

            enemy.status = "prison";

            enemy.capturedBy = token.color;

        } else {

            enemy.status = "home";

            enemy.capturedBy = null;

        }

        gameState[token.color].captures++;

        renderTokenPosition(enemy);

        playCaptureSound();

        await wait(
            animationsEnabled ? 250 : 0
        );

    }

    // Capturing token cannot use another die
    // until a new dice roll.

    lockCapturingToken(token);

    updateCaptureCounter(token.color);
    updateLastPoints();

    giftMessage.textContent =
        `⚔ ${enemies.length} TOKEN(S) CAPTURED!`;

    gameMessage.textContent =
        mode === "turbo"

        ? "Capturing token locked until next roll."

        : "Opponent captured!";

    updateBlockades();
    updatePrisonAreas();

    await wait(700);

}

// ==========================================
// PRISON ESCAPE
// ==========================================

async function escapePrison(token) {

    if (token.status !== "prison") return;

    token.status = "home";
    token.position = -1;
    token.capturedBy = null;

    renderTokenPosition(token);

    playReleaseSound();

    giftMessage.textContent =
        "🔓 TOKEN ESCAPED PRISON!";

    gameMessage.textContent =
        "Another six is required to enter the board.";

    await wait(400);

}

// ==========================================
// RELEASE TOKENS
// ==========================================

async function releaseSingleToken(token) {

    token.status = "board";
    token.position = 0;
    token.capturedBy = null;

    renderTokenPosition(token);

    playReleaseSound();

    await wait(
        animationsEnabled ? 250 : 0
    );

    await captureOpponents(token);

}

async function releaseTokens(color, quantity) {

    const [row, col] = startingPoints[color];

    if (isCellBlocked(color, row, col)) {
        return [];
    }

    const tokens =
        getHomeTokens(color).slice(0, quantity);

    for (const token of tokens) {
        await releaseSingleToken(token);
    }

    return tokens;

}

// ==========================================
// TURBO ACTIVATION
// ==========================================

function updateTurboStatus() {

    if (mode !== "turbo") return;

    Object.keys(gameState).forEach(color => {

        const player = gameState[color];

        const panel =
            document.getElementById(
                `player-${color}`
            );

        const badge =
            document.getElementById(
                `turbo-${color}`
            );

        if (!badge || !panel) return;

        panel.classList.toggle(
            "turbo-active",
            player.turbo
        );

        if (player.turbo) {

            badge.hidden = false;

            badge.textContent =
                "⚡ TURBO ACTIVE";

        } else if (player.finished === 4) {

            badge.hidden = false;

            badge.textContent =
                "🎲 ROLL 6 FOR TURBO";

        } else if (
            gameState[teammates[color]].turbo
        ) {

            badge.hidden = false;

            badge.textContent =
                "⚡ TURBO ASSISTED";

        } else {

            badge.hidden = true;

        }

    });

}

async function activateTurbo() {

    const player = gameState[currentPlayer];

    if (player.turbo) return;

    player.turbo = true;

    updateTurboStatus();

    giftMessage.textContent =
        "⚡ TURBO ACTIVATED!";

    gameMessage.textContent =
        `${currentPlayer.toUpperCase()} can now control ${teammates[currentPlayer].toUpperCase()} tokens!`;

    playEngineSound(400, 1600);

    await wait(1000);

}

// ==========================================
// VICTORY SYSTEM
// ==========================================

function showVictory(team, winnerColor = null) {

    turnPhase = "finished";

    rollButton.disabled = true;

    bonusRolls = 0;

    automaticMovement = false;

    remainingDice = [];

    selectedDie = -1;

    clearTokenHighlights();

    updateDiceAppearance();

    let winnerName;
    let subtitle;

    if (mode === "classic") {

        winnerName =
            `${winnerColor.toUpperCase()} WINS!`;

        subtitle = "All four tokens finished.";

    } else {

        winnerName = team === "A"

            ? "RED & GREEN WIN!"

            : "BLUE & YELLOW WIN!";

        subtitle =
            "All eight team tokens finished!";

    }

    gameMessage.textContent = winnerName;

    const dialog =
        document.createElement("dialog");

    dialog.className = "victory-dialog";

    dialog.innerHTML = `

        <div class="victory-trophy">🏆</div>

        <h1>VICTORY!</h1>

        <h2>${winnerName}</h2>

        <p>${subtitle}</p>

        <p style="color:#ffc83d">
            👑 TURBO LUDO CHAMPIONS
        </p>

        <button id="victoryReplay"
                class="victory-button">
            PLAY AGAIN
        </button>

        <button id="victoryHome"
                class="victory-button">
            MAIN MENU
        </button>

    `;

    document.body.appendChild(dialog);

    dialog.addEventListener("cancel", event => {
        event.preventDefault();
    });

    dialog.querySelector("#victoryReplay")
        .addEventListener("click", () => {
            window.location.reload();
        });

    dialog.querySelector("#victoryHome")
        .addEventListener("click", goHome);

    dialog.showModal();

    playEngineSound(500, 1500);

}

function checkTeamVictory() {

    if (mode !== "turbo") return false;

    for (const team of ["A", "B"]) {

        if (getTeamScore(team) === 8) {

            showVictory(team);

            return true;

        }

    }

    return false;

}

// ==========================================
// LUCK ROLL STATUS
// ==========================================

function updateLuckStatus() {

    if (mode === "classic") {

        luckStatus.hidden = true;

        return;

    }

    if (luckRollActive) {

        luckStatus.textContent =
            "✨ LUCK ROLL ACTIVE";

    } else if (openingBonusPending) {

        luckStatus.textContent =
            "🎁 OPENING BONUS ROLL";

    } else {

        luckStatus.textContent =
            "⚔ NORMAL GAMEPLAY";

    }

}

// ==========================================
// AUTOMATIC TURN MANAGEMENT
// ==========================================

async function finishTurnAutomatically(
    bonus = false
) {

    if (turnPhase === "finished") return;

    turnPhase = "transition";

    rollButton.disabled = true;

    automaticMovement = false;

    clearTokenHighlights();

    selectedDie = -1;

    remainingDice.forEach(die => {
        die.used = true;
    });

    updateDiceAppearance();

    if (bonus) bonusRolls++;

    await wait(900);

    remainingDice = [];

    updateDiceAppearance();

    if (bonusRolls > 0) {

        bonusRolls--;

        allowExtraRoll(
            `${currentPlayer.toUpperCase()} earned an extra roll!`
        );

    } else {

        nextPlayer();

    }

}

// ==========================================
// LUCK ROLL
// ==========================================

async function processLuckRoll(first, second) {

    const hasSix =
        first === 6 || second === 6;

    const doubleSix =
        first === 6 && second === 6;

    if (!hasSix) {

        gameMessage.textContent =
            "No six! Passing to next player.";

        await finishTurnAutomatically();

        return;

    }

    luckRollActive = false;

    if (doubleSix) {

        openingBonusPending = true;

        giftMessage.textContent =
            "🎁 GIFT TOKEN + EXTRA ROLL!";

        await releaseTokens(currentPlayer, 3);

        updateLuckStatus();

        await finishTurnAutomatically(true);

        return;

    }

    const movement =
        first === 6 ? second : first;

    const quantity =
        movement === 4 ? 4 : 2;

    giftMessage.textContent =
        `👑 ${quantity} TOKENS RELEASED!`;

    const released =
        await releaseTokens(
            currentPlayer,
            quantity
        );

    updateLuckStatus();

    if (released.length > 0) {

        const token = released[0];

        if (canMoveToken(token, movement)) {

            gameMessage.textContent =
                `Lucky prize! Moving one token ${movement} steps.`;

            await wait(500);

            await moveToken(token, movement);

        }

    }

    await finishTurnAutomatically();

}

// ==========================================
// OPENING BONUS
// ==========================================

async function processOpeningBonus(
    first,
    second
) {

    openingBonusPending = false;

    const dice = [first, second];

    const sixIndex = dice.indexOf(6);

    let consumedIndex = -1;

    if (sixIndex !== -1) {

        const released =
            await releaseTokens(currentPlayer, 1);

        if (released.length > 0) {

            consumedIndex = sixIndex;

            giftMessage.textContent =
                "🎁 FOURTH TOKEN RELEASED!";

        }

    }

    updateLuckStatus();

    remainingDice = dice.map((value, index) => ({

        value: value,

        used: index === consumedIndex

    }));

    if (first === 6 && second === 6) {

        bonusRolls++;

    }

    selectedDie = -1;

    automaticMovement =
        shouldMoveAutomatically();

    turnPhase = "move";

    await checkRemainingMoves();

}

// ==========================================
// LEGAL MOVE VALIDATION
// ==========================================

function canMoveToken(token, diceValue) {

    if (!canControlToken(token)) {
        return false;
    }

    if (captureLocks.has(token.id)) {
        return false;
    }

    if (token.status === "finished") {
        return false;
    }

    if (token.status === "prison") {
        return diceValue === 6;
    }

    if (token.status === "home") {

        if (diceValue !== 6) return false;

        const [row, col] =
            startingPoints[token.color];

        return !isCellBlocked(
            token.color, row, col
        );

    }

    if (token.status !== "board") {
        return false;
    }

    const target =
        token.position + diceValue;

    if (target > FINISH_POSITION) {
        return false;
    }

    if (
        !isHomeUnlocked(token.color) &&
        target > LAST_POINT
    ) {

        return false;

    }

    if (isPathBlocked(token, diceValue)) {
        return false;
    }

    return true;

}

function getLegalTokens(diceValue) {

    return getControlledTokens().filter(
        token => canMoveToken(token, diceValue)
    );

}

// ==========================================
// HIGHLIGHT TOKENS
// ==========================================

function clearTokenHighlights() {

    document.querySelectorAll(".token")
        .forEach(element => {

            element.classList.remove(
                "legal-token",
                "unavailable-token"
            );

        });

}

function highlightLegalTokens() {

    clearTokenHighlights();

    const die = remainingDice[selectedDie];

    if (!die || die.used) return;

    const legalIds =
        getLegalTokens(die.value)
            .map(token => token.id);

    document.querySelectorAll(".token")
        .forEach(element => {

            if (element.closest(".finish-area")) {
                return;
            }

            element.classList.add(

                legalIds.includes(element.id)

                    ? "legal-token"

                    : "unavailable-token"

            );

        });

    if (gameState[currentPlayer].turbo) {

        gameMessage.textContent =
            `⚡ TURBO: Select a teammate token for ${die.value}.`;

    } else {

        gameMessage.textContent =
            `Select a highlighted token for ${die.value}.`;

    }

}

// ==========================================
// DICE SELECTION
// ==========================================

function updateDiceAppearance() {

    ["dice1", "dice2"].forEach((id, index) => {

        const element =
            document.getElementById(id);

        const die = remainingDice[index];

        element.classList.toggle(
            "selected-die",
            selectedDie === index &&
            Boolean(die) &&
            !die.used
        );

        element.classList.toggle(
            "used-die",
            Boolean(die && die.used)
        );

    });

}

function selectDie(index) {

    if (turnPhase !== "move") return;

    if (automaticMovement) return;

    const die = remainingDice[index];

    if (!die || die.used) return;

    if (getLegalTokens(die.value).length === 0) {

        gameMessage.textContent =
            "No legal move for this die.";

        return;

    }

    selectedDie = index;

    updateDiceAppearance();

    highlightLegalTokens();

}

document.getElementById("dice1")
    .addEventListener("click", () => selectDie(0));

document.getElementById("dice2")
    .addEventListener("click", () => selectDie(1));

// ==========================================
// SMART AUTOMATIC MOVEMENT
// ==========================================

function shouldMoveAutomatically() {

    if (mode !== "turbo") return false;

    return getControlledBoardTokens().length === 1 &&

           !remainingDice.some(
               die => !die.used && die.value === 6
           );

}

function wouldCapture(token, steps) {

    const target = token.position + steps;

    if (target > LAST_POINT) return false;

    const point = getTokenCoordinates(
        token.color, target
    );

    if (!point || isSafeCell(...point)) {
        return false;
    }

    return getTokensAtCell(...point).some(
        other => isOpponent(
            token.color,
            other.color
        )
    );

}

function chooseAutomaticDie(
    token,
    availableIndexes
) {

    for (const index of availableIndexes) {

        const steps = remainingDice[index].value;

        // A capturing token cannot use
        // the second die in the same roll.

        if (wouldCapture(token, steps)) {
            continue;
        }

        const simulatedToken = {
            ...token,
            position: token.position + steps
        };

        const canUseOther =
            availableIndexes.some(other =>

                other !== index &&

                canMoveToken(
                    simulatedToken,
                    remainingDice[other].value
                )

            );

        if (canUseOther) return index;

    }

    return availableIndexes[0];

}

// ==========================================
// NORMAL ROLL AND TURBO ACTIVATION
// ==========================================

async function processNormalRoll(
    first,
    second
) {

    remainingDice = mode === "classic"

        ? [
            { value: first, used: false }
        ]

        : [
            { value: first, used: false },
            { value: second, used: false }
        ];

    selectedDie = -1;

    const extraRoll =
        mode === "classic"

            ? first === 6

            : first === 6 && second === 6;

    if (extraRoll) {

        bonusRolls++;

        giftMessage.textContent =
            "🎲 EXTRA ROLL EARNED!";

    }

    // Player finished all four tokens
    // but has not activated Turbo yet.

    if (
        mode === "turbo" &&
        gameState[currentPlayer].finished === 4 &&
        !gameState[currentPlayer].turbo
    ) {

        const sixIndex =
            remainingDice.findIndex(
                die => die.value === 6
            );

        if (sixIndex !== -1) {

            // One six activates Turbo.
            // Remaining die can move teammate.

            remainingDice[sixIndex].used = true;

            await activateTurbo();

        } else {

            gameMessage.textContent =
                "Roll a six to activate Turbo!";

            await finishTurnAutomatically();

            return;

        }

    }

    automaticMovement =
        shouldMoveAutomatically();

    turnPhase = "move";

    await checkRemainingMoves();

}

// ==========================================
// CHECK REMAINING MOVES
// ==========================================

async function checkRemainingMoves() {

    if (turnPhase === "finished") return;

    const availableIndexes = [];

    remainingDice.forEach((die, index) => {

        if (
            !die.used &&
            getLegalTokens(die.value).length > 0
        ) {

            availableIndexes.push(index);

        }

    });

    if (availableIndexes.length === 0) {

        gameMessage.textContent =
            "No remaining legal moves.";

        await finishTurnAutomatically();

        return;

    }

    const boardTokens =
        getControlledBoardTokens();

    if (
        automaticMovement &&
        boardTokens.length === 1
    ) {

        const token = boardTokens[0];

        selectedDie = chooseAutomaticDie(
            token,
            availableIndexes
        );

        turnPhase = "automatic";

        updateDiceAppearance();

        gameMessage.textContent =
            `Automatically moving ${remainingDice[selectedDie].value} steps.`;

        await wait(500);

        await executeSelectedMove(token);

        return;

    }

    automaticMovement = false;

    turnPhase = "move";

    selectedDie = availableIndexes[0];

    updateDiceAppearance();

    highlightLegalTokens();

}

// ==========================================
// TOKEN MOVEMENT
// ==========================================

async function moveToken(token, steps) {

    const element = getTokenElement(token);

    element?.classList.add("moving-token");

    for (let step = 0; step < steps; step++) {

        token.position++;

        if (token.position === FINISH_POSITION) {

            token.status = "finished";

            renderTokenPosition(token);

            break;

        }

        renderTokenPosition(token);

        playReleaseSound();

        await wait(
            animationsEnabled ? 140 : 0
        );

    }

    element?.classList.remove("moving-token");

    if (token.status === "finished") {

        finishToken(token);

        await wait(500);

    } else {

        await captureOpponents(token);

        if (
            token.position === LAST_POINT &&
            !isHomeUnlocked(token.color)
        ) {

            giftMessage.textContent =
                "🔒 LAST POINT REACHED!";

            gameMessage.textContent =
                "Capture an opponent to unlock home.";

            await wait(700);

        }

    }

    updateBlockades();

}

// ==========================================
// FINISH TOKEN
// ==========================================

function finishToken(token) {

    gameState[token.color].finished++;

    const score =
        gameState[token.color].finished;

    document.getElementById(
        `${token.color}-score`
    ).textContent = `${score} / 4`;

    bonusRolls++;

    giftMessage.textContent =
        "🏆 TOKEN FINISHED! EXTRA ROLL!";

    playEngineSound(500, 1200);

    if (score === 4) {

        giftMessage.textContent =
            "👑 ALL FOUR TOKENS FINISHED!";

    }

    if (mode === "classic" && score === 4) {

        showVictory(null, token.color);

        return;

    }

    updateTeamProgress();

    updateTurboStatus();

    checkTeamVictory();

}

// ==========================================
// EXECUTE MOVE
// ==========================================

async function executeSelectedMove(token) {

    const die = remainingDice[selectedDie];

    if (!die || die.used) return;

    if (!canMoveToken(token, die.value)) return;

    turnPhase = "moving";

    clearTokenHighlights();

    const steps = die.value;

    die.used = true;

    selectedDie = -1;

    updateDiceAppearance();

    if (token.status === "prison") {

        await escapePrison(token);

    } else if (token.status === "home") {

        await releaseSingleToken(token);

    } else {

        await moveToken(token, steps);

    }

    if (turnPhase === "finished") return;

    await checkRemainingMoves();

}

// ==========================================
// MANUAL TOKEN SELECTION
// ==========================================

selectToken = async function (token) {

    if (!matchStarted) return;

    if (turnPhase !== "move") return;

    if (automaticMovement) return;

    const die = remainingDice[selectedDie];

    if (!die || die.used) return;

    if (!canControlToken(token)) {

        gameMessage.textContent =
            "You cannot control this token.";

        return;

    }

    if (captureLocks.has(token.id)) {

        gameMessage.textContent =
            "🔒 This token captured an opponent. Wait for the next roll.";

        return;

    }

    if (!canMoveToken(token, die.value)) {

        if (
            token.status === "board" &&
            !isHomeUnlocked(token.color) &&
            token.position + die.value > LAST_POINT
        ) {

            gameMessage.textContent =
                "🔒 Home locked! Capture an opponent first.";

        } else if (
            token.status === "board" &&
            isPathBlocked(token, die.value)
        ) {

            gameMessage.textContent =
                "🔒 Enemy blockade! Choose another move.";

        } else {

            gameMessage.textContent =
                "This token cannot use this die.";

        }

        return;

    }

    await executeSelectedMove(token);

};

// ==========================================
// DOUBLE ONE BONUS
// ==========================================

async function convertDoubleOne() {

    if (mode !== "turbo") return;

    if (
        diceValues[0] !== 1 ||
        diceValues[1] !== 1
    ) {

        return;

    }

    giftMessage.textContent =
        "✨ DOUBLE ONE BONUS!";

    gameMessage.textContent =
        "Converting 1 + 1 into 6 + 6!";

    const dice1 =
        document.getElementById("dice1");

    const dice2 =
        document.getElementById("dice2");

    dice1.classList.add("double-one-bonus");

    dice2.classList.add("double-one-bonus");

    playEngineSound(400, 1400);

    await wait(
        animationsEnabled ? 1000 : 0
    );

    diceValues[0] = 6;
    diceValues[1] = 6;

    renderDice("dice1", 6);
    renderDice("dice2", 6);

    dice1.classList.remove("double-one-bonus");

    dice2.classList.remove("double-one-bonus");

    giftMessage.textContent =
        "🎁 TWO SIXES + EXTRA ROLL!";

    await wait(500);

}

// ==========================================
// HANDLE DICE RESULTS
// ==========================================

showDiceResult = async function () {

    turnPhase = "processing";

    rollButton.disabled = true;

    automaticMovement = false;

    clearTokenHighlights();

    remainingDice = [];

    selectedDie = -1;

    updateDiceAppearance();

    gameMessage.textContent =
        mode === "classic"

            ? `You rolled ${diceValues[0]}`

            : `You rolled ${diceValues[0]} + ${diceValues[1]}`;

    await wait(400);

    await convertDoubleOne();

    const first = diceValues[0];
    const second = diceValues[1];

    if (mode === "classic") {

        await processNormalRoll(first, 0);

        return;

    }

    if (openingBonusPending) {

        await processOpeningBonus(first, second);

        return;

    }

    if (luckRollActive) {

        await processLuckRoll(first, second);

        return;

    }

    await processNormalRoll(first, second);

};

// ==========================================
// PREPARE NEW ROLL
// ==========================================

const previousRollHandler = rollDice;

rollDice = function () {

    if (turnPhase !== "roll") return;

    if (!matchStarted || isRolling) return;

    // All capturing tokens become available
    // when the next dice roll begins.

    clearCaptureLocks();

    remainingDice = [];

    selectedDie = -1;

    automaticMovement = false;

    updateDiceAppearance();

    clearTokenHighlights();

    previousRollHandler();

};

// ==========================================
// INITIALIZE ENGINE
// ==========================================

getAllTokens().forEach(token => {

    token.capturedBy = null;

    getTokenElement(token);

});

Object.values(gameState).forEach(player => {

    player.turbo = false;

});

if (mode === "turbo") {

    createPrisonAreas();

    createTeamProgress();

}

createFinishAreas();

updateLuckStatus();

updateBlockades();

updateLastPoints();

updateTurboStatus();

updateTeamProgress();

initializeMatch();
