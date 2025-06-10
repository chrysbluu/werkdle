const queenNames = Object.keys(queens);
let correctQueen = queenNames[Math.floor(Math.random() * queenNames.length)];
let tries = 0;
let maxTries = 5;
let streak = parseInt(localStorage.getItem("streak") || "0");
let highScore = parseInt(localStorage.getItem("highScore") || "0");
let dailyMode = false;

const countryFilter = document.getElementById("country-filter");
const datalist = document.getElementById("queen-options");

function updateQueenDatalist(selectedCountry) {
  datalist.innerHTML = "";
  Object.entries(queens)
    .filter(([name, data]) =>
      selectedCountry === "all" || data.country === selectedCountry
    )
    .forEach(([name]) => {
      const option = document.createElement("option");
      option.value = name;
      datalist.appendChild(option);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  // Setup initial datalist
  updateQueenDatalist("all");

  // Setup event listeners
  countryFilter.addEventListener("change", (e) => {
    updateQueenDatalist(e.target.value);
  });

  document.getElementById("submit-btn").addEventListener("click", submitGuess);
  document.getElementById("mode-toggle").addEventListener("click", toggleMode);
  document.getElementById("next-round-btn").addEventListener("click", nextRound);

  updateStats();
});

function updateStats() {
  document.getElementById("streak-info").innerText = `🔥 Streak: ${streak} | 🏆 High Score: ${highScore}`;
  document.getElementById("tries-left").innerText = `Tries: ${tries}/${maxTries}`;
}

function toggleMode() {
  dailyMode = !dailyMode;
  document.getElementById("mode-toggle").innerText = dailyMode ? "Switch to Endless Mode" : "Switch to Daily Mode";

  if (dailyMode) {
    const today = new Date().toISOString().split('T')[0];
    let seed = 0;
    for (let i = 0; i < today.length; i++) {
      seed += today.charCodeAt(i);
    }
    correctQueen = queenNames[seed % queenNames.length];
  } else {
    correctQueen = queenNames[Math.floor(Math.random() * queenNames.length)];
  }

  resetGame();
}

function resetGame() {
  tries = 0;
  document.getElementById("guess-input").value = "";
  document.querySelector("#guess-table tbody").innerHTML = "";
  document.getElementById("game-result").innerText = "";
  document.getElementById("next-round-btn").style.display = "none";
  updateStats();
}

function submitGuess() {
  const guess = document.getElementById("guess-input").value.trim();
  const tableBody = document.querySelector("#guess-table tbody");
  const result = document.getElementById("game-result");

  if (!queens[guess] || tries >= maxTries) return;

  const data = queens[guess];
  const correct = queens[correctQueen];

  const row = document.createElement("tr");

  // Image cell
const imgCell = document.createElement("td");
const img = document.createElement("img");

if (data.image && typeof data.image === "string" && data.image.trim() !== "") {
  img.src = data.image;
} else {
  // fallback to placeholder
  img.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
}

img.alt = guess;
img.className = "queen-img";
imgCell.appendChild(img);
row.appendChild(imgCell);


  // Name cell
  const nameCell = document.createElement("td");
  nameCell.textContent = guess;
  row.appendChild(nameCell);

  // Attributes to show with arrow hints
  ["season", "placement", "country"].forEach((attr) => {
    const cell = document.createElement("td");
    let value = data[attr];
    const correctValue = correct[attr];

    // Add arrows for season and placement
    if (attr === "season") {
      const guessedNum = parseInt(value.replace(/[^\d]/g, ""));
      const correctNum = parseInt(correctValue.replace(/[^\d]/g, ""));
      if (guessedNum > correctNum) {
        value += " ⬇️";
      } else if (guessedNum < correctNum) {
        value += " ⬆️";
      }
    }

    if (attr === "placement") {
      // handle cases like "3/4"
      const parsePlacement = (p) => {
        if (p.includes("/")) {
          return Math.min(...p.split("/").map(Number));
        }
        return parseInt(p);
      };
      const guessedNum = parsePlacement(value);
      const correctNum = parsePlacement(correctValue);

      if (guessedNum > correctNum) {
        value += " ⬆️"; // lower placement number = better rank
      } else if (guessedNum < correctNum) {
        value += " ⬇️";
      }
    }

    // Set background color based on raw value comparison (without arrows)
    if (data[attr] === correctValue) {
      cell.style.backgroundColor = "#90ee90"; // green
      cell.classList.add("correct");
    } else {
      cell.style.backgroundColor = "#f08080"; // red
      cell.classList.add("incorrect");
    }

    cell.textContent = value;
    row.appendChild(cell);
  });

  tableBody.appendChild(row);

  tries++;
  updateStats();

  if (guess === correctQueen) {
    result.innerText = "🎉 Correct! You win!";
    if (dailyMode) {
      streak++;
      if (streak > highScore) highScore = streak;
    }
    localStorage.setItem("streak", streak);
    localStorage.setItem("highScore", highScore);
  } else if (tries >= maxTries) {
    result.innerText = `😢 Out of tries! It was ${correctQueen}`;
    if (dailyMode) streak = 0;
    localStorage.setItem("streak", streak);
  }

  if (guess === correctQueen || tries >= maxTries) {
    if (!dailyMode) {
      document.getElementById("next-round-btn").style.display = "inline-block";
    }
  }

  document.getElementById("guess-input").value = "";
}


function nextRound() {
  correctQueen = queenNames[Math.floor(Math.random() * queenNames.length)];
  resetGame();
}
