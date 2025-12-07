/**
 * Dataset Calibration Module
 * Analyzes CSV data to calculate dataset-agnostic parameters
 *
 * This module enables the optimizer to work on unseen datasets by:
 * 1. Analyzing network topology (hub/spoke structure)
 * 2. Calculating economic ratios (penalty vs cost)
 * 3. Deriving optimal parameters from first principles
 */

import { PerClassAmount, Airport, Aircraft, FlightPlan, KIT_CLASSES } from '../types';

/**
 * Network topology metrics derived from CSV data
 */
export interface NetworkTopology {
  hubCode: string;
  spokeCount: number;
  totalFlightsPerDay: number;
  avgFlightsPerSpoke: number;
  hubCapacity: PerClassAmount;
  avgSpokeCapacity: PerClassAmount;
  minSpokeCapacity: PerClassAmount;
  capacityRatio: PerClassAmount;  // hub / avg_spoke
}

/**
 * Route economics derived from flight_plan.csv
 */
export interface RouteEconomics {
  avgDistance: number;
  minDistance: number;
  maxDistance: number;
  distanceStdDev: number;
  avgPenaltyPerEconomyKit: number;  // 0.003 * avgDistance * 50
  avgTransportCost: number;         // loading + fuel + processing
  penaltyCostRatio: number;         // penalty / cost (KEY METRIC)
}

/**
 * Calibrated thresholds for economy load factor
 */
export interface EconomyLoadFactorConfig {
  baseline: number;           // Starting load factor (e.g., 0.72)
  warningThreshold: number;   // Occupancy % to start reducing (e.g., 0.60)
  dangerThreshold: number;    // Occupancy % for aggressive reduction (e.g., 0.80)
  minFactor: number;          // Absolute minimum (e.g., 0.50)
  maxFactor: number;          // Absolute maximum (e.g., 0.85)
}

/**
 * Complete dataset characteristics - the main output
 */
export interface DatasetCharacteristics {
  // Network structure
  topology: NetworkTopology;

  // Economic analysis
  economics: RouteEconomics;

  // Derived parameters
  economyLoadFactor: EconomyLoadFactorConfig;
  demandEstimates: PerClassAmount;

  // Destination buffer percentages (for overflow prevention)
  destinationBuffers: {
    hub: number;
    economy: number;
    premiumEconomy: number;
    firstBusiness: number;
  };

  // Purchase threshold percentages (of hub capacity)
  purchaseThresholdPercents: PerClassAmount;

  // Confidence in calibration (0-1)
  confidence: number;

  // Any warnings detected
  warnings: string[];
}

/**
 * Sanity bounds for calibrated parameters
 */
const SANITY_BOUNDS = {
  economyLoadFactor: { min: 0.50, max: 0.90 },
  purchaseThreshold: { min: 0.05, max: 0.90 },
  demandEstimate: {
    first: { min: 2, max: 100 },
    business: { min: 5, max: 200 },
    premiumEconomy: { min: 3, max: 150 },
    economy: { min: 30, max: 600 }
  }
};

/**
 * Main calibration class
 */
export class NetworkCalibrator {
  private airports: Map<string, Airport>;
  private aircraft: Map<string, Aircraft>;
  private flightPlans: FlightPlan[];

  constructor(
    airports: Map<string, Airport>,
    aircraft: Map<string, Aircraft>,
    flightPlans: FlightPlan[]
  ) {
    this.airports = airports;
    this.aircraft = aircraft;
    this.flightPlans = flightPlans;
  }

