// ...existing code...
let workDuration = 25 * 60;
let shortBreak = 5 * 60;
let longBreak = 15 * 60;

let current = workDuration;
let interval = null;
let isRunning = false;
let session = "Work";

const timerElement = document.getElementById("timer");
const progressCircle = document.querySelector(".progress");
const radius = 90;
const circumference = 2 * Math.PI * radius;

const setTimePanel = document.getElementById("set-time-panel");
const editTimeBtn = document.getElementById("edit-time-btn");

progressCircle.style.strokeDasharray = circumference;

function updateDisplay() {
  const minutes = Math.floor(current / 60);
  const seconds = current % 60;
  timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const offset = circumference - (current / getSessionDuration()) * circumference;
  progressCircle.style.strokeDashoffset = offset;

  // Dynamic color: green (start) -> yellow (middle) -> red (end)
  const percent = current / getSessionDuration();
  let r, g, b;
  if (percent > 0.5) {
    // Green to Yellow
    // Green: (0,255,99), Yellow: (255,255,0)
    const t = (1 - percent) * 2; // 0 at 100%, 1 at 50%
    r = Math.round(0 + (255 - 0) * t);
    g = 255;
    b = Math.round(99 - 99 * t);
  } else {
    // Yellow to Red
    // Yellow: (255,255,0), Red: (255,0,0)
    const t = 1 - percent * 2; // 0 at 50%, 1 at 0%
    r = 255;
    g = Math.round(255 - 255 * t);
    b = 0;
  }
  progressCircle.style.stroke = `rgb(${r},${g},${b})`;
}

function getSessionDuration() {
  if (session === "Work") return workDuration;
  if (session === "Short Break") return shortBreak;
  return longBreak;
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  interval = setInterval(() => {
    if (current === 0) {
      clearInterval(interval);
      isRunning = false;
      if (session === "Work") {
        session = "Short Break";
        current = shortBreak;
        alert("Work done! Time for a break.");
      } else if (session === "Short Break") {
        session = "Work";
        current = workDuration;
        alert("Break over! Back to work.");
      }
      updateDisplay();
      return;
    }
    current--;
    updateDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(interval);
  isRunning = false;
  updateDisplay(); // ensure arc updates when paused
}

function resetTimer() {
  pauseTimer();
  session = "Work";
  current = workDuration;
  updateDisplay();
}

function toggleEditTime() {
  if (setTimePanel.style.display === "none" || setTimePanel.style.display === "") {
    setTimePanel.style.display = "flex";
    editTimeBtn.textContent = "Close";
    pauseTimer(); // pause timer when editing
  } else {
    setTimePanel.style.display = "none";
    editTimeBtn.textContent = "Edit Time";
  }
}

function setCustomTimes() {
  const workInput = document.getElementById("work-min");
  const shortInput = document.getElementById("short-min");
  const longInput = document.getElementById("long-min");

  const workVal = parseInt(workInput.value);
  const shortVal = parseInt(shortInput.value);
  const longVal = parseInt(longInput.value);

  if (isNaN(workVal) || workVal < 1) {
    alert("Work time must be a positive number.");
    workInput.focus();
    return;
  }
  if (isNaN(shortVal) || shortVal < 1) {
    alert("Short break time must be a positive number.");
    shortInput.focus();
    return;
  }
  if (isNaN(longVal) || longVal < 1) {
    alert("Long break time must be a positive number.");
    longInput.focus();
    return;
  }

  workDuration = workVal * 60;
  shortBreak = shortVal * 60;
  longBreak = longVal * 60;

  if (session === "Work") current = workDuration;
  else if (session === "Short Break") current = shortBreak;
  else current = longBreak;

  updateDisplay();

  setTimePanel.style.display = "none";
  editTimeBtn.textContent = "Edit Time";
}

updateDisplay();
// ...existing code...