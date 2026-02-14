import { User } from "@supabase/supabase-js";
import type { GridBounds } from "@/lib/gridSystem";

export type LatLng = {
  lat: number;
  lng: number;
};

export type PlayerPresence = {
  id: string;
  username: string;
  location: LatLng;
  lastActive: number;
};

export type GlobalDrop = {
  id: string;
  location: LatLng;
  rarity: DropRarity;
};

export type Drop = {
  id: string;
  location: LatLng;
  collected: boolean;
  rarity: DropRarity;
};

export type DropRarity = "Common" | "Rare" | "Epic" | "Legendary";
export type RewardType = "Credits" | "INK Cash" | "Permit";

export type ParcelRarity = "common" | "rare" | "epic" | "legendary";

export type ParcelData = {
  id: string;
  corners: Array<[number, number]>;
  center: LatLng;
  rarity: ParcelRarity;
  level: number;
  purchaseTime: number;
  rentRate: number;
  visualFeature?: string;
  lastUpgradedAt?: number;
};

export type LeaderboardScope = "city" | "state" | "country";
export type LeaderboardTab = LeaderboardScope | "officeholders";

export type LeaderboardEntry = {
  id: string;
  name: string;
  title: string;
  income: number;
  parcels: number;
  region: string;
  avatarUrl: string;
};

export type MayorStatus = {
  title: string;
  region: string;
  name: string;
  income: number;
};

export type LeaderboardPlayerPosition = {
  rank: number;
  entry: LeaderboardEntry;
};

export type Officeholder = {
  title: "Mayor" | "Governor" | "President";
  name: string;
  region: string;
  parcels: number;
  needed: number;
  avatarUrl: string;
};

export type GovernanceOfficeholders = {
  city: {
    mayorId: string;
    viceMayorId: string;
  };
  state: {
    governorId: string;
  };
  country: {
    presidentId: string;
  };
};

export type PayoutEvent = {
  id: string;
  type: "CityKeyKickback" | "CityKeyRoyalty" | "TreasuryMayor" | "TreasuryViceMayor";
  amount: number;
  recipientId: string;
  region: string;
  timestamp: number;
};

export type CityKeyLevel = "district" | "city" | "county" | "state" | "country";

export const PARCEL_RENT_RATES: Record<ParcelRarity, number> = {
  common: 0.0000001111,
  rare: 0.00000016665,
  epic: 0.0000002222,
  legendary: 0.0000004444,
};

export const PARCEL_FEATURES: Record<ParcelRarity, string[]> = {
  common: ["Lawn", "Flowerbed"],
  rare: ["Solar Array", "Billboard"],
  epic: ["Brownstone", "Pool House"],
  legendary: ["Golden Bull", "Fountain"],
};

