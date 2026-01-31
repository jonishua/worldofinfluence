import { StateCreator } from "zustand";
import { 
  GameState, 
  LatLng, 
  Drop, 
  RewardType, 
  PlayerPresence,
  GlobalDrop,
  DROP_SPAWN_INTERVAL_MS,
  ACTIVE_DROP_MIN,
  ACTIVE_DROP_MAX,
  ACTIVE_DROP_RADIUS_METERS,
  RESERVE_DROP_COUNT,
  RESERVE_DROP_RADIUS_METERS,
  SATELLITE_MAX_CHARGES,
  SATELLITE_UPLINK_REFILL_MS
} from "../types";
import { GridBounds } from "@/lib/gridSystem";
import { metersToKilometers, debounceSync } from "../utils";
import { buildDropsInRadius, rollLoot, calculateDistance } from "../mapUtils";

export interface MapSlice {
  userLocation: LatLng | null;
  locationRequestId: number;
  pickupRadiusMultiplier: number;
  drops: Drop[];
  otherPlayers: Record<string, PlayerPresence>;
  globalDrops: GlobalDrop[];
  lastDropSpawnTime: number;
  selectedParcel: GridBounds | null;
  mapZoom: number;
  minMapZoom: number;
  maxMapZoom: number;
  satelliteMode: boolean;
  satelliteCameraLocation: LatLng | null;
  flyToTarget: LatLng | null;
  uplinkCharges: number;
  lastUplinkRefillTime: number;
  setUserLocation: (location: LatLng) => void;
  setSatelliteCameraLocation: (location: LatLng | null) => void;
  triggerMapFlyTo: (location: LatLng | null) => void;
  setOtherPlayers: (players: Record<string, PlayerPresence>) => void;
  setGlobalDrops: (drops: GlobalDrop[] | ((current: GlobalDrop[]) => GlobalDrop[])) => void;
  setMapZoom: (zoom: number) => void;
  setMapZoomLimits: (minZoom: number, maxZoom: number) => void;
  setPickupRadiusMultiplier: (multiplier: number) => void;
  setSelectedParcel: (parcel: GridBounds | null) => void;
  generateDrops: (origin: LatLng) => void;
  spawnDropsInRadius: (origin: LatLng, count: number, radiusMeters: number) => void;
  collectDrop: (dropId: string) => { type: RewardType; amount: number };
  isDropInRange: (origin: LatLng, drop: { location: LatLng }, radiusMeters?: number) => boolean;
  toggleSatelliteMode: () => void;
  consumeUplinkCharge: () => boolean;
  refillUplinkCharges: () => void;
}

export const createMapSlice: StateCreator<GameState, [], [], MapSlice> = (set, get) => ({
  userLocation: null,
  locationRequestId: 0,
  pickupRadiusMultiplier: 1,
  drops: [],
  otherPlayers: {},
  globalDrops: [],
  lastDropSpawnTime: 0,
  selectedParcel: null,
  mapZoom: 17,
  minMapZoom: 17,
  maxMapZoom: 21,
  satelliteMode: false,
  satelliteCameraLocation: null,
  flyToTarget: null,
  uplinkCharges: SATELLITE_MAX_CHARGES,
  lastUplinkRefillTime: Date.now(),

  setUserLocation: (location) => set({ userLocation: location }),
  setSatelliteCameraLocation: (location) => set({ satelliteCameraLocation: location }),
  triggerMapFlyTo: (location) => set({ flyToTarget: location }),
  setOtherPlayers: (players) => set({ otherPlayers: players }),
  setGlobalDrops: (drops) => {
    if (typeof drops === "function") {
      set((state) => ({ globalDrops: drops(state.globalDrops) }));
    } else {
      set({ globalDrops: drops });
    }
  },
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setMapZoomLimits: (minZoom, maxZoom) => {
    const min = Math.max(0, Math.min(minZoom, maxZoom));
    const max = Math.max(minZoom, maxZoom);
    const currentZoom = get().mapZoom;
    const clampedZoom = Math.min(Math.max(currentZoom, min), max);
    set({ minMapZoom: min, maxMapZoom: max, mapZoom: clampedZoom });
  },
  setPickupRadiusMultiplier: (multiplier) =>
    set({ pickupRadiusMultiplier: Math.max(1, multiplier) }),
  setSelectedParcel: (parcel) => set({ selectedParcel: parcel }),

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
    debounceSync(get().syncToCloud);
    return reward;
  },

  isDropInRange: (origin, drop, radiusMeters = 50) => {
    const km = calculateDistance(origin, drop.location);
    return km <= metersToKilometers(radiusMeters);
  },

  toggleSatelliteMode: () => {
    const isEnabling = !get().satelliteMode;
    set((state) => ({ 
      satelliteMode: isEnabling,
      satelliteCameraLocation: isEnabling ? state.userLocation : null
    }));
    debounceSync(get().syncToCloud);
  },

  consumeUplinkCharge: () => {
    const state = get();
    // Subscribers have infinite charges
    const isSubscriber = state.activeSubscriptions.length > 0;
    if (isSubscriber) return true;

    if (state.uplinkCharges > 0) {
      set((state) => ({ uplinkCharges: state.uplinkCharges - 1 }));
      debounceSync(get().syncToCloud);
      return true;
    }
    return false;
  },

  refillUplinkCharges: () => {
    const state = get();
    const now = Date.now();
    const elapsed = now - state.lastUplinkRefillTime;
    
    if (elapsed >= SATELLITE_UPLINK_REFILL_MS) {
      const chargesToAdd = Math.floor(elapsed / SATELLITE_UPLINK_REFILL_MS);
      const newCharges = Math.min(SATELLITE_MAX_CHARGES, state.uplinkCharges + chargesToAdd);
      
      if (newCharges > state.uplinkCharges) {
        set({ 
          uplinkCharges: newCharges,
          lastUplinkRefillTime: now - (elapsed % SATELLITE_UPLINK_REFILL_MS)
        });
        debounceSync(get().syncToCloud);
      }
    }
  },
});
