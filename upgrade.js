// TURBO LUDO V2.5
// NOORTECH GAME EFFECTS

(() => {

    let audio = null;

    const board =
        document.getElementById("ludoBoard");

    if (!board) return;

    // AUDIO SYSTEM

    function unlockAudio() {

        if (!soundEnabled) return;

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

    // WOODEN CLICK SOUND

    function woodClick(
        delay = 0,
        volume = .16,
        pitch = 700
    ) {

        if (!soundEnabled || !audio) return;

        try {

            const time =
                audio.currentTime + delay;

            const duration = .055;

            const buffer = audio.createBuffer(
                1,
                Math.ceil(
                    audio.sampleRate * duration
                ),
                audio.sampleRate
            );

            const data =
                buffer.getChannelData(0);

            for (let i = 0; i < data.length; i++) {

                data[i] =
                    (Math.random() * 2 - 1) *
                    Math.exp(-i / (data.length * .15));

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

            gain.gain.value = volume;

            source.connect(filter);

            filter.connect(gain);

            gain.connect(audio.destination);

            source.start(time);

        } catch (error) {}

    }

    // MUSICAL EFFECTS

    function tone(
        frequency,
        delay = 0,
        duration = .12,
        volume = .08
    ) {

        if (!soundEnabled || !audio) return;

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
                volume, time
            );

            gain.gain.exponentialRampToValueAtTime(
                .001,
                time + duration
            );

            oscillator.connect(gain);

            gain.connect(audio.destination);

            oscillator.start(time);

            oscillator.stop(time + duration);

        } catch (error) {}

    }

    // REALISTIC DICE SOUND

    playDiceSound = function () {

        unlockAudio();

        for (let i = 0; i < 12; i++) {

            woodClick(
                i * .065,
                .22 - i * .008,
                500 + Math.random() * 1100
            );

        }

        woodClick(.86, .25, 650);

    };

    // ENGINE SOUND UPGRADE

    playEngineSound = function (
        frequency = 450,
        endFrequency = 900
    ) {

        if (!soundEnabled) return;

        if (endFrequency < frequency) {

            woodClick(0, .28, 350);

            tone(330, .03, .15);

            tone(180, .12, .2);

        } else if (endFrequency >= 1200) {

            tone(523, 0);

            tone(659, .09);

            tone(784, .18);

            tone(1047, .27, .2);

        } else {

            woodClick(0, .13, 900);

        }

    };

    // SMOOTH TOKEN MOVEMENT

    const originalRenderToken =
        renderTokenPosition;

    renderTokenPosition = function (token) {

        const element =
            getTokenElement(token);

        const previousParent =
            element?.parentElement;

        const previousRect =
            element?.getBoundingClientRect();

        originalRenderToken(token);

        if (!element || !previousRect) return;

        if (
            previousParent ===
            element.parentElement
        ) return;

        if (
            token.status !== "board" &&
            token.status !== "finished"
        ) return;

        if (
            typeof turnPhase !== "undefined" &&
            turnPhase === "roll"
        ) return;

        // Play a click on every square

        woodClick(
            0,
            .18,
            750 + Math.random() * 350
        );

        if (!animationsEnabled) return;

        if (!element.animate) return;

        const svg =
            element.querySelector("svg");

        if (!svg) return;

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

        svg.getAnimations().forEach(
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
                duration: leavingHome ? 220 : 95,

                easing: "ease-out"
            }

        );

    };

    // EXTRA ROLL SOUND

    const previousShowDiceResult =
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

            tone(659, 0);

            tone(784, .1);

            tone(1047, .2, .22);

        }

        return previousShowDiceResult.apply(
            this, args
        );

    };

    // ACTIVE DICE ARROW

    function updateDicePointer() {

        const diceArea =
            document.querySelector(".dice-area");

        if (!diceArea) return;

        const ready =
            typeof turnPhase !== "undefined" &&
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

})();