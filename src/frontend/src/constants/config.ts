/**
 * Application configuration constants
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Game Configuration
export const TOTAL_ROUNDS = 720;
export const POLL_INTERVAL_RUNNING = 1000;
export const POLL_INTERVAL_IDLE = 2000;

// UI Configuration
export const COMPACT_NAV_BREAKPOINT = 1065;
export const MAX_VISIBLE_AIRPORTS = 15;
export const MAX_EVENTS_HEIGHT = 500;

// Animation Configuration
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
