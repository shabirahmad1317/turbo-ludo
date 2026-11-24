
// =====================================
// TURBO LUDO
// Lucky Spin and Automatic Turns
// =====================================

const spinColors = [
    "red",
    "blue",
    "green",
    "yellow"
];

const turnOrder = [
    "red",
    "blue",
    "green",
    "yellow"
];

let spinInProgress = false;
let spinWinner = null;
let matchStarted = false;
let turnPhase = "waiting";
let turnNumber = 1;

const spinDialog =
    document.getElementById("spinDialog");

const spinWheel =
    document.getElementById("spinWheel");

const spinButton =
    document.getElementById("spinButton");

const startMatchButton =
    document.getElementById("startMatchButton");

const rollButton =
    document.getElementById("rollButton");

const spinResult =
    document.getElementById("spinResult");

const giftMessage =
    document.getElementById("giftMessage");

function initializeMatch() {

    rollButton.disabled = true;

    document.querySelectorAll(".player")
        .forEach(player => {

            player.classList.remove("active");

        });

    if (mode === "turbo") {

        document.getElementById("turnMessage")
            .textContent = "Waiting for Lucky Spin";

        spinDialog.showModal();

    } else {

        currentPlayer = "red";

        matchStarted = true;

        prepareTurn();

    }

}

spinDialog.addEventListener(
    "cancel",
    event => event.preventDefault()
);

function startLuckySpin() {

    if (spinInProgress || spinWinner) return;

    spinInProgress = true;

    spinButton.disabled = true;

    spinButton.textContent = "SPINNING...";

    const winnerIndex =
        Math.floor(Math.random() * 4);

    spinWinner = spinColors[winnerIndex];

    const sectionAngle =
        winnerIndex * 90 + 45;

    const finalRotation =
        360 * 6 + 360 - sectionAngle;

    spinWheel.style.transform =
        `rotate(${finalRotation}deg)`;

    playSpinSound();

    setTimeout(() => {

        spinInProgress = false;

        spinResult.textContent =
            `${spinWinner.toUpperCase()} PLAYER STARTS!`;

        spinResult.style.color =
            colors[spinWinner];

        if (animationsEnabled) {

            spinResult.classList.add(
                "winner-effect"
            );

        }

        spinButton.hidden = true;

        startMatchButton.hidden = false;

        playWinnerSound();

    }, animationsEnabled ? 4600 : 0);

}

function beginMatch() {

    if (!spinWinner || spinInProgress) return;

    currentPlayer = spinWinner;

    matchStarted = true;

    turnNumber = 1;

    spinDialog.close();

    prepareTurn();

}

function prepareTurn() {

    turnPhase = "roll";

    updateCurrentPlayer();

    rollButton.disabled = false;

    rollButton.textContent = "🎲 ROLL DICE";

    giftMessage.textContent = "";

    document.getElementById("gameSubtitle")
        .textContent = `TURN ${turnNumber}`;

    document.getElementById("gameMessage")
        .textContent =
            `${currentPlayer.toUpperCase()}, roll the dice.`;

}

function nextPlayer() {

    const currentIndex =
        turnOrder.indexOf(currentPlayer);

    const nextIndex =
        (currentIndex + 1) % turnOrder.length;

    currentPlayer = turnOrder[nextIndex];

    turnNumber++;

    prepareTurn();

}

function allowExtraRoll(message) {

    turnPhase = "roll";

    rollButton.disabled = false;

    rollButton.textContent = "🎲 EXTRA ROLL";

    document.getElementById("gameMessage")
        .textContent = message;

}

const originalRollDice = rollDice;

rollDice = function () {

    if (!matchStarted) return;

    if (spinInProgress) return;

    if (isRolling) return;

    if (turnPhase !== "roll") return;

    turnPhase = "rolling";

    giftMessage.textContent = "";

    originalRollDice();

};

function playSpinSound() {

    if (!soundEnabled) return;

    if (!animationsEnabled) return;

    const AudioClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioClass) return;

    if (!audioContext) {
        audioContext = new AudioClass();
    }

    audioContext.resume().then(() => {

        let delay = 0;

        for (let i = 0; i < 30; i++) {

            const oscillator =
                audioContext.createOscillator();

            const gain =
                audioContext.createGain();

            const time =
                audioContext.currentTime + delay;

            oscillator.connect(gain);

            gain.connect(audioContext.destination);

            oscillator.type = "triangle";

            oscillator.frequency.value = 700;

            gain.gain.setValueAtTime(
                0.05, time
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001, time + 0.035
            );

            oscillator.start(time);

            oscillator.stop(time + 0.04);

            delay += 0.045 + i * 0.006;

        }

    }).catch(() => {});

}

function playWinnerSound() {

    if (!soundEnabled) return;

    const AudioClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioClass) return;

    if (!audioContext) {
        audioContext = new AudioClass();
    }

    audioContext.resume().then(() => {

        const notes = [
            523.25,
            659.25,
            783.99,
            1046.50
        ];

        notes.forEach((note, index) => {

            const oscillator =
                audioContext.createOscillator();

            const gain =
                audioContext.createGain();

            const time =
                audioContext.currentTime +
                index * 0.13;

            oscillator.connect(gain);

            gain.connect(audioContext.destination);

            oscillator.type = "sine";

            oscillator.frequency.value = note;

            gain.gain.setValueAtTime(
                0.08, time
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001, time + 0.25
            );

            oscillator.start(time);

            oscillator.stop(time + 0.26);

        });

    }).catch(() => {});

}
