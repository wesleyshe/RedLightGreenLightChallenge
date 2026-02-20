// ===========================
// GAME STATE AND LOGIC
// ===========================

let gameState = 'START'; // START, PLAYING, END
let lightState = 'GREEN'; // GREEN, YELLOW, RED
let lightTimer = 0;
let lightDuration = 0;
let obstacles = [];
let players = [];
let winner = null;
let endReason = '';
let currentTotalPixels = 0;
let crossingSound;
let waitingSound;

function preload() {
  crossingSound = loadSound('public/Crossing.mp3');
  waitingSound = loadSound('public/Waiting.mp3');
}

// ===========================
// OBSTACLE GENERATION
// ===========================

function generateObstacles() {
  obstacles = [];
  let forbiddenNodes = [0, players[0].startNode, players[1].startNode];
  let maxAttempts = 1000;
  let currentPixels = 0;
  let nextId = 1;

  for (let attempts = 0; attempts < maxAttempts && currentPixels < currentTotalPixels; attempts++) {
    let remainingPixels = currentTotalPixels - currentPixels;
    let blobSize = Math.floor(randomRange(CONFIG.OBSTACLE_MIN_SIZE, CONFIG.OBSTACLE_MAX_SIZE + 1));
    blobSize = Math.min(blobSize, remainingPixels);
    if (blobSize < 1) break;

    let startNode = Math.floor(Math.random() * CONFIG.TRACK_LEN);

    let blob = [];
    for (let i = 0; i < blobSize; i++) {
      blob.push(wrapIndex(startNode + i));
    }

    if (blob.some(node => forbiddenNodes.includes(node))) continue;

    let tooClose = obstacles.some(existingObstacle =>
      blob.some(node =>
        existingObstacle.nodes.some(existingNode =>
          circularDistance(node, existingNode.index) < CONFIG.OBSTACLE_MIN_SEP
        )
      )
    );

    if (!tooClose) {
      obstacles.push({
        id: nextId++,
        nodes: blob.map(n => ({ index: n, isBreathing: false, breathingTimer: 0 }))
      });
      currentPixels += blobSize;
    }
  }
}

// ===========================
// LIGHT STATE MACHINE
// ===========================

function updateLightState(dt) {
  lightTimer += dt;

  if (lightTimer >= lightDuration) {
    switchLightState();
  }
}

function switchLightState() {
  if (lightState === 'GREEN') {
    lightState = 'BREATHING_GREEN';
    let targetDuration = randomRange(CONFIG.BREATHING_GREEN_MIN_MS, CONFIG.BREATHING_GREEN_MAX_MS) / 1000;
    lightDuration = Math.max(1, Math.round(targetDuration / CONFIG.AUDIO_WAITING_DURATION)) * CONFIG.AUDIO_WAITING_DURATION;
    lightTimer = 0;

    crossingSound.stop();
    if (!waitingSound.isPlaying()) waitingSound.play();
  } else if (lightState === 'BREATHING_GREEN') {
    lightState = 'RED';
    let targetDuration = randomRange(CONFIG.RED_MIN_MS, CONFIG.RED_MAX_MS) / 1000;
    lightDuration = Math.max(1, Math.round(targetDuration / CONFIG.AUDIO_WAITING_DURATION)) * CONFIG.AUDIO_WAITING_DURATION;
    lightTimer = 0;
    checkRedLightLoss();

    crossingSound.stop();
    if (!waitingSound.isPlaying()) waitingSound.play();
  } else if (lightState === 'RED') {
    lightState = 'GREEN';
    let targetDuration = randomRange(CONFIG.GREEN_MIN_MS, CONFIG.GREEN_MAX_MS) / 1000;
    lightDuration = Math.max(1, Math.round(targetDuration / CONFIG.AUDIO_CROSSING_DURATION)) * CONFIG.AUDIO_CROSSING_DURATION;
    lightTimer = 0;
    currentTotalPixels = Math.max(1, currentTotalPixels - CONFIG.OBSTACLE_PIXEL_DECREMENT);
    generateObstacles();

    waitingSound.stop();
    if (!crossingSound.isPlaying()) crossingSound.play();
  }
}

function checkRedLightLoss() {
  let p1Hidden = players[0].isHidden(obstacles);
  let p2Hidden = players[1].isHidden(obstacles);

  if (!p1Hidden && !p2Hidden) {
    players[0].isAlive = false;
    players[1].isAlive = false;
    endGame('draw', 'both players caught by red light');
  } else if (!p1Hidden) {
    players[0].isAlive = false;
    endGame(players[1].name, players[0].name.toLowerCase() + ' caught by red light');
  } else if (!p2Hidden) {
    players[1].isAlive = false;
    endGame(players[0].name, players[1].name.toLowerCase() + ' caught by red light');
  }
}

