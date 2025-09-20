class MazeGenerator {
  constructor(width, height, difficulty = "normal") {
    this.width = width;
    this.height = height;
    this.difficulty = difficulty;
  }

  generate() {
    const grid = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(1));

    const startX =
      1 + 2 * Math.floor(Math.random() * Math.floor((this.width - 1) / 2));
    const startY =
      1 + 2 * Math.floor(Math.random() * Math.floor((this.height - 1) / 2));

    this.recursiveBacktrack(grid, startX, startY);

    this.applyDifficultyModifications(grid);

    return grid;
  }

  recursiveBacktrack(grid, x, y) {
    grid[y][x] = 0;

    const directions = [
      { dx: 0, dy: -2 },
      { dx: 2, dy: 0 },
      { dx: 0, dy: 2 },
      { dx: -2, dy: 0 },
    ];

    this.shuffleArray(directions);

    for (let dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;

      if (
        nx > 0 &&
        nx < this.width - 1 &&
        ny > 0 &&
        ny < this.height - 1 &&
        grid[ny][nx] === 1
      ) {
        grid[y + dir.dy / 2][x + dir.dx / 2] = 0;
        this.recursiveBacktrack(grid, nx, ny);
      }
    }
  }

  applyDifficultyModifications(grid) {
    switch (this.difficulty) {
      case "easy":
        this.createEasyMaze(grid);
        break;
      case "normal":
        this.createNormalMaze(grid);
        break;
      case "hard":
        break;
    }
  }

  createEasyMaze(grid) {
    const wallsToRemove = Math.floor(this.width * this.height * 0.06);

    for (let i = 0; i < wallsToRemove; i++) {
      let attempts = 0;
      const maxAttempts = 40;

      while (attempts < maxAttempts) {
        const x = 2 + Math.floor(Math.random() * (this.width - 4));
        const y = 2 + Math.floor(Math.random() * (this.height - 4));

        if (grid[y][x] === 1) {
          const neighbors = this.getPathNeighbors(grid, x, y);
          if (neighbors >= 2 && neighbors <= 3) {
            grid[y][x] = 0;
            break;
          }
        }
        attempts++;
      }
    }

    this.createWiderCorridors(grid, 0.06);
  }

  createNormalMaze(grid) {
    const wallsToRemove = Math.floor(this.width * this.height * 0.03);

    for (let i = 0; i < wallsToRemove; i++) {
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        const x = 2 + Math.floor(Math.random() * (this.width - 4));
        const y = 2 + Math.floor(Math.random() * (this.height - 4));

        if (grid[y][x] === 1) {
          const neighbors = this.getPathNeighbors(grid, x, y);
          if (neighbors >= 2 && neighbors <= 2) {
            grid[y][x] = 0;
            break;
          }
        }
        attempts++;
      }
    }

    this.createStrategicShortcuts(grid);

    this.createWiderCorridors(grid, 0.02);
  }

  createStrategicShortcuts(grid) {
    const shortcutsToAdd = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < shortcutsToAdd; i++) {
      let attempts = 0;
      const maxAttempts = 20;

      while (attempts < maxAttempts) {
        const x = 3 + Math.floor(Math.random() * (this.width - 6));
        const y = 3 + Math.floor(Math.random() * (this.height - 6));

        if (grid[y][x] === 1) {
          const neighbors = this.getPathNeighbors(grid, x, y);
          if (neighbors === 2) {
            const wouldCreateLoop = this.wouldCreateUsefulConnection(
              grid,
              x,
              y
            );
            if (wouldCreateLoop) {
              grid[y][x] = 0;
              break;
            }
          }
        }
        attempts++;
      }
    }
  }

  wouldCreateUsefulConnection(grid, x, y) {
    const pathNeighbors = [];
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
    ];

    for (let dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;

      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        if (grid[ny][nx] === 0) {
          pathNeighbors.push({ x: nx, y: ny });
        }
      }
    }

    return pathNeighbors.length === 2;
  }

  getPathNeighbors(grid, x, y) {
    let count = 0;
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
    ];

    for (let dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;

      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        if (grid[ny][nx] === 0) {
          count++;
        }
      }
    }

    return count;
  }

  createWiderCorridors(grid, probability) {
    for (let y = 2; y < this.height - 2; y++) {
      for (let x = 2; x < this.width - 2; x++) {
        if (grid[y][x] === 0 && Math.random() < probability) {
          const currentOpenArea = this.calculateLocalOpenArea(grid, x, y, 2);

          if (currentOpenArea < 6) {
            if (Math.random() < 0.5) {
              if (grid[y][x + 1] === 1 && grid[y][x - 1] === 0) {
                grid[y][x + 1] = 0;
              }
            } else {
              if (grid[y + 1][x] === 1 && grid[y - 1][x] === 0) {
                grid[y + 1][x] = 0;
              }
            }
          }
        }
      }
    }
  }

  calculateLocalOpenArea(grid, centerX, centerY, radius) {
    let openCells = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          if (grid[y][x] === 0) {
            openCells++;
          }
        }
      }
    }

    return openCells;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  static generateEntranceAndExit(grid, width, height) {
    const entranceSide = Math.floor(Math.random() * 4);
    const exitSide = (entranceSide + 2) % 4;

    const entrance = this.createOpeningOnSide(entranceSide, width, height);
    const exit = this.createOpeningOnSide(exitSide, width, height);

    this.createOpening(grid, entrance);
    this.createOpening(grid, exit);

    this.connectToInternalPath(grid, entrance, width, height);
    this.connectToInternalPath(grid, exit, width, height);

    return { entrance, exit };
  }

  static createOpeningOnSide(side, width, height) {
    let x, y, w, h;

    switch (side) {
      case 0:
        x = Math.floor(Math.random() * (width - 3)) + 1;
        y = 0;
        w = 2;
        h = 1;
        break;
      case 1:
        x = width - 1;
        y = Math.floor(Math.random() * (height - 3)) + 1;
        w = 1;
        h = 2;
        break;
      case 2:
        x = Math.floor(Math.random() * (width - 3)) + 1;
        y = height - 1;
        w = 2;
        h = 1;
        break;
      case 3:
        x = 0;
        y = Math.floor(Math.random() * (height - 3)) + 1;
        w = 1;
        h = 2;
        break;
    }

    return { x, y, width: w, height: h, side };
  }

  static createOpening(grid, opening) {
    for (let dy = 0; dy < opening.height; dy++) {
      for (let dx = 0; dx < opening.width; dx++) {
        grid[opening.y + dy][opening.x + dx] = 0;
      }
    }
  }

  static connectToInternalPath(grid, opening, gridWidth, gridHeight) {
    const connectX =
      opening.side === 1
        ? opening.x - 1
        : opening.side === 3
        ? opening.x + opening.width
        : opening.x + Math.floor(opening.width / 2);

    const connectY =
      opening.side === 0
        ? opening.y + 1
        : opening.side === 2
        ? opening.y - 1
        : opening.y + Math.floor(opening.height / 2);

    if (
      connectX >= 0 &&
      connectX < gridWidth &&
      connectY >= 0 &&
      connectY < gridHeight
    ) {
      grid[connectY][connectX] = 0;
    }
  }
}
