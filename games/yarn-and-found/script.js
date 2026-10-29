const cardGrid = document.getElementById("card-grid");
const movesDisplay = document.getElementById("moves");
const pairsDisplay = document.getElementById("pairs");
const pairProgress = document.getElementById("pair-progress");
const bestScoreDisplay = document.getElementById("best-score");
const gameMessage = document.getElementById("game-message");
const newGameButton = document.getElementById("new-game-button");

const craftItems = [
  { id: "yarn", name: "Sage yarn ball" },
  { id: "hook", name: "Crochet hook" },
  { id: "mitten", name: "Pink mitten" },
  { id: "thread", name: "Lilac thread" },
  { id: "scissors", name: "Embroidery scissors" },
  { id: "hoop", name: "Flower embroidery hoop" }
];

const storageKey = "yarn-and-found-best";

let firstCard = null;
let secondCard = null;
let boardLocked = false;
let moves = 0;
let pairs = 0;
let bestScore = null;
let flipBackTimer = null;

// Shuffle a copy of the array using Fisher–Yates.
function shuffleCards(cards) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    const temporaryCard = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = temporaryCard;
  }

  return shuffled;
}

// Read the best score saved in this browser.
function loadBestScore() {
  try {
    const savedScore = localStorage.getItem(storageKey);

    if (savedScore === null) {
      return;
    }

    const parsedScore = Number(savedScore);

    if (Number.isInteger(parsedScore) && parsedScore >= 6) {
      bestScore = parsedScore;
    }
  } catch (error) {
    console.warn("The best score could not be loaded.", error);
  }
}

function saveBestScore() {
  try {
    localStorage.setItem(storageKey, String(bestScore));
  } catch (error) {
    console.warn("The best score could not be saved.", error);
  }
}

function updateStatistics() {
  movesDisplay.textContent = moves;
  pairsDisplay.textContent = pairs;
  pairProgress.value = pairs;

  bestScoreDisplay.textContent =
    bestScore === null ? "—" : `${bestScore} moves`;
}

// Create a button for one card.
function createCard(item, index) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "memory-card";
  button.dataset.item = item.id;
  button.dataset.name = item.name;
  button.dataset.position = index + 1;

  button.setAttribute(
    "aria-label",
    `Card ${index + 1}, face down`
  );

  button.addEventListener("click", () => {
    flipCard(button);
  });

  return button;
}

// Build a fresh board and reset the round.
function startGame() {
  clearTimeout(flipBackTimer);
  flipBackTimer = null;

  firstCard = null;
  secondCard = null;
  boardLocked = false;
  moves = 0;
  pairs = 0;

  // Two copies of six items make twelve cards.
  const deck = shuffleCards([...craftItems, ...craftItems]);

  cardGrid.replaceChildren();

  deck.forEach((item, index) => {
    const button = createCard(item, index);
    cardGrid.appendChild(button);
  });

  updateStatistics();

  gameMessage.textContent =
    "Turn over two cards to find a matching pair.";
}

// Reveal a card, then compare when two are open.
function flipCard(button) {
  if (
    boardLocked ||
    button === firstCard ||
    button.classList.contains("is-matched")
  ) {
    return;
  }

  button.classList.add("is-flipped");
  button.setAttribute(
    "aria-label",
    `Card ${button.dataset.position}: ${button.dataset.name}`
  );

  if (firstCard === null) {
    firstCard = button;
    gameMessage.textContent = "Now find its matching pair.";
    return;
  }

  secondCard = button;
  moves = moves + 1;
  updateStatistics();

  checkForMatch();
}

function checkForMatch() {
  if (firstCard.dataset.item === secondCard.dataset.item) {
    keepMatchingPair();
  } else {
    hideUnmatchedPair();
  }
}

// Matching cards stay visible.
function keepMatchingPair() {
  [firstCard, secondCard].forEach((button) => {
    button.classList.add("is-matched");
    button.setAttribute(
      "aria-label",
      `${button.dataset.name}, matched`
    );
    button.disabled = true;
  });

  pairs = pairs + 1;

  firstCard = null;
  secondCard = null;

  updateStatistics();

  if (pairs === craftItems.length) {
    finishGame();
  } else {
    gameMessage.textContent = "A perfect pair! Keep going 🌷";
  }
}

// Pause so the player can see both cards before hiding them.
function hideUnmatchedPair() {
  boardLocked = true;
  gameMessage.textContent = "Not quite a pair. Remember those two!";

  flipBackTimer = setTimeout(() => {
    [firstCard, secondCard].forEach((button) => {
      button.classList.remove("is-flipped");
      button.setAttribute(
        "aria-label",
        `Card ${button.dataset.position}, face down`
      );
    });

    firstCard = null;
    secondCard = null;
    boardLocked = false;
    flipBackTimer = null;

    gameMessage.textContent = "Try another pair 🧶";
  }, 1000);
}

function finishGame() {
  boardLocked = true;

  if (bestScore === null || moves < bestScore) {
    bestScore = moves;
    saveBestScore();

    gameMessage.textContent =
      `All six pairs found in ${moves} moves! A new personal best 🌟`;
  } else {
    gameMessage.textContent =
      `All six pairs found in ${moves} moves! Lovely work 🌷`;
  }

  updateStatistics();
}

newGameButton.addEventListener("click", startGame);

loadBestScore();
startGame();