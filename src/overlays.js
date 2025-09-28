class OverlayManager {
  constructor() {
    this.overlays = new Map();
    this.createOverlays();
  }

  createOverlays() {
    this.createStartScreen();
    this.createInstructionsScreen();
    this.createPauseScreen();
    this.createGameOverScreen();
  }

  createShootingStars() {
    const shootingStarsContainer = document.createElement("div");
    shootingStarsContainer.className = "shooting-stars";

    for (let i = 1; i <= 8; i++) {
      const star = document.createElement("div");
      star.className = "shooting-star";
      shootingStarsContainer.appendChild(star);
    }

    return shootingStarsContainer;
  }

  createStartScreen() {
    const startScreen = document.createElement("div");
    startScreen.id = "startScreen";
    startScreen.className = "start-screen";

    startScreen.innerHTML = `
      <div class="content-wrapper">
        <h1 class="game-title">ESCAPE YONDU</h1>
        <p class="game-subtitle">
          Navigate through the maze and avoid the arrow at all cost.<br />
          Can you escape Yondu's wrath?
        </p>
        <div class="actions">
          <button id="startButton" class="start-button">Start Game</button>
          <div class="difficulty-select">
            <label for="difficulty">Choose difficulty:</label>
            <select name="difficulty" id="difficulty"></select>
          </div>
          <a href="#" id="instructionsLink" class="instructions-link">Instructions</a>
        </div>
      </div>
    `;

    const shootingStars = this.createShootingStars();
    startScreen.appendChild(shootingStars);

    const bgCanvas = document.createElement("canvas");
    bgCanvas.className = "bg-canvas";
    startScreen.appendChild(bgCanvas);

    document.body.appendChild(startScreen);
    this.overlays.set("start", startScreen);
  }

  createInstructionsScreen() {
    const instructionsScreen = document.createElement("div");
    instructionsScreen.id = "instructionsScreen";
    instructionsScreen.className = "instructions-screen hidden";

    instructionsScreen.innerHTML = `
      <div class="instructions-wrapper">
        <div class="instructions-header">
          <h2>HOW TO PLAY</h2>
          <button id="closeInstructions" class="close-button">&times;</button>
        </div>
        <div class="instructions-content">
          <div class="instruction-section">
            <h3>Objective</h3>
            <p>Navigate through the maze to reach the exit while avoiding Yondu's deadly arrow. Your goal is to escape alive!</p>
          </div>

          <div class="instruction-section">
            <h3>Desktop Controls</h3>
            <div class="controls-grid">
              <div class="control-item">
                <kbd>W</kbd> <kbd>↑</kbd>
                <span>Move Up</span>
              </div>
              <div class="control-item">
                <kbd>A</kbd> <kbd>←</kbd>
                <span>Move Left</span>
              </div>
              <div class="control-item">
                <kbd>S</kbd> <kbd>↓</kbd>
                <span>Move Down</span>
              </div>
              <div class="control-item">
                <kbd>D</kbd> <kbd>→</kbd>
                <span>Move Right</span>
              </div>
              <div class="control-item">
                <kbd>ESC</kbd>
                <span>Pause Game</span>
              </div>
            </div>
          </div>

          <div class="instruction-section">
            <h3>Mobile Controls</h3>
            <ul>
              <li><strong>Use D-Pad to Move:</strong> Simply use the d-pad to move the character</li>
              <li><strong>Lift to Stop:</strong> Lift your finger from the d-pad to stop moving</li>
              <li><strong>Landscape Mode:</strong> For the best experience, rotate your device to landscape orientation</li>
              <li><strong>Action Buttons:</strong> When the game ends, use the "Play Again" or "Main Menu" buttons that appear</li>
            </ul>
          </div>

          <div class="instruction-section">
            <h3>Difficulty Levels</h3>
            <div class="difficulty-info">
              <div class="diff-item easy">
                <strong>Easy:</strong> Wider corridors and more shortcuts. Great for beginners and mobile players!
              </div>
              <div class="diff-item normal">
                <strong>Normal:</strong> Balanced challenge with some strategic shortcuts.
              </div>
              <div class="diff-item hard">
                <strong>Hard:</strong> Pure maze challenge - no shortcuts, tight corridors.
              </div>
            </div>
          </div>

          <div class="instruction-section">
            <h3>Tips</h3>
            <ul>
              <li>You have a five seconds head start, use it to your advantage</li>
              <li>Study the maze layout before rushing to the exit</li>
              <li>The game automatically pauses when you switch apps or tabs</li>
              <li>Use the pause feature if you need a break</li>
            </ul>
          </div>
        </div>
        <div class="instructions-footer">
          <button id="backToMenu" class="back-button">Back to Menu</button>
        </div>
      </div>
    `;

    const shootingStars = this.createShootingStars();
    instructionsScreen.appendChild(shootingStars);

    document.body.appendChild(instructionsScreen);
    this.overlays.set("instructions", instructionsScreen);
  }

  createPauseScreen() {
    const pauseScreen = document.createElement("div");
    pauseScreen.id = "pauseScreen";
    pauseScreen.className = "pause-screen hidden";

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      navigator.maxTouchPoints > 1 ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth <= 768;

    if (isMobile) {
      pauseScreen.innerHTML = `
        <div>
          <h2>GAME PAUSED</h2>
          <div class="mobile-overlay-buttons">
            <button id="resumeGameButton" class="mobile-overlay-button">Resume Game</button>
            <button id="pauseMainMenuButton" class="mobile-overlay-button">Main Menu</button>
          </div>
        </div>
      `;
    } else {
      pauseScreen.innerHTML = `
        <div>
          <h2>GAME PAUSED</h2>
          <p>Press <span>ESC</span> or <span>SPACE</span> to resume</p>
        </div>
      `;
    }

    document.body.appendChild(pauseScreen);
    this.overlays.set("pause", pauseScreen);
  }

  createGameOverScreen() {
    const gameOverScreen = document.createElement("div");
    gameOverScreen.id = "gameOverScreen";
    gameOverScreen.className = "game-over-screen hidden";

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;

    if (isMobile) {
      gameOverScreen.innerHTML = `
        <div>
          <h2>GAME OVER</h2>
          <div class="mobile-overlay-buttons">
            <button id="playAgainButton" class="mobile-overlay-button">Play Again</button>
            <button id="gameOverMainMenuButton" class="mobile-overlay-button">Main Menu</button>
          </div>
        </div>
      `;
    } else {
      gameOverScreen.innerHTML = `
        <div>
          <h2>GAME OVER</h2>
          <p>Press <span>SPACE</span> to play again or <span>ESC</span> for main menu</p>
        </div>
      `;
    }

    document.body.appendChild(gameOverScreen);
    this.overlays.set("gameOver", gameOverScreen);
  }

  showOverlay(type) {
    const overlay = this.overlays.get(type);
    if (overlay) {
      overlay.classList.remove("hidden");
    }
  }

  hideOverlay(type) {
    const overlay = this.overlays.get(type);
    if (overlay) {
      overlay.classList.add("hidden");
    }
  }

  hideAllOverlays() {
    this.overlays.forEach((overlay) => {
      overlay.classList.add("hidden");
    });
  }

  getOverlay(type) {
    return this.overlays.get(type);
  }

  updateOverlayContent(type, content) {
    const overlay = this.overlays.get(type);
    if (overlay) {
      const h2 = overlay.querySelector("h2");
      const p = overlay.querySelector("p");

      if (h2 && content.title) {
        h2.textContent = content.title;
      }

      if (p && content.message) {
        p.innerHTML = content.message;
      }
    }
  }

  showVictory() {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;

    if (isMobile) {
      this.updateOverlayContent("gameOver", {
        title: "VICTORY!",
        message: "",
      });
    } else {
      this.updateOverlayContent("gameOver", {
        title: "VICTORY!",
        message:
          "Press <span>SPACE</span> to play again or <span>ESC</span> for main menu",
      });
    }
    this.showOverlay("gameOver");
  }

  showGameOver() {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;

    if (isMobile) {
      this.updateOverlayContent("gameOver", {
        title: "YOU GOT CAUGHT!",
        message: "",
      });
    } else {
      this.updateOverlayContent("gameOver", {
        title: "YOU GOT CAUGHT!",
        message:
          "Press <span>SPACE</span> to play again or <span>ESC</span> for main menu",
      });
    }
    this.showOverlay("gameOver");
  }

  showPause() {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;

    if (isMobile) {
      this.updateOverlayContent("pause", {
        title: "GAME PAUSED",
        message: "",
      });
    } else {
      this.updateOverlayContent("pause", {
        title: "GAME PAUSED",
        message: "Press <span>ESC</span> or <span>SPACE</span> to resume",
      });
    }
    this.showOverlay("pause");
  }

  showInstructions() {
    this.showOverlay("instructions");
  }

  setupInstructionsListeners(game) {
    const instructionsLink = document.getElementById("instructionsLink");
    const closeInstructions = document.getElementById("closeInstructions");
    const backToMenu = document.getElementById("backToMenu");

    if (instructionsLink) {
      instructionsLink.addEventListener("click", (e) => {
        e.preventDefault();
        game.showInstructions();
      });
    }

    if (closeInstructions) {
      closeInstructions.addEventListener("click", () => {
        game.hideInstructions();
      });
    }

    if (backToMenu) {
      backToMenu.addEventListener("click", () => {
        game.hideInstructions();
      });
    }

    this.setupMobileOverlayListeners(game);
  }

  setupMobileOverlayListeners(game) {
    const resumeButton = document.getElementById("resumeGameButton");
    if (resumeButton) {
      resumeButton.addEventListener("click", () => {
        game.resumeGame();
      });
    }

    const pauseMainMenuButton = document.getElementById("pauseMainMenuButton");
    if (pauseMainMenuButton) {
      pauseMainMenuButton.addEventListener("click", () => {
        game.cleanup();
        game.showStartScreen();
      });
    }

    const playAgainButton = document.getElementById("playAgainButton");
    if (playAgainButton) {
      playAgainButton.addEventListener("click", () => {
        game.cleanup();
        game.startGame();
      });
    }

    const gameOverMainMenuButton = document.getElementById(
      "gameOverMainMenuButton"
    );
    if (gameOverMainMenuButton) {
      gameOverMainMenuButton.addEventListener("click", () => {
        game.cleanup();
        game.showStartScreen();
      });
    }
  }
}
