# Hackathon SAP - Plan Complet (ACTUALIZAT)

> **Temă:** "Gate-to-Gate with a Fork in the Air: Craft clever heuristics for a smoother network, secret stowaways included"
> **Durată:** 48 ore
> **Echipă:** 3 persoane
> **Stack:** TypeScript/Node.js

---

## 📊 PROGRES CURENT (Actualizat: 5 Decembrie 2025)

| Fază | Status | Detalii |
|------|--------|---------|
| **FAZA 1** | ✅ DONE | Setup complet (Windows + Ubuntu cross-platform) |
| **FAZA 2** | ✅ DONE | Core Engine implementat (`types`, `api`, `data`, `engine`) |
| **FAZA 3** | 🔄 ~70% | Algoritm basic greedy + cumpărare - rămâne optimizare avansată |
| **FAZA 4** | ⏳ TODO | Frontend WOW |
| **FAZA 5** | ⏳ TODO | Pregătire Battle & Prezentare |

### Fișiere implementate:
```
src/
├── types/index.ts     ✅ Tipuri TypeScript complete
├── api/client.ts      ✅ API client cu startSession, playRound, endSession
├── data/loader.ts     ✅ Data loader cross-platform (Windows + Ubuntu)
├── engine/state.ts    ✅ GameState complet cu tracking inventar/kit-uri
└── index.ts           ✅ Game loop principal (720 runde)
```

---

## 🤖 TL;DR PENTRU CLAUDE (CITEȘTE ASTA PRIMUL!)

### Ce trebuie să faci:
Construiești un **optimizer TypeScript** care comunică cu un API de evaluare (Java Spring Boot) pentru a gestiona kit-uri de servicii aeriene (tacâmuri, pături, căști) într-o rețea de 161 aeroporturi timp de 720 runde (30 zile × 24 ore).

### Obiectiv:
**Minimizează costul total** = Transport + Procesare + Kit-uri noi + Penalități

### Cum funcționează jocul:
1. Primești evenimente despre zboruri (SCHEDULED la T-24h, CHECKED_IN la T-1h, LANDED după)
2. Trimiți ordine de încărcare kit-uri pe avioane (câte kit-uri de fiecare clasă)
3. Trimiți ordine de cumpărare kit-uri noi (doar la Hub)
4. Primești scorul actualizat și penalitățile

### Constrângeri cheie:
- **4 clase de pasageri**: First, Business, Premium Economy, Economy
- **Timpul de procesare kit-uri la spoke >> turnaround avion** → trebuie stoc pregătit DINAINTE
- **Penalități MARI** pentru: stoc negativ (5342), flight ID invalid (5000), pasageri fără kit (0.003×distanță)

### Pașii de implementare (în ordine strictă):
1. **Setup proiect** → `skykit-optimizer/` cu TypeScript
2. **API Client** → comunică cu platforma de evaluare
3. **Data Loader** → parsează CSV-urile
4. **Game State** → tracking inventar și zboruri
5. **Algoritm Greedy** → încarcă kit-uri = min(cerere, stoc, capacitate)
6. **Strategie Cumpărare** → prognozează cerere și comandă la Hub
7. **Optimizări** → buffer dinamic, balansare inventar

### Fișiere CSV de folosit:
```
c:\Users\serge\Desktop\meditatii\HackitAll2025\eval-platform\src\main\resources\liquibase\data\
├── aircraft_types.csv      # Capacități avioane
├── airports_with_stocks.csv # Stocuri și costuri per aeroport
├── flight_plan.csv         # Programul zborurilor
└── teams.csv               # API keys pentru testare
```

### API Key pentru testare:
```
43b9ab90-b593-404c-a8d8-aaa074e181e1
```

### Endpoint-uri API:
- `POST /api/v1/session/start` → primești Session ID
- `POST /api/v1/play/round` → trimite ordine, primește evenimente
- `POST /api/v1/session/end` → finalizează și primește scor final

---

## 📁 PATHS ȘI LOCAȚII

> **⚠️ Cross-Platform:** Proiectul suportă atât Windows cât și Ubuntu. Path-urile sunt detectate automat în `src/data/loader.ts`.

