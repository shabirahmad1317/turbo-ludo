
const settings = {
    sound: localStorage.getItem("sound") !== "false",
    animations: localStorage.getItem("animations") !== "false"
};

let audioContext;

function playSound() {

    if (!settings.sound) return;

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

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            700,
            audioContext.currentTime
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            400,
            audioContext.currentTime + 0.12
        );

        gain.gain.setValueAtTime(
            0.1,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.15
        );

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.15
        );

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

function openSettings() {

    playSound();

    document.getElementById("soundSetting")
        .checked = settings.sound;

    document.getElementById("animationSetting")
        .checked = settings.animations;

    document.getElementById("settingsDialog")
        .showModal();
}

function saveSettings() {

    settings.sound =
        document.getElementById("soundSetting")
            .checked;

    settings.animations =
        document.getElementById("animationSetting")
            .checked;

    savePreferences();

    document.getElementById("settingsDialog")
        .close();

    playSound();
}

function savePreferences() {

    localStorage.setItem(
        "sound",
        settings.sound
    );

    localStorage.setItem(
        "animations",
        settings.animations
    );

    applySettings();
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

applySettings();
