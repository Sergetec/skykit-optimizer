/**
 * Demand Forecasting Module
 * Predicts future kit demand based on known flights and flight plans
 *
 * Enhanced with dataset-adaptive calibration:
 * - Tracks demand statistics (mean, variance)
 * - Can recalibrate if observed demand differs from initial estimates
 * - Uses calibrated demand estimates when available
 */

import {
  PerClassAmount,
  FlightEvent,
  FlightPlan,
  KIT_CLASSES
} from '../types';
import { DatasetCharacteristics } from './calibrator';

/**
 * Statistics for observed demand per class
 */
interface DemandStats {
  count: number;
  sum: PerClassAmount;
  sumSq: PerClassAmount;  // For variance calculation
  min: PerClassAmount;
  max: PerClassAmount;
}

export class DemandForecaster {
  private flightPlans: FlightPlan[];

  // Track observed passenger counts for adaptive demand estimation
  // This makes the algorithm robust to different datasets
  private observedDemands: Record<keyof PerClassAmount, number[]> = {
    first: [],
    business: [],
    premiumEconomy: [],
    economy: []
  };

  // Cached averages (updated when new observations added)
  private cachedAverages: Record<keyof PerClassAmount, number> | null = null;

  // Dataset characteristics for calibrated estimates
  private characteristics: DatasetCharacteristics | null = null;

  // Enhanced demand statistics
  private demandStats: DemandStats = {
    count: 0,
    sum: { first: 0, business: 0, premiumEconomy: 0, economy: 0 },
    sumSq: { first: 0, business: 0, premiumEconomy: 0, economy: 0 },
    min: { first: Infinity, business: Infinity, premiumEconomy: Infinity, economy: Infinity },
    max: { first: 0, business: 0, premiumEconomy: 0, economy: 0 }
  };

  constructor(flightPlans: FlightPlan[], characteristics?: DatasetCharacteristics) {
    this.flightPlans = flightPlans;
    if (characteristics) {
      this.characteristics = characteristics;
    }
  }

  /**
   * Set dataset characteristics (can be called after construction)
   */
  setCharacteristics(characteristics: DatasetCharacteristics): void {
    this.characteristics = characteristics;
  }

  /**
   * Record observed passenger counts from actual flights
   * Call this when SCHEDULED or CHECKED_IN events are received
   * This enables adaptive learning for different datasets
   */
  recordObservedDemand(passengers: PerClassAmount): void {
    // Update per-class observation arrays (for moving average)
    for (const kitClass of KIT_CLASSES) {
      const count = passengers[kitClass];
      if (count > 0) {
        this.observedDemands[kitClass].push(count);
        // Keep only last 100 observations per class
        if (this.observedDemands[kitClass].length > 100) {
          this.observedDemands[kitClass].shift();
        }
      }
    }
    // Invalidate cache
    this.cachedAverages = null;

    // Update aggregate statistics (for recalibration decisions)
    this.demandStats.count++;
    for (const kitClass of KIT_CLASSES) {
      const val = passengers[kitClass];
      this.demandStats.sum[kitClass] += val;
      this.demandStats.sumSq[kitClass] += val * val;
      this.demandStats.min[kitClass] = Math.min(this.demandStats.min[kitClass], val);
      this.demandStats.max[kitClass] = Math.max(this.demandStats.max[kitClass], val);
    }
  }

  /**
   * Get observed mean for a kit class
   */
  getObservedMean(kitClass: keyof PerClassAmount): number {
    if (this.demandStats.count === 0) return 0;
    return this.demandStats.sum[kitClass] / this.demandStats.count;
  }

  /**
   * Get observed variance for a kit class
   */
  getObservedVariance(kitClass: keyof PerClassAmount): number {
    if (this.demandStats.count < 2) return 0;
    const mean = this.getObservedMean(kitClass);
    const meanSq = this.demandStats.sumSq[kitClass] / this.demandStats.count;
    return meanSq - mean * mean;
  }

  /**
   * Get all observed statistics
   */
  getDemandStats(): DemandStats {
    return this.demandStats;
  }

