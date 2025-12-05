import {
  PerClassAmount,
  FlightEvent,
  Airport,
  Aircraft,
  FlightPlan,
  KIT_CLASSES,
  FlightLoadDto,
  copyPerClass
} from '../types';

// Track kits that are in-flight (loaded on a plane, not yet landed)
interface InFlightKits {
  flightId: string;
  destinationAirport: string;
  kits: PerClassAmount;
  arrivalDay: number;
  arrivalHour: number;
}

// Track kits that are processing at an airport (arrived but not yet available)
interface ProcessingKits {
  airportCode: string;
  kits: PerClassAmount;
  readyDay: number;
  readyHour: number;
}

export class GameState {
  // Current time
  currentDay: number = 0;
  currentHour: number = 0;

  // Inventory at each airport (available kits)
  airportStocks: Map<string, PerClassAmount>;

  // Aircraft data for capacity checks
  aircraftTypes: Map<string, Aircraft>;

  // Airport data
  airports: Map<string, Airport>;

  // Static flight plan for demand forecasting
  flightPlans: FlightPlan[];

  // Known flights (from SCHEDULED/CHECKED_IN events)
  knownFlights: Map<string, FlightEvent> = new Map();

  // Flights that are CHECKED_IN and ready to depart this hour
  flightsReadyToDepart: FlightEvent[] = [];

  // NEW: Track kits currently on planes (in-flight)
  inFlightKits: Map<string, InFlightKits> = new Map();

  // NEW: Track kits being processed at airports (not yet available)
  processingKits: ProcessingKits[] = [];

  constructor(
    initialStocks: Map<string, PerClassAmount>,
    aircraftTypes: Map<string, Aircraft>,
    airports: Map<string, Airport>,
    flightPlans: FlightPlan[]
  ) {
    this.airportStocks = initialStocks;
    this.aircraftTypes = aircraftTypes;
    this.airports = airports;
    this.flightPlans = flightPlans;
  }

  // Update time and find flights departing NOW
  setTime(day: number, hour: number): void {
    this.currentDay = day;
    this.currentHour = hour;

    // Process any kits that finished processing and are now available
    this.processReadyKits();

    // Find all flights departing at this exact time
    // Include both CHECKED_IN (preferred - has real passenger count) and SCHEDULED (fallback)
    // This ensures we don't miss flights that never transition to CHECKED_IN
    this.flightsReadyToDepart = [];
    for (const flight of this.knownFlights.values()) {
      if ((flight.eventType === 'CHECKED_IN' || flight.eventType === 'SCHEDULED') &&
          flight.departure.day === day &&
          flight.departure.hour === hour) {
        this.flightsReadyToDepart.push(flight);
      }
    }
  }

  // Process kits that have finished processing and are now available
  private processReadyKits(): void {
    const stillProcessing: ProcessingKits[] = [];

    for (const processing of this.processingKits) {
      // Check if processing is complete
      const isReady = (this.currentDay > processing.readyDay) ||
                      (this.currentDay === processing.readyDay && this.currentHour >= processing.readyHour);

      if (isReady) {
        // Add kits to airport stock (with capacity check)
        const stock = this.airportStocks.get(processing.airportCode);
        const airport = this.airports.get(processing.airportCode);
        if (stock) {
          for (const kitClass of KIT_CLASSES) {
            if (airport) {
              // Cap at capacity to avoid OVER_CAPACITY_STOCK penalty
              const capacity = airport.capacity[kitClass];
              const toAdd = Math.min(processing.kits[kitClass], capacity - stock[kitClass]);
              stock[kitClass] += Math.max(0, toAdd);
            } else {
              stock[kitClass] += processing.kits[kitClass];
            }
          }
        }
      } else {
        stillProcessing.push(processing);
      }
    }

    this.processingKits = stillProcessing;
  }

