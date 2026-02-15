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
  let attempts = 0;

  while (obstacles.length < targetCount && attempts < maxAttempts) {
    attempts++;
    
    // Random blob size
    let blobSize = Math.floor(randomRange(CONFIG.OBSTACLE_MIN_SIZE, CONFIG.OBSTACLE_MAX_SIZE + 1));
    
    // Random starting position for the blob
    let startNode = Math.floor(Math.random() * CONFIG.TRACK_LEN);
    
    // Create the blob as an array of consecutive nodes
    let blob = [];
    for (let i = 0; i < blobSize; i++) {
      blob.push(wrapIndex(startNode + i));
    }
    
    // Check if any node in the blob is forbidden
    let hasForbidden = false;
    for (let node of blob) {
      if (forbiddenNodes.includes(node)) {
        hasForbidden = true;
        break;
      }
    }
    if (hasForbidden) continue;
    
    // Check if blob is too close to existing obstacle blobs
    let tooClose = false;
    for (let existingBlob of obstacles) {
      for (let node of blob) {
        for (let existingNode of existingBlob) {
          if (circularDistance(node, existingNode) < CONFIG.OBSTACLE_MIN_SEP) {
            tooClose = true;
            break;
          }
        }
        if (tooClose) break;
      }
      if (tooClose) break;
    }
    
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
  // At the instant the light becomes RED, check if players are hidden
  let p1Hidden = players[0].isHidden(obstacles);
  let p2Hidden = players[1].isHidden(obstacles);

  if (!p1Hidden && !p2Hidden) {
    // Both lose - draw
    players[0].isAlive = false;
    players[1].isAlive = false;
    endGame('draw', 'both players caught by red light');
  } else if (!p1Hidden) {
    players[0].isAlive = false;
    endGame(players[1].name, players[0].name + ' caught by red light');
  } else if (!p2Hidden) {
    players[1].isAlive = false;
    endGame(players[0].name, players[1].name + ' caught by red light');
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

  // Randomize starting positions adjacent to traffic light (node 0)
  // One player on node 1 (clockwise), one on node -1 (counterclockwise)
  let clockwiseNode = 1;
  let counterclockwiseNode = wrapIndex(-1); // This will be TRACK_LEN - 1
  
  // Randomly assign which player gets which side
  let player1Node, player2Node;
  if (Math.random() < 0.5) {
    player1Node = clockwiseNode;
    player2Node = counterclockwiseNode;
  } else {
    player1Node = counterclockwiseNode;
    player2Node = clockwiseNode;
  }

  // Create players
  players = [
    new Player(
      player1Node, 
      color(CONFIG.COLORS.player1), 
      'Player 1', 
      CONFIG.PLAYER1_LEFT, 
      CONFIG.PLAYER1_RIGHT
    ),
    new Player(
      player2Node, 
      color(CONFIG.COLORS.player2), 
      'Player 2', 
      CONFIG.PLAYER2_LEFT, 
      CONFIG.PLAYER2_RIGHT
    )
  ];

  // Generate obstacles once per round
  generateObstacles();
}

function endGame(winnerName, reason) {
  gameState = 'END';
  winner = winnerName;
  endReason = reason;
}

function checkWinConditions() {
  if (!players[0].isAlive && !players[1].isAlive) {
    if (winner === null) {
      endGame('DRAW', 'Both players eliminated');
    }
    return;
  }

  if (!players[0].isAlive) {
    if (winner === null) {
      endGame(players[1].name, players[0].name + ' moved during red light');
    }
    return;
  }

  if (!players[1].isAlive) {
    if (winner === null) {
      endGame(players[0].name, players[1].name + ' moved during red light');
    }
    return;
  }

  // Check if players reached opponent's start
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
      for (let player of players) {
        player.draw(obstacles);
      }
      drawTrafficLight(lightState);
      drawHUD();
    }
  } else if (gameState === 'END') {
    drawTrack();
    drawObstacles(obstacles);
    for (let player of players) {
      player.draw(obstacles);
    }
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