  /**
   * Main calibration method - analyzes data and returns characteristics
   */
  calibrate(): DatasetCharacteristics {
    const warnings: string[] = [];

    // Step 1: Analyze network topology
    const topology = this.analyzeTopology();

    // Step 2: Analyze route economics
    const economics = this.analyzeEconomics(topology);

    // Step 3: Calculate optimal economy load factor
    const economyLoadFactor = this.calculateEconomyLoadFactor(economics, topology);

    // Step 4: Estimate demand per flight
    const demandEstimates = this.estimateDemand();

    // Step 5: Calculate destination buffers
    const destinationBuffers = this.calculateDestinationBuffers(topology);

    // Step 6: Calculate purchase thresholds
    const purchaseThresholdPercents = this.calculatePurchaseThresholds(topology, demandEstimates);

    // Validate and add warnings
    if (topology.spokeCount < 5) {
      warnings.push(`Small network detected: only ${topology.spokeCount} spokes`);
    }
    if (topology.spokeCount > 100) {
      warnings.push(`Large network detected: ${topology.spokeCount} spokes`);
    }
    if (economics.distanceStdDev > economics.avgDistance * 0.6) {
      warnings.push('High distance variance - may need route-specific adjustments');
    }

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(topology, economics);

    return {
      topology,
      economics,
      economyLoadFactor,
      demandEstimates,
      destinationBuffers,
      purchaseThresholdPercents,
      confidence,
      warnings
    };
  }

  /**
   * Analyze network topology from airport data
   */
  private analyzeTopology(): NetworkTopology {
    const hub = this.airports.get('HUB1');
    const spokes = [...this.airports.values()].filter(a => !a.isHub);

    if (!hub) {
      throw new Error('HUB1 not found in airports data');
    }

    // Calculate average and minimum spoke capacity
    const avgSpokeCapacity: PerClassAmount = { first: 0, business: 0, premiumEconomy: 0, economy: 0 };
    const minSpokeCapacity: PerClassAmount = { first: Infinity, business: Infinity, premiumEconomy: Infinity, economy: Infinity };

    for (const spoke of spokes) {
      for (const kitClass of KIT_CLASSES) {
        avgSpokeCapacity[kitClass] += spoke.capacity[kitClass] / spokes.length;
        minSpokeCapacity[kitClass] = Math.min(minSpokeCapacity[kitClass], spoke.capacity[kitClass]);
      }
    }

    // Count flights per day (average across weekdays)
    const flightsPerWeekday = new Array(7).fill(0);
    for (const plan of this.flightPlans) {
      for (let d = 0; d < 7; d++) {
        if (plan.weekdays[d]) flightsPerWeekday[d]++;
      }
    }
    const avgFlightsPerDay = flightsPerWeekday.reduce((a, b) => a + b, 0) / 7;

    // Calculate capacity ratios
    const capacityRatio: PerClassAmount = { first: 0, business: 0, premiumEconomy: 0, economy: 0 };
    for (const kitClass of KIT_CLASSES) {
      capacityRatio[kitClass] = avgSpokeCapacity[kitClass] > 0
        ? hub.capacity[kitClass] / avgSpokeCapacity[kitClass]
        : 1;
    }

    return {
      hubCode: 'HUB1',
      spokeCount: spokes.length,
      totalFlightsPerDay: avgFlightsPerDay,
      avgFlightsPerSpoke: avgFlightsPerDay / Math.max(1, spokes.length) / 2,  // /2 for round-trip
      hubCapacity: { ...hub.capacity },
      avgSpokeCapacity,
      minSpokeCapacity,
      capacityRatio
    };
  }

  /**
   * Analyze route economics (penalty vs cost)
   */
  private analyzeEconomics(topology: NetworkTopology): RouteEconomics {
    const distances = this.flightPlans.map(p => p.distanceKm).filter(d => d > 0);

    if (distances.length === 0) {
      // Fallback for empty flight plans
      return {
        avgDistance: 3000,
        minDistance: 500,
        maxDistance: 6000,
        distanceStdDev: 1500,
        avgPenaltyPerEconomyKit: 4.5,  // 0.003 * 3000 * 50
        avgTransportCost: 4.0,
        penaltyCostRatio: 1.125
      };
    }

    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const minDistance = Math.min(...distances);
    const maxDistance = Math.max(...distances);

    // Calculate standard deviation
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
    const distanceStdDev = Math.sqrt(variance);

    // Calculate penalty per economy kit (game formula: 0.003 * distance * $50)
    const avgPenaltyPerEconomyKit = 0.003 * avgDistance * 50;

    // Calculate average transport cost
    const avgTransportCost = this.calculateAvgTransportCost(avgDistance);

    return {
      avgDistance,
      minDistance,
      maxDistance,
      distanceStdDev,
      avgPenaltyPerEconomyKit,
      avgTransportCost,
      penaltyCostRatio: avgPenaltyPerEconomyKit / avgTransportCost
    };
  }