export const MOCK_LEADERBOARDS: Record<LeaderboardScope, LeaderboardEntry[]> = {
  city: [
    { id: "city-1", name: "AustinKing", title: "Mayor", income: 0.024512, parcels: 182, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-2", name: "VaultDahlia", title: "Mayor", income: 0.021984, parcels: 166, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-3", name: "IronLedger", title: "Mayor", income: 0.020477, parcels: 152, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-4", name: "MapleTrust", title: "Mayor", income: 0.019231, parcels: 148, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-5", name: "SignalForte", title: "Mayor", income: 0.018902, parcels: 141, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-6", name: "NeonEscrow", title: "Mayor", income: 0.017305, parcels: 131, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-7", name: "RivetCapital", title: "Mayor", income: 0.016889, parcels: 125, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-8", name: "MarbleMint", title: "Mayor", income: 0.016201, parcels: 121, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-9", name: "HarborNexus", title: "Mayor", income: 0.015712, parcels: 116, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-10", name: "JetLedger", title: "Mayor", income: 0.015194, parcels: 111, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-11", name: "QuartzSky", title: "Mayor", income: 0.014803, parcels: 108, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-12", name: "NorthCrest", title: "Mayor", income: 0.014221, parcels: 104, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-13", name: "LedgerPulse", title: "Mayor", income: 0.013912, parcels: 101, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-14", name: "BlueHarbor", title: "Mayor", income: 0.013504, parcels: 97, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-15", name: "SlateRidge", title: "Mayor", income: 0.013101, parcels: 95, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-16", name: "CivicTrail", title: "Mayor", income: 0.012798, parcels: 91, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-17", name: "PeakSignal", title: "Mayor", income: 0.012504, parcels: 88, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-18", name: "IronVale", title: "Mayor", income: 0.012041, parcels: 85, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-19", name: "CopperKey", title: "Mayor", income: 0.011744, parcels: 82, region: "Austin, TX", avatarUrl: "/globe.svg" },
    { id: "city-20", name: "MetroForge", title: "Mayor", income: 0.011401, parcels: 80, region: "Austin, TX", avatarUrl: "/globe.svg" },
  ],
  state: [
    { id: "state-1", name: "ArcVault", title: "Governor", income: 0.112414, parcels: 896, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-2", name: "SilverAxis", title: "Governor", income: 0.101221, parcels: 862, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-3", name: "NovaSteward", title: "Governor", income: 0.099884, parcels: 844, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-4", name: "CrestLedger", title: "Governor", income: 0.095112, parcels: 799, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-5", name: "Gridline", title: "Governor", income: 0.093652, parcels: 775, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-6", name: "CitadelWave", title: "Governor", income: 0.091448, parcels: 742, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-7", name: "Lockstep", title: "Governor", income: 0.089913, parcels: 719, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-8", name: "SouthBanker", title: "Governor", income: 0.088221, parcels: 704, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-9", name: "CanyonTrust", title: "Governor", income: 0.086444, parcels: 691, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-10", name: "LumenHold", title: "Governor", income: 0.084119, parcels: 663, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-11", name: "RangerCivic", title: "Governor", income: 0.082414, parcels: 648, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-12", name: "PrairieMint", title: "Governor", income: 0.080221, parcels: 632, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-13", name: "GulfAxis", title: "Governor", income: 0.078884, parcels: 618, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-14", name: "MesaHold", title: "Governor", income: 0.077112, parcels: 604, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-15", name: "IronCanyon", title: "Governor", income: 0.075652, parcels: 590, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-16", name: "CedarLine", title: "Governor", income: 0.073448, parcels: 571, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-17", name: "Oakstone", title: "Governor", income: 0.071913, parcels: 552, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-18", name: "CactusLedger", title: "Governor", income: 0.070221, parcels: 538, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-19", name: "VistaForge", title: "Governor", income: 0.068444, parcels: 521, region: "Texas", avatarUrl: "/globe.svg" },
    { id: "state-20", name: "Hillcrest", title: "Governor", income: 0.066119, parcels: 506, region: "Texas", avatarUrl: "/globe.svg" },
  ],
  country: [
    { id: "country-1", name: "AtlasPrime", title: "President", income: 1.482441, parcels: 9820, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-2", name: "CivicMint", title: "President", income: 1.401004, parcels: 9482, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-3", name: "CrownForge", title: "President", income: 1.352874, parcels: 9211, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-4", name: "QuartzLine", title: "President", income: 1.299121, parcels: 8975, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-5", name: "RelayCapital", title: "President", income: 1.243339, parcels: 8624, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-6", name: "PeakAuthority", title: "President", income: 1.198402, parcels: 8310, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-7", name: "TitanMark", title: "President", income: 1.151114, parcels: 8042, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-8", name: "LedgeWorks", title: "President", income: 1.101553, parcels: 7788, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-9", name: "HeritageGrid", title: "President", income: 1.054998, parcels: 7420, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-10", name: "IronCrest", title: "President", income: 1.011224, parcels: 7189, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-11", name: "SummitCivic", title: "President", income: 0.982441, parcels: 6940, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-12", name: "TrueNorth", title: "President", income: 0.954004, parcels: 6721, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-13", name: "CivicAxis", title: "President", income: 0.923874, parcels: 6488, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-14", name: "IronSignal", title: "President", income: 0.899121, parcels: 6294, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-15", name: "PrismLine", title: "President", income: 0.872339, parcels: 6073, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-16", name: "UnionWave", title: "President", income: 0.851402, parcels: 5904, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-17", name: "GraniteMark", title: "President", income: 0.822114, parcels: 5712, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-18", name: "LatticeHold", title: "President", income: 0.801553, parcels: 5510, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-19", name: "RiverCrest", title: "President", income: 0.774998, parcels: 5336, region: "United States", avatarUrl: "/globe.svg" },
    { id: "country-20", name: "Frontier", title: "President", income: 0.751224, parcels: 5109, region: "United States", avatarUrl: "/globe.svg" },
  ],
};

