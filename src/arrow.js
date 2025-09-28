class Arrow {
  constructor(ctx, maze) {
    this.ctx = ctx;
    this.maze = maze;

    this.width = 22;
    this.height = 0.5;
    this.x = 0;
    this.y = 0;

    this.speed = 80;
    this.path = [];
    this.currentPathIndex = 0;
    this.lastPlayerGridX = -1;
    this.lastPlayerGridY = -1;

    this.initialDelay = 5000;
    this.startTime = performance.now();
    this.active = false;
    this.hasEnteredMaze = false;
    this.showWarning = false;
    this.warningStartTime = 0;

    this.rotation = 0;
    this.targetRotation = 0;
    this.rotationSpeed = 8;

    this.energyTrail = [];
    this.maxTrailLength = 12;
    this.isMoving = false;

    this.setInitialPosition();
  }

  setInitialPosition() {
    const entrance = this.maze.entrance;
    const offset = 50;

    switch (entrance.side) {
      case 0:
        this.x = entrance.x + entrance.width / 2 - this.width / 2;
        this.y = entrance.y - offset;
        this.rotation = Math.PI / 2;
        this.targetRotation = Math.PI / 2;
        break;
      case 1:
        this.x = entrance.x + entrance.width + offset;
        this.y = entrance.y + entrance.height / 2 - this.height / 2;
        this.rotation = Math.PI;
        this.targetRotation = Math.PI;
        break;
      case 2:
        this.x = entrance.x + entrance.width / 2 - this.width / 2;
        this.y = entrance.y + entrance.height + offset;
        this.rotation = -Math.PI / 2;
        this.targetRotation = -Math.PI / 2;
        break;
      case 3:
        this.x = entrance.x - offset;
        this.y = entrance.y + entrance.height / 2 - this.height / 2;
        this.rotation = 0;
        this.targetRotation = 0;
        break;
    }
  }

  update(deltaTime, playerX, playerY) {
    const currentTime = performance.now();

    if (!this.active && currentTime - this.startTime >= this.initialDelay) {
      this.active = true;
      this.showWarning = true;
      this.warningStartTime = currentTime;
      this.calculateInitialPath(playerX, playerY);
    }

    if (!this.active) return;

    if (this.showWarning && currentTime - this.warningStartTime > 2500) {
      this.showWarning = false;
    }

    const playerGridPos = this.worldToGrid(playerX + 9, playerY + 9);
    if (
      playerGridPos.x !== this.lastPlayerGridX ||
      playerGridPos.y !== this.lastPlayerGridY
    ) {
      this.calculatePathToPlayer(playerX, playerY);
      this.lastPlayerGridX = playerGridPos.x;
      this.lastPlayerGridY = playerGridPos.y;
    }

    this.moveAlongPath(deltaTime / 1000);

    this.updateRotation(deltaTime / 800);

    this.updateEnergyTrail();
  }

  updateRotation(deltaTime) {
    let rotationDiff = this.targetRotation - this.rotation;

    while (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
    while (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;

    if (Math.abs(rotationDiff) > 0.01) {
      this.rotation += rotationDiff * this.rotationSpeed * deltaTime;
    } else {
      this.rotation = this.targetRotation;
    }
  }

  calculateInitialPath(playerX, playerY) {
    const entrance = this.maze.entrance;
    let entryPoint;

    switch (entrance.side) {
      case 0:
        entryPoint = {
          x: entrance.x + entrance.width / 2,
          y: entrance.y + 10,
        };
        break;
      case 1:
        entryPoint = {
          x: entrance.x + entrance.width - 10,
          y: entrance.y + entrance.height / 2,
        };
        break;
      case 2:
        entryPoint = {
          x: entrance.x + entrance.width / 2,
          y: entrance.y + entrance.height - 10,
        };
        break;
      case 3:
        entryPoint = {
          x: entrance.x + 10,
          y: entrance.y + entrance.height / 2,
        };
        break;
    }

    this.path = [entryPoint];
    this.currentPathIndex = 0;

    this.calculatePathToPlayer(playerX, playerY);
  }

  calculatePathToPlayer(playerX, playerY) {
    if (!this.hasEnteredMaze) {
      return;
    }

    const currentGrid = this.worldToGrid(
      this.x + this.width / 2,
      this.y + this.height / 2
    );
    const targetGrid = this.worldToGrid(playerX + 9, playerY + 9);

    const gridPath = this.findPath(currentGrid, targetGrid);

    if (gridPath.length > 0) {
      const worldPath = gridPath.map((gridPos) => ({
        x:
          this.maze.offsetX +
          gridPos.x * this.maze.cellWidth +
          this.maze.cellWidth / 2,
        y:
          this.maze.offsetY +
          gridPos.y * this.maze.cellHeight +
          this.maze.cellHeight / 2,
      }));

      this.path = worldPath;
      this.currentPathIndex = 0;
    }
  }

  worldToGrid(x, y) {
    const gridX = Math.floor((x - this.maze.offsetX) / this.maze.cellWidth);
    const gridY = Math.floor((y - this.maze.offsetY) / this.maze.cellHeight);

    return {
      x: Math.max(0, Math.min(this.maze.gridWidth - 1, gridX)),
      y: Math.max(0, Math.min(this.maze.gridHeight - 1, gridY)),
    };
  }

  findPath(start, end) {
    const openList = [start];
    const closedList = new Set();
    const gScore = new Map();
    const fScore = new Map();
    const cameFrom = new Map();

    const getKey = (pos) => `${pos.x},${pos.y}`;

    gScore.set(getKey(start), 0);
    fScore.set(getKey(start), this.manhattanDistance(start, end));

    while (openList.length > 0) {
      let current = openList.reduce((lowest, node) => {
        const currentF = fScore.get(getKey(node)) || Infinity;
        const lowestF = fScore.get(getKey(lowest)) || Infinity;
        return currentF < lowestF ? node : lowest;
      });

      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(cameFrom, current);
      }

      openList.splice(openList.indexOf(current), 1);
      closedList.add(getKey(current));

      const neighbors = [
        { x: current.x, y: current.y - 1 },
        { x: current.x + 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x - 1, y: current.y },
      ];

      for (let neighbor of neighbors) {
        if (
          neighbor.x < 0 ||
          neighbor.x >= this.maze.gridWidth ||
          neighbor.y < 0 ||
          neighbor.y >= this.maze.gridHeight
        ) {
          continue;
        }

        if (this.maze.grid[neighbor.y][neighbor.x] === 1) {
          continue;
        }

        const neighborKey = getKey(neighbor);
        if (closedList.has(neighborKey)) {
          continue;
        }

        const tentativeG = (gScore.get(getKey(current)) || Infinity) + 1;

        if (
          !openList.find(
            (node) => node.x === neighbor.x && node.y === neighbor.y
          )
        ) {
          openList.push(neighbor);
        } else if (tentativeG >= (gScore.get(neighborKey) || Infinity)) {
          continue;
        }

        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(
          neighborKey,
          tentativeG + this.manhattanDistance(neighbor, end)
        );
      }
    }

    return [];
  }

  manhattanDistance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  reconstructPath(cameFrom, current) {
    const path = [current];
    const getKey = (pos) => `${pos.x},${pos.y}`;

    while (cameFrom.has(getKey(current))) {
      current = cameFrom.get(getKey(current));
      path.unshift(current);
    }

    return path;
  }

  moveAlongPath(deltaTime) {
    if (this.path.length === 0 || this.currentPathIndex >= this.path.length) {
      this.isMoving = false;
      return;
    }

    const target = this.path[this.currentPathIndex];
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    const dx = target.x - centerX;
    const dy = target.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      this.currentPathIndex++;
      this.isMoving = false;

      if (!this.hasEnteredMaze && this.currentPathIndex === 1) {
        this.hasEnteredMaze = true;
      }

      return;
    }

    this.isMoving = true;

    const dirX = dx / distance;
    const dirY = dy / distance;

    this.targetRotation = Math.atan2(dirY, dirX);

    const moveDistance = this.speed * deltaTime;
    this.x += dirX * moveDistance;
    this.y += dirY * moveDistance;
  }

  updateEnergyTrail() {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    const tailX =
      centerX + Math.cos(this.rotation + Math.PI) * (this.width / 2);
    const tailY =
      centerY + Math.sin(this.rotation + Math.PI) * (this.width / 2);

    if (this.isMoving) {
      this.energyTrail.unshift({
        x: tailX,
        y: tailY,
        age: 0,
      });

      if (this.energyTrail.length > this.maxTrailLength) {
        this.energyTrail.pop();
      }
    }

    for (let i = 0; i < this.energyTrail.length; i++) {
      this.energyTrail[i].age += 0.08;
    }

    this.energyTrail = this.energyTrail.filter((segment) => segment.age < 1.0);
  }

  checkCollision(playerX, playerY, playerWidth, playerHeight) {
    if (!this.active) return false;

    return !(
      this.x + this.width <= playerX ||
      this.x >= playerX + playerWidth ||
      this.y + this.height <= playerY ||
      this.y >= playerY + playerHeight
    );
  }

  render() {
    if (!this.active) return;

    this.renderEnergyTrail();

    this.ctx.save();

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(this.rotation);

    this.drawYakaArrow();

    this.ctx.restore();

    this.renderWarningMessage();
  }

  drawYakaArrow() {
    const arrowLength = this.width;
    const arrowWidth = this.height;

    this.ctx.shadowColor = "#c90707ab";
    this.ctx.shadowBlur = 8;

    this.ctx.fillStyle = "#c4341ab6";
    this.ctx.beginPath();
    this.ctx.moveTo(arrowLength / 2, 0);
    this.ctx.lineTo(-arrowLength / 4, -arrowWidth / 2);
    this.ctx.lineTo(-arrowLength / 2, -arrowWidth / 4);
    this.ctx.lineTo(-arrowLength / 2, arrowWidth / 4);
    this.ctx.lineTo(-arrowLength / 4, arrowWidth / 2);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = "#DC143C";
    this.ctx.beginPath();
    this.ctx.moveTo(arrowLength / 2, 0);
    this.ctx.lineTo(-arrowLength / 6, -arrowWidth / 3);
    this.ctx.lineTo(-arrowLength / 3, -arrowWidth / 6);
    this.ctx.lineTo(-arrowLength / 3, arrowWidth / 6);
    this.ctx.lineTo(-arrowLength / 6, arrowWidth / 3);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = "#FF4444";
    this.ctx.beginPath();
    this.ctx.moveTo(arrowLength / 3, 0);
    this.ctx.lineTo(-arrowLength / 8, -arrowWidth / 4);
    this.ctx.lineTo(-arrowLength / 4, 0);
    this.ctx.lineTo(-arrowLength / 8, arrowWidth / 4);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = "#FFAAAA";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(arrowLength / 3, 0);
    this.ctx.lineTo(-arrowLength / 4, 0);
    this.ctx.stroke();
  }

  renderEnergyTrail() {
    if (this.energyTrail.length < 2) return;

    this.ctx.save();
    this.ctx.globalCompositeOperation = "screen";

    this.ctx.beginPath();
    this.ctx.moveTo(this.energyTrail[0].x, this.energyTrail[0].y);

    for (let i = 1; i < this.energyTrail.length - 1; i++) {
      const current = this.energyTrail[i];
      const next = this.energyTrail[i + 1];
      const cpx = (current.x + next.x) / 2;
      const cpy = (current.y + next.y) / 2;
      this.ctx.quadraticCurveTo(current.x, current.y, cpx, cpy);
    }

    for (let pass = 0; pass < 3; pass++) {
      let width, alpha, color;

      switch (pass) {
        case 0:
          width = 8;
          alpha = 0.1;
          color = `rgba(139, 0, 0, ${alpha})`;
          break;
        case 1:
          width = 4;
          alpha = 0.4;
          color = `rgba(220, 20, 60, ${alpha})`;
          break;
        case 2:
          width = 2;
          alpha = 0.7;
          color = `rgba(255, 100, 100, ${alpha})`;
          break;
      }

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = width;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.filter = `blur(${pass}px)`;
      this.ctx.stroke();
      this.ctx.filter = "none";
    }

    this.ctx.restore();
  }

  renderWarningMessage() {
    if (!this.showWarning) return;

    this.ctx.save();

    const currentTime = performance.now();
    const elapsed = currentTime - this.warningStartTime;

    const flashAlpha = (Math.sin(elapsed * 0.01) + 1) / 2;

    const messageX = this.ctx.canvas.width / 2;
    const messageY = 60;

    this.ctx.fillStyle = `rgba(255, 0, 0, ${flashAlpha * 0.8})`;
    this.ctx.fillRect(messageX - 120, messageY - 20, 240, 40);

    this.ctx.strokeStyle = `rgba(255, 255, 255, ${flashAlpha})`;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(messageX - 120, messageY - 20, 240, 40);

    this.ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
    this.ctx.font = "12px";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    this.ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
    this.ctx.fillText("⚠️YONDU'S ARROW IS HUNTING YOU!⚠️", messageX, messageY);

    this.ctx.restore();
  }
}
