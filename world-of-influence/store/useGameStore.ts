"use client";

import { bbox, circle, distance, randomPoint } from "@turf/turf";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { GridBounds } from "@/lib/gridSystem";

export type LatLng = {
  lat: number;
  lng: number;
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

const PARCEL_RENT_RATES: Record<ParcelRarity, number> = {
  common: 0.0000001111,
  rare: 0.00000016665,
  epic: 0.0000002222,
  legendary: 0.0000004444,
};

const PARCEL_FEATURES: Record<ParcelRarity, string[]> = {
  common: ["Lawn", "Flowerbed"],
  rare: ["Solar Array", "Billboard"],
  epic: ["Brownstone", "Pool House"],
  legendary: ["Golden Bull", "Fountain"],
};

const MOCK_LEADERBOARDS: Record<LeaderboardScope, LeaderboardEntry[]> = {
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

const MOCK_FEED_EVENTS = [
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

const MOCK_PLAYER_POSITIONS: Record<LeaderboardScope, LeaderboardPlayerPosition> = {
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

const MOCK_OFFICEHOLDERS: Officeholder[] = [
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

const MOCK_GOVERNANCE_OFFICEHOLDERS: GovernanceOfficeholders = {
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

const REGION_HIERARCHY: Record<string, { state: string; country: string }> = {
  "Austin, TX": { state: "Texas", country: "United States" },
};

type GameState = {
  userLocation: LatLng | null;
  rentBalance: number;
  walletBalance: number;
  credits: number;
  influenceBucks: number;
  zoningPermits: number;
  locationRequestId: number;
  pickupRadiusMultiplier: number;
  drops: Drop[];
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
  isBoostActive: (timestamp?: number) => boolean;
  setUserLocation: (location: LatLng) => void;
  generateDrops: (origin: LatLng) => void;
  spawnDropsInRadius: (origin: LatLng, count: number, radiusMeters: number) => void;
  collectDrop: (dropId: string) => { type: RewardType; amount: number };
  isDropInRange: (origin: LatLng, drop: Drop, radiusMeters?: number) => boolean;
  setSelectedParcel: (parcel: GridBounds | null) => void;
  setIsMinting: (isMinting: boolean) => void;
  setForceNextLegendary: (force: boolean) => void;
  setOwnedParcelsCount: (count: number) => void;
  buyParcel: (parcel: GridBounds, cost: number) => ParcelData | null;
  upgradeParcel: (parcelId: string) => { success: boolean; reason?: string };
  resetGame: () => void;
  addWalletBalance: (amount: number) => void;
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

const metersToKilometers = (meters: number) => meters / 1000;

const LOOT_TABLE: Record<
  DropRarity,
  { type: RewardType; min: number; max: number; decimals?: number }
> = {
  Common: { type: "Credits", min: 2, max: 6 },
  Rare: { type: "Credits", min: 12, max: 24 },
  Epic: { type: "INK Cash", min: 0.05, max: 0.2, decimals: 6 },
  Legendary: { type: "Permit", min: 1, max: 2 },
};

const pickDropRarity = (): DropRarity => {
  const roll = Math.random();
  if (roll < 0.05) return "Legendary";
  if (roll < 0.15) return "Epic";
  if (roll < 0.4) return "Rare";
  return "Common";
};

const rollLoot = (rarity: DropRarity) => {
  const table = LOOT_TABLE[rarity];
  if (table.type === "Permit") {
    const amount = Math.floor(Math.random() * (table.max - table.min + 1) + table.min);
    return { type: table.type, amount };
  }
  if (table.decimals) {
    const amount = Math.random() * (table.max - table.min) + table.min;
    return { type: table.type, amount: Number(amount.toFixed(table.decimals)) };
  }
  const amount = Math.floor(Math.random() * (table.max - table.min + 1) + table.min);
  return { type: table.type, amount };
};

const pickRarity = (): ParcelRarity => {
  const roll = Math.random() * 100;
  if (roll < 50) return "common";
  if (roll < 80) return "rare";
  if (roll < 95) return "epic";
  return "legendary";
};

const pickParcelFeature = (rarity: ParcelRarity) => {
  const options = PARCEL_FEATURES[rarity];
  return options[Math.floor(Math.random() * options.length)];
};

const pickWeightedParcelRarity = (): ParcelRarity => {
  const roll = Math.random() * 100;
  if (roll < 50) return "common";
  if (roll < 80) return "rare";
  if (roll < 95) return "epic";
  return "legendary";
};

const buildCheatParcels = (count: number): Record<string, ParcelData> => {
  const parcels: Record<string, ParcelData> = {};
  const now = Date.now();
  for (let index = 0; index < count; index += 1) {
    const rarity = pickWeightedParcelRarity();
    parcels[`cheat-${index}`] = {
      id: `cheat-${index}`,
      corners: [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ],
      center: { lat: 0, lng: 0 },
      rarity,
      level: getRarityLevel(rarity),
      purchaseTime: now,
      rentRate: PARCEL_RENT_RATES[rarity],
      visualFeature: PARCEL_FEATURES[rarity]?.[0] ?? "Lawn",
    };
  }
  return parcels;
};

const calculateBaseRentRate = (ownedParcels: Record<string, ParcelData>) =>
  Object.values(ownedParcels).reduce((total, parcel) => {
    const rentRate = Number.isFinite(parcel.rentRate)
      ? parcel.rentRate
      : PARCEL_RENT_RATES[parcel.rarity];
    return total + rentRate;
  }, 0);

const rarityOrder: ParcelRarity[] = ["common", "rare", "epic", "legendary"];

const getRarityLevel = (rarity: ParcelRarity) => rarityOrder.indexOf(rarity) + 1;

const getNextRarity = (rarity: ParcelRarity): ParcelRarity | null => {
  const index = rarityOrder.indexOf(rarity);
  if (index < 0 || index >= rarityOrder.length - 1) {
    return null;
  }
  return rarityOrder[index + 1];
};

const normalizeParcelData = (parcel: ParcelData): ParcelData => {
  const rarity = parcel.rarity ?? "common";
  const rentRate = Number.isFinite(parcel.rentRate)
    ? parcel.rentRate
    : PARCEL_RENT_RATES[rarity];
  const visualFeature =
    parcel.visualFeature ?? PARCEL_FEATURES[rarity]?.[0] ?? "Lawn";
  return {
    ...parcel,
    rarity,
    level: Number.isFinite(parcel.level) ? parcel.level : getRarityLevel(rarity),
    purchaseTime: Number.isFinite(parcel.purchaseTime) ? parcel.purchaseTime : Date.now(),
    rentRate,
    visualFeature,
  };
};

export const computeBaseRentRate = (ownedParcels: Record<string, ParcelData>) =>
  calculateBaseRentRate(ownedParcels);

export const selectBaseRentRate = (state: GameState) =>
  calculateBaseRentRate(state.ownedParcels);

type BoostTier = {
  min: number;
  max?: number;
  multiplier: number;
};

const BOOST_TIERS: BoostTier[] = [
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

export const getBoostMultiplier = (parcelCount: number) => {
  const tier = BOOST_TIERS.find(
    (candidate) =>
      parcelCount >= candidate.min &&
      (candidate.max === undefined || parcelCount <= candidate.max),
  );
  return tier ? tier.multiplier : 1;
};

export const computeRentRate = (
  ownedParcels: Record<string, ParcelData>,
  boostEndTime: number | null,
  timestamp = Date.now(),
) => {
  const baseRate = calculateBaseRentRate(ownedParcels);
  const isBoostActive = boostEndTime ? boostEndTime > timestamp : false;
  const parcelCount = Object.keys(ownedParcels).length;
  const boostMultiplier = getBoostMultiplier(parcelCount);
  return baseRate * (isBoostActive ? boostMultiplier : 1);
};

export const selectRentRate = (state: GameState, timestamp = Date.now()) =>
  computeRentRate(state.ownedParcels, state.boostEndTime, timestamp);

export const selectGovernanceOfficeholders = (state: GameState) =>
  state.governanceOfficeholders;

export const selectPlayerPosition = (state: GameState, scope: LeaderboardScope) =>
  state.playerPositions[scope];

const resolveRegionHierarchy = (regionId: string) => {
  const mapped = REGION_HIERARCHY[regionId];
  return {
    city: regionId,
    state: mapped?.state ?? regionId,
    country: mapped?.country ?? regionId,
  };
};

const appendPayoutEvent = (events: PayoutEvent[], next: PayoutEvent) => {
  const updated = [...events, next];
  return updated.length > 5 ? updated.slice(-5) : updated;
};

const addGovernanceBalance = (
  balances: Record<string, number>,
  recipientId: string,
  amount: number,
) => ({
  ...balances,
  [recipientId]: (balances[recipientId] ?? 0) + amount,
});

const DROP_SPAWN_INTERVAL_MS = 4 * 60 * 60 * 1000;
const ACTIVE_DROP_RADIUS_METERS = 50;
const RESERVE_DROP_RADIUS_METERS = 500;
const ACTIVE_DROP_MIN = 4;
const ACTIVE_DROP_MAX = 6;
const RESERVE_DROP_COUNT = 20;
const getBoostStackLimitMs = () => 6 * 60 * 60 * 1000;
const getEscrowLimitMs = () => 4 * 60 * 60 * 1000;

export const selectIsBoostActive = (state: GameState, timestamp = Date.now()) =>
  state.boostEndTime ? state.boostEndTime > timestamp : false;

const computePendingRent = (state: GameState, timestamp = Date.now()) => {
  const elapsedMs = Math.max(0, timestamp - state.lastSettledTime);
  const effectiveMs = Math.min(elapsedMs, state.escrowLimit);
  const rate = selectRentRate(state, timestamp);
  return state.rentBalance + rate * (effectiveMs / 1000);
};

const getFreshState = (timestamp = Date.now()) => ({
  userLocation: null,
  rentBalance: 0,
  walletBalance: 0,
  credits: 500,
  influenceBucks: 0,
  zoningPermits: 5,
  locationRequestId: 0,
  pickupRadiusMultiplier: 1,
  drops: [],
  lastDropSpawnTime: 0,
  selectedParcel: null,
  ownedParcels: {},
  isMinting: false,
  forceNextLegendary: false,
  mapZoom: 17,
  minMapZoom: 17,
  maxMapZoom: 21,
  lastSettledTime: timestamp,
  escrowLimit: getEscrowLimitMs(),
  boostEndTime: null,
  boostDurationMs: 60 * 60 * 1000,
  leaderboards: MOCK_LEADERBOARDS,
  activeLeaderboardScope: "city" as LeaderboardTab,
  isLeaderboardOpen: false,
  mayorStatus: {
    title: "Mayor",
    region: "Austin, TX",
    name: "AustinKing",
    income: 0.024512,
  },
  feedEvents: MOCK_FEED_EVENTS,
  playerPositions: MOCK_PLAYER_POSITIONS,
  officeholders: MOCK_OFFICEHOLDERS,
  cityKeysOwned: {},
  treasuryBalances: {},
  governanceBalances: {},
  governanceOfficeholders: MOCK_GOVERNANCE_OFFICEHOLDERS,
  payoutEvents: [],
  lastSponsorBriefingTime: 0,
  ownedLandmarks: [],
  activeSubscriptions: [],
  isTickerVisible: false,
});

const buildDropsInRadius = (origin: LatLng, count: number, radiusMeters: number) => {
  if (count <= 0) {
    return [];
  }
  const radiusKm = metersToKilometers(radiusMeters);
  const bounds = bbox(circle([origin.lng, origin.lat], radiusKm, { units: "kilometers" }));
  const points = randomPoint(count, { bbox: bounds });
  return points.features.map((feature) => ({
    id: crypto.randomUUID(),
    location: {
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
    },
    collected: false,
    rarity: pickDropRarity(),
  }));
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...getFreshState(Date.now()),
      isBoostActive: (timestamp = Date.now()) => selectIsBoostActive(get(), timestamp),
      setUserLocation: (location) => set({ userLocation: location }),
      generateDrops: (origin) => {
        const now = Date.now();
        const state = get();
        const isExpired = now - state.lastDropSpawnTime >= DROP_SPAWN_INTERVAL_MS;
        if (state.drops.length > 0 && !isExpired) {
          return;
        }
        const activeCount =
          Math.floor(Math.random() * (ACTIVE_DROP_MAX - ACTIVE_DROP_MIN + 1)) + ACTIVE_DROP_MIN;
        const activeDrops = buildDropsInRadius(origin, activeCount, ACTIVE_DROP_RADIUS_METERS);
        const reserveDrops = buildDropsInRadius(origin, RESERVE_DROP_COUNT, RESERVE_DROP_RADIUS_METERS);
        set({ drops: [...activeDrops, ...reserveDrops], lastDropSpawnTime: now });
      },
      spawnDropsInRadius: (origin, count, radiusMeters) => {
        const drops = buildDropsInRadius(origin, count, radiusMeters);
        set({ drops, lastDropSpawnTime: Date.now() });
      },
      collectDrop: (dropId) => {
        const drop = get().drops.find((candidate) => candidate.id === dropId);
        if (!drop || drop.collected) {
          return { type: "Credits", amount: 0 };
        }
        const reward = rollLoot(drop.rarity);
        set((state) => ({
          drops: state.drops.map((candidate) =>
            candidate.id === dropId ? { ...candidate, collected: true } : candidate,
          ),
          credits:
            reward.type === "Credits" ? state.credits + reward.amount : state.credits,
          influenceBucks:
            reward.type === "INK Cash"
              ? state.influenceBucks + reward.amount
              : state.influenceBucks,
          zoningPermits:
            reward.type === "Permit"
              ? state.zoningPermits + reward.amount
              : state.zoningPermits,
        }));
        return reward;
      },
      isDropInRange: (origin, drop, radiusMeters = 50) => {
        const km = distance(
          [origin.lng, origin.lat],
          [drop.location.lng, drop.location.lat],
          { units: "kilometers" },
        );
        return km <= metersToKilometers(radiusMeters);
      },
      setSelectedParcel: (parcel) => set({ selectedParcel: parcel }),
      setIsMinting: (isMinting) => set({ isMinting }),
      setForceNextLegendary: (force) => set({ forceNextLegendary: force }),
      setOwnedParcelsCount: (count) => {
        const safeCount = Math.max(0, Math.floor(count));
        const now = Date.now();
        set({
          ownedParcels: buildCheatParcels(safeCount),
          selectedParcel: null,
          lastSettledTime: now,
          rentBalance: 0,
        });
      },
      buyParcel: (parcel, cost) => {
        const now = Date.now();
        get().syncBalance(now);
        const { influenceBucks, ownedParcels, forceNextLegendary } = get();
        if (influenceBucks < cost || ownedParcels[parcel.id]) {
          return null;
        }

        const rarity = forceNextLegendary ? "legendary" : pickRarity();
        const visualFeature = pickParcelFeature(rarity);
        const purchased: ParcelData = {
          id: parcel.id,
          corners: parcel.corners,
          center: parcel.center,
          rarity,
          level: getRarityLevel(rarity),
          purchaseTime: now,
          rentRate: PARCEL_RENT_RATES[rarity],
          visualFeature,
        };

        set((state) => ({
          influenceBucks: state.influenceBucks - cost,
          forceNextLegendary: false,
          ownedParcels: {
            ...state.ownedParcels,
            [parcel.id]: purchased,
          },
        }));

        return purchased;
      },
      upgradeParcel: (parcelId) => {
        const now = Date.now();
        get().syncBalance(now);
        const state = get();
        const parcel = state.ownedParcels[parcelId];
        if (!parcel) {
          return { success: false, reason: "Parcel not found." };
        }
        const nextRarity = getNextRarity(parcel.rarity);
        if (!nextRarity) {
          return { success: false, reason: "Parcel already maxed." };
        }
        if (state.influenceBucks < 250 || state.zoningPermits < 1) {
          return { success: false, reason: "Insufficient funds." };
        }
        const upgraded: ParcelData = {
          ...parcel,
          rarity: nextRarity,
          level: getRarityLevel(nextRarity),
          rentRate: PARCEL_RENT_RATES[nextRarity],
          lastUpgradedAt: now,
        };
        set((current) => ({
          influenceBucks: current.influenceBucks - 250,
          zoningPermits: current.zoningPermits - 1,
          ownedParcels: {
            ...current.ownedParcels,
            [parcelId]: upgraded,
          },
        }));
        return { success: true };
      },
      resetGame: () => {
        const now = Date.now();
        const currentRequestId = get().locationRequestId;
        set({ ...getFreshState(now), locationRequestId: currentRequestId + 1 });
      },
      getPendingRent: (timestamp = Date.now()) => computePendingRent(get(), timestamp),
      settleFunds: (timestamp = Date.now()) => {
        const state = get();
        const pendingRent = computePendingRent(state, timestamp);
        set({
          walletBalance: state.walletBalance + pendingRent,
          rentBalance: 0,
          lastSettledTime: timestamp,
        });
      },
      reinvestFunds: (timestamp = Date.now()) => {
        const state = get();
        const pendingRent = computePendingRent(state, timestamp);
        if (pendingRent < 1) {
          return false;
        }
        set({
          rentBalance: pendingRent - 1,
          lastSettledTime: timestamp,
          influenceBucks: state.influenceBucks + 25,
        });
        return true;
      },
      syncBalance: (timestamp = Date.now()) => {
        const state = get();
        const elapsedMs = timestamp - state.lastSettledTime;
        if (elapsedMs <= 0) {
          set({ lastSettledTime: timestamp });
          return;
        }
        const pendingRent = computePendingRent(state, timestamp);
        set({
          rentBalance: pendingRent,
          lastSettledTime: timestamp,
        });
      },
      activateBoost: () => {
        const now = Date.now();
        get().syncBalance(now);
        const state = get();
        const currentEnd = state.boostEndTime ?? now;
        const base = Math.max(currentEnd, now);
        const nextEnd = base + state.boostDurationMs;
        const cap = now + getBoostStackLimitMs();
        set({ boostEndTime: Math.min(nextEnd, cap) });
      },
      extendBoost: () => {
        const now = Date.now();
        get().syncBalance(now);
        const state = get();
        const currentEnd = state.boostEndTime ?? now;
        const base = Math.max(currentEnd, now);
        const cap = now + getBoostStackLimitMs();
        set({ boostEndTime: Math.min(base + state.boostDurationMs, cap) });
      },
      purchaseCityKey: (regionId, costInk, _level) => {
        const state = get();
        if (state.influenceBucks < costInk) {
          return false;
        }
        set((current) => ({
          influenceBucks: current.influenceBucks - costInk,
          cityKeysOwned: {
            ...current.cityKeysOwned,
            [regionId]: (current.cityKeysOwned[regionId] ?? 0) + 1,
          },
        }));
        get().distributeCityKeyRoyalties(regionId, costInk);
        return true;
      },
      distributeCityKeyRoyalties: (regionId, amountInk) => {
        const now = Date.now();
        const hierarchy = resolveRegionHierarchy(regionId);
        const { governanceOfficeholders } = get();
        const mayorId = governanceOfficeholders.city.mayorId;
        const governorId = governanceOfficeholders.state.governorId;
        const presidentId = governanceOfficeholders.country.presidentId;
        const mayorRoyalty = Number((amountInk * 0.05).toFixed(6));
        const governorRoyalty = Number((amountInk * 0.02).toFixed(6));
        const presidentRoyalty = Number((amountInk * 0.01).toFixed(6));
        const mayorKickback = 20;

        set((current) => {
          let balances = current.governanceBalances;
          let events = current.payoutEvents;

          if (mayorKickback > 0) {
            balances = addGovernanceBalance(balances, mayorId, mayorKickback);
            events = appendPayoutEvent(events, {
              id: crypto.randomUUID(),
              type: "CityKeyKickback",
              amount: mayorKickback,
              recipientId: mayorId,
              region: hierarchy.city,
              timestamp: now,
            });
          }
          if (mayorRoyalty > 0) {
            balances = addGovernanceBalance(balances, mayorId, mayorRoyalty);
            events = appendPayoutEvent(events, {
              id: crypto.randomUUID(),
              type: "CityKeyRoyalty",
              amount: mayorRoyalty,
              recipientId: mayorId,
              region: hierarchy.city,
              timestamp: now,
            });
          }
          if (governorRoyalty > 0) {
            balances = addGovernanceBalance(balances, governorId, governorRoyalty);
            events = appendPayoutEvent(events, {
              id: crypto.randomUUID(),
              type: "CityKeyRoyalty",
              amount: governorRoyalty,
              recipientId: governorId,
              region: hierarchy.state,
              timestamp: now,
            });
          }
          if (presidentRoyalty > 0) {
            balances = addGovernanceBalance(balances, presidentId, presidentRoyalty);
            events = appendPayoutEvent(events, {
              id: crypto.randomUUID(),
              type: "CityKeyRoyalty",
              amount: presidentRoyalty,
              recipientId: presidentId,
              region: hierarchy.country,
              timestamp: now,
            });
          }

          return {
            governanceBalances: balances,
            payoutEvents: events,
          };
        });
      },
      distributeTreasuryPayout: (regionId) => {
        const now = Date.now();
        const state = get();
        const balance = state.treasuryBalances[regionId] ?? 0;
        if (balance <= 0) {
          return;
        }
        const { governanceOfficeholders } = state;
        const mayorId = governanceOfficeholders.city.mayorId;
        const viceMayorId = governanceOfficeholders.city.viceMayorId;
        const mayorShare = Math.min(balance, Number((balance * 0.1).toFixed(6)));
        const remaining = Math.max(0, balance - mayorShare);
        const viceShare = Math.min(10, remaining);

        set((current) => {
          let balances = current.governanceBalances;
          let events = current.payoutEvents;

          if (mayorShare > 0) {
            balances = addGovernanceBalance(balances, mayorId, mayorShare);
            events = appendPayoutEvent(events, {
              id: crypto.randomUUID(),
              type: "TreasuryMayor",
              amount: mayorShare,
              recipientId: mayorId,
              region: regionId,
              timestamp: now,
            });
          }
          if (viceShare > 0) {
            balances = addGovernanceBalance(balances, viceMayorId, viceShare);
            events = appendPayoutEvent(events, {
              id: crypto.randomUUID(),
              type: "TreasuryViceMayor",
              amount: viceShare,
              recipientId: viceMayorId,
              region: regionId,
              timestamp: now,
            });
          }

          return {
            governanceBalances: balances,
            treasuryBalances: {
              ...current.treasuryBalances,
              [regionId]: Math.max(0, balance - mayorShare - viceShare),
            },
            payoutEvents: events,
          };
        });
      },
      simulateTreasuryTick: (regionId, amountInk = 50) => {
        if (amountInk <= 0) {
          return;
        }
        set((current) => ({
          treasuryBalances: {
            ...current.treasuryBalances,
            [regionId]: (current.treasuryBalances[regionId] ?? 0) + amountInk,
          },
        }));
      },
      addWalletBalance: (amount) =>
        set((state) => ({ walletBalance: state.walletBalance + amount })),
      addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
      addInfluenceBucks: (amount) =>
        set((state) => ({ influenceBucks: state.influenceBucks + amount })),
      addZoningPermits: (amount) =>
        set((state) => ({ zoningPermits: state.zoningPermits + amount })),
      setMapZoom: (zoom) => set({ mapZoom: zoom }),
      setPickupRadiusMultiplier: (multiplier) =>
        set({ pickupRadiusMultiplier: Math.max(1, multiplier) }),
      setMapZoomLimits: (minZoom, maxZoom) => {
        const min = Math.max(0, Math.min(minZoom, maxZoom));
        const max = Math.max(minZoom, maxZoom);
        const currentZoom = get().mapZoom;
        const clampedZoom = Math.min(Math.max(currentZoom, min), max);
        set({ minMapZoom: min, maxMapZoom: max, mapZoom: clampedZoom });
      },
      setBoostDurationMs: (durationMs) =>
        set({ boostDurationMs: Math.max(1000, durationMs) }),
      setLeaderboardOpen: (isOpen) => set({ isLeaderboardOpen: isOpen }),
      setActiveLeaderboardScope: (scope) => set({ activeLeaderboardScope: scope }),
      setTickerVisible: (visible) => set({ isTickerVisible: visible }),
      watchSponsorBriefing: () => {
        const now = Date.now();
        const state = get();
        const cooldownMs = 20 * 60 * 1000;
        const elapsed = now - state.lastSponsorBriefingTime;
        if (elapsed < cooldownMs) {
          return { success: false, remainingCooldown: cooldownMs - elapsed };
        }
        set((current) => ({
          lastSponsorBriefingTime: now,
          influenceBucks: current.influenceBucks + 5,
        }));
        return { success: true };
      },
      addLandmark: (landmarkId) => {
        set((current) => ({
          ownedLandmarks: [...current.ownedLandmarks, landmarkId],
        }));
      },
      activateSubscription: (tierId) => {
        set((current) => ({
          activeSubscriptions: current.activeSubscriptions.includes(tierId) 
            ? current.activeSubscriptions 
            : [...current.activeSubscriptions, tierId],
        }));
      },
    }),
    {
      name: "woi-game-store",
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }
        const normalizedParcels = Object.fromEntries(
          Object.entries(state.ownedParcels).map(([id, parcel]) => [
            id,
            normalizeParcelData(parcel as ParcelData),
          ]),
        );
        Object.assign(state, {
          ownedParcels: normalizedParcels,
          rentBalance: Number.isFinite(state.rentBalance) ? state.rentBalance : 0,
          walletBalance: Number.isFinite(state.walletBalance) ? state.walletBalance : 0,
          credits: Number.isFinite(state.credits) ? state.credits : 0,
          influenceBucks: Number.isFinite(state.influenceBucks) ? state.influenceBucks : 0,
          forceNextLegendary: false,
          cityKeysOwned: (state.cityKeysOwned as Record<string, number>) ?? {},
          treasuryBalances: (state.treasuryBalances as Record<string, number>) ?? {},
          governanceBalances: (state.governanceBalances as Record<string, number>) ?? {},
          governanceOfficeholders:
            (state.governanceOfficeholders as GovernanceOfficeholders) ??
            MOCK_GOVERNANCE_OFFICEHOLDERS,
          payoutEvents: Array.isArray(state.payoutEvents)
            ? (state.payoutEvents as PayoutEvent[]).slice(-5)
            : [],
          lastSponsorBriefingTime: Number.isFinite(state.lastSponsorBriefingTime)
            ? state.lastSponsorBriefingTime
            : 0,
          ownedLandmarks: Array.isArray(state.ownedLandmarks) ? state.ownedLandmarks : [],
          activeSubscriptions: Array.isArray(state.activeSubscriptions) ? state.activeSubscriptions : [],
        });
      },
      partialize: (state) => ({
        rentBalance: state.rentBalance,
        walletBalance: state.walletBalance,
        credits: state.credits,
        influenceBucks: state.influenceBucks,
        zoningPermits: state.zoningPermits,
        pickupRadiusMultiplier: state.pickupRadiusMultiplier,
        minMapZoom: state.minMapZoom,
        maxMapZoom: state.maxMapZoom,
        lastSettledTime: state.lastSettledTime,
        escrowLimit: state.escrowLimit,
        boostEndTime: state.boostEndTime,
        boostDurationMs: state.boostDurationMs,
        ownedParcels: state.ownedParcels,
        cityKeysOwned: state.cityKeysOwned,
        treasuryBalances: state.treasuryBalances,
        governanceBalances: state.governanceBalances,
        governanceOfficeholders: state.governanceOfficeholders,
        payoutEvents: state.payoutEvents,
        lastSponsorBriefingTime: state.lastSponsorBriefingTime,
        ownedLandmarks: state.ownedLandmarks,
        activeSubscriptions: state.activeSubscriptions,
      }),
    },
  ),
);