  /**
   * Calculate average transport cost per economy kit
   */
  private calculateAvgTransportCost(avgDistance: number): number {
    const hub = this.airports.get('HUB1');
    const spokes = [...this.airports.values()].filter(a => !a.isHub);

    // Loading cost at hub
    const avgLoadingCost = hub?.loadingCost?.economy ?? 2.0;

    // Fuel cost = distance * costPerKgPerKm * kitWeight (1.5kg for economy)
    const aircraftArray = [...this.aircraft.values()];
    const avgFuelRate = aircraftArray.length > 0
      ? aircraftArray.reduce((sum, a) => sum + a.costPerKgPerKm, 0) / aircraftArray.length
      : 0.001;
    const avgFuelCost = avgDistance * avgFuelRate * 1.5;

    // Processing cost at destination (average across spokes)
    const avgProcessingCost = spokes.length > 0
      ? spokes.reduce((sum, s) => sum + (s.processingCost?.economy ?? 4.0), 0) / spokes.length
      : 4.0;

    return avgLoadingCost + avgFuelCost + avgProcessingCost;
  }

  /**
   * Calculate optimal economy load factor from first principles
   *
   * The key insight: penalty/cost ratio determines when loading is profitable
   * - If R >= 1.0: penalty > cost, always load (economicOptimal = 1.0)
   * - If R < 1.0: interpolate from 0.5 to 1.0
   */
  private calculateEconomyLoadFactor(
    economics: RouteEconomics,
    topology: NetworkTopology
  ): EconomyLoadFactorConfig {
    const R = economics.penaltyCostRatio;

    // Economic optimal based on penalty/cost ratio
    // At R=0: 50% (some loading needed to prevent cascade)
    // At R=1: 100% (breakeven point)
    // At R>1: 100% (loading is always profitable)
    const economicOptimal = R >= 1.0 ? 1.0 : 0.5 + 0.5 * R;

    // Capacity-based adjustment
    // Higher capacity ratio = spokes can handle more = be more aggressive
    // Lower capacity ratio = spokes fill up faster = be conservative
    const capacityFactor = Math.min(1.0, topology.capacityRatio.economy / 15);

    // Calculate baseline: 0.60 to 0.85 range
    // economicOptimal contributes 60%, capacityFactor 40%
    let baseline = 0.55 + (economicOptimal - 0.5) * 0.35 + capacityFactor * 0.10;

    // Clamp to sanity bounds
    baseline = Math.max(SANITY_BOUNDS.economyLoadFactor.min,
                Math.min(SANITY_BOUNDS.economyLoadFactor.max, baseline));

    // Round to 2 decimal places
    baseline = Math.round(baseline * 100) / 100;

    // Calculate occupancy thresholds based on spoke capacity
    // daysBuffer = spoke capacity / daily demand
    const avgDailyDemandPerSpoke = (topology.totalFlightsPerDay / topology.spokeCount) * 200;
    const daysBuffer = topology.avgSpokeCapacity.economy / Math.max(1, avgDailyDemandPerSpoke);

    // If buffer < 1 day, use earlier warning thresholds
    const warningThreshold = daysBuffer < 1.5 ? 0.50 : 0.60;
    const dangerThreshold = daysBuffer < 1.5 ? 0.70 : 0.80;

    return {
      baseline,
      warningThreshold,
      dangerThreshold,
      minFactor: 0.50,
      maxFactor: Math.min(baseline + 0.10, 0.90)  // Allow +10% adjustment room
    };
  }

