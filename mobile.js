// ==========================================
// TURBO LUDO V2.3
// SMART TOKEN AND DICE SELECTION
// ==========================================

(() => {

    const root = document.documentElement;

    const container =
        document.querySelector(".game-container");

    const board =
        document.querySelector(".board-frame");

    const diceArea =
        document.querySelector(".dice-area");

    if (!container || !board || !diceArea) return;

    let frame = 0;
    let selectedTokenId = null;
    let animationRunning = false;

    // ======================================
    // FLOATING DICE STYLES
    // ======================================

    const style = document.createElement("style");

    style.textContent = `

        .token-dice-popup {
            position: fixed;
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 7px;
            background: #10265d;
            border: 2px solid #ffc83d;
            border-radius: 12px;
            box-shadow: 0 5px 15px #0008;
            animation: popupAppear .15s ease-out;
        }

        .token-dice-popup[hidden] {
            display: none !important;
        }

        .token-dice-popup::after {
            content: "";
            position: absolute;
            left: var(--arrow-position, 50%);
            bottom: -8px;
            width: 12px;
            height: 12px;
            background: #10265d;
            border-right: 2px solid #ffc83d;
            border-bottom: 2px solid #ffc83d;
            transform:
                translateX(-50%)
                rotate(45deg);
            z-index: -1;
        }

        .token-dice-popup.below::after {
            bottom: auto;
            top: -8px;
            transform:
                translateX(-50%)
                rotate(225deg);
        }

        .popup-die {
            width: 40px;
            height: 40px;
            padding: 6px;
            display: grid;
            grid-template-columns:
                repeat(3, 1fr);
            grid-template-rows:
                repeat(3, 1fr);
            gap: 2px;
            border: none;
            border-radius: 7px;
            background: white;
            box-shadow: 0 3px 0 #a7b7cc;
            cursor: pointer;
            touch-action: manipulation;
        }

        .popup-die:active {
            transform: scale(.9);
            background: #ffe9a0;
        }

        .popup-dot {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: transparent;
        }

        .popup-dot.visible {
            background: #10265d;
        }

        .token.popup-selected {
            filter:
                drop-shadow(0 0 5px white)
                drop-shadow(0 0 8px gold)
                !important;
            z-index: 40 !important;
        }

        .flying-token {
            pointer-events: none !important;
        }

        .flying-token svg {
            display: block;
            width: 100%;
            height: 100%;
        }

        @keyframes popupAppear {

            from {
                opacity: 0;
                scale: .85;
            }

            to {
                opacity: 1;
                scale: 1;
            }

        }

        @media (prefers-reduced-motion: reduce) {

            .token-dice-popup {
                animation: none;
            }

        }

    `;

    document.head.appendChild(style);

    // ======================================
    // CREATE FLOATING MENU
    // ======================================

    const popup = document.createElement("div");

    popup.className = "token-dice-popup";

    popup.hidden = true;

    popup.setAttribute(
        "aria-label",
        "Choose dice value"
    );

    document.body.appendChild(popup);

    const popupPatterns = {

        1: [4],

        2: [0, 8],

        3: [0, 4, 8],

        4: [0, 2, 6, 8],

        5: [0, 2, 4, 6, 8],

        6: [0, 2, 3, 5, 6, 8]

    };

    // ======================================
    // CLOSE POPUP
    // ======================================

    function closePopup() {

        popup.hidden = true;

        popup.replaceChildren();

        selectedTokenId = null;

        document.querySelectorAll(
            ".popup-selected"
        ).forEach(element => {

            element.classList.remove(
                "popup-selected"
            );

        });

    }

    // ======================================
    // FIND LEGAL DICE
    // ======================================

    function getAvailableDice(token) {

        return remainingDice

            .map((die, index) => ({

                index: index,

                value: die.value,

                used: die.used

            }))

            .filter(die =>

                !die.used &&

                canMoveToken(
                    token,
                    die.value
                )

            );

    }

    // ======================================
    // REMOVE IDENTICAL DICE CHOICES
    // ======================================

    function getUniqueDice(availableDice) {

        const values = new Set();

        return availableDice.filter(die => {

            if (values.has(die.value)) {

                return false;

            }

            values.add(die.value);

            return true;

        });

    }

    // ======================================
    // SMART AUTOMATIC DICE EXECUTION
    // ======================================

    async function useDice(token, index) {

        if (!matchStarted) return;

        if (animationRunning) return;

        if (turnPhase !== "move") return;

        if (automaticMovement) return;

        const die = remainingDice[index];

        if (!die || die.used) {

            closePopup();

            return;

        }

        if (!canMoveToken(token, die.value)) {

            closePopup();

            highlightLegalTokens();

            return;

        }

        closePopup();

        selectedDie = index;

        updateDiceAppearance();

        await executeSelectedMove(token);

    }

    // ======================================
    // POSITION POPUP
    // ======================================

    function positionPopup() {

        if (popup.hidden) return;

        const token = getAllTokens().find(

            item => item.id === selectedTokenId

        );

        if (!token) {

            closePopup();

            return;

        }

        const element = getTokenElement(token);

        if (!element || !element.isConnected) {

            closePopup();

            return;

        }

        const rect =
            element.getBoundingClientRect();

        const popupWidth = popup.offsetWidth;

        const popupHeight = popup.offsetHeight;

        const centerX =
            rect.left + rect.width / 2;

        const screenWidth =
            document.documentElement.clientWidth;

        const screenHeight =
            document.documentElement.clientHeight;

        let left =
            centerX - popupWidth / 2;

        left = Math.max(

            5,

            Math.min(

                left,

                screenWidth - popupWidth - 5

            )

        );

        let top =
            rect.top - popupHeight - 12;

        popup.classList.remove("below");

        if (top < 8) {

            top = rect.bottom + 12;

            popup.classList.add("below");

        }

        top = Math.max(

            5,

            Math.min(

                top,

                screenHeight - popupHeight - 5

            )

        );

        const arrowPosition = Math.max(

            10,

            Math.min(

                centerX - left,

                popupWidth - 10

            )

        );

        popup.style.left = `${left}px`;

        popup.style.top = `${top}px`;

        popup.style.setProperty(

            "--arrow-position",

            `${arrowPosition}px`

        );

    }

    // ======================================
    // CREATE MINIATURE DIE
    // ======================================

    function createPopupDie(die, token) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className = "popup-die";

        button.title = `Use ${die.value}`;

        button.setAttribute(

            "aria-label",

            `Use dice value ${die.value}`

        );

        const pattern =
            popupPatterns[die.value] || [];

        for (let i = 0; i < 9; i++) {

            const dot =
                document.createElement("span");

            dot.className = "popup-dot";

            if (pattern.includes(i)) {

                dot.classList.add("visible");

            }

            button.appendChild(dot);

        }

        button.addEventListener(

            "click",

            async event => {

                event.preventDefault();

                event.stopPropagation();

                if (selectedTokenId !== token.id) {

                    return;

                }

                await useDice(

                    token,

                    die.index

                );

            }

        );

        return button;

    }

    // ======================================
    // OPEN FLOATING MENU
    // ======================================

    function openPopup(token, availableDice) {

        closePopup();

        const element = getTokenElement(token);

        if (!element) return;

        selectedTokenId = token.id;

        element.classList.add("popup-selected");

        for (const die of availableDice) {

            popup.appendChild(

                createPopupDie(die, token)

            );

        }

        popup.hidden = false;

        positionPopup();

        gameMessage.textContent =

            "Choose a dice value for this token.";

    }

    // ======================================
    // HIGHLIGHT ALL LEGAL TOKENS
    // ======================================

    highlightLegalTokens = function () {

        clearTokenHighlights();

        closePopup();

        if (turnPhase !== "move") return;

        if (automaticMovement) return;

        selectedDie = -1;

        updateDiceAppearance();

        const legalIds = new Set();

        for (const token of getControlledTokens()) {

            if (getAvailableDice(token).length > 0) {

                legalIds.add(token.id);

            }

        }

        document.querySelectorAll(".token")

            .forEach(element => {

                if (element.closest(".finish-area")) {

                    return;

                }

                element.classList.add(

                    legalIds.has(element.id)

                        ? "legal-token"

                        : "unavailable-token"

                );

            });

        gameMessage.textContent =

            gameState[currentPlayer].turbo

                ? "⚡ TURBO: Tap a highlighted token."

                : "Tap a highlighted token.";

    };

    // ======================================
    // V2.3 SMART TOKEN SELECTION
    // ======================================

    selectToken = async function (token) {

        if (!matchStarted) return;

        if (animationRunning) return;

        if (turnPhase !== "move") return;

        if (automaticMovement) return;

        if (!canControlToken(token)) {

            closePopup();

            gameMessage.textContent =

                "You cannot control this token.";

            return;

        }

        if (captureLocks.has(token.id)) {

            closePopup();

            gameMessage.textContent =

                "🔒 Token locked until the next roll.";

            return;

        }

        const availableDice =
            getAvailableDice(token);

        // No legal movement.

        if (availableDice.length === 0) {

            closePopup();

            gameMessage.textContent =

                "No legal dice value for this token.";

            return;

        }

        // Remove duplicate choices.
        // Example: 6 + 6 becomes one choice.
        // Only one actual die will be consumed.

        const uniqueDice =
            getUniqueDice(availableDice);

        // ==================================
        // HOME TOKEN: AUTOMATIC RELEASE
        // ==================================

        if (token.status === "home") {

            const six = availableDice.find(

                die => die.value === 6

            );

            if (six) {

                await useDice(token, six.index);

                return;

            }

        }

        // ==================================
        // PRISON TOKEN: AUTOMATIC ESCAPE
        // ==================================

        if (token.status === "prison") {

            const six = availableDice.find(

                die => die.value === 6

            );

            if (six) {

                await useDice(token, six.index);

                return;

            }

        }

        // ==================================
        // ONLY ONE CHOICE: AUTOMATIC MOVE
        // ==================================

        if (uniqueDice.length === 1) {

            await useDice(

                token,

                uniqueDice[0].index

            );

            return;

        }

        // ==================================
        // TWO DIFFERENT CHOICES: SHOW MENU
        // ==================================

        if (

            selectedTokenId === token.id &&

            !popup.hidden

        ) {

            closePopup();

            return;

        }

        openPopup(token, uniqueDice);

    };

    // ======================================
    // CLOSE POPUP WHEN TAPPING OUTSIDE
    // ======================================

    document.addEventListener(

        "pointerdown",

        event => {

            if (popup.hidden) return;

            if (popup.contains(event.target)) return;

            if (event.target.closest(".token")) return;

            closePopup();

        }

    );

    // ======================================
    // MOVING DICE BETWEEN PLAYERS
    // ======================================

    const diceSlots = {};

    for (const color of players) {

        const panel =
            document.getElementById(
                `player-${color}`
            );

        if (!panel) continue;

        let slot = panel.querySelector(

            ".player-dice-slot"

        );

        if (!slot) {

            slot = document.createElement("div");

            slot.className = "player-dice-slot";

            slot.id = `dice-slot-${color}`;

            panel.appendChild(slot);

        }

        diceSlots[color] = slot;

    }

    function moveDiceToPlayer() {

        const slot = diceSlots[currentPlayer];

        if (!slot) return;

        if (diceArea.parentElement === slot) return;

        closePopup();

        slot.appendChild(diceArea);

        diceArea.classList.remove("dice-arriving");

        void diceArea.offsetWidth;

        if (animationsEnabled) {

            diceArea.classList.add("dice-arriving");

        }

        schedule();

    }

    const previousUpdatePlayer =
        updateCurrentPlayer;

    updateCurrentPlayer = function (...args) {

        const result = previousUpdatePlayer.apply(

            this,

            args

        );

        moveDiceToPlayer();

        return result;

    };

    moveDiceToPlayer();

    // ======================================
    // TAP DICE TO ROLL
    // ======================================

    diceArea.addEventListener(

        "click",

        event => {

            if (turnPhase !== "roll") return;

            if (!matchStarted) return;

            if (isRolling) return;

            if (animationRunning) return;

            if (rollButton.disabled) return;

            event.preventDefault();

            event.stopImmediatePropagation();

            closePopup();

            rollDice();

        },

        true

    );

    // ======================================
    // CLOSE POPUP DURING MOVEMENT
    // ======================================

    const previousExecuteMove =
        executeSelectedMove;

    executeSelectedMove = async function (token) {

        closePopup();

        await previousExecuteMove(token);

    };

    const previousFinishTurn =
        finishTurnAutomatically;

    finishTurnAutomatically = async function (...args) {

        closePopup();

        await previousFinishTurn(...args);

    };

    // ======================================
    // CAPTURE ANIMATION SETTINGS
    // ======================================

    const CAPTURE_STEP_MS = 30;

    const PRISON_FLIGHT_MS = 350;

    const ESCAPE_FLIGHT_MS = 500;

    // ======================================
    // CREATE FLYING TOKEN
    // ======================================

    function createFlyingToken(element) {

        const rect =
            element.getBoundingClientRect();

        const clone =
            document.createElement("div");

        clone.className = "flying-token";

        clone.innerHTML = element.innerHTML;

        Object.assign(clone.style, {

            position: "fixed",

            left: `${rect.left}px`,

            top: `${rect.top}px`,

            width: `${rect.width}px`,

            height: `${rect.height}px`,

            zIndex: "99999",

            pointerEvents: "none",

            transformOrigin: "center",

            margin: "0",

            padding: "0"

        });

        document.body.appendChild(clone);

        return clone;

    }

    // ======================================
    // ANIMATE TOKEN TO DESTINATION
    // ======================================

    async function flyTo(

        clone,

        destination,

        duration,

        rotation

    ) {

        if (!destination) return;

        const rect =
            destination.getBoundingClientRect();

        const left =

            rect.left +

            rect.width / 2 -

            clone.offsetWidth / 2;

        const top =

            rect.top +

            rect.height / 2 -

            clone.offsetHeight / 2;

        const transform =

            `rotate(${rotation}deg)`;

        const animation = clone.animate(

            [

                {

                    left: clone.style.left,

                    top: clone.style.top,

                    transform:

                        clone.style.transform ||

                        "rotate(0deg)"

                },

                {

                    left: `${left}px`,

                    top: `${top}px`,

                    transform: transform

                }

            ],

            {

                duration: duration,

                easing: "linear",

                fill: "forwards"

            }

        );

        try {

            await animation.finished;

        } catch (error) {

            console.warn(

                "Animation interrupted:",

                error

            );

        }

        clone.style.left = `${left}px`;

        clone.style.top = `${top}px`;

        clone.style.transform = transform;

        animation.cancel();

    }

    // ======================================
    // BACKWARDS CAPTURE ANIMATION
    // ======================================

    async function animateCapturedToken(

        enemy,

        attacker

    ) {

        const element = getTokenElement(enemy);

        if (!element) return;

        if (!animationsEnabled) return;

        if (!element.animate) return;

        const clone = createFlyingToken(element);

        const oldVisibility =
            element.style.visibility;

        element.style.visibility = "hidden";

        let rotation = 0;

        try {

            for (

                let position = enemy.position - 1;

                position >= 0;

                position--

            ) {

                const point = getTokenCoordinates(

                    enemy.color,

                    position

                );

                if (!point) continue;

                const cell =

                    document.getElementById(

                        `cell-${point[0]}-${point[1]}`

                    );

                if (!cell) continue;

                rotation -= 60;

                await flyTo(

                    clone,

                    cell,

                    CAPTURE_STEP_MS,

                    rotation

                );

            }

            let destination;

            if (mode === "turbo") {

                const prison =

                    document.getElementById(

                        `prison-${attacker.color}`

                    );

                destination =

                    prison && !prison.hidden

                        ? prison

                        : document.getElementById(

                            `player-${attacker.color}`

                        );

            } else {

                destination =

                    document.getElementById(

                        `slot-${enemy.id}`

                    );

            }

            await flyTo(

                clone,

                destination,

                PRISON_FLIGHT_MS,

                rotation - 360

            );

        } finally {

            clone.remove();

            element.style.visibility = oldVisibility;

        }

    }

    // ======================================
    // CONNECT CAPTURE ANIMATION
    // ======================================

    const previousCapture =
        captureOpponents;

    captureOpponents = async function (token) {

        closePopup();

        if (

            animationsEnabled &&

            token.status === "board" &&

            token.position <= LAST_POINT

        ) {

            const point = getTokenCoordinates(

                token.color,

                token.position

            );

            if (point && !isSafeCell(...point)) {

                const enemies =

                    getTokensAtCell(...point)

                        .filter(other =>

                            isOpponent(

                                token.color,

                                other.color

                            )

                        );

                animationRunning = true;

                try {

                    for (const enemy of enemies) {

                        try {

                            await animateCapturedToken(

                                enemy,

                                token

                            );

                        } catch (error) {

                            console.warn(

                                "Capture animation error:",

                                error

                            );

                        }

                    }

                } finally {

                    animationRunning = false;

                }

            }

        }

        await previousCapture(token);

    };

    // ======================================
    // PRISON ESCAPE ANIMATION
    // ======================================

    const previousEscape =
        escapePrison;

    escapePrison = async function (token) {

        closePopup();

        if (

            animationsEnabled &&

            token.status === "prison"

        ) {

            const element =
                getTokenElement(token);

            const home =

                document.getElementById(

                    `slot-${token.id}`

                );

            if (element && home && element.animate) {

                const clone =
                    createFlyingToken(element);

                const oldVisibility =
                    element.style.visibility;

                element.style.visibility = "hidden";

                animationRunning = true;

                try {

                    await flyTo(

                        clone,

                        home,

                        ESCAPE_FLIGHT_MS,

                        720

                    );

                } catch (error) {

                    console.warn(

                        "Prison animation error:",

                        error

                    );

                } finally {

                    clone.remove();

                    element.style.visibility =
                        oldVisibility;

                    animationRunning = false;

                }

            }

        }

        await previousEscape(token);

    };

    // ======================================
    // AUTOMATIC SCREEN FITTING
    // ======================================

    function fit() {

        if (innerWidth > 600) {

            root.style.removeProperty(

                "--mobile-board-size"

            );

            positionPopup();

            return;

        }

        const css = getComputedStyle(container);

        const px = value => parseFloat(value) || 0;

        const children =

            [...container.children].filter(

                element =>

                    getComputedStyle(element)

                        .display !== "none"

            );

        let occupied =

            px(css.paddingTop) +

            px(css.paddingBottom) +

            px(css.rowGap) *

            Math.max(0, children.length - 1);

        for (const element of children) {

            if (element === board) continue;

            const style = getComputedStyle(element);

            occupied +=

                element.getBoundingClientRect().height +

                px(style.marginTop) +

                px(style.marginBottom);

        }

        const width =

            container.clientWidth -

            px(css.paddingLeft) -

            px(css.paddingRight);

        const size = Math.max(

            1,

            Math.floor(

                Math.min(

                    width,

                    container.clientHeight -

                    occupied - 2

                )

            )

        );

        const value = `${size}px`;

        if (

            root.style.getPropertyValue(

                "--mobile-board-size"

            ) !== value

        ) {

            root.style.setProperty(

                "--mobile-board-size",

                value

            );

        }

        positionPopup();

    }

    function schedule() {

        cancelAnimationFrame(frame);

        frame = requestAnimationFrame(fit);

    }

    // ======================================
    // SCREEN EVENTS
    // ======================================

    for (const event of [

        "resize",

        "load",

        "pageshow",

        "orientationchange"

    ]) {

        window.addEventListener(event, schedule);

    }

    window.visualViewport?.addEventListener(

        "resize",

        schedule

    );

    window.addEventListener(

        "scroll",

        positionPopup,

        { passive: true }

    );

    if (window.ResizeObserver) {

        const observer =

            new ResizeObserver(schedule);

        observer.observe(container);

        for (const element of container.children) {

            if (element !== board) {

                observer.observe(element);

            }

        }

    }

    // ======================================
    // PREVENT ACCIDENTAL ZOOM
    // ======================================

    for (const event of [

        "gesturestart",

        "gesturechange",

        "gestureend"

    ]) {

        document.addEventListener(

            event,

            e => {

                if (e.cancelable) {

                    e.preventDefault();

                }

            },

            { passive: false }

        );

    }

    document.addEventListener(

        "touchmove",

        e => {

            if (

                e.touches.length > 1 &&

                e.cancelable

            ) {

                e.preventDefault();

            }

        },

        { passive: false }

    );

    document.addEventListener(

        "dblclick",

        e => e.preventDefault()

    );

    // ======================================
    // RESTORE HIGHLIGHTS FOR SAVED MATCHES
    // ======================================

    if (

        matchStarted &&

        turnPhase === "move" &&

        !automaticMovement

    ) {

        highlightLegalTokens();

    }

    schedule();


})();