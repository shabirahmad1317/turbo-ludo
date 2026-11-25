// TURBO LUDO V2.7.1
// NOORTECH PREFERENCES SYSTEM

(function () {

    "use strict";

    const KEY = "turboLudoPreferences";

    const defaults = {

        sound: true,
        volume: 100,

        dice: true,
        movement: true,
        capture: true,
        victory: true,

        animations: true,
        celebration: true,

        speed: "normal"

    };

    function load() {

        let saved = {};

        try {

            saved = JSON.parse(
                localStorage.getItem(KEY) || "{}"
            ) || {};

        } catch (error) {}

        const preferences = {

            ...defaults,

            sound:
                localStorage.getItem("sound")
                !== "false",

            animations:
                localStorage.getItem("animations")
                !== "false",

            ...saved

        };

        preferences.volume = Math.max(
            0,
            Math.min(
                100,
                Number(preferences.volume) || 0
            )
        );

        if (
            !["normal", "fast", "instant"]
                .includes(preferences.speed)
        ) {

            preferences.speed = "normal";

        }

        return preferences;

    }

    function save(preferences) {

        const data = {

            ...defaults,
            ...preferences

        };

        localStorage.setItem(
            KEY,
            JSON.stringify(data)
        );

        localStorage.setItem(
            "sound",
            String(data.sound)
        );

        localStorage.setItem(
            "animations",
            String(data.animations)
        );

        return data;

    }

    function canPlay(category) {

        const preferences = load();

        return preferences.sound &&
            preferences.volume > 0 &&
            preferences[category] !== false;

    }

    function volume(category) {

        if (!canPlay(category)) return 0;

        return load().volume / 100;

    }

    function movementDuration(milliseconds) {

        const preferences = load();

        if (
            !preferences.animations ||
            preferences.speed === "instant"
        ) return 0;

        if (preferences.speed === "fast") {

            return Math.round(
                milliseconds * .45
            );

        }

        return milliseconds;

    }

    window.TurboPreferences = {

        load,
        save,
        canPlay,
        volume,
        movementDuration,

        defaults: () => ({ ...defaults })

    };

})();