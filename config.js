// ===========================
// GAME CONFIGURATION
// ===========================
// Adjust these parameters to customize the game behavior

const CONFIG = {
  // Track Configuration
  TRACK_LEN: 80,           // Number of discrete nodes on the track
  RING_RADIUS: 250,        // Radius of the circular track in pixels
  PIXEL_SIZE: 14,          // Size of each square pixel on the track

  // Movement Physics
  ACCEL: 200,              // Acceleration when pressing keys
  INERTIA: 0.95,           // Momentum (0-1, higher = more slippery/momentum, lower = tighter control)
  MAX_SPEED: 10,           // Maximum velocity

  // Obstacles
  OBSTACLE_STARTING_PIXELS: 30, // Total number of pixels of obstacles at start
  OBSTACLE_PIXEL_DECREMENT: 3,  // Number of pixels to decrease per cycle
  OBSTACLE_MIN_SEP: 3,     // Minimum separation between obstacles (in nodes)
  OBSTACLE_MIN_SIZE: 2,    // Minimum size of obstacle blob (in pixels)
  OBSTACLE_MAX_SIZE: 4,    // Maximum size of obstacle blob (in pixels)

  // Block Interaction Timing (in seconds)
  BLOCK_TRIGGER_TIME: 1.0,           // Time required to stand on a block to trigger breathing
  BLOCK_BREATHING_DURATION: 3.0,     // Time a block must breathe continuously before disappearing

  // Light Timing (in milliseconds)
  GREEN_MIN_MS: 1000,               // Minimum green light duration
  GREEN_MAX_MS: 3000,               // Maximum green light duration
  BREATHING_GREEN_MIN_MS: 2000,     // Minimum breathing green duration
  BREATHING_GREEN_MAX_MS: 4000,     // Maximum breathing green duration
  RED_MIN_MS: 2000,                 // Minimum red light duration
  RED_MAX_MS: 5000,                 // Maximum red light duration

  // Audio Duration (in seconds)
  AUDIO_CROSSING_DURATION: 0.287292,
  AUDIO_WAITING_DURATION: 0.862,

  // Visual Settings
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 800,

  // Colors
  COLORS: {
    background: '#000000',
    trackPixel: [80, 80, 80],
    player1: [255, 255, 100],
    player2: [100, 100, 255],
    obstacle: [255, 255, 255],
    lightGreen: [100, 255, 100],
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
