const potButtons = document.querySelectorAll(".plant-pot");
const waterCountDisplay = document.getElementById("water-count");
const resetButton = document.getElementById("reset-button");
const gameMessage = document.getElementById("game-message");
const gardenProgress = document.getElementById("garden-progress");
const seedTool = document.getElementById("seed-tool");
const waterTool = document.getElementById("water-tool");

const storageKey = "tiny-windowsill-garden";

const plants = [
  { planted: false, waterCount: 0 },
  { planted: false, waterCount: 0 },
  { planted: false, waterCount: 0 }
];

let selectedTool = "seed";

// Store plant data as text in this browser.
function saveGarden() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(plants));
  } catch (error) {
    console.warn("Your browser could not save the garden.", error);
  }
}

// Restore a previously saved garden.
function loadGarden() {
  try {
    const savedText = localStorage.getItem(storageKey);

    if (savedText === null) {
      return;
    }

    const savedPlants = JSON.parse(savedText);

    // Check the saved data before using it.
    const validGarden =
      Array.isArray(savedPlants) &&
      savedPlants.length === plants.length &&
      savedPlants.every((plant) => {
        return (
          plant !== null &&
          typeof plant.planted === "boolean" &&
          Number.isInteger(plant.waterCount) &&
          plant.waterCount >= 0 &&
          plant.waterCount <= 6 &&
          (plant.planted || plant.waterCount === 0)
        );
      });

    if (validGarden === false) {
      return;
    }

    savedPlants.forEach((savedPlant, index) => {
      plants[index].planted = savedPlant.planted;
      plants[index].waterCount = savedPlant.waterCount;
    });
  } catch (error) {
    console.warn("The saved garden could not be loaded.", error);
  }
}

// Update every pot and the progress counter from our plant data.
function renderGarden() {
  potButtons.forEach((button, index) => {
    const plant = plants[index];

    if (plant.waterCount >= 6) {
      button.style.backgroundPosition = "100% 0%";
    } else if (plant.waterCount >= 4) {
      button.style.backgroundPosition = "66.666667% 0%";
    } else if (plant.waterCount >= 3) {
      button.style.backgroundPosition = "33.333333% 0%";
    } else {
      button.style.backgroundPosition = "0% 0%";
    }

    button.disabled = plant.waterCount >= 6;

    let label = `Plant seeds in pot ${index + 1}`;

    if (plant.waterCount >= 6) {
      label = `Plant ${index + 1} is fully bloomed`;
    } else if (plant.planted) {
      label = `Water plant ${index + 1}`;
    }

    button.setAttribute("aria-label", label);
  });

  const bloomedPlants = plants.filter((plant) => {
    return plant.waterCount >= 6;
  });

  gardenProgress.textContent =
    `Flowers bloomed: ${bloomedPlants.length} / ${plants.length}`;

  if (bloomedPlants.length === plants.length) {
    gameMessage.textContent = "Your whole windowsill is blooming! 🌸";
  }
}

function selectTool(tool) {
  selectedTool = tool;

  seedTool.setAttribute("aria-pressed", tool === "seed");
  waterTool.setAttribute("aria-pressed", tool === "water");

  if (tool === "seed") {
    gameMessage.textContent = "Click an empty pot to plant a seed 🌱";
  } else {
    gameMessage.textContent = "Click a planted pot to water it 💧";
  }

  renderGarden();
}

seedTool.addEventListener("click", () => {
  selectTool("seed");
});

waterTool.addEventListener("click", () => {
  selectTool("water");
});

potButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    const plant = plants[index];

    if (selectedTool === "seed") {
      if (plant.planted) {
        gameMessage.textContent =
          "This pot already has seeds. Choose the watering can 💧";
        return;
      }

      plant.planted = true;

      waterCountDisplay.textContent =
        `Pot ${index + 1} · Seed planted · Times watered: 0`;

      gameMessage.textContent =
        "Seed planted! Plant another or choose the watering can 🌱";

      saveGarden();
      renderGarden();
      return;
    }

    if (plant.planted === false) {
      gameMessage.textContent = "Plant a seed in this pot first 🌱";
      return;
    }

    showWatering(button);
    plant.waterCount = plant.waterCount + 1;

    waterCountDisplay.textContent =
      `Pot ${index + 1} · Times watered: ${plant.waterCount}`;

    if (plant.waterCount === 6) {
      gameMessage.textContent = "A new flower has bloomed! 🌸";
    } else {
      gameMessage.textContent = "A little care goes a long way 💧";
    }

    saveGarden();
    renderGarden();
  });
});

resetButton.addEventListener("click", () => {
  plants.forEach((plant) => {
    plant.planted = false;
    plant.waterCount = 0;
  });

  potButtons.forEach((button) => {
    button.classList.remove("watering");
  });

  waterCountDisplay.textContent = "Choose a pot to plant a seed 🌱";

  saveGarden();
  selectTool("seed");
});

function showWatering(button) {
  button.classList.add("watering");

  setTimeout(() => {
    button.classList.remove("watering");
  }, 500);
}

// Restore the garden, then display it.
loadGarden();

waterCountDisplay.textContent = "Your garden is ready 🌱";
selectTool("seed");