  /**
   * Check if we should recalibrate based on observed vs estimated demand
   * Returns true if observed differs from estimated by > 25%
   */
  shouldRecalibrate(): boolean {
    // Need at least 50 observations for meaningful comparison
    if (this.demandStats.count < 50) return false;

    // Get initial estimates (from calibration or defaults)
    const estimates = this.characteristics?.demandEstimates ?? {
      first: 10, business: 50, premiumEconomy: 25, economy: 200
    };

    // Check if any class differs by more than 25%
    for (const kitClass of KIT_CLASSES) {
      const observed = this.getObservedMean(kitClass);
      const estimated = estimates[kitClass];
      if (estimated === 0) continue;

      const ratio = observed / estimated;
      if (ratio < 0.75 || ratio > 1.25) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get updated demand estimates based on observations
   * Blends observed data with initial estimates for stability
   */
  getUpdatedDemandEstimates(): PerClassAmount {
    if (this.demandStats.count < 20) {
      // Not enough data, use initial estimates
      return this.characteristics?.demandEstimates ?? {
        first: 10, business: 50, premiumEconomy: 25, economy: 200
      };
    }

    const initial = this.characteristics?.demandEstimates ?? {
      first: 10, business: 50, premiumEconomy: 25, economy: 200
    };

    const updated: PerClassAmount = { first: 0, business: 0, premiumEconomy: 0, economy: 0 };

    for (const kitClass of KIT_CLASSES) {
      // Use observed mean with 30% buffer for safety
      const observed = this.getObservedMean(kitClass) * 1.3;
      // Blend: 70% observed, 30% initial (for stability)
      updated[kitClass] = Math.ceil(observed * 0.7 + initial[kitClass] * 0.3);
    }

    return updated;
  }

  /**
   * Get dynamic demand estimate based on observed flights
   * Falls back to conservative hardcoded values if not enough data
   */
  private getDynamicDemandEstimate(kitClass: keyof PerClassAmount): number {
    const observations = this.observedDemands[kitClass];

    // Need at least 5 observations for meaningful average
    if (observations.length >= 5) {
      if (!this.cachedAverages) {
        this.cachedAverages = {
          first: this.calculateAverage(this.observedDemands.first),
          business: this.calculateAverage(this.observedDemands.business),
          premiumEconomy: this.calculateAverage(this.observedDemands.premiumEconomy),
          economy: this.calculateAverage(this.observedDemands.economy)
        };
      }
      // Return average with 30% buffer
      return Math.ceil(this.cachedAverages[kitClass] * 1.3);
    }

    // Fall back to conservative hardcoded values
    return this.getTypicalDemandEstimate(kitClass);
  }

  private calculateAverage(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  /**
   * Calculate upcoming demand for a specific airport and kit class
   */
  calculateDemandForAirport(
    airportCode: string,
    currentDay: number,
    currentHour: number,
    withinHours: number,
    kitClass: keyof PerClassAmount,
    knownFlights: Map<string, FlightEvent>
  ): number {
    let demand = 0;

    const targetDay = currentDay + Math.floor((currentHour + withinHours) / 24);
    const targetHour = (currentHour + withinHours) % 24;

    // Use known flights if available (more accurate)
    for (const flight of knownFlights.values()) {
      if (flight.originAirport === airportCode) {
        const departsInWindow = (flight.departure.day < targetDay) ||
                               (flight.departure.day === targetDay && flight.departure.hour <= targetHour);
        const departsAfterNow = (flight.departure.day > currentDay) ||
                               (flight.departure.day === currentDay && flight.departure.hour >= currentHour);

        if (departsInWindow && departsAfterNow) {
          demand += flight.passengers[kitClass];
        }
      }
    }

    // Also use flight plan for forecasting beyond known flights
    let checkHour = currentHour;
    let checkDay = currentDay;

    for (let h = 0; h < withinHours; h++) {
      const weekdayIndex = checkDay % 7;

      for (const plan of this.flightPlans) {
        if (plan.departCode === airportCode &&
            plan.scheduledHour === checkHour &&
            plan.weekdays[weekdayIndex]) {
          // Estimate demand based on observed data (or typical load as fallback)
          const estimate = this.getDynamicDemandEstimate(kitClass);
          demand += estimate;
        }
      }

      checkHour++;
      if (checkHour >= 24) {
        checkHour = 0;
        checkDay++;
      }
    }

    return demand;
  }

  /**
   * Calculate INBOUND demand for an airport (arrivals INTO the airport)
   * This is what we need for pre-positioning kits at spokes - passengers ARRIVING need kits
   *
   * CRITICAL FIX: The original calculateDemandForAirport counts DEPARTURES, but
   * kits are consumed by ARRIVING passengers, not departing ones!
   */
  calculateInboundDemandForAirport(
    airportCode: string,
    currentDay: number,
    currentHour: number,
    withinHours: number,
    kitClass: keyof PerClassAmount,
    knownFlights: Map<string, FlightEvent>
  ): number {
    let demand = 0;

    const targetDay = currentDay + Math.floor((currentHour + withinHours) / 24);
    const targetHour = (currentHour + withinHours) % 24;

    // Use known flights - count ARRIVALS to this airport
    for (const flight of knownFlights.values()) {
      if (flight.destinationAirport === airportCode) {  // ARRIVALS, not departures!
        const arrivesInWindow = (flight.arrival.day < targetDay) ||
                               (flight.arrival.day === targetDay && flight.arrival.hour <= targetHour);
        const arrivesAfterNow = (flight.arrival.day > currentDay) ||
                               (flight.arrival.day === currentDay && flight.arrival.hour >= currentHour);

        if (arrivesInWindow && arrivesAfterNow) {
          demand += flight.passengers[kitClass];
        }
      }
    }

    // Also use flight plan for forecasting beyond known flights
    let checkHour = currentHour;
    let checkDay = currentDay;

    for (let h = 0; h < withinHours; h++) {
      const weekdayIndex = checkDay % 7;

      for (const plan of this.flightPlans) {
        // Count flights ARRIVING at this airport (arrivalCode, not departCode)
        if (plan.arrivalCode === airportCode &&
            plan.scheduledArrivalHour === checkHour &&
            plan.weekdays[weekdayIndex]) {
          const estimate = this.getDynamicDemandEstimate(kitClass);
          demand += estimate;
        }
      }

      checkHour++;
      if (checkHour >= 24) {
        checkHour = 0;
        checkDay++;
      }
    }

    return demand;
  }

  /**
   * Calculate total upcoming demand for all kit classes
   */
  calculateTotalDemand(
    airportCode: string,
    currentDay: number,
    currentHour: number,
    withinHours: number,
    knownFlights: Map<string, FlightEvent>
  ): PerClassAmount {
    const demand: PerClassAmount = { first: 0, business: 0, premiumEconomy: 0, economy: 0 };

    for (const kitClass of KIT_CLASSES) {
      demand[kitClass] = this.calculateDemandForAirport(
        airportCode,
        currentDay,
        currentHour,
        withinHours,
        kitClass,
        knownFlights
      );
    }

    return demand;
  }

  /**
   * Calculate demand from static flight plan (for forecasting before SCHEDULED events)
   */
  calculateScheduledDemand(
    airportCode: string,
    currentDay: number,
    currentHour: number,
    withinHours: number
  ): PerClassAmount {
    const demand: PerClassAmount = { first: 0, business: 0, premiumEconomy: 0, economy: 0 };

    let checkHour = currentHour;
    let checkDay = currentDay;

    for (let h = 0; h < withinHours; h++) {
      const weekdayIndex = checkDay % 7;

      for (const plan of this.flightPlans) {
        if (plan.departCode === airportCode &&
            plan.scheduledHour === checkHour &&
            plan.weekdays[weekdayIndex]) {
          // Estimate passengers based on observed data (or typical capacity as fallback)
          for (const kitClass of KIT_CLASSES) {
            demand[kitClass] += this.getDynamicDemandEstimate(kitClass);
          }
        }
      }

      checkHour++;
      if (checkHour >= 24) {
        checkHour = 0;
        checkDay++;
      }
    }

    return demand;
  }

  /**
   * Get typical demand estimate for a kit class
   * Uses calibrated values if available, otherwise falls back to defaults
   */
  private getTypicalDemandEstimate(kitClass: keyof PerClassAmount): number {
    // Use calibrated estimates if available
    if (this.characteristics?.demandEstimates) {
      return this.characteristics.demandEstimates[kitClass];
    }

    // Fall back to defaults (FIX 3.1: Reduced economy from 250 to 200)
    switch (kitClass) {
      case 'first': return 10;
      case 'business': return 50;
      case 'premiumEconomy': return 25;
      case 'economy': return 200;
      default: return 0;
    }
  }

  /**
   * Get flight distance from flight plan
   */
  getFlightDistance(origin: string, destination: string): number {
    for (const plan of this.flightPlans) {
      if (plan.departCode === origin && plan.arrivalCode === destination) {
        return plan.distanceKm;
      }
    }
    return 0;
  }

  /**
   * Get all flight plans
   */
  getFlightPlans(): FlightPlan[] {
    return this.flightPlans;
  }

  /**
   * Calculate average flight distance from all flight plans
   * Used to calibrate loading factors for different datasets
   */
  getAverageFlightDistance(): number {
    if (this.flightPlans.length === 0) return 2800; // Default fallback

    let totalDistance = 0;
    let count = 0;

    for (const plan of this.flightPlans) {
      if (plan.distanceKm > 0) {
        totalDistance += plan.distanceKm;
        count++;
      }
    }

    return count > 0 ? totalDistance / count : 2800;
  }
}