### Repository Clonat
| OS | Path |
|----|------|
| **Windows** | `C:\Users\serge\Desktop\HackitAll2025\` |
| **Ubuntu** | `~/repos/HackitAll2025/` |

### Platforma de Evaluare (Java)
| OS | Path |
|----|------|
| **Windows** | `C:\Users\serge\Desktop\HackitAll2025\eval-platform\` |
| **Ubuntu** | `~/repos/HackitAll2025/eval-platform/` |

### Fișiere CSV cu Date
| OS | Path |
|----|------|
| **Windows** | `C:\Users\serge\Desktop\HackitAll2025\eval-platform\src\main\resources\liquibase\data\` |
| **Ubuntu** | `~/repos/HackitAll2025/eval-platform/src/main/resources/liquibase/data/` |

### Proiectul Nostru
```
c:\Users\serge\Desktop\skykit-optimizer\
```

### Swagger UI (când platforma rulează)
```
http://127.0.0.1:8080/swagger-ui/index.html
```

---

## STRATEGIE GENERALĂ

### Faza 1: Algoritm (Prioritate MAXIMĂ)
Obiectiv: **Top 8 scoruri** pentru a trece în Partea a II-a
- Focus 100% pe optimizarea costului total
- Testare intensivă, tuning parametri
- Cel mai mic scor câștigă

### Faza 2: Frontend WOW (După ce algoritmul e solid)
- Dashboard vizual impresionant
- Vizualizare în timp real a jocului
- Grafice și animații pentru prezentare

---

## INDEX

1. [Overview & Obiective](#1-overview--obiective)
2. [Înțelegerea Problemei](#2-înțelegerea-problemei)
3. [Stack Tehnic & Arhitectură](#3-stack-tehnic--arhitectură)
4. [Design Algoritm & Strategie](#4-design-algoritm--strategie)
5. [Task-uri Principale](#5-task-uri-principale)
6. [Strategie Pitch & Prezentare](#6-strategie-pitch--prezentare)
7. [Planuri de Backup & Riscuri](#7-planuri-de-backup--riscuri)

---

## 1. Overview & Obiective

### Numele Proiectului: **SkyKit Optimizer**
*"Optimizing rotable kit logistics for seamless passenger experience"*

### Problema de Rezolvat
Gestionarea și optimizarea transportului **kit-urilor de rotables** (tacâmuri, veselă, perne, pături, căști) într-o rețea aeriană hub-and-spoke cu:
- **1 Hub central** + **160 aeroporturi**
- **4 tipuri de avioane**
- **447 zboruri** cu frecvențe săptămânale diferite
- **720 runde** (30 zile × 24 ore)
- **4 clase de pasageri**: First, Business, Premium Economy, Economy

### Obiectiv Principal
**Minimizarea costului total** = Transport + Procesare + Kituri noi + Penalități

### Fluxul Jocului
```
START SESSION → [720 runde] → END SESSION
                    ↓
            Pentru fiecare rundă:
            1. Primim evenimente zboruri (SCHEDULED, CHECKED-IN, LANDED)
            2. Trimitem ordine de încărcare kituri
            3. Trimitem ordine de cumpărare (doar la Hub)
            4. Primim scorul actualizat
```

---

## 2. Înțelegerea Problemei (DATE REALE DIN CSV)

### Statistici Rețea
- **1 Hub** (HUB1 - Main Hub Airport)
- **161 aeroporturi** în total (Hub + 160 spoke)
- **4 tipuri de avioane** (OJF294, NHY337, WTA646, UHB596)
- **~448 rute** în flight_plan.csv (dus + întors)
- **720 runde** = 30 zile × 24 ore

### Avioane (aircraft_types.csv)
| Type Code | FC Seats | BC Seats | PE Seats | EC Seats | Cost/kg/km | FC Kits Cap | BC Kits Cap | PE Kits Cap | EC Kits Cap |
|-----------|----------|----------|----------|----------|------------|-------------|-------------|-------------|-------------|
| OJF294 | 13 | 67 | 31 | 335 | 0.08 | 18 | 105 | 44 | 781 |
| NHY337 | 4 | 30 | 17 | 156 | 0.09 | 4 | 66 | 44 | 438 |
| WTA646 | 20 | 63 | 28 | 329 | 0.10 | 30 | 126 | 71 | 770 |
| UHB596 | 7 | 41 | 27 | 196 | 0.11 | 15 | 67 | 54 | 329 |

**Observație:** Capacitatea de kit-uri > număr scaune (ex: OJF294 are 335 economy seats dar 781 kit capacity)

### Hub (HUB1) - Date Speciale
| Proprietate | FC | BC | PE | EC |
|-------------|------|------|------|-------|
| Processing Time (ore) | 6 | 4 | 2 | 1 |
| Processing Cost | 8.0 | 6.0 | 2.0 | 1.0 |
| Loading Cost | 1.0 | 0.75 | 0.5 | 0.5 |
| Initial Stock | 1659 | 5184 | 2668 | 23651 |
| Capacity | 18109 | 18109 | 9818 | 95075 |

**Hub-ul are:**
- Timp procesare FOARTE MIC (1-6 ore vs 4-48 ore la spoke)
- Costuri procesare MICI
- Stocuri inițiale MARI
- Capacitate MARE
- **POATE COMANDA KIT-URI NOI**

### Aeroporturi Spoke (exemplu ZHVK)
| Proprietate | FC | BC | PE | EC |
|-------------|------|------|------|-------|
| Processing Time (ore) | 45 | 28 | 12 | 4 |
| Processing Cost | 6.67 | 5.23 | 3.55 | 1.65 |
| Loading Cost | 3.3 | 2.09 | 2.01 | 1.38 |
| Initial Stock | 158 | 105 | 135 | 304 |
| Capacity | 445 | 445 | 290 | 803 |

**Observație CRITICĂ:** Timpul de procesare la spoke e ENORM (45 ore pentru First Class!)
→ Kit-urile care ajung NU pot fi folosite rapid pentru zborul de retur

### Structura Flight Plan (flight_plan.csv)
```
depart_code;arrival_code;scheduled_hour;scheduled_arrival_hour;arrival_next_day;distance_km;Mon;Tue;Wed;Thu;Fri;Sat;Sun
HUB1;ZHVK;15;20;0;3664;1;0;0;0;0;0;0
ZHVK;HUB1;21;2;1;3664;1;0;0;0;0;0;0
```
- Zboruri **dus-întors** între Hub și fiecare aeroport
- **Frecvență săptămânală** variabilă (1-7 zile/săptămână)
- Distanțe **876 - 6981 km**
- Unele zboruri ajung **a doua zi** (arrival_next_day=1)

### Penalități (PenaltyFactors.java) - CRITICE!
```java
FLIGHT_OVERLOAD_FACTOR_PER_DISTANCE = 5.0        // Supraîncărcare avion
UNFULFILLED_KIT_FACTOR_PER_DISTANCE = 0.003     // Pasager fără kit
INCORRECT_FLIGHT_LOAD = 5000.0                   // Flight ID invalid
NEGATIVE_INVENTORY = 5342.0                      // Stoc negativ
OVER_CAPACITY_STOCK = 777.0                      // Depășire capacitate
END_OF_GAME_REMAINING_STOCK = 0.0013            // Stoc rămas la final
EARLY_END_OF_GAME = 1000.0                       // Încheiere prematură
END_OF_GAME_PENDING_KIT_PROCESSING = 0.0013     // Kit-uri în procesare la final
END_OF_GAME_UNFULFILLED_FLIGHT_KITS = 1.5       // Zboruri neservite la final
```

**Prioritate evitare penalități:**
1. **NEGATIVE_INVENTORY (5342)** - cea mai mare per incident
2. **INCORRECT_FLIGHT_LOAD (5000)** - ID-uri greșite
3. **OVER_CAPACITY_STOCK (777)** - depășire capacitate
4. **UNFULFILLED_KIT (0.003 × distanță)** - poate deveni mare pentru zboruri lungi

---

## 3. Stack Tehnic & Arhitectură

### Stack Principal
```
Limbaj: TypeScript/Node.js
├── HTTP Client (axios)
├── CSV Parser (csv-parse)
├── Algoritm de optimizare
└── (Opțional) UI pentru vizualizare

