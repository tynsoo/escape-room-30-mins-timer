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

setInterval(() => {
    if (timerState.running && timerState.endTime) {

        const remaining = Math.max(
            0,
            Math.ceil((timerState.endTime - Date.now()) / 1000)
        );

        timerState.remaining = remaining;

        if (remaining <= 0) {
            timerState.running = false;
            timerState.endTime = null;
        }

        io.emit("timerUpdate", timerState);
    }
}, 1000);

io.on("connection", (socket) => {

    socket.emit("timerUpdate", timerState);

    socket.on("start", () => {
        timerState.remaining = timerState.duration;
        timerState.running = true;
        timerState.endTime = Date.now() + timerState.duration * 1000;
        io.emit("timerUpdate", timerState);
    });

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

    socket.on("resume", () => {
        if (!timerState.running && timerState.remaining > 0) {

            timerState.running = true;
            timerState.endTime =
                Date.now() + timerState.remaining * 1000;

            io.emit("timerUpdate", timerState);
        }
    });

    socket.on("reset", () => {
        timerState.running = false;
        timerState.remaining = timerState.duration;
        timerState.endTime = null;

        io.emit("timerUpdate", timerState);
    });

    socket.on("minusFiveMinutes", () => {
      timerState.remaining =
          Math.max(0, timerState.remaining - 300);

      if (timerState.running) {

          timerState.endTime =
              Date.now() + timerState.remaining * 1000;
      }
      io.emit("timerUpdate", timerState);
    });

      io.emit("timerUpdate", timerState);

      io.emit(
          "penaltyApplied",
          "Incorrect suspect identified. Security countermeasures activated. Five minutes deducted."
      );

  });

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});