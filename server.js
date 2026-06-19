const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let timerState = {
    duration: 45 * 60,
    remaining: 45 * 60,
    running: false,
    endTime: null
};

// Timer update loop
setInterval(() => {

    if (timerState.running && timerState.endTime) {

        timerState.remaining = Math.max(
            0,
            Math.ceil((timerState.endTime - Date.now()) / 1000)
        );

        if (timerState.remaining <= 0) {

            timerState.remaining = 0;
            timerState.running = false;
            timerState.endTime = null;
        }

        io.emit("timerUpdate", timerState);
    }

}, 1000);

io.on("connection", (socket) => {

    console.log("Client connected");

    socket.emit("timerUpdate", timerState);

    // START TIMER
    socket.on("start", () => {

        timerState.remaining = timerState.duration;
        timerState.running = true;
        timerState.endTime =
            Date.now() + timerState.duration * 1000;

        io.emit("timerUpdate", timerState);
    });

    // PAUSE TIMER
    socket.on("pause", () => {

        if (timerState.running) {

            timerState.remaining = Math.ceil(
                (timerState.endTime - Date.now()) / 1000
            );

            timerState.running = false;
            timerState.endTime = null;

            io.emit("timerUpdate", timerState);
        }
    });

    // RESUME TIMER
    socket.on("resume", () => {

        if (
            !timerState.running &&
            timerState.remaining > 0
        ) {

            timerState.running = true;

            timerState.endTime =
                Date.now() +
                timerState.remaining * 1000;

            io.emit("timerUpdate", timerState);
        }
    });

    // RESET TIMER
    socket.on("reset", () => {

        timerState.running = false;
        timerState.remaining = timerState.duration;
        timerState.endTime = null;

        io.emit("timerUpdate", timerState);
    });

    // -5 MINUTE PENALTY
    socket.on("minusFiveMinutes", () => {

        console.log("5 minute penalty applied");

        if (timerState.running && timerState.endTime) {

            // Move end time 5 minutes closer
            timerState.endTime -= 300000;

            timerState.remaining = Math.max(
                0,
                Math.ceil(
                    (timerState.endTime - Date.now()) / 1000
                )
            );

            if (timerState.remaining <= 0) {

                timerState.remaining = 0;
                timerState.running = false;
                timerState.endTime = null;
            }

        } else {

            timerState.remaining =
                Math.max(
                    0,
                    timerState.remaining - 300
                );
        }

        io.emit("timerUpdate", timerState);

        // Trigger audio announcement
        io.emit("penaltyApplied");
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});