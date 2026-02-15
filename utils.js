// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Wraps an index to the valid range [0, TRACK_LEN)
 */
function wrapIndex(index) {
  return ((index % CONFIG.TRACK_LEN) + CONFIG.TRACK_LEN) % CONFIG.TRACK_LEN;
}

/**
 * Calculates the circular distance between two nodes
 */
function circularDistance(a, b) {
  let diff = Math.abs(a - b);
  return Math.min(diff, CONFIG.TRACK_LEN - diff);
}

/**
 * Returns a random number between min and max
 */
function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Gets the pixel position (x, y) for a given node index
 */
function getPixelPosition(nodeIndex) {
  let angle = (nodeIndex / CONFIG.TRACK_LEN) * TWO_PI - HALF_PI;
  let x = width / 2 + cos(angle) * CONFIG.RING_RADIUS;
  let y = height / 2 + sin(angle) * CONFIG.RING_RADIUS;
  return { x, y, angle };
}

/**
 * Draws a square pixel at the given node index
 */
function drawSquarePixel(nodeIndex, fillColor) {
  let pos = getPixelPosition(nodeIndex);
  push();
  translate(pos.x, pos.y);
  rotate(pos.angle + HALF_PI);
  noStroke();
  fill(fillColor);
  rectMode(CENTER);
  square(0, 0, CONFIG.PIXEL_SIZE);
  pop();
}
