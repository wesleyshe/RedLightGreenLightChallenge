// ===========================
// RENDERING FUNCTIONS
// ===========================

function drawTrack() {
  // Draw all track pixels as squares
  for (let i = 0; i < CONFIG.TRACK_LEN; i++) {
    drawSquarePixel(i, CONFIG.COLORS.trackPixel);
  }
}

function drawObstacles(obstacles) {
  for (let obs of obstacles) {
    for (let nodeObj of obs.nodes) {
      let scaleFactor = 1.0;
      if (nodeObj.isBreathing) {
        scaleFactor = 1.0 + 0.3 * Math.sin(nodeObj.breathingTimer * Math.PI * 4);
      }
      drawSquarePixel(nodeObj.index, CONFIG.COLORS.obstacle, scaleFactor);
    }
  }
}

function drawTrafficLight(lightState) {
  // Draw at node 0 (top)
  let lightColor;
  let scaleFactor = 1.0;
  if (lightState === 'GREEN') {
    lightColor = CONFIG.COLORS.lightGreen;
  } else if (lightState === 'BREATHING_GREEN') {
    lightColor = CONFIG.COLORS.lightGreen;
    scaleFactor = 1.0 + 0.2 * Math.sin(millis() / 150);
  } else if (lightState === 'RED') {
    lightColor = CONFIG.COLORS.lightRed;
  }

  drawSquarePixel(0, lightColor, scaleFactor);
}

function drawHUD() {
  // Minimal UI - no instructions
}

function drawStartScreen() {
  textSize(24);
  fill(CONFIG.COLORS.textSecondary);
  textAlign(CENTER, CENTER);
  text('press space to start', width / 2, height / 2 - 40);

  textSize(16);
  fill(CONFIG.COLORS.textTertiary);
  text('player 1: use a/d to move', width / 2, height / 2 + 40);
  text('player 2: use \u2190/\u2192 to move', width / 2, height / 2 + 70);
  text('reach opponent starting position to win', width / 2, height / 2 + 110);
}

function drawEndScreen(winner, endReason) {
  fill(0, 0, 0, 200);
  rectMode(CENTER);
  rect(width / 2, height / 2, 500, 300);

  fill(CONFIG.COLORS.text);
  textSize(48);
  textAlign(CENTER, CENTER);

  if (winner === 'DRAW') {
    fill(255, 255, 255);
    text('draw', width / 2, height / 2 - 60);
  } else {
    if (winner === 'player 1') {
      fill(CONFIG.COLORS.player1);
    } else {
      fill(CONFIG.COLORS.player2);
    }
    text(winner.toLowerCase() + ' wins', width / 2, height / 2 - 60);
  }

  fill(CONFIG.COLORS.textSecondary);
  textSize(20);
  text(endReason.toLowerCase(), width / 2, height / 2);

  fill(CONFIG.COLORS.textTertiary);
  textSize(24);
  text('press r to restart', width / 2, height / 2 + 60);

  rectMode(CORNER);
}
