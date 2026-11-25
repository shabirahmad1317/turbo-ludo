// TURBO LUDO V2.7.1
// MAIN MENU AND ADVANCED SETTINGS

let settings = {

    sound: localStorage.getItem("sound") !== "false",

    animations:
        localStorage.getItem("animations") !== "false",

    volume: 100,
    dice: true,
    movement: true,
    capture: true,
    victory: true,
    celebration: true,
    speed: "normal"

};

let audioContext;

function playSound() {

    if (!settings.sound || !settings.volume) return;

    const AudioClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioClass) return;

    if (!audioContext) {

        audioContext = new AudioClass();

    }

    audioContext.resume().then(() => {

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        const time = audioContext.currentTime;

        oscillator.connect(gain);

        gain.connect(audioContext.destination);

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            700, time
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            400, time + .12
        );

        gain.gain.setValueAtTime(
            .1 * settings.volume / 100,
            time
        );

        gain.gain.exponentialRampToValueAtTime(
            .00001,
            time + .15
        );

        oscillator.start(time);

        oscillator.stop(time + .15);

    }).catch(() => {});

}

function startGame(mode) {

    playSound();

    localStorage.setItem("gameMode", mode);

    window.location.href = "game.html";

}

function closeMode() {

    playSound();

    document.getElementById("modeDialog")
        .close();

}

function toggleSound() {

    settings.sound = !settings.sound;

    savePreferences();

    playSound();

}

function createSettingsInterface() {

    const dialog =
        document.getElementById("settingsDialog");

    dialog.innerHTML = `

        <h2>⚙ GAME SETTINGS</h2>

        <h3>🔊 SOUND SETTINGS</h3>

        <label class="advanced-setting-row">
            Master Sound
            <input type="checkbox" id="soundSetting">
        </label>

        <label class="advanced-setting-row">
            Dice Rolling
            <input type="checkbox" id="diceSetting">
        </label>

        <label class="advanced-setting-row">
            Token Movement
            <input type="checkbox" id="movementSetting">
        </label>

        <label class="advanced-setting-row">
            Capture Effects
            <input type="checkbox" id="captureSetting">
        </label>

        <label class="advanced-setting-row">
            Victory Sounds
            <input type="checkbox" id="victorySetting">
        </label>

        <div class="volume-heading">

            <span>Master Volume</span>

            <strong id="volumeValue">100%</strong>

        </div>

        <input
            type="range"
            id="volumeSetting"
            min="0"
            max="100"
            step="5"
        >

        <h3>🎮 ANIMATION SETTINGS</h3>

        <label class="advanced-setting-row">
            Game Animations
            <input type="checkbox" id="animationSetting">
        </label>

        <label class="advanced-setting-row">
            Victory Celebration
            <input type="checkbox" id="celebrationSetting">
        </label>

        <label class="speed-label">

            Token Movement Speed

            <select id="speedSetting">

                <option value="normal">Normal</option>

                <option value="fast">Fast</option>

                <option value="instant">Instant</option>

            </select>

        </label>

        <button
            class="advanced-save"
            onclick="saveSettings()">

            SAVE & CLOSE

        </button>

        <button
            class="advanced-secondary"
            onclick="resetSettings()">

            RESTORE DEFAULTS

        </button>

        <button
            class="advanced-secondary"
            onclick="document.getElementById('settingsDialog').close()">

            CANCEL

        </button>

        <div class="settings-brand">

            POWERED BY NOORTECH

        </div>

    `;

    document.getElementById("volumeSetting")
        .addEventListener("input", event => {

            document.getElementById("volumeValue")
                .textContent =
                    event.target.value + "%";

        });

}

function fillSettings(data) {

    const fields = {

        soundSetting: "sound",
        diceSetting: "dice",
        movementSetting: "movement",
        captureSetting: "capture",
        victorySetting: "victory",
        animationSetting: "animations",
        celebrationSetting: "celebration"

    };

    Object.entries(fields).forEach(
        ([id, key]) => {

            document.getElementById(id)
                .checked = data[key];

        }
    );

    document.getElementById("volumeSetting")
        .value = data.volume;

    document.getElementById("volumeValue")
        .textContent = data.volume + "%";

    document.getElementById("speedSetting")
        .value = data.speed;

}

function openSettings() {

    playSound();

    createSettingsInterface();

    fillSettings(settings);

    document.getElementById("settingsDialog")
        .showModal();

}

function saveSettings() {

    const checked = id =>
        document.getElementById(id).checked;

    settings = {

        sound: checked("soundSetting"),

        dice: checked("diceSetting"),

        movement: checked("movementSetting"),

        capture: checked("captureSetting"),

        victory: checked("victorySetting"),

        animations: checked("animationSetting"),

        celebration: checked("celebrationSetting"),

        volume: Number(
            document.getElementById("volumeSetting")
                .value
        ),

        speed:
            document.getElementById("speedSetting")
                .value

    };

    savePreferences();

    document.getElementById("settingsDialog")
        .close();

    playSound();

}

function resetSettings() {

    fillSettings(
        TurboPreferences.defaults()
    );

}

function savePreferences() {

    try {

        settings = TurboPreferences.save(settings);

        applySettings();

    } catch (error) {

        alert("Unable to save settings.");

    }

}

function applySettings() {

    document.getElementById("soundButton")
        .textContent =
            settings.sound ? "🔊" : "🔇";

    document.body.classList.toggle(
        "no-animations",
        !settings.animations
    );

}

function showRules() {

    playSound();

    document.getElementById("rulesDialog")
        .showModal();

}

function initializePreferences() {

    settings = TurboPreferences.load();

    applySettings();

}

applySettings();