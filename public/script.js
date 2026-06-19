const socket = io();

const timerElement = document.getElementById("timer");
const integrityElement = document.getElementById("integrity");
const titleElement = document.getElementById("title");
const warningElement = document.getElementById("warning");

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