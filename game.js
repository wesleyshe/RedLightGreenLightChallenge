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

// ===========================
// OBSTACLE GENERATION
// ===========================

function generateObstacles() {
  obstacles = [];
  let forbiddenNodes = [0, players[0].startNode, players[1].startNode];
  let targetCount = Math.floor(randomRange(CONFIG.OBSTACLE_MIN_COUNT, CONFIG.OBSTACLE_MAX_COUNT + 1));
  let maxAttempts = 1000;

  for (let attempts = 0; attempts < maxAttempts && obstacles.length < targetCount; attempts++) {
    let blobSize = Math.floor(randomRange(CONFIG.OBSTACLE_MIN_SIZE, CONFIG.OBSTACLE_MAX_SIZE + 1));
    let startNode = Math.floor(Math.random() * CONFIG.TRACK_LEN);
    
    let blob = [];
    for (let i = 0; i < blobSize; i++) {
      blob.push(wrapIndex(startNode + i));
    }
    
    if (blob.some(node => forbiddenNodes.includes(node))) continue;
    
    let tooClose = obstacles.some(existingBlob =>
      blob.some(node =>
        existingBlob.some(existingNode =>
          circularDistance(node, existingNode) < CONFIG.OBSTACLE_MIN_SEP
        )
      )
    );
    
    if (!tooClose) {
      obstacles.push(blob);
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
    lightState = 'YELLOW';
    lightDuration = randomRange(CONFIG.YELLOW_MIN_MS, CONFIG.YELLOW_MAX_MS) / 1000;
    lightTimer = 0;
  } else if (lightState === 'YELLOW') {
    lightState = 'RED';
    lightDuration = randomRange(CONFIG.RED_MIN_MS, CONFIG.RED_MAX_MS) / 1000;
    lightTimer = 0;
    checkRedLightLoss();
  } else if (lightState === 'RED') {
    lightState = 'GREEN';
    lightDuration = randomRange(CONFIG.GREEN_MIN_MS, CONFIG.GREEN_MAX_MS) / 1000;
    lightTimer = 0;
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
  lightDuration = randomRange(CONFIG.GREEN_MIN_MS, CONFIG.GREEN_MAX_MS) / 1000;
  winner = null;
  endReason = '';

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
    
    for (let player of players) {
      player.update(dt, lightState, obstacles);
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
