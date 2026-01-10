// Application constants

export const APP_NAME = '랜덤 런치 조 편성기';
export const DEFAULT_GROUP_SIZE = 4;
export const MIN_GROUP_SIZE = 3;
export const MAX_GROUP_SIZE = 5;

// Simulated Annealing parameters
export const SA_PARAMS = {
  initialTemp: 1000,
  coolingRate: 0.995,
  minTemp: 0.01,
  maxItersPerTemp: 100,
};

// File paths (relative to userData directory)
export const DATA_DIR = 'data';
export const ASSIGNMENTS_DIR = 'data/assignments';
export const EDGE_WEIGHTS_FILE = 'data/edge-weights.json';
export const SETTINGS_FILE = 'data/settings.json';
