class Game {
  constructor() {
    this.gameState = "start";
    this.difficulty = "normal";
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.isMobile = this.detectMobile();

    this.overlayManager = new OverlayManager();

    this.startScreen = this.overlayManager.getOverlay("start");
    this.instructionsScreen = this.overlayManager.getOverlay("instructions");
    this.pauseScreen = this.overlayManager.getOverlay("pause");
    this.gameOverScreen = this.overlayManager.getOverlay("gameOver");

    this.startButton = document.getElementById("startButton");
    this.difficultyDropdown = document.getElementById("difficulty");

    this.mobileControls = document.querySelector(".mobile-controls");
    this.mobileOverlayControls = document.querySelector(
      ".mobile-overlay-controls"
    );

    this.player = null;
    this.maze = null;
    this.arrow = null;

    this.animationId = null;
    this.lastTime = 0;

    this.init();
  }

  detectMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      window.innerWidth <= 768 ||
      "ontouchstart" in window
    );
  }

  init() {
    this.setupEventListeners();
    this.setupMobileUI();
    this.overlayManager.setupInstructionsListeners(this);
    this.showStartScreen();
  }

  setupMobileUI() {
    if (!this.isMobile) {
      return;
    }

    this.createMobileControlsHTML();

    if (!this.mobileButtonsInitialized) {
      this.setupMobileButtons();
      this.mobileButtonsInitialized = true;
    }
  }

  createMobileControlsHTML() {
    if (document.querySelector(".mobile-controls")) {
      return;
    }

    const mobileControlsHTML = `
      <div class="mobile-controls">
        <div class="virtual-dpad">
          <div class="dpad-container">
            <div class="dpad-button dpad-up">↑</div>
            <div class="dpad-button dpad-down">↓</div>
            <div class="dpad-button dpad-left">←</div>
            <div class="dpad-button dpad-right">→</div>
          </div>
        </div>
        <div class="mobile-game-buttons">
          <button class="mobile-btn pause" id="mobilePause">⏸</button>
        </div>
      </div>
    `;

    const canvasContainer = document.querySelector(".canvas-container");
    if (canvasContainer) {
      canvasContainer.insertAdjacentHTML("beforeend", mobileControlsHTML);

      this.mobileControls = document.querySelector(".mobile-controls");
      this.mobileOverlayControls = document.querySelector(
        ".mobile-overlay-controls"
      );
    }
  }

  setupMobileButtons() {
    const pauseBtn = document.getElementById("mobilePause");
    const menuBtn = document.getElementById("mobileMenu");
    const replayBtn = document.getElementById("mobileReplay");
    const backBtn = document.getElementById("mobileBack");

    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        if (this.gameState === "playing") {
          this.pauseGame();
        } else if (this.gameState === "paused") {
          this.resumeGame();
        }
      });
    }

    if (menuBtn) {
      menuBtn.addEventListener("click", () => {
        this.cleanup();
        this.showStartScreen();
      });
    }

    if (replayBtn) {
      replayBtn.addEventListener("click", () => {
        if (this.gameState === "victory" || this.gameState === "gameOver") {
          this.cleanup();
          this.startGame();
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (this.gameState === "victory" || this.gameState === "gameOver") {
          this.cleanup();
          this.showStartScreen();
        }
      });
    }
  }

  showMobileControls() {
    if (this.isMobile && this.mobileControls) {
      this.mobileControls.classList.add("active");
    }
  }

  hideMobileControls() {
    if (this.mobileControls) {
      this.mobileControls.classList.remove("active");
    }
  }

  showMobileOverlayControls() {
    if (this.isMobile && this.mobileOverlayControls) {
      this.mobileOverlayControls.classList.add("active");
    }
  }

  hideMobileOverlayControls() {
    if (this.mobileOverlayControls) {
      this.mobileOverlayControls.classList.remove("active");
    }
  }

  setupEventListeners() {
    if (this.startButton) {
      this.startButton.addEventListener("click", () => {
        this.startGame();
      });
    }

    document.addEventListener("keydown", (e) => this.handleMenuKeys(e));
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("blur", () => this.handleWindowBlur());

    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });

    window.addEventListener("resize", () => {
      this.handleResize();
    });
  }

  handleOrientationChange() {
    if (this.gameState === "playing") {
      this.resizeCanvas();
    }
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = this.detectMobile();

    if (this.isMobile) {
      this.setupMobileUI();
    } else if (wasMobile) {
      this.hideMobileControls();
      this.hideMobileOverlayControls();
    }
  }

  resizeCanvas() {
    if (this.gameState === "playing") {
      this.render();
    }
  }

  handleMenuKeys(e) {
    switch (this.gameState) {
      case "start":
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          this.startGame();
        }
        break;
      case "instructions":
        if (e.code === "Escape") {
          e.preventDefault();
          this.hideInstructions();
        }
        break;
      case "playing":
        if (e.code === "Escape") {
          e.preventDefault();
          this.pauseGame();
        }
        break;
      case "paused":
        if (e.code === "Escape" || e.code === "Space") {
          e.preventDefault();
          this.resumeGame();
        }
        break;
      case "victory":
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          this.cleanup();
          this.startGame();
        }
        if (e.code === "Escape") {
          e.preventDefault();
          this.cleanup();
          this.showStartScreen();
        }
        break;
      case "gameOver":
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          this.cleanup();
          this.startGame();
        }
        if (e.code === "Escape") {
          e.preventDefault();
          this.cleanup();
          this.showStartScreen();
        }
        break;
    }
  }

  handleWindowBlur() {
    if (this.gameState === "playing") {
      this.pauseGame();
    }
  }

  startGame() {
    this.gameState = "playing";
    this.overlayManager.hideAllOverlays();
    this.hideMobileOverlayControls();
    this.showMobileControls();
    this.initializeGameObjects();
    this.lastTime = performance.now();
    this.gameLoop();
  }

  initializeGameObjects() {
    this.difficulty = this.difficultyDropdown.value;

    this.maze = new Maze(this.ctx, this.difficulty);

    this.player = new Player(this.ctx, this.difficulty);

    const startPos = this.maze.getPlayerStartPosition();
    this.player.x = startPos.x;
    this.player.y = startPos.y;

    this.arrow = new Arrow(this.ctx, this.maze, this.difficulty);
  }

  pauseGame() {
    if (this.gameState !== "playing") return;
    this.gameState = "paused";
    this.hideMobileControls();
    this.showMobileOverlayControls();
    this.showPauseScreen();
  }

  resumeGame() {
    if (this.gameState !== "paused") return;
    this.gameState = "playing";
    this.overlayManager.hideAllOverlays();
    this.hideMobileOverlayControls();
    this.showMobileControls();
    this.lastTime = performance.now();
    this.gameLoop();
  }

  victory() {
    this.gameState = "victory";
    this.hideMobileControls();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    setTimeout(() => {
      this.showMobileOverlayControls();
      this.showVictoryScreen();
    }, 1000);
  }

  gameOver() {
    this.gameState = "gameOver";
    this.hideMobileControls();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    setTimeout(() => {
      this.showMobileOverlayControls();
      this.showGameOverScreen();
    }, 1000);
  }

  restartGame() {
    this.cleanup();
    this.showStartScreen();
  }

  cleanup() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.hideMobileControls();
    this.hideMobileOverlayControls();
    this.player = null;
    this.maze = null;
    this.arrow = null;
  }

  gameLoop(currentTime = 0) {
    if (this.gameState !== "playing") return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  overlapsRect(px, py, pw, ph, rx, ry, rw, rh) {
    return !(px + pw <= rx || px >= rx + rw || py + ph <= ry || py >= ry + rh);
  }

  update(deltaTime) {
    if (this.player && this.player.update) {
      const prevX = this.player.x;
      const prevY = this.player.y;

      this.player.update(deltaTime);

      if (
        this.maze &&
        this.maze.checkCollision(
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height
        )
      ) {
        this.player.x = prevX;
        this.player.y = prevY;
      } else {
        const overlapsExit = this.overlapsRect(
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height,
          this.maze.exit.x,
          this.maze.exit.y,
          this.maze.exit.width,
          this.maze.exit.height
        );
        if (overlapsExit) {
          const dx = this.player.x - prevX;
          const dy = this.player.y - prevY;
          let block = false;
          switch (this.maze.exit.side) {
            case 0:
              if (dy > 0) block = true;
              break;
            case 1:
              if (dx < 0) block = true;
              break;
            case 2:
              if (dy < 0) block = true;
              break;
            case 3:
              if (dx > 0) block = true;
              break;
          }
          if (block) {
            this.player.x = prevX;
            this.player.y = prevY;
          }
        }
      }

      if (
        this.maze &&
        this.maze.canWin(
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height
        )
      ) {
        this.victory();
      }
    }

    if (this.arrow && this.player) {
      this.arrow.update(deltaTime, this.player.x, this.player.y);

      if (
        this.arrow.checkCollision(
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height
        )
      ) {
        this.gameOver();
      }
    }
  }

  render() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    if (this.maze && this.maze.render) {
      this.maze.render();
    }

    this.ctx.strokeStyle = "#b0aeaeff";
    this.ctx.lineWidth = 2;
    const borderOffset = 10;
    this.ctx.strokeRect(
      borderOffset,
      borderOffset,
      this.canvas.width - borderOffset * 2,
      this.canvas.height - borderOffset * 2
    );

    if (this.player && this.player.render) {
      this.player.render();
    }

    if (this.arrow && this.arrow.render) {
      this.arrow.render();
    }
  }

  showStartScreen() {
    this.gameState = "start";
    this.setGameDifficulty();
    this.overlayManager.hideAllOverlays();
    this.hideMobileControls();
    this.hideMobileOverlayControls();
    this.overlayManager.showOverlay("start");
  }

  setGameDifficulty() {
    this.difficultyDropdown.innerHTML = "";

    const difficultyLevels = ["easy", "normal", "hard"];

    difficultyLevels.forEach((level) => {
      const option = document.createElement("option");
      option.value = level;
      const capitalizedText = level.charAt(0).toUpperCase() + level.slice(1);
      option.textContent = capitalizedText;

      if (level === "normal") {
        option.selected = true;
      }

      this.difficultyDropdown.appendChild(option);
    });
  }

  showPauseScreen() {
    this.overlayManager.showPause();
  }

  showVictoryScreen() {
    this.overlayManager.showVictory();
  }

  showGameOverScreen() {
    this.overlayManager.showGameOver();
  }

  showInstructions() {
    this.gameState = "instructions";
    this.overlayManager.showOverlay("start");
    this.overlayManager.showOverlay("instructions");
  }

  hideInstructions() {
    this.gameState = "start";
    this.overlayManager.hideOverlay("instructions");
  }
}
