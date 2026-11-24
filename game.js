
const mode =
    localStorage.getItem("gameMode") || "turbo";

const colors = {
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

const players = ["red", "blue", "green", "yellow"];

let currentPlayer = "red";
let isRolling = false;
let diceValues = [1, 1];

const animationsEnabled =
    localStorage.getItem("animations") !== "false";

const soundEnabled =
    localStorage.getItem("sound") !== "false";

if (!animationsEnabled) {
    document.body.classList.add("no-animations");
}

// Special board locations
// Coordinates start from zero.

const boardRules = {

    red: {
        homeStops: [
            [13, 6],
            [12, 8]
        ],
        lastPoint: [14, 7]
    },

    blue: {
        homeStops: [
            [6, 1],
            [8, 2]
        ],
        lastPoint: [7, 0]
    },

    green: {
        homeStops: [
            [1, 8],
            [2, 6]
        ],
        lastPoint: [0, 7]
    },

    yellow: {
        homeStops: [
            [8, 13],
            [6, 12]
        ],
        lastPoint: [7, 14]
    }

};

// Player data

const gameState = {};

players.forEach(color => {

    gameState[color] = {

        captures: 0,
        finished: 0,
        turbo: false,

        tokens: Array.from(
            { length: 4 },
            (_, index) => ({

                id: `${color}-${index + 1}`,
                color: color,
                status: "home",
                position: -1

            })
        )

    };

});

function initializeGame() {

    if (mode === "classic") {

        document.getElementById("gameTitle")
            .textContent = "CLASSIC LUDO";

        document.getElementById("dice2")
            .style.display = "none";

    } else {

        document.getElementById("gameTitle")
            .textContent = "TURBO TEAM LUDO";

    }

    createBoard();

    renderDice("dice1", 1);
    renderDice("dice2", 1);

    updateCurrentPlayer();

    document.getElementById("gameMessage")
        .textContent = "Roll the dice to test the game.";

}

function createBoard() {

    const board =
        document.getElementById("ludoBoard");

    board.innerHTML = "";

    for (let row = 0; row < 15; row++) {

        for (let col = 0; col < 15; col++) {

            const isCross =
                (row >= 6 && row <= 8) ||
                (col >= 6 && col <= 8);

            const isCenter =
                row >= 6 && row <= 8 &&
                col >= 6 && col <= 8;

            if (!isCross || isCenter) {
                continue;
            }

            const cell =
                document.createElement("div");

            cell.className = "cell";

            cell.id = `cell-${row}-${col}`;

            cell.style.gridRow = row + 1;
            cell.style.gridColumn = col + 1;

            cell.dataset.row = row;
            cell.dataset.col = col;

            colorCell(cell, row, col);

            markSpecialCell(cell, row, col);

            board.appendChild(cell);

        }

    }

    createHome("blue", 0, 0);
    createHome("green", 0, 9);
    createHome("red", 9, 0);
    createHome("yellow", 9, 9);

    createCenter();

}

function colorCell(cell, row, col) {

    // Blue finishing lane

    if (row === 7 && col >= 1 && col <= 5) {
        cell.classList.add("blue");
    }

    // Green finishing lane

    if (col === 7 && row >= 1 && row <= 5) {
        cell.classList.add("green");
    }

    // Yellow finishing lane

    if (row === 7 && col >= 9 && col <= 13) {
        cell.classList.add("yellow");
    }

    // Red finishing lane

    if (col === 7 && row >= 9 && row <= 13) {
        cell.classList.add("red");
    }

    // Starting squares

    if (row === 6 && col === 1) {
        cell.classList.add("blue");
    }

    if (row === 1 && col === 8) {
        cell.classList.add("green");
    }

    if (row === 8 && col === 13) {
        cell.classList.add("yellow");
    }

    if (row === 13 && col === 6) {
        cell.classList.add("red");
    }

}

function markSpecialCell(cell, row, col) {

    const arrows = {
        red: "↑",
        blue: "→",
        green: "↓",
        yellow: "←"
    };

    players.forEach(color => {

        const rules = boardRules[color];

        rules.homeStops.forEach((point, index) => {

            if (point[0] === row &&
                point[1] === col) {

                cell.textContent = "★";

                cell.classList.add("home-stop");

                cell.dataset.stopOwner = color;

                cell.title = `${color} Home Stop ${index + 1}`;

                if (index === 0) {
                    cell.classList.add("colored");
                }

            }

        });

        if (
            rules.lastPoint[0] === row &&
            rules.lastPoint[1] === col
        ) {

            cell.textContent = arrows[color];

            cell.classList.add("last-point");

            cell.dataset.lastPointOwner = color;

            cell.title = `${color} Last Point`;

        }

    });

}

function createHome(color, row, col) {

    const board =
        document.getElementById("ludoBoard");

    const home =
        document.createElement("div");

    home.className = `home ${color}`;

    home.style.gridRow =
        `${row + 1} / span 6`;

    home.style.gridColumn =
        `${col + 1} / span 6`;

    const inner =
        document.createElement("div");

    inner.className = "home-inner";

    gameState[color].tokens.forEach(token => {

        const slot =
            document.createElement("div");

        slot.className = "token-slot";

        slot.id = `slot-${token.id}`;

        slot.appendChild(createToken(token));

        inner.appendChild(slot);

    });

    home.appendChild(inner);

    board.appendChild(home);

}

function createToken(token) {

    const element =
        document.createElement("button");

    element.className = "token";

    element.id = token.id;

    element.title = token.id;

    element.setAttribute(
        "aria-label",
        token.id
    );

    const color = colors[token.color];
    const dark = darkColors[token.color];

    element.innerHTML = `
        <svg viewBox="0 0 40 50">

            <defs>

                <linearGradient
                    id="gradient-${token.id}"
                    x1="0%" y1="0%"
                    x2="100%" y2="100%">

                    <stop offset="0%"
                          stop-color="#ffffff"/>

                    <stop offset="30%"
                          stop-color="${color}"/>

                    <stop offset="100%"
                          stop-color="${dark}"/>

                </linearGradient>

            </defs>

            <ellipse
                cx="20" cy="44"
                rx="16" ry="5"
                fill="#000000"
                opacity="0.25"/>

            <ellipse
                cx="20" cy="40"
                rx="16" ry="7"
                fill="${dark}"/>

            <path
                d="M7 38
                   Q15 29 14 22
                   A12 12 0 1 1 26 22
                   Q25 29 33 38
                   Q20 48 7 38 Z"

                fill="url(#gradient-${token.id})"

                stroke="${dark}"
                stroke-width="1.5"/>

            <ellipse
                cx="15" cy="10"
                rx="4" ry="3"
                fill="white"
                opacity="0.7"/>

        </svg>
    `;

    element.onclick = () => selectToken(token);

    return element;

}

function createCenter() {

    const center =
        document.createElement("div");

    center.className = "center-home";

    center.style.gridRow = "7 / span 3";

    center.style.gridColumn = "7 / span 3";

    center.innerHTML =
        '<div class="center-crown">👑</div>';

    document.getElementById("ludoBoard")
        .appendChild(center);

}

// Dice faces

const dicePatterns = {

    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]

};

