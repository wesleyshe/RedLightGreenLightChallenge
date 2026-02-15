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
  // Draw each obstacle blob
  for (let obstacleBlob of obstacles) {
    for (let node of obstacleBlob) {
      drawSquarePixel(node, CONFIG.COLORS.obstacle);
    }
  }
}

function drawTrafficLight(lightState) {
  // Draw at node 0 (top)
  let lightColor;
  if (lightState === 'GREEN') {
    lightColor = CONFIG.COLORS.lightGreen;
  } else if (lightState === 'YELLOW') {
    lightColor = CONFIG.COLORS.lightYellow;
  } else if (lightState === 'RED') {
    lightColor = CONFIG.COLORS.lightRed;
  }
  
  drawSquarePixel(0, lightColor);
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
