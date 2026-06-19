const socket = io();

const timerElement = document.getElementById("timer");
const integrityElement = document.getElementById("integrity");
const titleElement = document.getElementById("title");
const warningElement = document.getElementById("warning");

let announcedTimes = new Set();

// Penalty sound
const penaltyAudio = new Audio("/audio/penalty.mp3");

// Time announcement audio files
const announcements = {
    1800: new Audio("/audio/30min.mp3"),
    1200: new Audio("/audio/20min.mp3"),
    900: new Audio("/audio/15min.mp3"),
    600: new Audio("/audio/10min.mp3"),
    300: new Audio("/audio/5min.mp3"),
    60: new Audio("/audio/1min.mp3")
};

socket.on("penaltyApplied", () => {

    penaltyAudio.pause();
    penaltyAudio.currentTime = 0;

    penaltyAudio.play().catch(err => {
        console.log("Penalty audio blocked:", err);
    });

});

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

    // Time announcements
    if (
        announcements[data.remaining] &&
        !announcedTimes.has(data.remaining)
    ) {

        announcedTimes.add(data.remaining);

        announcements[data.remaining]
            .play()
            .catch(err => {
                console.log("Announcement blocked:", err);
            });
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