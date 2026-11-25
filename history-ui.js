// ==========================================
// TURBO LUDO V2.6.2
// HISTORY INTERFACE CONTROLLER
// DEVELOPED BY NOORTECH
// ==========================================

(function () {

    "use strict";

    let activeFilter = "all";

    const colorIcons = {

        blue: "🔵",

        red: "🔴",

        green: "🟢",

        yellow: "🟡"

    };

    const history = window.TurboHistory;

    const leaderboard =
        document.getElementById("leaderboard");

    const matchHistory =
        document.getElementById("matchHistory");

    const detailsDialog =
        document.getElementById(
            "matchDetailsDialog"
        );

    const matchDetails =
        document.getElementById("matchDetails");

    const clearButton =
        document.getElementById(
            "clearHistoryButton"
        );

    if (!history) {

        matchHistory.textContent =
            "Unable to load match history.";

        clearButton.disabled = true;

        return;

    }

    // ======================================
    // FORMAT NUMBERS
    // ======================================

    function formatNumber(value) {

        return Number(value).toLocaleString();

    }

    // ======================================
    // FORMAT MATCH DATE
    // ======================================

    function formatDate(value) {

        return new Date(value).toLocaleString(
            undefined,
            {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }

    // ======================================
    // GAME MODE NAME
    // ======================================

    function modeName(mode) {

        return mode === "turbo"

            ? "TURBO TEAM LUDO"

            : "CLASSIC LUDO";

    }

    // ======================================
    // EMPTY STATE
    // ======================================

    function createEmptyState(
        icon,
        title,
        message
    ) {

        const element =
            document.createElement("div");

        element.className = "empty-state";

        const symbol =
            document.createElement("span");

        symbol.textContent = icon;

        const heading =
            document.createElement("strong");

        heading.textContent = title;

        const description =
            document.createElement("p");

        description.textContent = message;

        element.append(
            symbol,
            heading,
            description
        );

        return element;

    }

    // ======================================
    // UPDATE OVERALL STATISTICS
    // ======================================

    function renderStatistics() {

        const statistics =
            history.getStatistics(activeFilter);

        const fields = [

            "totalMatches",

            "totalCaptures",

            "totalTurns",

            "turboMatches",

            "classicMatches",

            "totalFinished"

        ];

        fields.forEach(field => {

            document.getElementById(field)
                .textContent =
                    formatNumber(statistics[field]);

        });

    }

    // ======================================
    // RENDER PLAYER LEADERBOARD
    // ======================================

    function renderLeaderboard() {

        leaderboard.replaceChildren();

        const players =
            history.getLeaderboard(activeFilter);

        if (players.length === 0) {

            leaderboard.appendChild(

                createEmptyState(

                    "🏅",

                    "NO PLAYER RANKINGS",

                    "Complete a match with custom player names to appear on the leaderboard."

                )

            );

            return;

        }

        players.forEach((player, index) => {

            const card =
                document.createElement("div");

            card.className =
                "leaderboard-card";

            card.innerHTML = `

                <div class="player-rank"></div>

                <div class="leaderboard-info">

                    <div class="leaderboard-name">
                    </div>

                    <div class="leaderboard-details">
                    </div>

                    <div class="win-track">

                        <div class="win-progress">
                        </div>

                    </div>

                </div>

                <div class="win-rate"></div>

            `;

            const medals = [
                "🥇",
                "🥈",
                "🥉"
            ];

            card.querySelector(
                ".player-rank"
            ).textContent =

                medals[index] ||
                String(index + 1);

            card.querySelector(
                ".leaderboard-name"
            ).textContent = player.name;

            card.querySelector(
                ".leaderboard-details"
            ).textContent =

                `${player.matches} matches • ` +
                `${player.wins} wins • ` +
                `${player.losses} losses • ` +
                `${player.captures} captures`;

            card.querySelector(
                ".win-rate"
            ).textContent =
                `${player.winRate}%`;

            card.querySelector(
                ".win-progress"
            ).style.width =
                `${player.winRate}%`;

            leaderboard.appendChild(card);

        });

    }

    // ======================================
    // SHOW INDIVIDUAL MATCH DETAILS
    // ======================================

    function showMatchDetails(match) {

        matchDetails.replaceChildren();

        const summary =
            document.createElement("div");

        summary.className =
            "detail-summary";

        const information = [

            modeName(match.mode),

            formatDate(match.playedAt),

            `${match.turns} turns`,

            `${match.captures} total captures`

        ];

        information.forEach(value => {

            const row =
                document.createElement("div");

            row.textContent = value;

            summary.appendChild(row);

        });

        matchDetails.appendChild(summary);

        const sortedPlayers =
            [...match.players].sort(
                (a, b) =>
                    Number(b.won) -
                    Number(a.won)
            );

        sortedPlayers.forEach(player => {

            const card =
                document.createElement("div");

            card.className =
                "detail-player";

            if (player.won) {

                card.classList.add("winner");

            }

            card.innerHTML = `

                <div class="detail-color">
                </div>

                <div class="detail-info">

                    <strong></strong>

                    <small></small>

                </div>

                <div class="detail-result">
                </div>

            `;

            card.querySelector(
                ".detail-color"
            ).textContent =

                colorIcons[player.color] ||
                "👤";

            card.querySelector(
                ".detail-info strong"
            ).textContent = player.name;

            card.querySelector(
                ".detail-info small"
            ).textContent =

                `${player.finished}/4 finished • ` +
                `${player.captures} captures`;

            card.querySelector(
                ".detail-result"
            ).textContent = player.won

                ? "🏆 WINNER"

                : "LOST";

            matchDetails.appendChild(card);

        });

        detailsDialog.showModal();

    }

    // ======================================
    // RENDER MATCH HISTORY
    // ======================================

    function renderMatchHistory() {

        matchHistory.replaceChildren();

        const matches =
            history.getMatches(activeFilter);

        if (matches.length === 0) {

            matchHistory.appendChild(

                createEmptyState(

                    "🎲",

                    "NO COMPLETED MATCHES",

                    "Your completed matches will automatically appear here."

                )

            );

            return;

        }

        matches.forEach(match => {

            const winners =
                match.players.filter(
                    player => player.won
                );

            const winnerNames =
                winners.map(
                    player => player.name
                ).join(" & ");

            const card =
                document.createElement("button");

            card.className = "match-card";

            card.type = "button";

            card.innerHTML = `

                <div class="match-icon">
                    🏆
                </div>

                <div class="match-info">

                    <div class="match-winners">
                    </div>

                    <div class="match-mode">
                    </div>

                    <div class="match-date">
                    </div>

                </div>

                <div class="match-arrow">
                    ❯
                </div>

            `;

            card.querySelector(
                ".match-winners"
            ).textContent = winnerNames;

            card.querySelector(
                ".match-mode"
            ).textContent =
                modeName(match.mode);

            card.querySelector(
                ".match-date"
            ).textContent =

                `${formatDate(match.playedAt)} • ` +
                `${match.turns} turns`;

            card.addEventListener(
                "click",
                () => showMatchDetails(match)
            );

            matchHistory.appendChild(card);

        });

    }

    // ======================================
    // REFRESH ENTIRE PAGE
    // ======================================

    function renderPage() {

        renderStatistics();

        renderLeaderboard();

        renderMatchHistory();

        clearButton.disabled =
            history.getMatches().length === 0;

    }

    // ======================================
    // FILTER BUTTONS
    // ======================================

    document.querySelectorAll(
        ".filter-button"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                activeFilter =
                    button.dataset.filter;

                document.querySelectorAll(
                    ".filter-button"
                ).forEach(item => {

                    item.classList.toggle(
                        "active",
                        item === button
                    );

                });

                renderPage();

            }
        );

    });

    // ======================================
    // CLEAR HISTORY
    // ======================================

    clearButton.addEventListener(
        "click",
        () => {

            const confirmed = confirm(

                "Permanently delete ALL match history and player statistics? This cannot be undone."

            );

            if (!confirmed) return;

            const success =
                history.clearHistory();

            if (!success) {

                alert(
                    "Unable to delete match history."
                );

                return;

            }

            renderPage();

        }
    );

    // ======================================
    // REFRESH WHEN RETURNING TO PAGE
    // ======================================

    window.addEventListener(
        "pageshow",
        renderPage
    );

    window.addEventListener(
        "storage",
        renderPage
    );

    // INITIALIZE

    renderPage();

})();