  /**
   * Estimate demand per flight based on aircraft capacity
   */
  private estimateDemand(): PerClassAmount {
    const aircraftArray = [...this.aircraft.values()];

    if (aircraftArray.length === 0) {
      // Fallback
      return { first: 10, business: 50, premiumEconomy: 25, economy: 200 };
    }

    // Calculate average seats per aircraft type
    const avgSeats: PerClassAmount = { first: 0, business: 0, premiumEconomy: 0, economy: 0 };
    for (const aircraft of aircraftArray) {
      avgSeats.first += aircraft.seats.first / aircraftArray.length;
      avgSeats.business += aircraft.seats.business / aircraftArray.length;
      avgSeats.premiumEconomy += aircraft.seats.premiumEconomy / aircraftArray.length;
      avgSeats.economy += aircraft.seats.economy / aircraftArray.length;
    }

    // Assume typical 80% passenger load factor (industry standard)
    const PASSENGER_LOAD_FACTOR = 0.80;

    const estimates: PerClassAmount = {
      first: Math.max(SANITY_BOUNDS.demandEstimate.first.min,
              Math.min(SANITY_BOUNDS.demandEstimate.first.max,
                Math.ceil(avgSeats.first * PASSENGER_LOAD_FACTOR))),
      business: Math.max(SANITY_BOUNDS.demandEstimate.business.min,
                Math.min(SANITY_BOUNDS.demandEstimate.business.max,
                  Math.ceil(avgSeats.business * PASSENGER_LOAD_FACTOR))),
      premiumEconomy: Math.max(SANITY_BOUNDS.demandEstimate.premiumEconomy.min,
                      Math.min(SANITY_BOUNDS.demandEstimate.premiumEconomy.max,
                        Math.ceil(avgSeats.premiumEconomy * PASSENGER_LOAD_FACTOR))),
      economy: Math.max(SANITY_BOUNDS.demandEstimate.economy.min,
               Math.min(SANITY_BOUNDS.demandEstimate.economy.max,
                 Math.ceil(avgSeats.economy * PASSENGER_LOAD_FACTOR)))
    };

    return estimates;
  }

  /**
   * Calculate destination buffer percentages for overflow prevention
   *
   * TUNING NOTE: These buffers control how full spokes can get before we stop sending kits.
   * Higher buffer = allow more kits = less UNFULFILLED but more OVERFLOW risk
   * Lower buffer = fewer kits = more UNFULFILLED but less OVERFLOW risk
   *
   * TESTED: 75-90% range caused +$1.14M overflow for only -$4M unfulfilled = net worse
   * REVERTED to 65-80% which gave better results ($736.9M vs $739.2M)
   */
  private calculateDestinationBuffers(topology: NetworkTopology): {
    hub: number;
    economy: number;
    premiumEconomy: number;
    firstBusiness: number;
  } {
    // Hub can handle more (0.95 = 95% of capacity allowed)
    const hub = 0.95;

    // Spoke buffers depend on capacity ratio
    // Higher ratio = hub dominates = spokes need more protection
    // Lower ratio = spokes are relatively large = can accept more
    const economyRatio = topology.capacityRatio.economy;

    // Economy: 65-80% buffer based on capacity ratio
    // If ratio > 20 (hub 20x larger), use 65%
    // If ratio < 5 (hub only 5x larger), use 80%
    const economy = Math.max(0.65, Math.min(0.80, 0.65 + (20 - economyRatio) * 0.01));

    // Premium Economy: 75-85%
    const premiumEconomy = Math.max(0.75, Math.min(0.85, 0.75 + (20 - topology.capacityRatio.premiumEconomy) * 0.005));

    // First/Business: 80-90%
    const firstBusiness = Math.max(0.80, Math.min(0.90, 0.80 + (20 - topology.capacityRatio.first) * 0.005));

    return { hub, economy, premiumEconomy, firstBusiness };
  }

