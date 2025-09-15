class Game {
  constructor() {
    this.gameState = "start";
    this.difficulty = "normal";
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.startScreen = document.getElementById("startScreen");
    this.startButton = document.getElementById("startButton");
    this.difficultyDropdown = document.getElementById("difficulty");
    this.gameOverScreen = document.getElementById("gameOverScreen");
    this.pauseScreen = document.getElementById("pauseScreen");

    this.player = null;

    this.animationId = null;
    this.lastTime = 0;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.showStartScreen();
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
  }

  handleMenuKeys(e) {
    switch (this.gameState) {
      case "start":
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          this.startGame();
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
        if (e.code === "Enter") {
          e.preventDefault();
          this.restartGame();
        }
        break;
      case "gameOver":
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          this.restartGame();
        }
        if (e.code === "Escape") {
          e.preventDefault();
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
    this.hideAllScreens();
    this.initializeGameObjects();
    this.lastTime = performance.now();
    this.gameLoop();
  }

  initializeGameObjects() {
    this.difficulty = this.difficultyDropdown.value;
    this.player = new Player(this.ctx, this.difficulty);
  }

  pauseGame() {
    if (this.gameState !== "playing") return;
    this.gameState = "paused";
    this.showPauseScreen();
  }

  resumeGame() {
    if (this.gameState !== "paused") return;
    this.gameState = "playing";
    this.hideAllScreens();
    this.lastTime = performance.now();
    this.gameLoop();
  }

  gameOver() {
    this.gameState = "gameOver";
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    setTimeout(() => {
      this.showGameOverScreen();
    }, 1000);
    console.log("Game Over!");
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
    this.player = null;
  }

  gameLoop(currentTime = 0) {
    if (this.gameState !== "playing") return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(deltaTime) {
    if (this.player && this.player.update) {
      this.player.update(deltaTime);
    }
  }

  render() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    this.ctx.strokeStyle = "#ccc9c9ff";
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
  }

  showStartScreen() {
    this.gameState = "start";
    this.setGameDifficulty();
    this.hideAllScreens();
    if (this.startScreen) {
      this.startScreen.classList.remove("hidden");
    }
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
    if (this.pauseScreen) {
      this.pauseScreen.classList.remove("hidden");
    }
  }

  showGameOverScreen() {
    if (this.gameOverScreen) {
      this.gameOverScreen.classList.remove("hidden");
    }
  }

  hideAllScreens() {
    if (this.startScreen) {
      this.startScreen.classList.add("hidden");
    }
    if (this.pauseScreen) {
      this.pauseScreen.classList.add("hidden");
    }
    if (this.gameOverScreen) {
      this.gameOverScreen.classList.add("hidden");
    }
  }
}
