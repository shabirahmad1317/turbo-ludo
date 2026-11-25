// ==========================================
// TURBO LUDO V2.7.1
// ADVANCED GAME PREFERENCES
// DEVELOPED BY NOORTECH
// ==========================================

(() => {

    "use strict";

    const prefs = window.TurboPreferences;

    if (!prefs) {

        console.error("Preferences module missing.");

        return;

    }

    if (!document.getElementById("ludoBoard")) {
        return;
    }

    const config = prefs.load();

    let audio = null;

    // ======================================
    // AUDIO SYSTEM
    // ======================================

    function unlockAudio() {

        if (!config.sound || !config.volume) return;

        try {

            const AudioClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioClass) return;

            if (!audio) {

                audio = new AudioClass();

            }

            audio.resume().catch(() => {});

        } catch (error) {}

    }

    document.addEventListener(
        "pointerdown",
        unlockAudio,
        { passive: true }
    );

    function canPlay(category) {

        return config.sound &&
            config.volume > 0 &&
            config[category] !== false;

    }

    function woodClick(
        category,
        delay = 0,
        volume = .16,
        pitch = 700
    ) {

        if (!canPlay(category)) return;

        unlockAudio();

        if (!audio) return;

        try {

            const duration = .055;

            const buffer = audio.createBuffer(

                1,

                Math.ceil(
                    audio.sampleRate * duration
                ),

                audio.sampleRate

            );

            const data = buffer.getChannelData(0);

            for (let i = 0; i < data.length; i++) {

                data[i] =
                    (Math.random() * 2 - 1) *
                    Math.exp(
                        -i / (data.length * .15)
                    );

            }

            const source =
                audio.createBufferSource();

            const filter =
                audio.createBiquadFilter();

            const gain =
                audio.createGain();

            source.buffer = buffer;

            filter.type = "bandpass";

            filter.frequency.value = pitch;

            filter.Q.value = .9;

            gain.gain.value =
                volume * config.volume / 100;

            source.connect(filter);

            filter.connect(gain);

            gain.connect(audio.destination);

            source.start(
                audio.currentTime + delay
            );

        } catch (error) {}

    }

    function tone(
        category,
        frequency,
        delay = 0,
        duration = .12,
        volume = .08
    ) {

        if (!canPlay(category)) return;

        unlockAudio();

        if (!audio) return;

        try {

            const time =
                audio.currentTime + delay;

            const oscillator =
                audio.createOscillator();

            const gain =
                audio.createGain();

            oscillator.type = "triangle";

            oscillator.frequency.value =
                frequency;

            gain.gain.setValueAtTime(

                Math.max(
                    .00001,
                    volume * config.volume / 100
                ),

                time

            );

            gain.gain.exponentialRampToValueAtTime(

                .00001,

                time + duration

            );

            oscillator.connect(gain);

            gain.connect(audio.destination);

            oscillator.start(time);

            oscillator.stop(time + duration);

        } catch (error) {}

    }

    // ======================================
    // DICE SOUND
    // ======================================

    playDiceSound = function () {

        if (!canPlay("dice")) return;

        for (let i = 0; i < 12; i++) {

            woodClick(

                "dice",

                i * .065,

                .22 - i * .008,

                500 + Math.random() * 1100

            );

        }

        woodClick("dice", .86, .25, 650);

    };

    // ======================================
    // GAME SOUND CATEGORIES
    // ======================================

    playEngineSound = function (
        frequency = 450,
        endFrequency = 900
    ) {

        if (endFrequency < frequency) {

            woodClick("capture", 0, .28, 350);

            tone("capture", 330, .03, .15);

            tone("capture", 180, .12, .2);

            return;

        }

        if (
            frequency === 500 &&
            endFrequency === 1500
        ) {

            const notes = [
                523, 659, 784, 1047
            ];

            notes.forEach((note, index) => {

                tone(
                    "victory",
                    note,
                    index * .15,
                    .25
                );

            });

            return;

        }

        if (endFrequency >= 1200) {

            const category =
                endFrequency === 1400
                    ? "dice"
                    : "movement";

            tone(category, 523, 0);

            tone(category, 659, .09);

            tone(category, 784, .18);

            tone(category, 1047, .27, .2);

            return;

        }

        woodClick("movement", 0, .13, 900);

    };

    // ======================================
    // LUCKY SPIN SOUNDS
    // ======================================

    if (typeof playSpinSound === "function") {

        playSpinSound = function () {

            for (let i = 0; i < 20; i++) {

                woodClick(
                    "dice",
                    i * .15,
                    .1,
                    700 + i * 15
                );

            }

        };

    }

    if (typeof playWinnerSound === "function") {

        playWinnerSound = function () {

            tone("dice", 523, 0);

            tone("dice", 659, .12);

            tone("dice", 784, .24);

            tone("dice", 1047, .36, .25);

        };

    }

    // ======================================
    // MOVEMENT SPEED
    // ======================================

    function duration(ms) {

        if (!config.animations) return 0;

        if (config.speed === "instant") return 0;

        if (config.speed === "fast") {

            return Math.round(ms * .45);

        }

        return ms;

    }

    const originalWait = wait;

    let movementDepth = 0;

    wait = function (ms) {

        return originalWait(

            movementDepth > 0

                ? duration(ms)

                : ms

        );

    };

    const originalMove = moveToken;

    moveToken = async function (...args) {

        movementDepth++;

        try {

            return await originalMove.apply(
                this, args
            );

        } finally {

            movementDepth--;

        }

    };

    const originalRelease =
        releaseSingleToken;

    releaseSingleToken = async function (...args) {

        movementDepth++;

        try {

            return await originalRelease.apply(
                this, args
            );

        } finally {

            movementDepth--;

        }

    };

    // ======================================
    // SMOOTH TOKEN MOVEMENT
    // ======================================

    const originalRender =
        renderTokenPosition;

    renderTokenPosition = function (token) {

        const element =
            getTokenElement(token);

        const previousParent =
            element?.parentElement;

        const previousRect =
            element?.getBoundingClientRect();

        originalRender(token);

        if (!element || !previousRect) return;

        if (
            previousParent ===
            element.parentElement
        ) return;

        if (
            token.status !== "board" &&
            token.status !== "finished"
        ) return;

        if (turnPhase === "roll") return;

        if (
            !config.animations ||
            config.speed === "instant"
        ) return;

        const svg =
            element.querySelector("svg");

        if (!svg || !svg.animate) return;

        const newRect =
            element.getBoundingClientRect();

        const x =
            previousRect.left - newRect.left;

        const y =
            previousRect.top - newRect.top;

        if (
            Math.abs(x) < 1 &&
            Math.abs(y) < 1
        ) return;

        svg.getAnimations?.().forEach(
            animation => animation.cancel()
        );

        const leavingHome =
            previousParent?.classList.contains(
                "token-slot"
            );

        svg.animate(

            [

                {
                    transform:
                        `translate(${x}px, ${y}px)`
                },

                {
                    transform:
                        `translate(${x * .45}px, ${y * .45 - 7}px) scale(1.08)`
                },

                {
                    transform:
                        "translate(0, 0) scale(1)"
                }

            ],

            {

                duration: duration(
                    leavingHome ? 220 : 95
                ),

                easing: "ease-out"

            }

        );

    };

    // ======================================
    // CAPTURE AND PRISON ANIMATION SPEED
    // ======================================

    const nativeAnimate =
        Element.prototype.animate;

    if (nativeAnimate) {

        Element.prototype.animate = function (
            frames,
            options
        ) {

            // Only modify flying-token animations.

            if (
                this.classList.contains(
                    "flying-token"
                )
            ) {

                if (typeof options === "number") {

                    options = duration(options);

                } else if (options) {

                    options = {

                        ...options,

                        duration: duration(
                            Number(options.duration) || 0
                        )

                    };

                }

            }

            return nativeAnimate.call(
                this,
                frames,
                options
            );

        };

    }

    const originalCapture =
        captureOpponents;

    captureOpponents = async function (...args) {

        movementDepth++;

        try {

            return await originalCapture.apply(
                this, args
            );

        } finally {

            movementDepth--;

        }

    };

    const originalEscape =
        escapePrison;

    escapePrison = async function (...args) {

        movementDepth++;

        try {

            return await originalEscape.apply(
                this, args
            );

        } finally {

            movementDepth--;

        }

    };

    // ======================================
    // EXTRA ROLL SOUND
    // ======================================

    const previousDiceResult =
        showDiceResult;

    showDiceResult = function (...args) {

        if (

            mode === "turbo" &&

            (

                (
                    diceValues[0] === 6 &&
                    diceValues[1] === 6
                ) ||

                (
                    diceValues[0] === 1 &&
                    diceValues[1] === 1
                )

            )

        ) {

            tone("dice", 659, 0);

            tone("dice", 784, .1);

            tone("dice", 1047, .2, .22);

        }

        return previousDiceResult.apply(
            this, args
        );

    };

    // ======================================
    // VICTORY CELEBRATION
    // ======================================

    if (
        !config.celebration ||
        !config.animations
    ) {

        const style =
            document.createElement("style");

        style.textContent = `

            .victory-confetti-layer {
                display: none !important;
            }

            .victory-trophy {
                animation: none !important;
            }

        `;

        document.head.appendChild(style);

    }

    // ======================================
    // ACTIVE DICE POINTER
    // ======================================

    function updateDicePointer() {

        const diceArea =
            document.querySelector(".dice-area");

        if (!diceArea) return;

        const ready =

            turnPhase === "roll" &&

            !isRolling &&

            !document.getElementById(
                "rollButton"
            )?.disabled;

        diceArea.classList.toggle(
            "ready-to-roll",
            ready
        );

    }

    setInterval(updateDicePointer, 150);

    updateDicePointer();

    console.info(
        "Turbo Ludo V2.7.1 preferences loaded.",
        config
    );

})();