  /**
   * Calculate purchase threshold percentages based on demand and lead times
   */
  private calculatePurchaseThresholds(
    topology: NetworkTopology,
    demandEstimates: PerClassAmount
  ): PerClassAmount {
    // Lead times in hours
    const LEAD_TIMES: PerClassAmount = {
      first: 48,
      business: 36,
      premiumEconomy: 24,
      economy: 12
    };

    const thresholds: PerClassAmount = { first: 0, business: 0, premiumEconomy: 0, economy: 0 };

    for (const kitClass of KIT_CLASSES) {
      // Demand per hour = flights per day / 24 * passengers per flight
      const demandPerHour = (topology.totalFlightsPerDay / 24) * demandEstimates[kitClass];

      // Demand during lead time
      const demandDuringLeadTime = demandPerHour * LEAD_TIMES[kitClass];

      // Safety multiplier = 1.5 (base) + variance adjustment
      const safetyMultiplier = 1.5;

      // Threshold as percentage of hub capacity
      const rawThreshold = (demandDuringLeadTime * safetyMultiplier) / topology.hubCapacity[kitClass];

      // Clamp to sanity bounds
      thresholds[kitClass] = Math.max(SANITY_BOUNDS.purchaseThreshold.min,
                             Math.min(SANITY_BOUNDS.purchaseThreshold.max, rawThreshold));
    }

    return thresholds;
  }

  /**
   * Calculate confidence in calibration (0-1)
   */
  private calculateConfidence(topology: NetworkTopology, economics: RouteEconomics): number {
    let confidence = 1.0;

    // Reduce confidence for unusual networks
    if (topology.spokeCount < 5 || topology.spokeCount > 100) {
      confidence -= 0.1;
    }

    // Reduce confidence for high distance variance
    if (economics.distanceStdDev > economics.avgDistance * 0.5) {
      confidence -= 0.1;
    }

    // Reduce confidence if no aircraft data
    if (this.aircraft.size === 0) {
      confidence -= 0.2;
    }

    // Reduce confidence if few flight plans
    if (this.flightPlans.length < 50) {
      confidence -= 0.2;
    }

    return Math.max(0.3, confidence);
  }
}

/**
 * Runtime calibration updates based on observed data
 */
export class RuntimeCalibrator {
  private initialCharacteristics: DatasetCharacteristics;
  private observedDemand: { count: number; sum: PerClassAmount; sumSq: PerClassAmount };
  private adjustmentHistory: number[];
  private cumulativeAdjustment: number;

  constructor(initial: DatasetCharacteristics) {
    this.initialCharacteristics = initial;
    this.observedDemand = {
      count: 0,
      sum: { first: 0, business: 0, premiumEconomy: 0, economy: 0 },
      sumSq: { first: 0, business: 0, premiumEconomy: 0, economy: 0 }
    };
    this.adjustmentHistory = [];
    this.cumulativeAdjustment = 0;
  }

  /**
   * Record observed demand from a flight
   */
  recordObservation(passengers: PerClassAmount): void {
    this.observedDemand.count++;
    for (const kitClass of KIT_CLASSES) {
      this.observedDemand.sum[kitClass] += passengers[kitClass];
      this.observedDemand.sumSq[kitClass] += passengers[kitClass] * passengers[kitClass];
    }
  }

  /**
   * Get observed mean for a kit class
   */
  getObservedMean(kitClass: keyof PerClassAmount): number {
    if (this.observedDemand.count === 0) return 0;
    return this.observedDemand.sum[kitClass] / this.observedDemand.count;
  }