  // Process flight events from API response
  processFlightUpdates(updates: FlightEvent[]): void {
    for (const event of updates) {
      // Always update/store the flight info
      this.knownFlights.set(event.flightId, event);

      if (event.eventType === 'LANDED') {
        // Flight landed - retrieve the in-flight kits
        const inflight = this.inFlightKits.get(event.flightId);
        if (inflight) {
          // Get airport processing time
          const airport = this.airports.get(event.destinationAirport);

          if (airport) {
            // Calculate when kits will be ready (after processing)
            // Use the maximum processing time among all classes for simplicity
            // Or process each class separately with its own time
            const maxProcessingTime = Math.max(
              airport.processingTime.first,
              airport.processingTime.business,
              airport.processingTime.premiumEconomy,
              airport.processingTime.economy
            );

            // Calculate ready time
            let readyHour = event.arrival.hour + maxProcessingTime;
            let readyDay = event.arrival.day;
            while (readyHour >= 24) {
              readyHour -= 24;
              readyDay++;
            }

            // For HUB1, processing is fast - add directly to stock
            // For spoke airports with very long processing times, queue for processing
            if (airport.isHub || maxProcessingTime <= 2) {
              // Fast processing - add directly to stock (with capacity check)
              const stock = this.airportStocks.get(event.destinationAirport);
              if (stock) {
                for (const kitClass of KIT_CLASSES) {
                  // Cap at capacity to avoid OVER_CAPACITY_STOCK penalty (777/unit)
                  const capacity = airport.capacity[kitClass];
                  const toAdd = Math.min(inflight.kits[kitClass], capacity - stock[kitClass]);
                  stock[kitClass] += Math.max(0, toAdd);
                }
              }
            } else {
              // Queue for processing
              this.processingKits.push({
                airportCode: event.destinationAirport,
                kits: copyPerClass(inflight.kits),
                readyDay,
                readyHour
              });
            }
          } else {
            // Airport not found - add directly to avoid losing kits
            // Note: Without airport data we can't check capacity, but this shouldn't happen
            const stock = this.airportStocks.get(event.destinationAirport);
            if (stock) {
              for (const kitClass of KIT_CLASSES) {
                stock[kitClass] += inflight.kits[kitClass];
              }
            }
          }

          // Remove from in-flight tracking
          this.inFlightKits.delete(event.flightId);
        }
      }
    }
  }

