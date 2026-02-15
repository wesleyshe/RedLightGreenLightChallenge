// ===========================
// GAME CONFIGURATION
// ===========================
// Adjust these parameters to customize the game behavior

const CONFIG = {
  // Track Configuration
  TRACK_LEN:80,           // Number of discrete nodes on the track
  RING_RADIUS: 250,        // Radius of the circular track in pixels
  PIXEL_SIZE: 14,          // Size of each square pixel on the track

  // Movement Physics
  ACCEL: 180,              // Acceleration when pressing keys
  INERTIA: 0.95,           // Momentum (0-1, higher = more slippery/momentum, lower = tighter control)
  MAX_SPEED: 20,           // Maximum velocity

  // Obstacles
  OBSTACLE_MIN_COUNT: 6,   // Minimum number of obstacle blobs
  OBSTACLE_MAX_COUNT: 10,  // Maximum number of obstacle blobs
  OBSTACLE_MIN_SEP: 3,     // Minimum separation between obstacles (in nodes)
  OBSTACLE_MIN_SIZE: 2,    // Minimum size of obstacle blob (in pixels)
  OBSTACLE_MAX_SIZE: 6,    // Maximum size of obstacle blob (in pixels)

  // Light Timing (in milliseconds)
  GREEN_MIN_MS: 3000,      // Minimum green light duration
  GREEN_MAX_MS: 6000,      // Maximum green light duration
  YELLOW_MIN_MS: 2000,     // Minimum yellow light duration
  YELLOW_MAX_MS: 4000,     // Maximum yellow light duration
  RED_MIN_MS: 3000,        // Minimum red light duration
  RED_MAX_MS: 5000,        // Maximum red light duration

  // Visual Settings
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 800,

  // Colors
  COLORS: {
    background: '#000000',
    trackPixel: [80, 80, 80],
    player1: [255, 100, 100],
    player2: [100, 100, 255],
    obstacle: [255, 255, 255],
    lightGreen: [100, 255, 100],
    lightYellow: [255, 255, 100],
    lightRed: [255, 100, 100],
    text: 255,
    textSecondary: 200,
    textTertiary: 150
  },

  // Player Controls
  PLAYER1_LEFT: 'A',
  PLAYER1_RIGHT: 'D',
  PLAYER2_LEFT: 'ArrowLeft',
  PLAYER2_RIGHT: 'ArrowRight'
};
