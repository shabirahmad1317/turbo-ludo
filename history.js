// ==========================================
// TURBO LUDO V2.6.2
// MATCH HISTORY DATABASE
// DEVELOPED BY NOORTECH
// ==========================================

(function () {

    "use strict";

    const HISTORY_KEY = "turboLudoMatchHistory_v1";

    let matchRecorded = false;

    // ======================================
    // LOAD MATCH HISTORY
    // ======================================

    function loadHistory() {

        try {

            const raw =
                localStorage.getItem(HISTORY_KEY);

            if (!raw) return [];

            const data = JSON.parse(raw);

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(error);

            return [];

        }

    }

    // ======================================
    // SAVE MATCH HISTORY
    // ======================================

    function saveHistory(history) {

        try {

            localStorage.setItem(
                HISTORY_KEY,
                JSON.stringify(history)
            );

            return true;

        } catch (error) {

            console.error(
                "History save failed:",
                error
            );

            return false;

        }

    }

    // ======================================
    // GENERATE MATCH ID
    // ======================================

    function generateMatchId() {

        return Date.now().toString(36) +
            "-" +
            Math.random().toString(36).slice(2);

    }

    // ======================================
    // GET PLAYER NAME
    // ======================================

    function playerName(color) {

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
    // RECORD COMPLETED MATCH
    // ======================================

    function recordMatch(
        team,
        winnerColor = null
    ) {

        if (matchRecorded) return false;

        let winners;

        if (mode === "classic") {

            winners = [winnerColor];

        } else if (team === "A") {

            winners = ["blue", "green"];

        } else if (team === "B") {

            winners = ["red", "yellow"];

        } else {

            return false;

        }

        if (
            winners.some(
                color => !gameState[color]
            )
        ) return false;

        if (
            !winners.every(
                color =>
                    gameState[color].finished === 4
            )
        ) return false;

        const matchPlayers = [
            "blue",
            "red",
            "green",
            "yellow"
        ].map(color => ({

            color: color,

            name: playerName(color),

            finished:
                gameState[color].finished,

            captures:
                gameState[color].captures,

            won: winners.includes(color)

        }));

        const match = {

            id: generateMatchId(),

            playedAt:
                new Date().toISOString(),

            mode: mode,

            winners: winners,

            players: matchPlayers,

            turns: turnNumber,

            captures: matchPlayers.reduce(
                (sum, player) =>
                    sum + player.captures,
                0
            )

        };

        const history = loadHistory();

        history.unshift(match);

        const saved = saveHistory(history);

        if (saved) {

            matchRecorded = true;

            console.log(
                "Match recorded:",
                match
            );

        }

        return saved;

    }

    // ======================================
    // FILTER MATCHES
    // ======================================

    function getMatches(filter = "all") {

        const history = loadHistory();

        if (filter === "all") {

            return history;

        }

        return history.filter(
            match => match.mode === filter
        );

    }

    // ======================================
    // OVERALL STATISTICS
    // ======================================

    function getStatistics(filter = "all") {

        const history = getMatches(filter);

        return {

            totalMatches: history.length,

            turboMatches: history.filter(
                match => match.mode === "turbo"
            ).length,

            classicMatches: history.filter(
                match => match.mode === "classic"
            ).length,

            totalCaptures: history.reduce(
                (sum, match) =>
                    sum + match.captures,
                0
            ),

            totalTurns: history.reduce(
                (sum, match) =>
                    sum + match.turns,
                0
            ),

            totalFinished: history.reduce(
                (sum, match) =>

                    sum + match.players.reduce(
                        (total, player) =>
                            total + player.finished,
                        0
                    ),

                0
            )

        };

    }

    // ======================================
    // PLAYER LEADERBOARD
    // ======================================

    function getLeaderboard(filter = "all") {

        const history = getMatches(filter);

        const records = new Map();

        history.forEach(match => {

            match.players.forEach(player => {

                const name =
                    player.name.trim();

                const defaultName =
                    player.color.toLowerCase();

                // Default color names do not
                // identify individual people.

                if (
                    name.toLowerCase() ===
                    defaultName
                ) return;

                const key =
                    name.toLowerCase();

                if (!records.has(key)) {

                    records.set(key, {

                        name: name,

                        matches: 0,

                        wins: 0,

                        losses: 0,

                        captures: 0,

                        finished: 0

                    });

                }

                const record =
                    records.get(key);

                record.matches++;

                if (player.won) {

                    record.wins++;

                } else {

                    record.losses++;

                }

                record.captures +=
                    player.captures;

                record.finished +=
                    player.finished;

            });

        });

        return Array.from(
            records.values()
        ).map(player => ({

            ...player,

            winRate:

                player.matches === 0

                    ? 0

                    : Math.round(
                        player.wins /
                        player.matches * 100
                    )

        })).sort((a, b) =>

            b.wins - a.wins ||

            b.winRate - a.winRate ||

            b.captures - a.captures

        );

    }

    // ======================================
    // DELETE MATCH HISTORY
    // ======================================

    function clearHistory() {

        try {

            localStorage.removeItem(
                HISTORY_KEY
            );

            return true;

        } catch (error) {

            console.error(error);

            return false;

        }

    }

    // ======================================
    // PUBLIC DATABASE FUNCTIONS
    // ======================================

    window.TurboHistory = {

        getMatches,

        getStatistics,

        getLeaderboard,

        clearHistory

    };

    // ======================================
    // CONNECT TO GAME VICTORY
    // ======================================

    if (
        typeof showVictory === "function"
    ) {

        const previousVictory =
            showVictory;

        showVictory = function (
            team,
            winnerColor = null
        ) {

            recordMatch(
                team,
                winnerColor
            );

            return previousVictory(
                team,
                winnerColor
            );

        };

    }

})();