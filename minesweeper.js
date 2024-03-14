const CELL_STATES = {
  HIDDEN: "hidden",
  FLAGGED: "flagged",
  MINED: "mined",
  EMPTY: "empty",
};

import {
  stopTimer,
  NUMBER_OF_MINES,
  playSound,
  soundFlag,
  soundOpenCell,
  soundWin,
  soundLose,
} from "./index.js";

let results = JSON.parse(localStorage.getItem("results")) || [];

function generateField(fieldSize) {
  const field = [];

  for (let x = 0; x < fieldSize; x++) {
    const row = [];

    for (let y = 0; y < fieldSize; y++) {
      const element = document.createElement("div");
      element.classList.add("ms__cell");
      element.dataset.state = CELL_STATES.HIDDEN;

      const cell = {
        x,
        y,
        element,
        mined: false,

        get state() {
          return this.element.dataset.state;
        },

        set state(state) {
          this.element.dataset.state = state;
        },
      };

      row.push(cell);
    }

    field.push(row);
  }

  return field;
}

function flagCell(c, flagsLeft) {
  if (c.state === CELL_STATES.HIDDEN) {
    if (flagsLeft > 0) {
      c.state = CELL_STATES.FLAGGED;
      c.element.textContent = "🚩";
      playSound(soundFlag);
    }
  } else if (c.state === CELL_STATES.FLAGGED) {
    c.state = CELL_STATES.HIDDEN;
    c.element.textContent = "";
    playSound(soundFlag);
  }
}

function addMines(field, numOfMines, clickedCell) {
  let minesPlaced = 0;

  // Place mine in a random cell of a randomly picked row
  while (minesPlaced < numOfMines) {
    const rndRowNum = getRandomNumber(0, field.length - 1);
    const rndColNum = getRandomNumber(
      0,
      field[getRandomNumber(0, field.length - 1)].length - 1
    );
    if (
      field[rndRowNum][rndColNum].mined !== true &&
      field[rndRowNum][rndColNum] !== clickedCell
    ) {
      field[rndRowNum][rndColNum].mined = true;
      minesPlaced++;
    }
  }
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function openCell(
  cell,
  field,
  fieldEl,
  statusIconEl,
  msg,
  movesCount,
  timerId,
  sec
) {
  if (cell.state === CELL_STATES.HIDDEN) {
    // Open mined cell
    if (cell.mined) {
      endGame(field, fieldEl, statusIconEl, msg, timerId, sec);
    } else {
      // Open not mined cell
      cell.state = CELL_STATES.EMPTY;

      const adjacentCells = findAdjacentCells(field, cell);
      const adjacentMinedCells = adjacentCells.filter((c) => c.mined);

      if (adjacentMinedCells.length !== 0) {
        cell.element.textContent = adjacentMinedCells.length;
      } else if (adjacentMinedCells.length === 0) {
        adjacentCells.forEach((c) => {
          openCell(
            c,
            field,
            fieldEl,
            statusIconEl,
            msg,
            movesCount,
            timerId,
            sec
          );
        });
      }

      handleDigitColors(cell);
      playSound(soundOpenCell);

      // Check win
      checkGameWin(field, fieldEl, statusIconEl, msg, movesCount, timerId, sec);
    }
  }
  return;
}

function handleDigitColors(cell) {
  switch (cell.element.textContent) {
    case "1":
      cell.element.style.color = "var(--color-bombs-1)";
      break;
    case "2":
      cell.element.style.color = "var(--color-bombs-2)";
      break;
    case "3":
      cell.element.style.color = "var(--color-bombs-3)";
      break;
    case "4":
      cell.element.style.color = "var(--color-bombs-4)";
      break;
    case "5":
      cell.element.style.color = "var(--color-bombs-5)";
      break;
    case "6":
      cell.element.style.color = "var(--color-bombs-6)";
      break;
    case "7":
      cell.element.style.color = "var(--color-bombs-7)";
      break;
    case "8":
      cell.element.style.color = "var(--color-bombs-8)";
      break;
    default:
      return;
  }
}

function findAdjacentCells(field, cell) {
  let adjacentCells = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    for (let colOffset = -1; colOffset <= 1; colOffset++) {
      const adjacentCell = field?.[cell.x + rowOffset]?.[cell.y + colOffset];
      adjacentCells.push(adjacentCell);
    }
  }

  adjacentCells = adjacentCells.filter((c) => c !== undefined && c !== cell);

  return adjacentCells;
}

function endGame(field, fieldEl, statusIconEl, msg, timerId, sec) {
  playSound(soundLose);

  field.forEach((row) =>
    row.forEach((cell) => {
      if (cell.mined) {
        cell.state = CELL_STATES.MINED;
        cell.element.textContent = "💣";
        stopTimer(timerId, sec);
      }
    })
  );
  fieldEl.style.pointerEvents = "none";
  statusIconEl.textContent = "💀";
  msg.style.display = "block";
  msg.textContent = "Game over. Try again!";
  storeResults(false);
}

function checkGameWin(
  gameField,
  fieldEl,
  statusIconEl,
  msg,
  movesCount,
  timerId,
  sec
) {
  // If every (not mined) cell is EMPTY or (mined) cell is HIDDEN or FLAGGED -- game won
  const gameWon = gameField.every((row) =>
    row.every(
      (c) =>
        c.state === CELL_STATES.EMPTY ||
        ((c.state === CELL_STATES.HIDDEN || c.state === CELL_STATES.FLAGGED) &&
          c.mined === true)
    )
  );

  if (gameWon) {
    fieldEl.style.pointerEvents = "none";
    statusIconEl.textContent = "🎉";
    stopTimer(timerId);
    msg.style.display = "block";
    msg.textContent = `You found all ${NUMBER_OF_MINES} mines in ${sec} seconds and ${movesCount} moves!`;
    storeResults(true, NUMBER_OF_MINES, sec, movesCount);
    playSound(soundWin);
  }
}

function storeResults(gameWon, NUMBER_OF_MINES, sec, movesCount) {
  if (results.length === 10) results.shift();

  if (gameWon) {
    results.push(`🎉 ${NUMBER_OF_MINES} mines, ${sec}s, ${movesCount} moves`);
    localStorage.setItem("results", JSON.stringify(results));
  } else {
    results.push(`💀`);
    localStorage.setItem("results", JSON.stringify(results));
  }
}

export { generateField, flagCell, addMines, openCell, CELL_STATES };
