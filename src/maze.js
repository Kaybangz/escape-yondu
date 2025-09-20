class Maze {
  constructor(ctx, difficulty = "normal") {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.difficulty = difficulty;

    this.gridWidth = 31;
    this.gridHeight = 19;

    this.wallThickness = 3;

    this.wallColor = "#4a5568";
    this.pathColor = "#1a202c";
    this.entranceColor = "#38a169";
    this.exitColor = "#c53232ff";

    this.grid = [];
    this.entrance = { x: 0, y: 0, gridX: 0, gridY: 0, width: 0, height: 0 };
    this.exit = { x: 0, y: 0, gridX: 0, gridY: 0, width: 0, height: 0 };

    this.calculateMazeDimensions();
    this.generateMaze();
  }

  calculateMazeDimensions() {
    const borderOffset = 10;
    const canvasWidth = this.canvas.width - borderOffset * 2;
    const canvasHeight = this.canvas.height - borderOffset * 2;

    const mazeAreaWidth = canvasWidth * 1.0;
    const mazeAreaHeight = canvasHeight * 1.0;

    this.cellWidth = Math.floor(mazeAreaWidth / this.gridWidth);
    this.cellHeight = Math.floor(mazeAreaHeight / this.gridHeight);

    const totalMazeWidth = this.gridWidth * this.cellWidth;
    const totalMazeHeight = this.gridHeight * this.cellHeight;

    this.offsetX =
      borderOffset + Math.floor((canvasWidth - totalMazeWidth) / 2);
    this.offsetY =
      borderOffset + Math.floor((canvasHeight - totalMazeHeight) / 2);
  }

  generateMaze() {
    const generator = new MazeGenerator(
      this.gridWidth,
      this.gridHeight,
      this.difficulty
    );
    this.grid = generator.generate();

    const { entrance, exit } = MazeGenerator.generateEntranceAndExit(
      this.grid,
      this.gridWidth,
      this.gridHeight
    );

    this.entrance = {
      gridX: entrance.x,
      gridY: entrance.y,
      x: this.offsetX + entrance.x * this.cellWidth,
      y: this.offsetY + entrance.y * this.cellHeight,
      width: entrance.width * this.cellWidth,
      height: entrance.height * this.cellHeight,
      side: entrance.side,
    };

    this.exit = {
      gridX: exit.x,
      gridY: exit.y,
      x: this.offsetX + exit.x * this.cellWidth,
      y: this.offsetY + exit.y * this.cellHeight,
      width: exit.width * this.cellWidth,
      height: exit.height * this.cellHeight,
      side: exit.side,
    };
  }

  getPlayerStartPosition() {
    let startX, startY;

    switch (this.entrance.side) {
      case 0:
        startX = this.entrance.x + this.entrance.width / 2 - 10;
        startY = this.entrance.y - 40;
        break;
      case 1:
        startX = this.entrance.x + 40;
        startY = this.entrance.y + this.entrance.height / 2 - 10;
        break;
      case 2:
        startX = this.entrance.x + this.entrance.width / 2 - 10;
        startY = this.entrance.y + 40;
        break;
      case 3:
        startX = this.entrance.x - 40;
        startY = this.entrance.y + this.entrance.height / 2 - 10;
        break;
    }

    return { x: startX, y: startY };
  }

  isWall(x, y) {
    const gridX = Math.floor((x - this.offsetX) / this.cellWidth);
    const gridY = Math.floor((y - this.offsetY) / this.cellHeight);

    if (
      gridX < 0 ||
      gridX >= this.gridWidth ||
      gridY < 0 ||
      gridY >= this.gridHeight
    ) {
      return false;
    }

    return this.grid[gridY][gridX] === 1;
  }

  checkCollision(playerX, playerY, playerWidth, playerHeight) {
    const corners = [
      { x: playerX, y: playerY },
      { x: playerX + playerWidth, y: playerY },
      { x: playerX, y: playerY + playerHeight },
      { x: playerX + playerWidth, y: playerY + playerHeight },
    ];

    return corners.some((corner) => this.isWall(corner.x, corner.y));
  }

  isAtExit(playerX, playerY, playerWidth, playerHeight) {
    const px = playerX;
    const py = playerY;
    const pw = playerWidth;
    const ph = playerHeight;
    const rx = this.exit.x;
    const ry = this.exit.y;
    const rw = this.exit.width;
    const rh = this.exit.height;

    return !(px + pw <= rx || px >= rx + rw || py + ph <= ry || py >= ry + rh);
  }

  canWin(playerX, playerY, playerWidth, playerHeight) {
    return this.isAtExit(playerX, playerY, playerWidth, playerHeight);
  }

  render() {
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const cellX = this.offsetX + x * this.cellWidth;
        const cellY = this.offsetY + y * this.cellHeight;

        if (this.grid[y][x] === 1) {
          const padding = Math.floor(this.cellWidth * 0.1);
          this.ctx.fillStyle = this.wallColor;
          this.ctx.fillRect(
            cellX + padding,
            cellY + padding,
            this.cellWidth - padding * 2,
            this.cellHeight - padding * 2
          );

          this.ctx.fillStyle = "#2d3748";
          this.ctx.fillRect(
            cellX + padding + 1,
            cellY + padding + 1,
            this.cellWidth - padding * 2 - 2,
            this.cellHeight - padding * 2 - 2
          );
        } else {
          this.ctx.fillStyle = this.pathColor;
          this.ctx.fillRect(cellX, cellY, this.cellWidth, this.cellHeight);
        }
      }
    }

    this.ctx.fillStyle = this.entranceColor;
    this.ctx.fillRect(
      this.entrance.x,
      this.entrance.y,
      this.entrance.width,
      this.entrance.height
    );

    this.ctx.fillStyle = "#68d391";
    this.ctx.font = "11px";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "IN",
      this.entrance.x + this.entrance.width / 2,
      this.entrance.y + this.entrance.height / 2 + 4
    );

    this.ctx.fillStyle = this.exitColor;
    this.ctx.fillRect(
      this.exit.x,
      this.exit.y,
      this.exit.width,
      this.exit.height
    );

    this.ctx.fillStyle = "#fc8181";
    this.ctx.font = "11px";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "OUT",
      this.exit.x + this.exit.width / 2,
      this.exit.y + this.exit.height / 2 + 4
    );

    this.ctx.textAlign = "left";
  }

  debugRender() {
    this.ctx.strokeStyle = "#ff0000";
    this.ctx.lineWidth = 1;

    for (let y = 0; y <= this.gridHeight; y++) {
      const lineY = this.offsetY + y * this.cellHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(this.offsetX, lineY);
      this.ctx.lineTo(this.offsetX + this.gridWidth * this.cellWidth, lineY);
      this.ctx.stroke();
    }

    for (let x = 0; x <= this.gridWidth; x++) {
      const lineX = this.offsetX + x * this.cellWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(lineX, this.offsetY);
      this.ctx.lineTo(lineX, this.offsetY + this.gridHeight * this.cellHeight);
      this.ctx.stroke();
    }
  }
}
