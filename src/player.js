class Player {
  constructor(ctx, difficulty) {
    this.ctx = ctx;
    this.difficulty = difficulty;
    this.x = 100;
    this.y = 100;
    this.width = 18;
    this.height = 18;
    this.speed = 200;
    this.keys = {};

    this.sprite = new Image();
    this.spriteLoaded = false;

    this.loadSprite();
    this.setupControls();
  }

  loadSprite() {
    this.sprite.onload = () => {
      this.spriteLoaded = true;
      this.width = 18;
      this.height = 18;
    };

    this.sprite.onerror = () => {
      console.error("Failed to load player sprite");
      this.spriteLoaded = false;
    };

    this.sprite.src = "assets/images/starlord.png";
  }

  setupControls() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
  }

  update(deltaTime) {
    let dt;

    switch (this.difficulty) {
      case ("easy", "normal"):
        dt = deltaTime / 2000;
        break;
      case "hard":
        dt = deltaTime / 2200;
        break;
      default:
        dt = deltaTime / 2000;
    }

    if (this.keys["ArrowUp"] || this.keys["KeyW"]) {
      this.y -= this.speed * dt;
    }
    if (this.keys["ArrowDown"] || this.keys["KeyS"]) {
      this.y += this.speed * dt;
    }
    if (this.keys["ArrowLeft"] || this.keys["KeyA"]) {
      this.x -= this.speed * dt;
    }
    if (this.keys["ArrowRight"] || this.keys["KeyD"]) {
      this.x += this.speed * dt;
    }

    const borderOffset = 10;
    this.x = Math.max(
      borderOffset + 2,
      Math.min(this.ctx.canvas.width - borderOffset - this.width - 2, this.x)
    );
    this.y = Math.max(
      borderOffset + 2,
      Math.min(this.ctx.canvas.height - borderOffset - this.height - 2, this.y)
    );
  }

  render() {
    if (this.spriteLoaded) {
      this.ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    } else {
      this.ctx.fillStyle = "#ddff00";
      this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}