export const MOCK_FEED_EVENTS = [
  "AustinKing bought 5 plots in Downtown Austin",
  "VaultDahlia secured a Legendary supply drop",
  "IronLedger upgraded a parcel to Epic",
  "SignalForte minted 12 new parcels in South Congress",
  "MapleTrust secured Vice Mayor status in Austin",
  "NeonEscrow claimed 20 INK Cash from City Treasury",
  "CrestLedger bought a City Key for Austin, TX",
  "JetLedger reinvested rent for +25 INK Cash",
  "HarborNexus claimed 3 zoning permits",
  "MarbleMint hit 500 total parcels owned",
];

export const MOCK_PLAYER_POSITIONS: Record<LeaderboardScope, LeaderboardPlayerPosition> = {
  city: {
    rank: 42,
    entry: {
      id: "player-city",
      name: "You",
      title: "Mayor",
      income: 0.006402,
      parcels: 38,
      region: "Austin, TX",
      avatarUrl: "/globe.svg",
    },
  },
  state: {
    rank: 318,
    entry: {
      id: "player-state",
      name: "You",
      title: "Governor",
      income: 0.004122,
      parcels: 28,
      region: "Texas",
      avatarUrl: "/globe.svg",
    },
  },
  country: {
    rank: 2211,
    entry: {
      id: "player-country",
      name: "You",
      title: "President",
      income: 0.002014,
      parcels: 16,
      region: "United States",
      avatarUrl: "/globe.svg",
    },
  },
};

export const MOCK_OFFICEHOLDERS: Officeholder[] = [
  {
    title: "Mayor",
    name: "AustinKing",
    region: "Austin, TX",
    parcels: 4200,
    needed: 4199,
    avatarUrl: "/globe.svg",
  },
  {
    title: "Governor",
    name: "AustinKing",
    region: "Texas",
    parcels: 38453,
    needed: 38452,
    avatarUrl: "/globe.svg",
  },
  {
    title: "President",
    name: "AustinKing",
    region: "United States",
    parcels: 143675,
    needed: 143674,
    avatarUrl: "/globe.svg",
  },
];

export const MOCK_GOVERNANCE_OFFICEHOLDERS: GovernanceOfficeholders = {
  city: {
    mayorId: "AustinKing",
    viceMayorId: "VaultDahlia",
  },
  state: {
    governorId: "AustinKing",
  },
  country: {
    presidentId: "AustinKing",
  },
};

export const REGION_HIERARCHY: Record<string, { state: string; country: string }> = {
  "Austin, TX": { state: "Texas", country: "United States" },
};

export type DroneStatus = "idle" | "targeting" | "deploying" | "active";