  // Calculate what kits to load on departing flights
  calculateFlightLoads(): FlightLoadDto[] {
    const loads: FlightLoadDto[] = [];

    // Sort flights by priority: longer distance = higher penalty if unfulfilled
    // UNFULFILLED_KIT_FACTOR_PER_DISTANCE = 0.003, so distance matters
    const sortedFlights = [...this.flightsReadyToDepart].sort((a, b) => {
      // Get distance from flight plan for priority
      const distA = this.getFlightDistance(a.originAirport, a.destinationAirport);
      const distB = this.getFlightDistance(b.originAirport, b.destinationAirport);
      // Higher distance = higher priority (sort descending)
      return distB - distA;
    });

    for (const flight of sortedFlights) {
      const originStock = this.airportStocks.get(flight.originAirport);
      const aircraft = this.aircraftTypes.get(flight.aircraftType);

      if (!originStock || !aircraft) {
        console.warn(`[STATE] Missing data for flight ${flight.flightNumber} from ${flight.originAirport}`);
        continue;
      }

      // Calculate how many kits to load for each class
      const loadedKits: PerClassAmount = {
        first: 0,
        business: 0,
        premiumEconomy: 0,
        economy: 0
      };

      for (const kitClass of KIT_CLASSES) {
        const demand = flight.passengers[kitClass];
        const available = originStock[kitClass];
        const capacity = aircraft.kitCapacity[kitClass];

        // DEBUG: Log the values for first few flights on day 1
        if (this.currentDay === 1 && this.currentHour === 0 && kitClass === 'economy') {
          console.log(`  [CALC] Flight ${flight.flightNumber} ${flight.originAirport}→${flight.destinationAirport} (aircraft: ${flight.aircraftType}): demand=${demand}, available=${available}, capacity=${capacity}, aircraft.kitCapacity=${JSON.stringify(aircraft?.kitCapacity)}`);
        }

        // Load passenger demand first
        let toLoad = Math.min(demand, available, capacity);

        // OPTIMIZATION: For flights FROM HUB1, load extra kits based on destination's actual deficit
        // Calculate what the destination actually needs for upcoming flights
        if (flight.originAirport === 'HUB1' && toLoad < capacity) {
          const destStock = this.airportStocks.get(flight.destinationAirport);
          const destAirport = this.airports.get(flight.destinationAirport);

          if (destStock && destAirport) {
            // Calculate destination's demand for next 48 hours
            const destDemand48h = this.calculateUpcomingDemandForAirport(flight.destinationAirport, 48, kitClass);

            // Calculate what will be available at destination (current + arriving + processing)
            const destCurrent = destStock[kitClass];
            const inFlightToDestination = this.getInFlightKitsToAirport(flight.destinationAirport, kitClass);
            const processingAtDestination = this.getProcessingKitsAtAirport(flight.destinationAirport, kitClass);
            const destExpected = destCurrent + inFlightToDestination + processingAtDestination;

            // Calculate actual deficit at destination
            const destDeficit = Math.max(0, destDemand48h - destExpected);

            // Also check capacity constraint
            const destCapacity = destAirport.capacity[kitClass];
            const destRoom = Math.max(0, destCapacity - destCurrent - inFlightToDestination - processingAtDestination);

            // Load extra kits: min of (deficit needed, room available, aircraft capacity, hub stock)
            const remainingCapacity = capacity - toLoad;
            const remainingStock = available - toLoad;
            const extraToLoad = Math.min(destDeficit, destRoom, remainingCapacity, remainingStock);

            if (extraToLoad > 0) {
              toLoad += extraToLoad;
            }
          }
        }

        // OPTIMIZATION: For flights TO HUB1, load extra kits if spoke has surplus
        // This brings kits back to hub for redistribution to other spokes
        if (flight.destinationAirport === 'HUB1' && toLoad < capacity) {
          // Check if we have surplus stock beyond what's needed for upcoming flights
          const upcomingDemand = this.calculateUpcomingDemandForAirport(flight.originAirport, 48, kitClass);
          const currentStock = available - toLoad; // What remains after loading demand
          const surplus = Math.max(0, currentStock - upcomingDemand);

          if (surplus > 0) {
            const remainingCapacity = capacity - toLoad;
            const extraToLoad = Math.min(remainingCapacity, surplus);
            toLoad += extraToLoad;
          }
        }

        loadedKits[kitClass] = toLoad;

        // Deduct from stock
        originStock[kitClass] -= toLoad;
      }

      // Track this flight's kits as in-flight
      this.inFlightKits.set(flight.flightId, {
        flightId: flight.flightId,
        destinationAirport: flight.destinationAirport,
        kits: copyPerClass(loadedKits),
        arrivalDay: flight.arrival.day,
        arrivalHour: flight.arrival.hour
      });

      // DEBUG: Log what we're loading
      const totalLoaded = loadedKits.first + loadedKits.business + loadedKits.premiumEconomy + loadedKits.economy;
      if (totalLoaded > 0 && this.currentDay >= 25) {
        console.log(`  [LOAD] Flight ${flight.flightNumber} ${flight.originAirport}→${flight.destinationAirport}: EC=${loadedKits.economy}, BC=${loadedKits.business}, PE=${loadedKits.premiumEconomy}, FC=${loadedKits.first}`);
      }

      loads.push({
        flightId: flight.flightId,
        loadedKits
      });
    }

    return loads;
  }

  // Get distance for a route from flight plan
  private getFlightDistance(origin: string, destination: string): number {
    for (const plan of this.flightPlans) {
      if (plan.departCode === origin && plan.arrivalCode === destination) {
        return plan.distanceKm;
      }
    }
    return 0; // Unknown route
  }

  // Get total kits of a class currently in-flight to a specific airport
  private getInFlightKitsToAirport(airportCode: string, kitClass: keyof PerClassAmount): number {
    let total = 0;
    for (const inflight of this.inFlightKits.values()) {
      if (inflight.destinationAirport === airportCode) {
        total += inflight.kits[kitClass];
      }
    }
    return total;
  }

  // Get total kits of a class currently processing at a specific airport
  private getProcessingKitsAtAirport(airportCode: string, kitClass: keyof PerClassAmount): number {
    let total = 0;
    for (const processing of this.processingKits) {
      if (processing.airportCode === airportCode) {
        total += processing.kits[kitClass];
      }
    }
    return total;
  }

  // Get stock at an airport
  getStock(airportCode: string): PerClassAmount | undefined {
    return this.airportStocks.get(airportCode);
  }