  /**
   * Check if we should recalibrate based on observed vs estimated demand
   */
  shouldRecalibrate(): boolean {
    if (this.observedDemand.count < 50) return false;

    // Check if observed differs from estimated by > 25%
    for (const kitClass of KIT_CLASSES) {
      const observed = this.getObservedMean(kitClass);
      const estimated = this.initialCharacteristics.demandEstimates[kitClass];
      const ratio = observed / Math.max(1, estimated);
      if (ratio < 0.75 || ratio > 1.25) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get updated demand estimates based on observations
   */
  getUpdatedDemandEstimates(): PerClassAmount {
    if (this.observedDemand.count < 20) {
      return this.initialCharacteristics.demandEstimates;
    }

    const updated: PerClassAmount = { first: 0, business: 0, premiumEconomy: 0, economy: 0 };
    for (const kitClass of KIT_CLASSES) {
      // Use observed mean with 30% buffer
      const observed = this.getObservedMean(kitClass) * 1.3;
      // Blend with initial estimate (70% observed, 30% initial for stability)
      const initial = this.initialCharacteristics.demandEstimates[kitClass];
      updated[kitClass] = Math.ceil(observed * 0.7 + initial * 0.3);
    }
    return updated;
  }

  /**
   * Suggest economy load factor adjustment based on penalty patterns
   *
   * @param unfulfilledCost Total economy unfulfilled penalty cost
   * @param overflowCost Total overflow penalty cost
   * @param currentDay Current game day
   * @returns Suggested adjustment (-0.02 to +0.02)
   */
  suggestLoadFactorAdjustment(
    unfulfilledCost: number,
    overflowCost: number,
    currentDay: number
  ): number {
    // Don't adjust in first 3 days (need baseline data)
    if (currentDay < 3) return 0;

    // Calculate per-day rates
    const unfulfilledRate = unfulfilledCost / currentDay;
    const overflowRate = overflowCost / currentDay;

    // Stability guards
    const MAX_DAILY_ADJUSTMENT = 0.02;
    const MAX_TOTAL_ADJUSTMENT = 0.10;

    // If we've already adjusted too much, stop
    if (Math.abs(this.cumulativeAdjustment) >= MAX_TOTAL_ADJUSTMENT) {
      return 0;
    }

    let adjustment = 0;

    // If high unfulfilled AND low overflow => increase load factor
    // Threshold: $500K/day unfulfilled is "high", $10K/day overflow is "low"
    if (unfulfilledRate > 500000 && overflowRate < 10000) {
      adjustment = 0.02;  // Increase by 2%
    }
    // If high overflow => decrease load factor
    else if (overflowRate > 50000) {
      adjustment = -0.02;  // Decrease by 2%
    }

    // Apply stability guards
    adjustment = Math.max(-MAX_DAILY_ADJUSTMENT, Math.min(MAX_DAILY_ADJUSTMENT, adjustment));

    // Check cumulative limit
    if (this.cumulativeAdjustment + adjustment > MAX_TOTAL_ADJUSTMENT) {
      adjustment = MAX_TOTAL_ADJUSTMENT - this.cumulativeAdjustment;
    } else if (this.cumulativeAdjustment + adjustment < -MAX_TOTAL_ADJUSTMENT) {
      adjustment = -MAX_TOTAL_ADJUSTMENT - this.cumulativeAdjustment;
    }

    if (adjustment !== 0) {
      this.adjustmentHistory.push(adjustment);
      this.cumulativeAdjustment += adjustment;
    }

    return adjustment;
  }

  /**
   * Get current economy load factor (baseline + adjustments)
   */
  getCurrentEconomyLoadFactor(): number {
    const baseline = this.initialCharacteristics.economyLoadFactor.baseline;
    return Math.max(
      this.initialCharacteristics.economyLoadFactor.minFactor,
      Math.min(
        this.initialCharacteristics.economyLoadFactor.maxFactor,
        baseline + this.cumulativeAdjustment
      )
    );
  }

  /**
   * Get the initial characteristics
   */
  getCharacteristics(): DatasetCharacteristics {
    return this.initialCharacteristics;
  }

  /**
   * Get cumulative adjustment
   */
  getCumulativeAdjustment(): number {
    return this.cumulativeAdjustment;
  }
}