export type GameState = {
  userLocation: LatLng | null;
  rentBalance: number;
  walletBalance: number;
  credits: number;
  influenceBucks: number;
  zoningPermits: number;
  locationRequestId: number;
  pickupRadiusMultiplier: number;
  drops: Drop[];
  otherPlayers: Record<string, PlayerPresence>;
  globalDrops: GlobalDrop[];
  selectedParcel: GridBounds | null;
  ownedParcels: Record<string, ParcelData>;
  isMinting: boolean;
  forceNextLegendary: boolean;
  mapZoom: number;
  minMapZoom: number;
  maxMapZoom: number;
  lastSettledTime: number;
  escrowLimit: number;
  boostEndTime: number | null;
  boostDurationMs: number;
  lastDropSpawnTime: number;
  leaderboards: Record<LeaderboardScope, LeaderboardEntry[]>;
  activeLeaderboardScope: LeaderboardTab;
  isLeaderboardOpen: boolean;
  mayorStatus: MayorStatus | null;
  feedEvents: string[];
  playerPositions: Record<LeaderboardScope, LeaderboardPlayerPosition>;
  officeholders: Officeholder[];
  cityKeysOwned: Record<string, number>;
  treasuryBalances: Record<string, number>;
  governanceBalances: Record<string, number>;
  governanceOfficeholders: GovernanceOfficeholders;
  payoutEvents: PayoutEvent[];
  lastSponsorBriefingTime: number;
  ownedLandmarks: string[];
  activeSubscriptions: string[];
  isTickerVisible: boolean;
  selectedJurisdiction: string | null;
  viewingMode: "personal" | "drone";
  
  // Drone System
  satelliteMode: boolean;
  droneStatus: DroneStatus;
  droneTargetLocation: LatLng | null;
  droneCurrentLocation: LatLng | null;
  droneSessionExpiry: number | null;
  isLeaping: boolean;
  
  droneTimer: number;
  droneTetherCenter: LatLng | null;
  satelliteCameraLocation: LatLng | null;
  flyToTarget: LatLng | null;
  uplinkCharges: number;
  lastUplinkRefillTime: number;
  user: User | null;
  isSyncing: boolean;
  lastSyncTime: number | null;
  cloudSyncError: string | null;
  setUser: (user: User | null) => void;
  setOtherPlayers: (players: Record<string, PlayerPresence>) => void;
  setGlobalDrops: (drops: GlobalDrop[] | ((current: GlobalDrop[]) => GlobalDrop[])) => void;
  isBoostActive: (timestamp?: number) => boolean;
  setUserLocation: (location: LatLng) => void;
  setSatelliteCameraLocation: (location: LatLng | null) => void;
  triggerMapFlyTo: (location: LatLng | null) => void;
  hydrateFromCloud: () => Promise<void>;
  syncToCloud: () => Promise<void>;
  generateDrops: (origin: LatLng) => void;
  spawnDropsInRadius: (origin: LatLng, count: number, radiusMeters: number) => void;
  collectDrop: (dropId: string) => { type: RewardType; amount: number };
  isDropInRange: (origin: LatLng, drop: { location: LatLng }, radiusMeters?: number) => boolean;
  setSelectedParcel: (parcel: GridBounds | null) => void;
  setViewingMode: (mode: "personal" | "drone") => void;
  setIsMinting: (isMinting: boolean) => void;
  setForceNextLegendary: (force: boolean) => void;
  setOwnedParcelsCount: (count: number) => void;
  buyParcel: (parcel: GridBounds, cost: number) => ParcelData | null;
  upgradeParcel: (parcelId: string) => { success: boolean; reason?: string };
  resetGame: () => void;
  addWalletBalance: (amount: number) => void;
  addInkCash: (amount: number) => void;
  addCredits: (amount: number) => void;
  addInfluenceBucks: (amount: number) => void;
  addZoningPermits: (amount: number) => void;
  setMapZoom: (zoom: number) => void;
  setPickupRadiusMultiplier: (multiplier: number) => void;
  setMapZoomLimits: (minZoom: number, maxZoom: number) => void;
  setBoostDurationMs: (durationMs: number) => void;
  setLeaderboardOpen: (isOpen: boolean) => void;
  setActiveLeaderboardScope: (scope: LeaderboardTab) => void;
  setTickerVisible: (visible: boolean) => void;
  setSelectedJurisdiction: (region: string | null) => void;
  
  // Drone Actions
  toggleSatelliteMode: () => void;
  startTargeting: () => void;
  confirmDeployment: (target: LatLng) => void;
  completeDeployment: () => void;
  cancelDrone: () => void;
  setLeaping: (leaping: boolean) => void;
  updateDroneLocation: (location: LatLng) => void;

  startDroneSession: () => void;
  endDroneSession: () => void;
  updateDroneTimer: () => void;
  consumeUplinkCharge: () => boolean;
  refillUplinkCharges: () => void;
  watchSponsorBriefing: () => { success: boolean; remainingCooldown?: number };
  addLandmark: (landmarkId: string) => void;
  activateSubscription: (tierId: string) => void;
  activateBoost: () => void;
  extendBoost: () => void;
  getPendingRent: (timestamp?: number) => number;
  settleFunds: (timestamp?: number) => void;
  reinvestFunds: (timestamp?: number) => boolean;
  syncBalance: (timestamp?: number) => void;
  purchaseCityKey: (regionId: string, costInk: number, level: CityKeyLevel) => boolean;
  distributeCityKeyRoyalties: (regionId: string, amountInk: number) => void;
  distributeTreasuryPayout: (regionId: string) => void;
  simulateTreasuryTick: (regionId: string, amountInk?: number) => void;
};