function renderDice(id, value) {

    const dice =
        document.getElementById(id);

    dice.innerHTML = "";

    for (let i = 0; i < 9; i++) {

        const dot =
            document.createElement("div");

        dot.className = "dice-dot";

        if (dicePatterns[value].includes(i)) {
            dot.classList.add("visible");
        }

        dice.appendChild(dot);

    }

}

function randomDice() {

    return Math.floor(Math.random() * 6) + 1;

}

function rollDice() {

    if (isRolling) return;

    isRolling = true;

    const button =
        document.getElementById("rollButton");

    const dice1 =
        document.getElementById("dice1");

    const dice2 =
        document.getElementById("dice2");

    button.disabled = true;

    button.textContent = "ROLLING...";

    dice1.classList.add("rolling");

    if (mode !== "classic") {
        dice2.classList.add("rolling");
    }

    playDiceSound();

    const interval = setInterval(() => {

        renderDice("dice1", randomDice());

        renderDice("dice2", randomDice());

    }, 90);

    setTimeout(() => {

        clearInterval(interval);

        const first = randomDice();

        const second =
            mode === "classic" ? 0 : randomDice();

        diceValues = [first, second];

        renderDice("dice1", first);

        if (mode !== "classic") {
            renderDice("dice2", second);
        }

        dice1.classList.remove("rolling");
        dice2.classList.remove("rolling");

        button.disabled = false;

        button.textContent = "🎲 ROLL DICE";

        isRolling = false;

        showDiceResult();

    }, animationsEnabled ? 900 : 0);

}

function showDiceResult() {

    const message =
        document.getElementById("gameMessage");

    if (mode === "classic") {

        message.textContent =
            `You rolled ${diceValues[0]}`;

    } else {

        message.textContent =
            `You rolled ${diceValues[0]} + ${diceValues[1]}`;

        if (
            diceValues[0] === 6 &&
            diceValues[1] === 6
        ) {

            message.textContent +=
                " — DOUBLE SIX!";

        }

    }

}

function selectToken(token) {

    document.getElementById("gameMessage")
        .textContent =
            `${token.color.toUpperCase()} Token selected: ${token.id}`;

}

function updateCurrentPlayer() {

    players.forEach(color => {

        document.getElementById(`player-${color}`)
            .classList.toggle(
                "active",
                color === currentPlayer
            );

    });

    document.getElementById("turnMessage")
        .textContent =
            `${currentPlayer.toUpperCase()} PLAYER`;

}

let audioContext;

function playDiceSound() {

    if (!soundEnabled) return;

    const AudioClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioClass) return;

    if (!audioContext) {
        audioContext = new AudioClass();
    }

    audioContext.resume().then(() => {

        for (let i = 0; i < 6; i++) {

            const oscillator =
                audioContext.createOscillator();

            const gain =
                audioContext.createGain();

            const time =
                audioContext.currentTime + i * 0.08;

            oscillator.connect(gain);

            gain.connect(audioContext.destination);

            oscillator.type = "triangle";

            oscillator.frequency.value =
                150 + Math.random() * 350;

            gain.gain.setValueAtTime(0.08, time);

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                time + 0.06
            );

            oscillator.start(time);

            oscillator.stop(time + 0.07);

        }

    }).catch(() => {});

}

function goHome() {

    window.location.href = "index.html";

}

function restartGame() {

    if (confirm("Restart the game?")) {

        window.location.reload();

    }

}

initializeGame();