// ===========================
// GAME FLOW
// ===========================

function startGame() {
  gameState = 'PLAYING';
  lightState = 'GREEN';
  lightTimer = 0;
  let targetDuration = randomRange(CONFIG.GREEN_MIN_MS, CONFIG.GREEN_MAX_MS) / 1000;
  lightDuration = Math.max(1, Math.round(targetDuration / CONFIG.AUDIO_CROSSING_DURATION)) * CONFIG.AUDIO_CROSSING_DURATION;

  if (waitingSound.isPlaying()) waitingSound.stop();
  crossingSound.play();
  winner = null;
  endReason = '';
  currentTotalPixels = CONFIG.OBSTACLE_STARTING_PIXELS;

  let clockwiseNode = 1;
  let counterclockwiseNode = CONFIG.TRACK_LEN - 1;

  let randomize = Math.random() < 0.5;
  let player1Node = randomize ? clockwiseNode : counterclockwiseNode;
  let player2Node = randomize ? counterclockwiseNode : clockwiseNode;

  players = [
    new Player(player1Node, color(CONFIG.COLORS.player1), 'player 1', CONFIG.PLAYER1_LEFT, CONFIG.PLAYER1_RIGHT),
    new Player(player2Node, color(CONFIG.COLORS.player2), 'player 2', CONFIG.PLAYER2_LEFT, CONFIG.PLAYER2_RIGHT)
  ];

  generateObstacles();
}

function endGame(winnerName, reason) {
  gameState = 'END';
  winner = winnerName;
  endReason = reason;

  crossingSound.stop();
  waitingSound.stop();
}

function checkWinConditions() {
  let bothDead = !players[0].isAlive && !players[1].isAlive;

  if (bothDead && winner === null) {
    endGame('draw', 'both players eliminated');
    return;
  }

  if (!players[0].isAlive && winner === null) {
    endGame(players[1].name, players[0].name.toLowerCase() + ' moved during red light');
    return;
  }

  if (!players[1].isAlive && winner === null) {
    endGame(players[0].name, players[1].name.toLowerCase() + ' moved during red light');
    return;
  }

  let p1Win = players[0].checkWin(players[1]);
  let p2Win = players[1].checkWin(players[0]);

  if (p1Win && p2Win) {
    endGame('draw', 'both players reached the goal');
  } else if (p1Win) {
    endGame(players[0].name, 'reached the goal');
  } else if (p2Win) {
    endGame(players[1].name, 'reached the goal');
  }
}

// ===========================
// P5.JS MAIN FUNCTIONS
// ===========================

function setup() {
  createCanvas(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  textAlign(CENTER, CENTER);
  textFont('Consolas');
}

function draw() {
  background(CONFIG.COLORS.background);

  if (gameState === 'START') {
    drawStartScreen();
  } else if (gameState === 'PLAYING') {
    let dt = deltaTime / 1000;
    updateLightState(dt);

    for (let i = obstacles.length - 1; i >= 0; i--) {
      let obs = obstacles[i];
      for (let j = obs.nodes.length - 1; j >= 0; j--) {
        let nodeObj = obs.nodes[j];
        if (nodeObj.isBreathing) {
          nodeObj.breathingTimer += dt;
          if (nodeObj.breathingTimer >= CONFIG.BLOCK_BREATHING_DURATION) {
            obs.nodes.splice(j, 1);
          }
        }
      }
      if (obs.nodes.length === 0) {
        obstacles.splice(i, 1);
      }
    }

    for (let player of players) {
      player.update(dt, lightState, obstacles);
    }

    // Audio Sync Check
    if (gameState === 'PLAYING') {
      if (lightState === 'GREEN' && !crossingSound.isPlaying()) {
        crossingSound.play();
      } else if ((lightState === 'BREATHING_GREEN' || lightState === 'RED') && !waitingSound.isPlaying()) {
        waitingSound.play();
      }
    }

    checkWinConditions();

    if (gameState === 'PLAYING') {
      drawTrack();
      drawObstacles(obstacles);
      players.forEach(p => p.draw());
      drawTrafficLight(lightState);
      drawHUD();
    }
  } else if (gameState === 'END') {
    drawTrack();
    drawObstacles(obstacles);
    players.forEach(p => p.draw());
    drawTrafficLight(lightState);
    drawEndScreen(winner, endReason);
  }
}

function keyPressed() {
  if (gameState === 'START' && key === ' ') {
    startGame();
  }

  if (gameState === 'END' && (key === 'r' || key === 'R')) {
    startGame();
  }

  // Prevent default for arrow keys
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    return false;
  }
}