export const LOOT_TABLE: Record<
  DropRarity,
  { type: RewardType; min: number; max: number; decimals?: number }
> = {
  Common: { type: "Credits", min: 2, max: 6 },
  Rare: { type: "Credits", min: 12, max: 24 },
  Epic: { type: "INK Cash", min: 0.05, max: 0.2, decimals: 6 },
  Legendary: { type: "Permit", min: 1, max: 2 },
};

export type BoostTier = {
  min: number;
  max?: number;
  multiplier: number;
};

export const BOOST_TIERS: BoostTier[] = [
  { min: 0, max: 150, multiplier: 30 },
  { min: 151, max: 220, multiplier: 20 },
  { min: 221, max: 290, multiplier: 15 },
  { min: 291, max: 365, multiplier: 12 },
  { min: 366, max: 435, multiplier: 10 },
  { min: 436, max: 545, multiplier: 8 },
  { min: 546, max: 625, multiplier: 7 },
  { min: 626, max: 730, multiplier: 6 },
  { min: 731, max: 875, multiplier: 5 },
  { min: 876, max: 1100, multiplier: 4 },
  { min: 1101, max: 1500, multiplier: 3 },
  { min: 1501, multiplier: 2 },
];

export const rarityOrder: ParcelRarity[] = ["common", "rare", "epic", "legendary"];

export const DROP_SPAWN_INTERVAL_MS = 4 * 60 * 60 * 1000;
export const ACTIVE_DROP_RADIUS_METERS = 50;
export const RESERVE_DROP_RADIUS_METERS = 500;
export const ACTIVE_DROP_MIN = 4;
export const ACTIVE_DROP_MAX = 6;
export const RESERVE_DROP_COUNT = 20;
export const SATELLITE_UPLINK_REFILL_MS = 60 * 60 * 1000;
export const SATELLITE_MAX_CHARGES = 3;
export const REMOTE_FILING_FEE_MULTIPLIER = 0.1;
export const DRONE_TETHER_RADIUS_MILES = 10;
export const DRONE_TETHER_RADIUS_KM = 16.0934;
export const DRONE_BUY_RADIUS_KM = 0.804672;
export const DRONE_SESSION_DURATION_SEC = 600; // 10 minutes
export const getBoostStackLimitMs = () => 6 * 60 * 60 * 1000;
export const getEscrowLimitMs = () => 4 * 60 * 60 * 1000;
