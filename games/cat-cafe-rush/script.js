const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const orderText = document.getElementById("order-text");
const orderPicture = document.getElementById("order-picture");
const patienceDisplay = document.getElementById("patience");
const gameMessage = document.getElementById("game-message");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const menuButtons = document.querySelectorAll(".menu-item");
const customer = document.getElementById("customer");
const cafePopup = document.getElementById("cafe-popup");

const menu = [
  { id: "matcha", name: "Matcha" },
  { id: "strawberry-milk", name: "Strawberry milk" },
  { id: "cake", name: "Cake" }
];

const roundDuration = 45000;

let score = 0;
let playing = false;
let transitioning = false;
let currentOrder = null;
let customerDuration = 8000;
let roundEndsAt = 0;
let customerLeavesAt = 0;

let timerId = null;
let popupTimerId = null;
let arrivalTimerId = null;

// Work out how long the next customer will wait.
function getCustomerDuration() {
  if (score >= 500) {
    return 4000;
  }

  if (score >= 400) {
    return 5000;
  }

  if (score >= 300) {
    return 6000;
  }

  if (score >= 200) {
    return 7000;
  }

  return 8000;
}

// Display a temporary message over the café.
function showPopup(message) {
  clearTimeout(popupTimerId);

  cafePopup.textContent = message;
  cafePopup.hidden = false;

  popupTimerId = setTimeout(() => {
    cafePopup.hidden = true;
  }, 1800);
}

// Enable or disable every menu button.
function setMenuEnabled(enabled) {
  menuButtons.forEach((button) => {
    button.disabled = !enabled;
  });
}

// Pick an order and set this customer's patience.
function nextCustomer() {
  const nextDuration = getCustomerDuration();

  if (nextDuration < customerDuration) {
    showPopup(
      `Café rush! Customers now wait ${nextDuration / 1000}s ⚡`
    );
  }

  customerDuration = nextDuration;

  const randomIndex = Math.floor(Math.random() * menu.length);
  currentOrder = menu[randomIndex];

  customerLeavesAt = Date.now() + customerDuration;

  orderText.textContent = `${currentOrder.name}, please!`;
  orderPicture.dataset.item = currentOrder.id;

  patienceDisplay.value = 100;
  patienceDisplay.classList.remove("missed");

  customer.classList.remove("leaving");
  transitioning = false;
  setMenuEnabled(true);
}

// Show the customer leaving before the next arrival.
function loseCustomer() {
  transitioning = true;
  setMenuEnabled(false);

  patienceDisplay.value = 0;
  patienceDisplay.classList.add("missed");
  customer.classList.add("leaving");

  orderText.textContent = "Maybe next time…";
  delete orderPicture.dataset.item;

  gameMessage.textContent = "Another customer is on their way.";
  showPopup("Customer left! 💔");

  arrivalTimerId = setTimeout(() => {
    if (playing === false) {
      return;
    }

    if (Date.now() >= roundEndsAt) {
      endGame();
      return;
    }

    nextCustomer();
    gameMessage.textContent = "A new customer is ready to order!";
  }, 650);
}

// Start a fresh round.
function startGame() {
  clearInterval(timerId);
  clearTimeout(popupTimerId);
  clearTimeout(arrivalTimerId);

  score = 0;
  playing = true;
  transitioning = false;
  customerDuration = 8000;
  roundEndsAt = Date.now() + roundDuration;

  cafePopup.hidden = true;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = roundDuration / 1000;

  gameMessage.textContent =
    "The café is open! Serve your first customer.";

  startButton.disabled = true;
  startButton.textContent = "Café open";
  startButton.hidden = true;
  restartButton.hidden = false;

  nextCustomer();

  timerId = setInterval(updateTimers, 100);
}

// Update the round clock and customer patience.
function updateTimers() {
  if (playing === false) {
    return false;
  }

  const now = Date.now();
  const roundRemaining = Math.max(0, roundEndsAt - now);

  timeDisplay.textContent = Math.ceil(roundRemaining / 1000);

  if (roundRemaining === 0) {
    endGame();
    return false;
  }

  // The round clock continues while customers change.
  if (transitioning) {
    return false;
  }

  const patienceRemaining = Math.max(0, customerLeavesAt - now);

  patienceDisplay.value =
    (patienceRemaining / customerDuration) * 100;

  if (patienceRemaining === 0) {
    loseCustomer();
    return false;
  }

  return true;
}

// Compare the served item with the current order.
function serveItem(itemId) {
  if (playing === false || transitioning) {
    return;
  }

  if (updateTimers() === false) {
    return;
  }

  if (itemId === currentOrder.id) {
    score = score + 10;
    scoreDisplay.textContent = score;

    nextCustomer();
    gameMessage.textContent = "Purrfect! +10 points 🐾";
  } else {
    customerLeavesAt = customerLeavesAt - 2000;

    gameMessage.textContent = "Check the order and try again!";
    showPopup("Wrong item! −2 seconds of patience 💔");

    updateTimers();
  }
}

// Finish the round and allow another game.
function endGame() {
  playing = false;
  transitioning = false;

  clearInterval(timerId);
  clearTimeout(arrivalTimerId);
  clearTimeout(popupTimerId);

  timerId = null;
  arrivalTimerId = null;
  popupTimerId = null;

  setMenuEnabled(false);

  cafePopup.hidden = true;
  customer.classList.remove("leaving");
  patienceDisplay.classList.remove("missed");

  timeDisplay.textContent = 0;
  patienceDisplay.value = 0;
  orderText.textContent = "Thanks for visiting!";
  delete orderPicture.dataset.item;

  gameMessage.textContent =
    `Café closed! You scored ${score} points.`;

  startButton.disabled = false;
  startButton.textContent = "Play again";
  startButton.hidden = false;
  restartButton.hidden = true;
}

// Connect the controls.
startButton.addEventListener("click", startGame);

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    serveItem(button.dataset.item);
  });
});

restartButton.addEventListener("click", startGame);