/**
 * Demand Forecasting Module
 * Predicts future kit demand based on known flights and flight plans
 */

import {
  PerClassAmount,
  FlightEvent,
  FlightPlan,
  KIT_CLASSES
} from '../types';

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

  constructor(flightPlans: FlightPlan[]) {
    this.flightPlans = flightPlans;
  }

  /**
   * Record observed passenger counts from actual flights
   * Call this when SCHEDULED or CHECKED_IN events are received
   * This enables adaptive learning for different datasets
   */
  recordObservedDemand(passengers: PerClassAmount): void {
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
   */
  private getTypicalDemandEstimate(kitClass: keyof PerClassAmount): number {
    // FIX 3.1: Reduced economy from 250 to 200 to prevent spoke overflow
    switch (kitClass) {
      case 'first': return 10;
      case 'business': return 50;
      case 'premiumEconomy': return 25;
      case 'economy': return 200;  // Was 250
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
}
