// ===========================
// PLAYER CLASS
// ===========================

class Player {
  constructor(startNode, color, name, leftKey, rightKey) {
    this.startNode = startNode;
    this.position = startNode;
    this.velocity = 0;
    this.color = color;
    this.name = name;
    this.leftKeyCode = this.getKeyCode(leftKey);
    this.rightKeyCode = this.getKeyCode(rightKey);
    this.isAlive = true;
    this.lastNode = startNode;
    this.totalDistance = 0;
    this.currentObstacleId = -1;
    this.currentNodeIndex = -1;
    this.timeOnObstacle = 0;
    this.isBreathing = false;
    this.breathingTimer = 0;
  }

  getKeyCode(key) {
    if (key === 'ArrowLeft') return LEFT_ARROW;
    if (key === 'ArrowRight') return RIGHT_ARROW;
    if (key === 'ArrowUp') return UP_ARROW;
    if (key === 'ArrowDown') return DOWN_ARROW;
    return key.toUpperCase().charCodeAt(0);
  }

  reset() {
    this.position = this.startNode;
    this.velocity = 0;
    this.isAlive = true;
    this.lastNode = this.startNode;
    this.totalDistance = 0;
    this.currentObstacleId = -1;
    this.currentNodeIndex = -1;
    this.timeOnObstacle = 0;
    this.isBreathing = false;
    this.breathingTimer = 0;
  }

  update(dt, lightState, obstacles) {
    if (!this.isAlive) return;

    let node = this.getCurrentNode();
    let onObstacle = obstacles.find(obs => obs.nodes.some(n => n.index === node));
    let onNodeObj = onObstacle ? onObstacle.nodes.find(n => n.index === node) : null;

    // If we left an obstacle we were currently interacting with, reset its breathing state
    if (this.currentObstacleId !== -1 && this.currentNodeIndex !== -1) {
      if (!onObstacle || onObstacle.id !== this.currentObstacleId || node !== this.currentNodeIndex) {
        let prevObs = obstacles.find(o => o.id === this.currentObstacleId);
        if (prevObs) {
          let prevNodeObj = prevObs.nodes.find(n => n.index === this.currentNodeIndex);
          if (prevNodeObj) {
            prevNodeObj.isBreathing = false;
            prevNodeObj.breathingTimer = 0;
          }
        }

        // Ensure player also resets their own state immediately upon leaving or destroying
        this.currentObstacleId = -1;
        this.currentNodeIndex = -1;
        this.timeOnObstacle = 0;
        this.isBreathing = false;
        this.breathingTimer = 0;
      }
    }

    if (onObstacle && onNodeObj) {
      if (this.currentObstacleId === onObstacle.id && this.currentNodeIndex === node) {
        if (!this.isBreathing && !onNodeObj.isBreathing) {
          this.timeOnObstacle += dt;
          if (this.timeOnObstacle >= CONFIG.BLOCK_TRIGGER_TIME) {
            this.isBreathing = true;
            this.breathingTimer = 0;
            onNodeObj.isBreathing = true;
            onNodeObj.breathingTimer = 0;
          }
        }
      } else {
        this.currentObstacleId = onObstacle.id;
        this.currentNodeIndex = node;
        this.timeOnObstacle = 0;
        this.isBreathing = onNodeObj.isBreathing;
        this.breathingTimer = onNodeObj.breathingTimer;
      }
    } else {
      this.currentObstacleId = -1;
      this.currentNodeIndex = -1;
      this.timeOnObstacle = 0;
      this.isBreathing = false;
      this.breathingTimer = 0;
    }

    if (this.isBreathing) {
      this.breathingTimer += dt;
    }

    if (lightState === 'RED') {
      let isHidden = this.isHidden(obstacles);

      if (!isHidden) {
        // Not hidden - check for any movement
        if (keyIsDown(this.leftKeyCode) || keyIsDown(this.rightKeyCode)) {
          this.isAlive = false;
          return;
        }

        let currentNode = this.getCurrentNode();
        if (currentNode !== this.lastNode) {
          this.isAlive = false;
          return;
        }

        this.velocity *= 0.95;
        return;
      }
      // If hidden, allow normal movement below
    }

    let accel = 0;
    if (keyIsDown(this.leftKeyCode)) {
      accel = -CONFIG.ACCEL;
    }
    if (keyIsDown(this.rightKeyCode)) {
      accel = CONFIG.ACCEL;
    }

    this.velocity += accel * dt;
    this.velocity *= CONFIG.INERTIA;
    this.velocity = constrain(this.velocity, -CONFIG.MAX_SPEED, CONFIG.MAX_SPEED);

    let oldPosition = this.position;
    let newPosition = this.position + this.velocity * dt;

    // Prevent crossing node 0 (traffic light)
    let oldNode = wrapIndex(Math.round(oldPosition));
    let newNode = wrapIndex(Math.round(newPosition));

    if (oldNode !== 0 && newNode === 0) {
      // Block movement to node 0
      newPosition = oldPosition;
      this.velocity = 0;
    }

    this.position = newPosition;
    this.totalDistance += Math.abs(newPosition - oldPosition);

    this.lastNode = this.getCurrentNode();
  }

  getCurrentNode() {
    return wrapIndex(Math.round(this.position));
  }

  isHidden(obstacles) {
    let node = this.getCurrentNode();
    for (let obstacle of obstacles) {
      if (obstacle.nodes.some(n => n.index === node)) {
        return true;
      }
    }
    return false;
  }

  checkWin(otherPlayer) {
    let node = this.getCurrentNode();
    let hasMinDistance = this.totalDistance >= CONFIG.TRACK_LEN * 0.75;
    return node === otherPlayer.startNode && hasMinDistance;
  }

  draw() {
    if (!this.isAlive) return;
    let scaleFactor = 1.0;
    if (this.isBreathing) {
      scaleFactor = 1.0 + 0.3 * Math.sin(this.breathingTimer * Math.PI * 4);
    }
    drawSquarePixel(this.getCurrentNode(), this.color, scaleFactor);
  }
}