Platforma de Evaluare: Java Spring Boot (furnizată)
├── API REST
├── Swagger UI: http://127.0.0.1:8080/swagger-ui/index.html
└── OpenAPI spec: http://127.0.0.1:8080/api-docs
```

### API Endpoints (din PlayController.java)

#### POST /api/v1/session/start
- **Headers:** `API-KEY: UUID`
- **Response:** Session ID (UUID string)

#### POST /api/v1/play/round
- **Headers:** `API-KEY: UUID`, `SESSION-ID: UUID`
- **Request Body (HourRequestDto):**
```json
{
  "day": 0,           // 0-29
  "hour": 4,          // 0-23
  "flightLoads": [
    {
      "flightId": "uuid-string",
      "loadedKits": {
        "first": 10,
        "business": 50,
        "premiumEconomy": 20,
        "economy": 300
      }
    }
  ],
  "kitPurchasingOrders": {    // Opțional, doar pentru Hub
    "first": 0,
    "business": 0,
    "premiumEconomy": 0,
    "economy": 0
  }
}
```
- **Response (HourResponseDto):**
```json
{
  "day": 0,
  "hour": 4,
  "flightUpdates": [
    {
      "eventType": "SCHEDULED|CHECKED_IN|LANDED",
      "flightNumber": "AB1022",
      "flightId": "uuid",
      "originAirport": "HUB1",
      "destinationAirport": "ZHVK",
      "departure": { "day": 0, "hour": 15 },
      "arrival": { "day": 0, "hour": 20 },
      "passengers": { "first": 10, "business": 50, "premiumEconomy": 20, "economy": 300 },
      "aircraftType": "OJF294"
    }
  ],
  "penalties": [
    {
      "code": "FLIGHT_UNFULFILLED_ECONOMY_CLASS",
      "flightId": "uuid",
      "flightNumber": "AB1234",
      "issuedDay": 0,
      "issuedHour": 4,
      "penalty": 7952.69,
      "reason": "Flight AB1234 has unfulfilled Economy Class passengers of 14 kits"
    }
  ],
  "totalCost": 895758.54
}
```

#### POST /api/v1/session/end
- **Headers:** `API-KEY: UUID`
- **Response:** Final HourResponseDto cu costul total

---

## 📦 FIȘIERE DE CONFIGURARE (COPY-PASTE READY)

### package.json
```json
{
  "name": "skykit-optimizer",
  "version": "1.0.0",
  "description": "SAP Hackathon - Rotables Kit Optimizer",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "watch": "tsc -w"
  },
  "keywords": ["hackathon", "sap", "optimization"],
  "author": "Echipa Hackathon",
  "license": "MIT",
  "dependencies": {
    "axios": "^1.6.0",
    "csv-parse": "^5.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.0"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Comenzi de Setup (în ordine)
```bash
# 1. Creează folderul proiectului
mkdir c:\Users\serge\Desktop\meditatii\skykit-optimizer
cd c:\Users\serge\Desktop\meditatii\skykit-optimizer

# 2. Inițializează proiectul (sau copiază package.json de mai sus)
npm init -y

# 3. Instalează dependențele
npm install axios csv-parse
npm install -D typescript ts-node @types/node

# 4. Creează tsconfig.json (sau copiază de mai sus)
npx tsc --init

# 5. Creează structura de foldere
mkdir src
mkdir src\api
mkdir src\data
mkdir src\engine
mkdir src\optimizer
mkdir src\types

# 6. Creează fișierul principal
# (vezi secțiunea COD STARTER mai jos)

# 7. Testează că merge
npm run dev
```

---

### Structura Proiectului
```
skykit-optimizer/
├── src/
│   ├── api/
│   │   └── client.ts           # HTTP client pentru eval platform
│   ├── data/
│   │   ├── loader.ts           # Încărcare CSV-uri
│   │   └── models.ts           # Interfețe TypeScript
│   ├── engine/
│   │   ├── game.ts             # Loop principal joc
│   │   ├── state.ts            # Starea curentă (inventare, zboruri)
│   │   └── events.ts           # Procesare evenimente
│   ├── optimizer/
│   │   ├── strategy.ts         # Strategie principală
│   │   ├── forecaster.ts       # Predicție cerere
│   │   ├── inventory.ts        # Management inventar
│   │   └── purchasing.ts       # Logică cumpărare kituri
│   ├── ui/                     # (Opțional) Dashboard vizualizare
│   │   └── dashboard.tsx
│   └── index.ts                # Entry point
├── data/
│   ├── flight_plan.csv
│   ├── aircraft_types.csv
│   └── airports_with_stocks.csv
├── package.json
└── README.md
```

### Modele de Date TypeScript (bazate pe API)
```typescript
// === Clase comune ===
interface PerClassAmount {
  first: number;
  business: number;
  premiumEconomy: number;
  economy: number;
}

interface ReferenceHour {
  day: number;
  hour: number;
}

// === Date statice (din CSV) ===
interface Aircraft {
  id: string;
  typeCode: string;  // OJF294, NHY337, etc.
  seats: PerClassAmount;
  kitCapacity: PerClassAmount;
  costPerKgPerKm: number;
}

interface Airport {
  id: string;
  code: string;      // HUB1, ZHVK, etc.
  name: string;
  processingTime: PerClassAmount;  // ore
  processingCost: PerClassAmount;
  loadingCost: PerClassAmount;
  initialStock: PerClassAmount;
  capacity: PerClassAmount;
}

interface FlightPlan {
  departCode: string;
  arrivalCode: string;
  scheduledHour: number;
  scheduledArrivalHour: number;
  arrivalNextDay: boolean;
  distanceKm: number;
  weekdays: boolean[];  // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
}

// === Request/Response API ===
interface FlightLoadDto {
  flightId: string;  // UUID
  loadedKits: PerClassAmount;
}

interface HourRequestDto {
  day: number;       // 0-29
  hour: number;      // 0-23
  flightLoads: FlightLoadDto[];
  kitPurchasingOrders?: PerClassAmount;  // Opțional, doar pentru Hub
}

type FlightEventType = 'SCHEDULED' | 'CHECKED_IN' | 'LANDED';

interface FlightEvent {
  eventType: FlightEventType;
  flightNumber: string;
  flightId: string;
  originAirport: string;
  destinationAirport: string;
  departure: ReferenceHour;
  arrival: ReferenceHour;
  passengers: PerClassAmount;
  aircraftType: string;
}

interface PenaltyDto {
  code: string;
  flightId?: string;
  flightNumber?: string;
  issuedDay: number;
  issuedHour: number;
  penalty: number;
  reason: string;
}

interface HourResponseDto {
  day: number;
  hour: number;
  flightUpdates: FlightEvent[];
  penalties: PenaltyDto[];
  totalCost: number;
}

// === State Management ===
interface GameState {
  currentDay: number;
  currentHour: number;
  sessionId: string;
  totalCost: number;

  // Stocuri per aeroport
  airportStocks: Map<string, PerClassAmount>;

  // Kit-uri în procesare (cu timestamp finalizare)
  processingKits: Array<{
    airportCode: string;
    kits: PerClassAmount;
    readyAt: ReferenceHour;
  }>;

  // Zboruri cunoscute (din evenimente)
  knownFlights: Map<string, FlightEvent>;

  // Zboruri care pleacă la ora curentă
  departingFlights: FlightEvent[];
}
```

---

## 4. Design Algoritm & Strategie

### Strategia Principală: "Greedy cu Look-ahead"

#### Faza 1: Inițializare
```
1. Încarcă toate datele CSV
2. Construiește graficul zborurilor (rută, frecvență, capacitate)
3. Calculează cererea medie per rută
4. Stabilește stocuri țintă per aeroport
```

#### Faza 2: Pentru Fiecare Rundă
```
INPUT: Evenimente noi (SCHEDULED, CHECKED_IN, LANDED)

1. ACTUALIZARE STARE
   - Procesează LANDED → kit-uri ajung la destinație
   - Procesează CHECKED_IN → cunoaștem pasageri reali
   - Procesează SCHEDULED → planificăm 24h înainte

2. DECIZIE ÎNCĂRCARE
   Pentru fiecare zbor care pleacă ACUM:
   a) Calculează cererea (pasageri per clasă)
   b) Verifică stoc disponibil la origine
   c) Verifică capacitate avion
   d) Încarcă min(cerere, stoc, capacitate)
   e) Dacă stoc insuficient → PENALIZARE inevitabilă

3. DECIZIE CUMPĂRARE (doar Hub)
   a) Prognozează cererea următoarele 24-48h
   b) Calculează stoc disponibil (actual + în procesare + comandat)
   c) Comandă diferența (cu buffer de siguranță)

OUTPUT: RoundRequest cu flightLoads și kitPurchases
```

### Algoritm Detaliat: Încărcare Optimă

```typescript
function calculateOptimalLoad(
  flight: Flight,
  originStock: Record<KitClass, number>,
  aircraft: Aircraft
): FlightLoad {
  const load: Record<KitClass, number> = {};

  for (const kitClass of KIT_CLASSES) {
    const demand = flight.passengers[kitClass];
    const available = originStock[kitClass];
    const capacity = aircraft.kitCapacity[kitClass];

    // Încarcă exact cât trebuie, respectând constrângerile
    load[kitClass] = Math.min(demand, available, capacity);
  }

  return { flightId: flight.id, loadedKits: load };
}
```

### Algoritm Detaliat: Strategie Cumpărare

```typescript
function calculatePurchaseOrder(
  hubStock: Record<KitClass, number>,
  incomingKits: Record<KitClass, number>,  // Kit-uri care vor ajunge
  forecastDemand: Record<KitClass, number>, // Cerere prognozată
  bufferFactor: number = 1.2
): Record<KitClass, number> {
  const order: Record<KitClass, number> = {};

  for (const kitClass of KIT_CLASSES) {
    const expectedStock = hubStock[kitClass] + incomingKits[kitClass];
    const requiredStock = forecastDemand[kitClass] * bufferFactor;
    const deficit = requiredStock - expectedStock;

    order[kitClass] = Math.max(0, Math.ceil(deficit));
  }

  return order;
}
```

### Optimizări Avansate (Nice-to-Have)

1. **Balansare inventar între aeroporturi**
   - Identifică aeroporturi cu surplus/deficit
   - Folosește zboruri de retur pentru redistribuire

2. **Predicție cerere bazată pe istoric**
   - Învață pattern-uri săptămânale
   - Ajustează pentru variație zi/oră

3. **Optimizare cost transport vs penalizare**
   - Uneori e mai ieftin să iei penalizare decât să transporți

4. **Buffer dinamic**
   - Crește buffer-ul când incertitudinea e mare
   - Scade când avem date sigure (după CHECKED_IN)

---

## 5. Task-uri Principale

### FAZA 1: Setup & Foundation

#### Task 1.1: Setup Mediu
- [x] ✅ DONE - Clonare repo evaluare: `git clone https://github.com/pradu3/HackitAll2025`
- [x] ✅ DONE - Instalare Java JDK 25, Maven
- [x] ✅ DONE - Rulare platformă local: `cd eval-platform && mvn spring-boot:run`
- [x] ✅ DONE - Verificare Swagger UI: `http://127.0.0.1:8080/swagger-ui/index.html`
- [x] ✅ DONE - Test manual API cu Postman/Bruno (start session, play round, end)

#### Task 1.2: Setup Proiect TypeScript ✅ DONE
- [x] ✅ DONE - `mkdir skykit-optimizer && cd skykit-optimizer`
- [x] ✅ DONE - `npm init -y`
- [x] ✅ DONE - `npm install typescript ts-node @types/node axios csv-parse`
- [x] ✅ DONE - Setup `tsconfig.json`
- [x] ✅ DONE - Structură foldere: `src/`, `src/api/`, `src/data/`, `src/engine/`, `src/optimizer/`

#### Task 1.3: Înțelegere Date CSV ✅ DONE
- [x] ✅ DONE - Analiză `flight_plan.csv` - structură zboruri
- [x] ✅ DONE - Analiză `aircraft_types.csv` - capacități avioane
- [x] ✅ DONE - Analiză `airports.csv` sau similar - stocuri și costuri
- [x] ✅ DONE - Documentare modele de date necesare

---

### FAZA 2: Core Engine ✅ DONE

#### Task 2.1: API Client ✅ DONE
- [x] ✅ DONE - Implementare `src/api/client.ts`
- [x] ✅ DONE - Funcții: `startSession()`, `playRound()`, `endSession()`
- [x] ✅ DONE - Handling erori HTTP și validare răspunsuri
- [x] ✅ DONE - Logging pentru debugging

#### Task 2.2: Data Loader ✅ DONE
- [x] ✅ DONE - Implementare `src/data/loader.ts`
- [x] ✅ DONE - Parsare CSV-uri în structuri TypeScript
- [x] ✅ DONE - Validare date încărcate
- [x] ✅ DONE - Export funcții: `loadFlights()`, `loadAircraft()`, `loadAirports()`
- [x] ✅ DONE - **Cross-platform paths** (Windows + Ubuntu) detectate automat

#### Task 2.3: Type Definitions ✅ DONE
- [x] ✅ DONE - Implementare `src/types/index.ts`
- [x] ✅ DONE - Interfețe pentru: Flight, Aircraft, Airport, Kit, FlightLoad
- [x] ✅ DONE - Enums pentru: KitClass, FlightStatus

#### Task 2.4: Game State Manager ✅ DONE
- [x] ✅ DONE - Implementare `src/engine/state.ts`
- [x] ✅ DONE - Tracking inventar per aeroport (stoc curent)
- [x] ✅ DONE - Tracking kit-uri în procesare (cu timestamp)
- [x] ✅ DONE - Tracking kit-uri în zbor
- [x] ✅ DONE - Update stare la fiecare eveniment

#### Task 2.5: Event Processor ✅ DONE
- [x] ✅ DONE - ~~Implementare `src/engine/events.ts`~~ (integrat în `state.ts`)
- [x] ✅ DONE - Procesare SCHEDULED → pregătire pentru zbor
- [x] ✅ DONE - Procesare CHECKED_IN → pasageri reali cunoscuți
- [x] ✅ DONE - Procesare LANDED → kit-uri ajung la destinație

#### Task 2.6: Game Loop ✅ DONE
- [x] ✅ DONE - Implementare `src/index.ts` (entry point principal)
- [x] ✅ DONE - Loop principal: 720 runde
- [x] ✅ DONE - Orchestrare: primește evenimente → decide → trimite comenzi
- [x] ✅ DONE - Logging scor și costuri per rundă

---

### FAZA 3: Algoritm Optimizare (CRITICĂ) - Parțial Done

#### Task 3.1: Algoritm Basic - Greedy ✅ DONE
- [x] ✅ DONE - Implementare în `src/engine/state.ts` → `calculateFlightLoads()`
- [x] ✅ DONE - Pentru fiecare zbor: încarcă exact câți pasageri sunt
- [x] ✅ DONE - Respectă constrângeri: stoc disponibil, capacitate avion
- [x] ✅ DONE - **Obiectiv:** Funcționează fără penalități majore

#### Task 3.2: Strategie Cumpărare Kit-uri ✅ DONE
- [x] ✅ DONE - Implementare în `src/engine/state.ts` → `calculatePurchaseOrder()`
- [x] ✅ DONE - Prognozare cerere viitoare (48h) → `calculateUpcomingDemand()`
- [x] ✅ DONE - Calculare deficit și comandare la Hub
- [x] ✅ DONE - Buffer de siguranță configurabil (1.5x demand, max 80% capacity)

#### Task 3.3: Predicție Cerere ✅ DONE
- [x] ✅ DONE - Implementare în `src/engine/state.ts` → `calculateUpcomingDemand()`, `getExpectedStock()`
- [x] ✅ DONE - Analiză pattern zboruri (frecvență, capacitate)
- [x] ✅ DONE - Estimare pasageri per clasă
- [x] ✅ DONE - Tracking kit-uri în zbor și în procesare

#### Task 3.4: Optimizare Avansată
- [ ] Balansare inventar între aeroporturi via zboruri de retur
- [ ] Optimizare cost transport vs penalizare unfulfilled
- [ ] Tuning buffer dinamic
- [ ] Considerare timp procesare kit-uri

#### Task 3.5: Testare & Tuning
- [ ] Multiple rulări complete (720 runde)
- [ ] Analiză penalități - care sunt cele mai mari?
- [ ] Ajustare parametri (buffer, thresholds)
- [ ] Comparare scoruri între versiuni

---

### FAZA 4: Frontend WOW (După algoritm stabil)

#### Task 4.1: Setup Frontend
- [ ] Next.js sau React simplu
- [ ] TailwindCSS pentru styling rapid
- [ ] Structură componente

#### Task 4.2: Dashboard Principal
- [ ] Vizualizare hartă cu aeroporturi
- [ ] Indicator scor curent și costuri
- [ ] Lista zboruri active
- [ ] Stocuri per aeroport (color-coded)

#### Task 4.3: Vizualizare Timp Real
- [ ] Animație zboruri pe hartă
- [ ] Update live la fiecare rundă
- [ ] Grafice evoluție cost/penalități

#### Task 4.4: Polish & Animații
- [ ] Tranziții smooth
- [ ] Efecte vizuale pentru evenimente
- [ ] Dark mode / design modern

---

### FAZA 5: Pregătire Bătălie & Prezentare

#### Task 5.1: Pregătire Battle Mode
- [ ] Test conectare la platforma cloud
- [ ] Verificare că aplicația rulează stabil
- [ ] Plan de acțiune pentru 1h de bătălie

#### Task 5.2: Prezentare
- [ ] Slide-uri: Problemă, Soluție, Demo, Algoritm, Rezultate
- [ ] Screenshots și recordings din aplicație
- [ ] Rehearsal prezentare 10 min

---

### Checkpoints Importante

| Checkpoint | Descriere | Criterii de succes | Status |
|------------|-----------|-------------------|--------|
| **CP1** | Setup complet | Platforma rulează, API funcționează | ✅ DONE |
| **CP2** | Prima rundă | Putem trimite un playRound și primim răspuns | ✅ DONE |
| **CP3** | Game loop complet | 720 runde fără crash | ✅ DONE |
| **CP4** | Scor de referință | Prima rulare cu algoritm basic | ✅ DONE |
| **CP5** | Algoritm optimizat | Scor îmbunătățit semnificativ | 🔄 IN PROGRESS |
| **CP6** | Frontend funcțional | Dashboard vizibil cu date reale | ⏳ TODO |
| **CP7** | Battle ready | Aplicația e gata pentru cloud | ⏳ TODO |

---

## 🔢 ORDINE STRICTĂ DE IMPLEMENTARE (PENTRU CLAUDE)

**IMPORTANT:** Implementează EXACT în această ordine. NU sări pași. Fiecare pas depinde de anteriorul.

### ✅ PASUL 1: Verificare Platformă Evaluare - DONE
```bash
# Navighează la platforma de evaluare
# Windows: cd C:\Users\serge\Desktop\HackitAll2025\eval-platform
# Ubuntu:  cd ~/repos/HackitAll2025/eval-platform

# Verifică că Java e instalat
java --version
# Trebuie să fie Java 21+ (preferabil 25)

# Pornește platforma
mvn spring-boot:run -Dspring-boot.run.profiles=local

# VERIFICARE: Deschide http://127.0.0.1:8080/swagger-ui/index.html
# Trebuie să vezi interfața Swagger
```

### ✅ PASUL 2: Creare Proiect TypeScript - DONE
```bash
# Proiectul există la: c:\Users\serge\Desktop\skykit-optimizer
```

### ✅ PASUL 3: Creează `src/types/index.ts` - DONE
Acest fișier TREBUIE creat PRIMUL deoarece toate celelalte fișiere îl importă.

### ✅ PASUL 4: Creează `src/api/client.ts` - DONE
API client pentru comunicare cu platforma de evaluare.

### ✅ PASUL 5: Creează `src/data/loader.ts` - DONE
Parser pentru fișierele CSV. **Include cross-platform path detection (Windows + Ubuntu).**

### ✅ PASUL 6: Creează `src/engine/state.ts` - DONE
Manager pentru starea jocului (inventar, zboruri în aer).

### ✅ PASUL 7: ~~Creează `src/engine/events.ts`~~ - DONE (integrat în state.ts)
Processor pentru evenimentele primite (SCHEDULED, CHECKED_IN, LANDED).

### ✅ PASUL 8: ~~Creează `src/optimizer/strategy.ts`~~ - DONE (integrat în state.ts)
Algoritmul de decizie pentru încărcare kit-uri → `calculateFlightLoads()`, `calculatePurchaseOrder()`

### ✅ PASUL 9: ~~Creează `src/engine/game.ts`~~ - DONE (integrat în index.ts)
Loop-ul principal al jocului (720 runde).

### ✅ PASUL 10: Creează `src/index.ts` - DONE
Entry point care leagă totul.

### 🔄 PASUL 11: Test și Debug - IN PROGRESS
```bash
npm run dev
# Verifică că rulează fără erori
# Verifică scorul la final
```

### ⏳ PASUL 12: Optimizare - TODO
Îmbunătățește algoritmul pe baza penalităților primite.

---

## 🚀 COD STARTER (COPY-PASTE READY)

### src/types/index.ts
```typescript
// === Clase comune ===
export interface PerClassAmount {
  first: number;
  business: number;
  premiumEconomy: number;
  economy: number;
}

export interface ReferenceHour {
  day: number;
  hour: number;
}

// === Date statice (din CSV) ===
export interface Aircraft {
  typeCode: string;
  seats: PerClassAmount;
  kitCapacity: PerClassAmount;
  costPerKgPerKm: number;
}

export interface Airport {
  code: string;
  name: string;
  isHub: boolean;
  processingTime: PerClassAmount;
  processingCost: PerClassAmount;
  loadingCost: PerClassAmount;
  initialStock: PerClassAmount;
  capacity: PerClassAmount;
}

export interface FlightPlan {
  departCode: string;
  arrivalCode: string;
  scheduledHour: number;
  scheduledArrivalHour: number;
  arrivalNextDay: boolean;
  distanceKm: number;
  weekdays: boolean[];
}

// === API Types ===
export interface FlightLoadDto {
  flightId: string;
  loadedKits: PerClassAmount;
}

export interface HourRequestDto {
  day: number;
  hour: number;
  flightLoads: FlightLoadDto[];
  kitPurchasingOrders?: PerClassAmount;
}

export type FlightEventType = 'SCHEDULED' | 'CHECKED_IN' | 'LANDED';

export interface FlightEvent {
  eventType: FlightEventType;
  flightNumber: string;
  flightId: string;
  originAirport: string;
  destinationAirport: string;
  departure: ReferenceHour;
  arrival: ReferenceHour;
  passengers: PerClassAmount;
  aircraftType: string;
}

export interface PenaltyDto {
  code: string;
  flightId?: string;
  flightNumber?: string;
  issuedDay: number;
  issuedHour: number;
  penalty: number;
  reason: string;
}

export interface HourResponseDto {
  day: number;
  hour: number;
  flightUpdates: FlightEvent[];
  penalties: PenaltyDto[];
  totalCost: number;
}

// === Game State ===
export interface ProcessingKit {
  airportCode: string;
  kits: PerClassAmount;
  readyAt: ReferenceHour;
}

export interface GameState {
  currentDay: number;
  currentHour: number;
  sessionId: string;
  totalCost: number;
  airportStocks: Map<string, PerClassAmount>;
  processingKits: ProcessingKit[];
  knownFlights: Map<string, FlightEvent>;
  departingFlights: FlightEvent[];
}

// === Helpers ===
export const EMPTY_PER_CLASS: PerClassAmount = {
  first: 0,
  business: 0,
  premiumEconomy: 0,
  economy: 0
};

export const KIT_CLASSES = ['first', 'business', 'premiumEconomy', 'economy'] as const;
export type KitClass = typeof KIT_CLASSES[number];
```

### src/api/client.ts
```typescript
import axios, { AxiosInstance } from 'axios';
import { HourRequestDto, HourResponseDto } from '../types';

const API_KEY = '43b9ab90-b593-404c-a8d8-aaa074e181e1';
const BASE_URL = 'http://127.0.0.1:8080';

export class ApiClient {
  private client: AxiosInstance;
  private sessionId: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': API_KEY
      }
    });
  }

  async startSession(): Promise<string> {
    const response = await this.client.post('/api/v1/session/start');
    this.sessionId = response.data;
    console.log(`Session started: ${this.sessionId}`);
    return this.sessionId;
  }

  async playRound(request: HourRequestDto): Promise<HourResponseDto> {
    if (!this.sessionId) {
      throw new Error('Session not started');
    }

    const response = await this.client.post<HourResponseDto>(
      '/api/v1/play/round',
      request,
      {
        headers: {
          'SESSION-ID': this.sessionId
        }
      }
    );

    return response.data;
  }

  async endSession(): Promise<HourResponseDto> {
    const response = await this.client.post<HourResponseDto>(
      '/api/v1/session/end',
      {},
      {
        headers: {
          'SESSION-ID': this.sessionId
        }
      }
    );

    console.log(`Session ended. Final cost: ${response.data.totalCost}`);
    return response.data;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }
}
```

### src/index.ts (Entry Point Minimal pentru Test)
```typescript
import { ApiClient } from './api/client';
import { HourRequestDto } from './types';

async function main() {
  console.log('=== SkyKit Optimizer ===');
  console.log('Starting...\n');

  const client = new ApiClient();

  try {
    // 1. Start session
    await client.startSession();

    // 2. Game loop - 720 rounds (30 days × 24 hours)
    for (let day = 0; day < 30; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const request: HourRequestDto = {
          day,
          hour,
          flightLoads: [],  // TODO: Implementează logica de încărcare
          // kitPurchasingOrders: { first: 0, business: 0, premiumEconomy: 0, economy: 0 }
        };

        const response = await client.playRound(request);

        // Log progress every 24 hours
        if (hour === 0) {
          console.log(`Day ${day}: Cost = ${response.totalCost.toFixed(2)}`);
        }

        // Log penalties if any
        if (response.penalties.length > 0) {
          for (const penalty of response.penalties) {
            console.log(`  PENALTY: ${penalty.code} - ${penalty.penalty.toFixed(2)}`);
          }
        }
      }
    }

    // 3. End session
    const finalResult = await client.endSession();
    console.log(`\n=== FINAL SCORE: ${finalResult.totalCost.toFixed(2)} ===`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
```

---

## 6. Strategie Pitch & Prezentare

### Structura (10 min + 5 min Q&A)

```
[0:00 - 1:30] PROBLEMA (1.5 min)
- Ce sunt rotables?
- De ce e greu să le gestionezi?

[1:30 - 3:00] SOLUȚIA NOASTRĂ (1.5 min)
- Arhitectură sistem
- Abordare algoritmică

[3:00 - 6:00] DEMO/REZULTATE (3 min)
- Rulare vizuală
- Comparație scoruri
- Metrici cheie

[6:00 - 8:00] ALGORITM DETALIAT (2 min)
- Strategia de bază
- Optimizări aplicate

[8:00 - 10:00] CONCLUZII (2 min)
- Ce am învățat
- Îmbunătățiri viitoare
```

### Puncte Bonus de Acoperit
- **UI** - Dashboard vizualizare
- **Timp rezolvare** - Cât de rapid rulăm 720 runde
- **Calitate cod** - Clean code, TypeScript, teste
- **Calitate prezentare** - Diagrame clare, demo smooth

---

## 7. Planuri de Backup & Riscuri

### Risc 1: API-ul nu funcționează
**Backup:**
- Rulare locală platformă evaluare
- Verificare Java 25 instalat corect

### Risc 2: Algoritmul e prea lent
**Backup:**
- Simplificare la greedy pur
- Cache calcule repetitive
- Precomputare distanțe/costuri

### Risc 3: Penalități prea mari
**Backup:**
- Strategie conservatoare: supraîncărcare kit-uri
- Accept penalizări mici transport vs mari unfulfilled

### Risc 4: Nu înțelegem regulile
**Backup:**
- Citire cod sursă platformă evaluare
- Experimentare cu diferite scenarii
- Întrebări organizatori

---

## INSIGHT-URI CHEIE DIN REGULAMENT

### Timing-ul este CRITIC
- **T-24h**: SCHEDULED - știi zborul și pasagerii planificați
- **T-1h**: CHECKED_IN - pasagerii reali pot DIFERI
- **T+0**: LANDED - distanța reală poate DIFERI

### Procesare kit-uri
> "Kit processing time is typically longer than aircraft turnaround time"

**IMPLICAȚIE:** Kit-urile care aterizează NU sunt disponibile imediat pentru zborul de retur!
Trebuie să ai stoc pregătit DINAINTE.

### Formula Cost
```
cost_total = transport + procesare + kit-uri_noi + PENALITĂȚI
```

**Penalitățile sunt MARI** - prioritate maximă să le evităm!

### Stowaways (Factori ascunși de optimizat)
Din tema concursului: "secret stowaways included"
- Probabil: variații pasageri, întârzieri, schimbări avioane
- Strategia: buffer de siguranță + adaptare rapidă la CHECKED_IN

---

## PRIMUL LUCRU DE FĂCUT

```bash
# 1. Repository-ul e deja clonat la:
cd c:\Users\serge\Desktop\meditatii\HackitAll2025

# 2. Verifică Java 25
java --version

# 3. Rulează platforma
cd eval-platform
mvn spring-boot:run -Dspring-boot.run.profiles=local

# 4. Deschide Swagger și testează
# http://127.0.0.1:8080/swagger-ui/index.html
```

### API Keys pentru Testare (din teams.csv)
```
Testing-1:  43b9ab90-b593-404c-a8d8-aaa074e181e1
Testing-2:  03d6a5d1-afba-41ca-9343-376de757550b
Testing-3:  5acb3258-577d-482d-a89a-b4cc63a8562b
...
```

### Test Rapid cu cURL
```bash
# Start session
curl -X POST http://127.0.0.1:8080/api/v1/session/start \
  -H "API-KEY: 43b9ab90-b593-404c-a8d8-aaa074e181e1"

# Play round (înlocuiește SESSION-ID cu cel primit)
curl -X POST http://127.0.0.1:8080/api/v1/play/round \
  -H "API-KEY: 43b9ab90-b593-404c-a8d8-aaa074e181e1" \
  -H "SESSION-ID: <session-id-primit>" \
  -H "Content-Type: application/json" \
  -d '{"day": 0, "hour": 0, "flightLoads": []}'
```

### Fișiere CSV Important de Analizat
```
eval-platform/src/main/resources/liquibase/data/
├── aircraft_types.csv      # 4 tipuri de avioane
├── airports.csv            # 161 aeroporturi (fără stocuri)
├── airports_with_stocks.csv # 161 aeroporturi CU stocuri și capacități
├── flight_plan.csv         # ~448 rute programate
├── flights.csv             # Fișier mare - probabil zboruri generate pentru 30 zile
└── teams.csv               # API keys pentru testare
```

---

*Plan actualizat pentru Hackathon SAP - Rotables Optimization*
*Echipă: 3 persoane | Durată: 48 ore | Joc: 720 runde turn-based*
*Stack: TypeScript/Node.js*
