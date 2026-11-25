// ==========================================
// TURBO LUDO V2.6.1
// PROFESSIONAL VICTORY CELEBRATION
// DEVELOPED BY NOORTECH
// ==========================================

(function () {

    "use strict";

    const victoryColors = {
        blue: "#078de2",
        red: "#ed2027",
        green: "#079e42",
        yellow: "#ffd000"
    };

    const colorIcons = {
        blue: "🔵",
        red: "🔴",
        green: "🟢",
        yellow: "🟡"
    };

    // ======================================
    // VICTORY STYLES
    // ======================================

    const style = document.createElement("style");

    style.textContent = `

        .victory-dialog.pro-victory {
            width: min(92vw, 400px);
            max-height: 88dvh;
            box-sizing: border-box;
            overflow-y: auto;
            padding: 20px;
            margin: auto;
            position: fixed;
            border: 2px solid #ffc83d;
            border-radius: 24px;
            background: linear-gradient(
                145deg,
                #193b85,
                #07132e 65%
            );
            color: white;
            text-align: center;
            box-shadow: 0 0 40px #ffc83d33;
        }

        .pro-victory::backdrop {
            background: #000d;
            backdrop-filter: blur(6px);
        }

        .victory-content {
            position: relative;
            z-index: 2;
        }

        .pro-victory .victory-trophy {
            font-size: 80px;
            margin: 5px 0;
            filter: drop-shadow(
                0 0 18px #ffc83d88
            );
            animation: trophyFloat 2s
                ease-in-out infinite;
        }

        .pro-victory h1 {
            color: #ffc83d;
            font-size: 32px;
            letter-spacing: 3px;
            margin: 8px 0;
        }

        .pro-victory h2 {
            color: white;
            font-size: 18px;
            margin: 8px 0;
            overflow-wrap: anywhere;
        }

        .victory-subtitle {
            font-size: 11px;
            letter-spacing: 2px;
            color: #cbd5e1;
            margin-bottom: 20px;
        }

        .victory-players {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin: 15px 0;
        }

        .victory-player-card {
            flex: 1;
            min-width: 0;
            padding: 12px 6px;
            border: 1px solid var(--winner-color);
            border-radius: 15px;
            background: #ffffff0a;
        }

        .victory-player-icon {
            font-size: 28px;
            margin-bottom: 7px;
        }

        .victory-player-name {
            font-size: 16px;
            font-weight: bold;
            overflow-wrap: anywhere;
        }

        .victory-player-color {
            font-size: 10px;
            color: #cbd5e1;
            margin: 5px 0;
        }

        .victory-player-score {
            font-size: 24px;
            font-weight: bold;
            color: #ffc83d;
            margin: 8px 0;
        }

        .victory-player-captures {
            font-size: 11px;
            color: #cbd5e1;
        }

        .victory-statistics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            padding: 14px 5px;
            border: 1px solid #ffffff22;
            border-radius: 14px;
            background: #ffffff08;
            margin: 16px 0;
        }

        .victory-stat strong {
            display: block;
            font-size: 22px;
            color: #ffc83d;
        }

        .victory-stat small {
            display: block;
            font-size: 10px;
            color: #cbd5e1;
            margin-top: 5px;
        }

        .pro-victory .victory-button {
            display: block;
            width: 100%;
            padding: 14px;
            margin-top: 10px;
            border: 1px solid #ffc83d;
            border-radius: 12px;
            background: #ffc83d;
            color: #10265d;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
        }

        .pro-victory .victory-button.secondary {
            background: transparent;
            color: #ffc83d;
        }

        .victory-brand {
            color: #ffc83d;
            font-size: 9px;
            letter-spacing: 1.5px;
            margin-top: 18px;
        }

        .victory-confetti-layer {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 1;
            border-radius: 22px;
        }

        .victory-confetti {
            position: absolute;
            top: -20px;
            width: 7px;
            height: 13px;
            border-radius: 2px;
            animation-name: confettiFall;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
        }

        @keyframes trophyFloat {

            0%, 100% {
                transform: translateY(0)
                    scale(1);
            }

            50% {
                transform: translateY(-8px)
                    scale(1.08);
            }

        }

        @keyframes confettiFall {

            0% {
                transform:
                    translateY(-30px)
                    rotate(0deg);
                opacity: 1;
            }

            85% {
                opacity: 1;
            }

            100% {
                transform:
                    translateY(100dvh)
                    rotate(720deg);
                opacity: 0;
            }

        }

        .no-animations .pro-victory * {
            animation: none !important;
        }

        @media (prefers-reduced-motion: reduce) {

            .pro-victory * {
                animation: none !important;
            }

            .victory-confetti-layer {
                display: none;
            }

        }

    `;

    document.head.appendChild(style);

    // ======================================
    // GET PLAYER NAME
    // ======================================

    function getWinnerName(color) {

        if (
            typeof window.getPlayerName
            === "function"
        ) {

            return window.getPlayerName(color);

        }

        return color.charAt(0).toUpperCase() +
            color.slice(1);

    }

    // ======================================
    // CREATE WINNING PLAYER CARD
    // ======================================

    function createWinnerCard(color) {

        const player = gameState[color];

        const card =
            document.createElement("div");

        card.className = "victory-player-card";

        card.style.setProperty(
            "--winner-color",
            victoryColors[color]
        );

        card.innerHTML = `

            <div class="victory-player-icon">
                ${colorIcons[color]}
            </div>

            <div class="victory-player-name">
            </div>

            <div class="victory-player-color">
                ${color.toUpperCase()} PLAYER
            </div>

            <div class="victory-player-score">
                ${player.finished} / 4
            </div>

            <div class="victory-player-captures">
                ${player.captures} captures
            </div>

        `;

        card.querySelector(
            ".victory-player-name"
        ).textContent = getWinnerName(color);

        return card;

    }

    // ======================================
    // CONFETTI ANIMATION
    // ======================================

    function createConfetti(dialog) {

        if (!animationsEnabled) return;

        if (
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) return;

        const layer =
            document.createElement("div");

        layer.className =
            "victory-confetti-layer";

        const palette = [
            "#078de2",
            "#ed2027",
            "#079e42",
            "#ffd000",
            "#ffc83d",
            "#ffffff"
        ];

        for (let i = 0; i < 45; i++) {

            const piece =
                document.createElement("div");

            piece.className =
                "victory-confetti";

            piece.style.left =
                `${Math.random() * 100}%`;

            piece.style.background =
                palette[
                    Math.floor(
                        Math.random() *
                        palette.length
                    )
                ];

            piece.style.animationDuration =
                `${3 + Math.random() * 3}s`;

            piece.style.animationDelay =
                `${Math.random() * 3}s`;

            layer.appendChild(piece);

        }

        dialog.prepend(layer);

        setTimeout(() => {

            layer.remove();

        }, 8000);

    }

    // ======================================
    // UPGRADE EXISTING VICTORY SCREEN
    // ======================================

    function upgradeVictory(
        dialog,
        team,
        winnerColor
    ) {

        const winners = mode === "classic"

            ? [winnerColor]

            : team === "A"

                ? ["blue", "green"]

                : ["red", "yellow"];

        if (
            winners.some(
                color => !gameState[color]
            )
        ) return;

        const totalFinished =
            winners.reduce(
                (sum, color) =>
                    sum + gameState[color].finished,
                0
            );

        const totalCaptures =
            winners.reduce(
                (sum, color) =>
                    sum + gameState[color].captures,
                0
            );

        const target =
            mode === "classic" ? 4 : 8;

        const winnerNames =
            winners.map(getWinnerName);

        const winnerTitle =
            winnerNames.join(" & ") +
            (winners.length === 1
                ? " WINS!"
                : " WIN!");

        dialog.classList.add("pro-victory");

        dialog.innerHTML = `

            <div class="victory-content">

                <div class="victory-trophy">
                    🏆
                </div>

                <h1>VICTORY!</h1>

                <h2 id="professionalWinnerName">
                </h2>

                <div class="victory-subtitle">
                    TURBO LUDO CHAMPIONS
                </div>

                <div class="victory-players">
                </div>

                <div class="victory-statistics">

                    <div class="victory-stat">

                        <strong>
                            ${totalFinished}/${target}
                        </strong>

                        <small>FINISHED</small>

                    </div>

                    <div class="victory-stat">

                        <strong>
                            ${totalCaptures}
                        </strong>

                        <small>CAPTURES</small>

                    </div>

                    <div class="victory-stat">

                        <strong>
                            ${turnNumber}
                        </strong>

                        <small>TURNS</small>

                    </div>

                </div>

                <button
                    id="victoryReplay"
                    class="victory-button">

                    ↻ PLAY AGAIN

                </button>

                <button
                    id="victoryHome"
                    class="victory-button secondary">

                    ⌂ MAIN MENU

                </button>

                <div class="victory-brand">

                    POWERED BY NOORTECH

                </div>

            </div>

        `;

        dialog.querySelector(
            "#professionalWinnerName"
        ).textContent = winnerTitle;

        const playersContainer =
            dialog.querySelector(
                ".victory-players"
            );

        winners.forEach(color => {

            playersContainer.appendChild(
                createWinnerCard(color)
            );

        });

        gameMessage.textContent = winnerTitle;

        dialog.querySelector("#victoryReplay")
            .addEventListener("click", () => {

                window.location.reload();

            });

        dialog.querySelector("#victoryHome")
            .addEventListener("click", () => {

                goHome();

            });

        createConfetti(dialog);

    }

    // ======================================
    // CONNECT TO EXISTING ENGINE
    // ======================================

    const previousVictory = showVictory;

    showVictory = function (
        team,
        winnerColor = null
    ) {

        // Preserve original engine and save logic.

        previousVictory(team, winnerColor);

        const dialogs =
            document.querySelectorAll(
                ".victory-dialog"
            );

        const dialog =
            dialogs[dialogs.length - 1];

        if (!dialog) return;

        upgradeVictory(
            dialog,
            team,
            winnerColor
        );

    };

})();