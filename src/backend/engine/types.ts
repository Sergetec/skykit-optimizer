/**
 * Engine-specific types and interfaces
 */

import { PerClassAmount } from '../types';

// Track kits that are in-flight (loaded on a plane, not yet landed)
export interface InFlightKits {
  flightId: string;
  destinationAirport: string;
  kits: PerClassAmount;
  arrivalDay: number;
  arrivalHour: number;
}

// Track kits that are processing at an airport (arrived but not yet available)
export interface ProcessingKits {
  airportCode: string;
  kits: PerClassAmount;
  readyDay: number;
  readyHour: number;
}

// Configuration for purchasing strategy
export interface PurchaseConfig {
  // Thresholds - when stock falls below, trigger purchase
  thresholds: Record<string, number>;

  // Emergency thresholds - when stock is critically low
  emergencyThresholds: Record<string, number>;

  // Maximum per single order (for pacing)
  maxPerOrder: Record<string, number>;

  // Maximum total purchases per class
  maxTotalPurchase: Record<string, number>;

  // API limits per request
  apiLimits: Record<string, number>;

  // Purchase interval in hours (how often to check for regular purchases)
  purchaseInterval: number;

  // Buffer multiplier for demand forecasting
  demandBuffer: number;

  // How many hours ahead to forecast
  forecastHours: number;
}

// Configuration for flight loading strategy
export interface LoadingConfig {
  // Safety buffer to keep at each airport (avoid negative inventory)
  safetyBuffer: {
    hub: number;
    spoke: number;
  };

  // How many hours ahead to look for demand at destinations
  destinationForecastHours: number;

  // Whether to load extra kits for destination deficit
  enableExtraLoadingToSpokes: boolean;

  // Whether to return surplus kits to hub
  enableReturnToHub: boolean;
}

/**
 * Calculate dynamic purchase config based on hub capacity
 * This ensures thresholds scale properly with different datasets
 * CRITICAL for robustness on new data!
 */
export function calculateDynamicPurchaseConfig(hubCapacity: PerClassAmount): PurchaseConfig {
  return {
    // Thresholds as percentage of hub capacity
    // These percentages were tuned on current dataset but should work on others
    thresholds: {
      first: Math.floor(hubCapacity.first * 0.10),           // 10% of capacity
      business: Math.floor(hubCapacity.business * 0.33),     // 33% of capacity
      premiumEconomy: Math.floor(hubCapacity.premiumEconomy * 0.40), // 40% of capacity
      economy: Math.floor(hubCapacity.economy * 0.70)        // 70% of capacity
    },
    // Emergency thresholds - trigger immediate purchase
    emergencyThresholds: {
      first: Math.max(50, Math.floor(hubCapacity.first * 0.02)),
      business: Math.max(200, Math.floor(hubCapacity.business * 0.03)),
      premiumEconomy: Math.max(50, Math.floor(hubCapacity.premiumEconomy * 0.02)),
      economy: Math.max(1000, Math.floor(hubCapacity.economy * 0.05))
    },
    // Max per order as percentage of capacity
    maxPerOrder: {
      first: Math.max(100, Math.floor(hubCapacity.first * 0.05)),
      business: Math.max(500, Math.floor(hubCapacity.business * 0.15)),
      premiumEconomy: Math.max(100, Math.floor(hubCapacity.premiumEconomy * 0.10)),
      economy: Math.max(2000, Math.floor(hubCapacity.economy * 0.15))
    },
    // Max total - 3x capacity should be enough for 30 days
    maxTotalPurchase: {
      first: hubCapacity.first * 3,
      business: hubCapacity.business * 3,
      premiumEconomy: hubCapacity.premiumEconomy * 3,
      economy: hubCapacity.economy * 3
    },
    // API limits - server constraints, keep as-is
    apiLimits: {
      first: 42000,
      business: 42000,
      premiumEconomy: 3000,
      economy: 42000
    },
    purchaseInterval: 6,
    demandBuffer: 1.0,
    forecastHours: 48
  };
}

/**
 * Calculate dynamic loading config based on hub capacity
 * Safety buffers as percentages for robustness
 */
export function calculateDynamicLoadingConfig(hubCapacity: PerClassAmount): LoadingConfig {
  return {
    safetyBuffer: {
      hub: 0.01,   // 1% of capacity (will be calculated per airport)
      spoke: 0.03  // 3% of capacity
    },
    destinationForecastHours: 24,
    enableExtraLoadingToSpokes: true,
    enableReturnToHub: true
  };
}

// Default configurations (fallback if hub capacity not available)
export const DEFAULT_PURCHASE_CONFIG: PurchaseConfig = {
  thresholds: {
    first: 1800,        // FIX 23: Was 1200, increased to reduce UNFULFILLED
    business: 6000,
    premiumEconomy: 4000,  // FIX 23: Was 2500, increased to reduce UNFULFILLED
    economy: 70000         // FIX 23: Was 50000, increased to reduce UNFULFILLED (51% of penalties!)
  },
  emergencyThresholds: {
    first: 400,         // FIX 8: Was 300, increased
    business: 2000,
    premiumEconomy: 400,   // FIX 8: Was 300, increased
    economy: 10000
  },
  maxPerOrder: {
    first: 1000,        // FIX 23: Was 700, increased to reduce UNFULFILLED
    business: 3000,
    premiumEconomy: 1000,  // FIX 23: Was 700, increased to reduce UNFULFILLED
    economy: 15000         // FIX 23: Was 10000, increased to reduce UNFULFILLED
  },
  maxTotalPurchase: {
    first: 50000,
    business: 100000,
    premiumEconomy: 30000,
    economy: 200000
  },
  apiLimits: {
    first: 42000,
    business: 42000,
    premiumEconomy: 3000,  // FIX 1.2: Was 1000, aligned with threshold to prevent burst purchases
    economy: 42000
  },
  purchaseInterval: 6,
  demandBuffer: 1.0,  // FIX 1.1: Was 1.1, reduced to prevent over-purchasing
  forecastHours: 48
};

export const DEFAULT_LOADING_CONFIG: LoadingConfig = {
  safetyBuffer: {
    hub: 100,
    spoke: 20
  },
  destinationForecastHours: 24,  // FIX 2.1: Was 48, reduced to prevent spoke overflow
  enableExtraLoadingToSpokes: true,
  enableReturnToHub: true
};
