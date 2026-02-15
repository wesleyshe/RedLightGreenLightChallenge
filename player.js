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
  }

  update(dt, lightState, obstacles) {
    if (!this.isAlive) return;

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
      if (obstacle.includes(node)) {
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

  getAngle() {
    let node = this.getCurrentNode();
    return (node / CONFIG.TRACK_LEN) * TWO_PI - HALF_PI;
  }

  draw(obstacles) {
    if (!this.isAlive) return;
    let node = this.getCurrentNode();
    drawSquarePixel(node, this.color);
  }
}