  // Calculate expected stock including in-flight and processing kits
  getExpectedStock(airportCode: string, withinHours: number = 24): PerClassAmount {
    const current = this.airportStocks.get(airportCode);
    const result: PerClassAmount = current ? copyPerClass(current) : {
      first: 0, business: 0, premiumEconomy: 0, economy: 0
    };

    const targetDay = this.currentDay + Math.floor((this.currentHour + withinHours) / 24);
    const targetHour = (this.currentHour + withinHours) % 24;

    // Add kits that will arrive from in-flight
    for (const inflight of this.inFlightKits.values()) {
      if (inflight.destinationAirport === airportCode) {
        const willArrive = (inflight.arrivalDay < targetDay) ||
                          (inflight.arrivalDay === targetDay && inflight.arrivalHour <= targetHour);
        if (willArrive) {
          for (const kitClass of KIT_CLASSES) {
            result[kitClass] += inflight.kits[kitClass];
          }
        }
      }
    }

    // Add kits that will finish processing
    for (const processing of this.processingKits) {
      if (processing.airportCode === airportCode) {
        const willBeReady = (processing.readyDay < targetDay) ||
                           (processing.readyDay === targetDay && processing.readyHour <= targetHour);
        if (willBeReady) {
          for (const kitClass of KIT_CLASSES) {
            result[kitClass] += processing.kits[kitClass];
          }
        }
      }
    }

    return result;
  }

  // Track total purchased kits to prevent cost explosion
  private totalPurchased: number = 0;

  // Calculate purchase order for hub - SELECTIVE ECONOMY ONLY
  // Strategy: Only buy economy kits when hub stock is low
  // Based on analysis: break-even distance = 333km, all routes > 815km = always profitable
  calculatePurchaseOrder(): PerClassAmount | undefined {
    // 1. Time constraint - stop purchasing late in game
    // Economy lead time is 12h + transport time, so day 20+ purchases won't help
    if (this.currentDay >= 20) {
      return undefined;
    }

    // 2. Hard cap on total purchases to prevent cost explosion (1M max = 20,000 kits × 50)
    const MAX_TOTAL_PURCHASE = 20000;
    if (this.totalPurchased >= MAX_TOTAL_PURCHASE) {
      return undefined;
    }

    // 3. Only evaluate once per day (hour 0) to avoid over-purchasing
    if (this.currentHour !== 0) {
      return undefined;
    }

    // 4. Get hub economy stock
    const hubStock = this.airportStocks.get('HUB1');
    if (!hubStock) return undefined;

    const economyStock = hubStock.economy;
    const economyInFlight = this.getInFlightKitsToAirport('HUB1', 'economy');
    const economyProcessing = this.getProcessingKitsAtAirport('HUB1', 'economy');
    const totalExpected = economyStock + economyInFlight + economyProcessing;

    // 5. Only purchase if stock is below threshold
    const THRESHOLD = 15000;
    if (totalExpected >= THRESHOLD) {
      return undefined;
    }

    // 6. Calculate 48h demand forecast for hub departures
    const demand48h = this.calculateUpcomingDemandForAirport('HUB1', 48, 'economy');

    // 7. Calculate deficit
    const deficit = Math.max(0, demand48h - totalExpected);

    // 8. Purchase conservatively: min of (deficit, 1000 API max, remaining cap, buffer to threshold)
    const remainingCap = MAX_TOTAL_PURCHASE - this.totalPurchased;
    const toPurchase = Math.min(deficit, 1000, remainingCap, Math.max(0, THRESHOLD - totalExpected));

    if (toPurchase <= 100) {
      return undefined;  // Not worth purchasing small amounts
    }

    // 9. Track total purchased
    this.totalPurchased += toPurchase;

    console.log(`[PURCHASE] Day ${this.currentDay}: Ordering ${toPurchase} economy kits (total: ${this.totalPurchased})`);

    // 10. CRITICAL: Only set economy, keep others at 0
    // This avoids a bug in the eval platform where economy cost is calculated using first class count
    return {
      first: 0,
      business: 0,
      premiumEconomy: 0,
      economy: toPurchase
    };
  }

