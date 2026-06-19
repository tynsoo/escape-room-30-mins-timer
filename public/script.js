const socket = io();

const timerElement = document.getElementById("timer");
const integrityElement = document.getElementById("integrity");
const titleElement = document.getElementById("title");
const warningElement = document.getElementById("warning");

let announcedTimes = new Set();

const checkpoints = {
    1800: "Attention participants. Thirty minutes remain before total system lockdown.",
    1200: "Security protocols are failing. Twenty minutes remain.",
    900: "Warning. System corruption spreading. Fifteen minutes remain.",
    600: "Critical alert. Ten minutes remain until containment failure.",
    300: "Emergency condition detected. Five minutes remain.",
    60: "Final warning. One minute remains before irreversible shutdown.",
    0: "System failure. Access terminated."
};

function announce(message) {

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);

    speech.rate = 0.9;
    speech.pitch = 0.8;
    speech.volume = 1;

    speechSynthesis.speak(speech);
}

// Enable browser audio
const audioButton = document.getElementById("enableAudio");

if (audioButton) {

    audioButton.addEventListener("click", () => {

        const speech = new SpeechSynthesisUtterance(
            "Audio system online."
        );

        speech.volume = 1;

        speechSynthesis.speak(speech);

        audioButton.style.display = "none";
    });

}

socket.on("timerUpdate", (data) => {

    const mins = Math.floor(data.remaining / 60);
    const secs = data.remaining % 60;

    timerElement.textContent =
        `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    const percent =
        Math.floor((data.remaining / (45 * 60)) * 100);

    integrityElement.textContent = percent + "%";

    if (data.remaining <= 900) {

        warningElement.textContent =
            "CONTAINMENT FAILURE IMMINENT";

        timerElement.classList.add("warning");
    }

    if (data.remaining <= 300) {

        warningElement.textContent =
            "SERVER FAILURE IMMINENT";

        timerElement.classList.add("critical");
    }

    if (data.remaining <= 60) {

        titleElement.textContent =
            "EMERGENCY LOCKDOWN";

        timerElement.classList.add("critical");
    }

    if (
        checkpoints[data.remaining] &&
        !announcedTimes.has(data.remaining)
    ) {

        announcedTimes.add(data.remaining);

        announce(checkpoints[data.remaining]);
    }

    if (data.remaining <= 0) {

        document.body.innerHTML = `
            <div class="failure">
                SYSTEM FAILURE<br><br>
                SERVER LOST<br><br>
                ACCESS TERMINATED
            </div>
        `;
    }

});

socket.on("penaltyApplied", () => {

    announce(
        "Penalty applied. Five minutes deducted."
    );

});