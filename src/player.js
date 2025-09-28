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

    this.touchControls = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    this.sprite = new Image();
    this.spriteLoaded = false;

    this.loadSprite();
    this.setupControls();
    this.setupMobileControls();
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

  setupMobileControls() {
    const dpadUp = document.querySelector(".dpad-up");
    const dpadDown = document.querySelector(".dpad-down");
    const dpadLeft = document.querySelector(".dpad-left");
    const dpadRight = document.querySelector(".dpad-right");

    const setupTouchEvents = (element, direction) => {
      if (!element) return;

      element.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          this.touchControls[direction] = true;
        },
        { passive: false }
      );

      element.addEventListener(
        "touchend",
        (e) => {
          e.preventDefault();
          this.touchControls[direction] = false;
        },
        { passive: false }
      );

      element.addEventListener(
        "touchcancel",
        (e) => {
          e.preventDefault();
          this.touchControls[direction] = false;
        },
        { passive: false }
      );

      element.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.touchControls[direction] = true;
      });

      element.addEventListener("mouseup", (e) => {
        e.preventDefault();
        this.touchControls[direction] = false;
      });

      element.addEventListener("mouseleave", (e) => {
        e.preventDefault();
        this.touchControls[direction] = false;
      });
    };

    setupTouchEvents(dpadUp, "up");
    setupTouchEvents(dpadDown, "down");
    setupTouchEvents(dpadLeft, "left");
    setupTouchEvents(dpadRight, "right");

    const blockDefault = (e) => {
      if (e.target.closest(".dpad-up, .dpad-down, .dpad-left, .dpad-right")) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", blockDefault, { passive: false });

    document.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  update(deltaTime) {
    let dt = deltaTime / 2000;

    let moveUp = this.keys["ArrowUp"] || this.keys["KeyW"];
    let moveDown = this.keys["ArrowDown"] || this.keys["KeyS"];
    let moveLeft = this.keys["ArrowLeft"] || this.keys["KeyA"];
    let moveRight = this.keys["ArrowRight"] || this.keys["KeyD"];

    moveUp = moveUp || this.touchControls.up;
    moveDown = moveDown || this.touchControls.down;
    moveLeft = moveLeft || this.touchControls.left;
    moveRight = moveRight || this.touchControls.right;

    if (moveUp) {
      this.y -= this.speed * dt;
    }
    if (moveDown) {
      this.y += this.speed * dt;
    }
    if (moveLeft) {
      this.x -= this.speed * dt;
    }
    if (moveRight) {
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