  // Calculate upcoming demand for a specific airport and kit class
  private calculateUpcomingDemandForAirport(airportCode: string, withinHours: number, kitClass: keyof PerClassAmount): number {
    let demand = 0;

    const targetDay = this.currentDay + Math.floor((this.currentHour + withinHours) / 24);
    const targetHour = (this.currentHour + withinHours) % 24;

    // Use known flights if available
    for (const flight of this.knownFlights.values()) {
      if (flight.originAirport === airportCode) {
        const departsInWindow = (flight.departure.day < targetDay) ||
                               (flight.departure.day === targetDay && flight.departure.hour <= targetHour);
        const departsAfterNow = (flight.departure.day > this.currentDay) ||
                               (flight.departure.day === this.currentDay && flight.departure.hour >= this.currentHour);

        if (departsInWindow && departsAfterNow) {
          demand += flight.passengers[kitClass];
        }
      }
    }

    // Also use flight plan for forecasting beyond known flights
    let checkHour = this.currentHour;
    let checkDay = this.currentDay;

    for (let h = 0; h < withinHours; h++) {
      const weekdayIndex = checkDay % 7;

      for (const plan of this.flightPlans) {
        if (plan.departCode === airportCode &&
            plan.scheduledHour === checkHour &&
            plan.weekdays[weekdayIndex]) {
          // Estimate demand based on typical load
          const estimate = kitClass === 'economy' ? 250 :
                          kitClass === 'business' ? 50 :
                          kitClass === 'premiumEconomy' ? 25 : 10;
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

  // Calculate demand from static flight plan (for forecasting before SCHEDULED events arrive)
  private calculateScheduledDemand(airportCode: string, withinHours: number): PerClassAmount {
    const demand: PerClassAmount = { first: 0, business: 0, premiumEconomy: 0, economy: 0 };

    // Calculate the time window
    let checkHour = this.currentHour;
    let checkDay = this.currentDay;

    for (let h = 0; h < withinHours; h++) {
      // Get weekday (0 = Monday, 6 = Sunday) for the check day
      // Day 0 in game = some weekday, we need to figure out the pattern
      const weekdayIndex = checkDay % 7;

      for (const plan of this.flightPlans) {
        if (plan.departCode === airportCode &&
            plan.scheduledHour === checkHour &&
            plan.weekdays[weekdayIndex]) {
          // This flight is scheduled to depart at this time
          // Estimate passengers based on typical aircraft capacity
          // Use average aircraft capacity as estimate (we don't know exact aircraft yet)
          demand.first += 10;      // Avg first class
          demand.business += 50;   // Avg business
          demand.premiumEconomy += 25;  // Avg premium economy
          demand.economy += 250;   // Avg economy
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

  // Calculate upcoming demand for an airport within the given hours
  private calculateUpcomingDemand(airportCode: string, withinHours: number): PerClassAmount {
    const demand: PerClassAmount = { first: 0, business: 0, premiumEconomy: 0, economy: 0 };

    const targetDay = this.currentDay + Math.floor((this.currentHour + withinHours) / 24);
    const targetHour = (this.currentHour + withinHours) % 24;

    for (const flight of this.knownFlights.values()) {
      if (flight.originAirport === airportCode) {
        // Check if flight departs within the time window
        const departsInWindow = (flight.departure.day < targetDay) ||
                               (flight.departure.day === targetDay && flight.departure.hour <= targetHour);
        const departsAfterNow = (flight.departure.day > this.currentDay) ||
                               (flight.departure.day === this.currentDay && flight.departure.hour >= this.currentHour);

        if (departsInWindow && departsAfterNow) {
          for (const kitClass of KIT_CLASSES) {
            demand[kitClass] += flight.passengers[kitClass];
          }
        }
      }
    }

    return demand;
  }

  // Debug: print current stocks
  printStocks(): void {
    console.log('\n[STATE] Current stocks:');
    for (const [code, stock] of this.airportStocks) {
      const total = stock.first + stock.business + stock.premiumEconomy + stock.economy;
      if (total > 0 || code === 'HUB1') {
        console.log(`  ${code}: FC=${stock.first}, BC=${stock.business}, PE=${stock.premiumEconomy}, EC=${stock.economy}`);
      }
    }
    console.log(`  In-flight: ${this.inFlightKits.size} flights`);
    console.log(`  Processing: ${this.processingKits.length} batches`);
  }
}
