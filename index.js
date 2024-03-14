import {
  generateField,
  flagCell,
  addMines,
  openCell,
  CELL_STATES,
} from "./minesweeper.js";
import { switchTheme } from "./themeSwitcher.js";

// Game parameters
const FIELD_SIZE = 10;
const NUMBER_OF_MINES = 10;

const htmlEl = document.documentElement;
const page = document.querySelector(".page");

const msContainer = document.createElement("div");
const ms = document.createElement("div");
const msHeader = document.createElement("div");
const msFlagsLeftCounter = document.createElement("div");
const msFlagsLeftIcon = document.createElement("div");
const msStatusIcon = document.createElement("div");
const msHistoryIcon = document.createElement("div");
const msHistory = document.createElement("ul");
const msThemeIcon = document.createElement("div");
const msField = document.createElement("div");
const msMessage = document.createElement("div");
const msSeconds = document.createElement("div");
const msSound = document.createElement("div");
const msMoves = document.createElement("div");
const msFooter = document.createElement("div");

const soundStartGame = document.createElement("audio");
const soundFlag = document.createElement("audio");
const soundHistory = document.createElement("audio");
const soundOpenCell = document.createElement("audio");
const soundWin = document.createElement("audio");
const soundLose = document.createElement("audio");

let historyDisplayed = false;
let soundOn = true;

msSeconds.classList.add("ms__seconds");
msSound.classList.add("ms__sound");
msMoves.classList.add("ms__moves");
msFooter.classList.add("ms__footer");

ms.classList.add("ms");
msContainer.classList.add("ms-container");
msHeader.classList.add("ms__header");
msFlagsLeftCounter.classList.add("ms__flags-left");
msFlagsLeftIcon.classList.add("ms__flags-icon");
msStatusIcon.classList.add("ms__status-icon");
msHistoryIcon.classList.add("ms__history-icon");
msHistory.classList.add("ms__history");
msThemeIcon.classList.add("ms__theme-icon");
msField.classList.add("ms__field");
msMessage.classList.add("ms__message");
msField.style.gridTemplateColumns = `repeat(${FIELD_SIZE}, 1fr)`;

// Set sounds sources
soundStartGame.setAttribute("src", "./assets/sound/soundStartGame.wav");
soundFlag.setAttribute("src", "./assets/sound/soundFlag.wav");
soundHistory.setAttribute("src", "./assets/sound/soundHistory.mp3");
soundOpenCell.setAttribute("src", "./assets/sound/soundOpenCell.wav");
soundWin.setAttribute("src", "./assets/sound/soundWin.wav");
soundLose.setAttribute("src", "./assets/sound/soundLose.wav");

msFlagsLeftIcon.textContent = "🚩";
msHistoryIcon.textContent = "📜";
msSound.textContent = "🔇";

msFlagsLeftIcon.append(msFlagsLeftCounter);
msHeader.append(msFlagsLeftIcon, msStatusIcon, msHistoryIcon, msThemeIcon);
msFooter.append(msMoves, msSeconds, msSound);
ms.append(msHeader, msField, msHistory, msMessage, msFooter);
msContainer.append(ms);
page.append(msContainer);

// Set theme
if (localStorage.getItem("theme")) {
  htmlEl.setAttribute("theme", localStorage.getItem("theme"));
} else {
  htmlEl.setAttribute("theme", "light");
}

// Set initial theme icon
if (htmlEl.getAttribute("theme") === "light") msThemeIcon.textContent = "🌒";
else msThemeIcon.textContent = "☀️";

// Set timer
let timerId;
let seconds = 0;
msSeconds.textContent = `Seconds: ${seconds}`;

function playSound(s) {
  if (soundOn) s.play();
  else return;
}

function toggleSound() {
  soundOn = !soundOn;
  if (soundOn) {
    {
      msSound.textContent = "🔇";
    }
  } else {
    msSound.textContent = "🔊";
  }
}

function startTimer() {
  seconds = 0;
  timerId = setInterval(() => {
    seconds++;
    msSeconds.textContent = `Seconds: ${seconds}`;
  }, 1000);
}

function stopTimer(id, sec) {
  clearInterval(id);
  sec = 0;
  msSeconds.textContent = `Seconds: ${sec}`;
}

function startGame() {
  playSound(soundStartGame);

  let moves = 0;
  seconds = 0;
  msMoves.textContent = `Moves: ${moves}`;
  let minesPlaced = false;

  msField.innerHTML = "";
  msField.style.pointerEvents = "initial";
  msStatusIcon.textContent = "🙂";
  msFlagsLeftCounter.textContent = NUMBER_OF_MINES;
  msMessage.style.display = "none";
  msMessage.textContent = "";

  msHistory.style.display = "none";
  msField.style.display = "grid";
  historyDisplayed = false;

  function calcFlagsLeft() {
    const flagsPlaced = field.reduce((acc, rowArr) => {
      const flagsCountInARow = rowArr.filter(
        (c) => c.state === CELL_STATES.FLAGGED
      ).length;
      return acc + flagsCountInARow;
    }, 0);
    const flagsLeft = NUMBER_OF_MINES - flagsPlaced;

    return flagsLeft;
  }

  // Generate game field
  const field = generateField(FIELD_SIZE, NUMBER_OF_MINES);

  // Render: append all cells to game field
  field.forEach((row) => {
    row.forEach((cell) => {
      msField.append(cell.element);

      // Handle click on cell
      cell.element.addEventListener("click", () => {
        if (!minesPlaced) {
          addMines(field, NUMBER_OF_MINES, cell);
          minesPlaced = true;
        }

        if (cell.state === CELL_STATES.HIDDEN) {
          {
            moves++;
            msMoves.textContent = `Moves: ${moves}`;
          }
        }

        if (moves === 1) startTimer();

        openCell(
          cell,
          field,
          msField,
          msStatusIcon,
          msMessage,
          moves,
          timerId,
          seconds
        );
      });

      // Handle right click on cell
      cell.element.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        flagCell(cell, calcFlagsLeft());
        msFlagsLeftCounter.textContent = calcFlagsLeft();
      });
    });
  });
}

function toggleHistory() {
  const results = JSON.parse(localStorage.getItem("results")) || [];
  const mappedResults = results
    .map((res) => `<li>${res}</li>`)
    .reverse()
    .join("");

  playSound(soundHistory);

  if (results.length > 0) msHistory.innerHTML = mappedResults;
  else msHistory.textContent = "Your last 10 results will be displayed here...";

  if (results.length > 6) msHistory.style.justifyContent = "space-around";
  else msHistory.style.justifyContent = "flex-start";

  historyDisplayed = !historyDisplayed;
  if (historyDisplayed) {
    msField.style.display = "none";
    msHistory.style.display = "flex";
  } else {
    msHistory.style.display = "none";
    msField.style.display = "grid";
  }
}

startGame();

msStatusIcon.addEventListener("click", () => {
  startGame();
  stopTimer(timerId, seconds);
});

msThemeIcon.addEventListener("click", () => switchTheme(msThemeIcon));
msHistoryIcon.addEventListener("click", () => toggleHistory());
msSound.addEventListener("click", () => {
  toggleSound();
});

export {
  stopTimer,
  playSound,
  NUMBER_OF_MINES,
  soundOpenCell,
  soundFlag,
  soundWin,
  soundLose,
};
