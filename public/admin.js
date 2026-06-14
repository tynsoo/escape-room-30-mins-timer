const socket = io();

const timerElement = document.getElementById("timer");

socket.on("timerUpdate", (data) => {
  const mins = Math.floor(data.remaining / 60);
  const secs = data.remaining % 60;

  timerElement.textContent =
    `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
});

function startTimer() {
  socket.emit("start");
}

function pauseTimer() {
  socket.emit("pause");
}

function resumeTimer() {
  socket.emit("resume");
}

function resetTimer() {
  socket.emit("reset");
}