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
  SATELLITE_UPLINK_REFILL_MS,
  DRONE_TETHER_RADIUS_KM,
  DRONE_SESSION_DURATION_SEC
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
  viewingMode: "personal" | "drone";
  droneStatus: "idle" | "targeting" | "deploying" | "active";
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
  setUserLocation: (location: LatLng) => void;
  setSatelliteCameraLocation: (location: LatLng | null) => void;
  triggerMapFlyTo: (location: LatLng | null) => void;
  setOtherPlayers: (players: Record<string, PlayerPresence>) => void;
  setGlobalDrops: (drops: GlobalDrop[] | ((current: GlobalDrop[]) => GlobalDrop[])) => void;
  setMapZoom: (zoom: number) => void;
  setMapZoomLimits: (minZoom: number, maxZoom: number) => void;
  setPickupRadiusMultiplier: (multiplier: number) => void;
  setSelectedParcel: (parcel: GridBounds | null) => void;
  setViewingMode: (mode: "personal" | "drone") => void;
  generateDrops: (origin: LatLng) => void;
  spawnDropsInRadius: (origin: LatLng, count: number, radiusMeters: number) => void;
  collectDrop: (dropId: string) => { type: RewardType; amount: number };
  isDropInRange: (origin: LatLng, drop: { location: LatLng }, radiusMeters?: number) => boolean;
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
  mapZoom: 19,
  minMapZoom: 17,
  maxMapZoom: 21,
  satelliteMode: false,
  viewingMode: "personal",
  droneStatus: "idle",
  droneTargetLocation: null,
  droneCurrentLocation: null,
  droneSessionExpiry: null,
  isLeaping: false,
  droneTimer: 0,
  droneTetherCenter: null,
  satelliteCameraLocation: null,
  flyToTarget: null,
  uplinkCharges: SATELLITE_MAX_CHARGES,
  lastUplinkRefillTime: Date.now(),

  setUserLocation: (location) => set({ userLocation: location }),
  setSatelliteCameraLocation: (location) => {
    const state = get();
    if (location && state.droneStatus === "active" && state.droneTetherCenter) {
      const dist = calculateDistance(state.droneTetherCenter, location);
      if (dist > DRONE_TETHER_RADIUS_KM) {
        // Enforce 10-mile tether limit
        return;
      }
    }
    set({ satelliteCameraLocation: location });
  },
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
  setViewingMode: (mode) => set({ viewingMode: mode }),

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
    const state = get();
    if (state.satelliteMode) {
      state.cancelDrone();
    } else {
      state.startTargeting();
    }
  },

  startTargeting: () => {
    const state = get();
    if (!state.userLocation) return;
    
    set({ 
      satelliteMode: true,
      viewingMode: "drone",
      droneStatus: "targeting",
      satelliteCameraLocation: state.userLocation,
      minMapZoom: 14, // Allow zooming out further for targeting
      mapZoom: 14, // Zoom out for targeting overview
    });
    
    // Trigger zoom 14 flyTo when starting targeting
    state.triggerMapFlyTo(state.userLocation);
    debounceSync(get().syncToCloud);
  },

  confirmDeployment: (target: LatLng) => {
    const state = get();
    if (!state.userLocation) return;

    const dist = calculateDistance(state.userLocation, target);
    if (dist > DRONE_TETHER_RADIUS_KM) {
      // 10 mile (16km) tether limit check
      return;
    }

    // Defer the heavy state update to allow the browser to paint the button press
    // and prevent the "Page Unresponsive" freeze.
    setTimeout(() => {
      set({ 
        droneStatus: "deploying",
        droneTargetLocation: target,
        droneCurrentLocation: state.userLocation,
        isLeaping: true,
        viewingMode: "drone",
        selectedParcel: null // Clear selection on deployment
      });
      
      get().triggerMapFlyTo(target);
      // Complete immediately - bypass MapFlyToHandler effect (avoids timing/race issues that kept "In-flight" stuck)
      get().completeDeployment();
      debounceSync(get().syncToCloud);
    }, 0);
  },

  completeDeployment: () => {
    const now = Date.now();
    set({ 
      droneStatus: "active",
      viewingMode: "drone",
      droneTimer: DRONE_SESSION_DURATION_SEC,
      droneSessionExpiry: now + (DRONE_SESSION_DURATION_SEC * 1000),
      droneTetherCenter: get().droneTargetLocation,
      isLeaping: false,
      minMapZoom: 17, // Restore normal zoom limits
      mapZoom: 19 // Zoom in on landing
    });
    debounceSync(get().syncToCloud);
  },

  cancelDrone: () => {
    const state = get();
    if (state.userLocation) {
      state.triggerMapFlyTo(state.userLocation);
    }
    set({ 
      satelliteMode: false,
      viewingMode: "personal",
      droneStatus: "idle",
      droneTimer: 0,
      droneTargetLocation: null,
      droneCurrentLocation: null,
      droneSessionExpiry: null,
      droneTetherCenter: null,
      satelliteCameraLocation: null,
      isLeaping: false,
      minMapZoom: 17, // Restore normal zoom limits
      mapZoom: 18,
      selectedParcel: null // Clear selection on cancel
    });
    debounceSync(get().syncToCloud);
  },

  setLeaping: (leaping: boolean) => set({ isLeaping: leaping }),

  updateDroneLocation: (location: LatLng) => set({ droneCurrentLocation: location }),

  startDroneSession: () => {
    // Deprecated in favor of multi-phase targeting
    get().startTargeting();
  },

  endDroneSession: () => {
    // Deprecated in favor of cancelDrone
    get().cancelDrone();
  },

  updateDroneTimer: () => {
    const state = get();
    if (state.droneStatus !== "active") return;

    const now = Date.now();
    if (state.droneSessionExpiry && now >= state.droneSessionExpiry) {
      state.cancelDrone();
    } else {
      // Keep droneTimer in sync for UI display if needed, 
      // though expiry timestamp is more reliable.
      const remaining = state.droneSessionExpiry 
        ? Math.max(0, Math.floor((state.droneSessionExpiry - now) / 1000))
        : 0;
      set({ droneTimer: remaining });
    }
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
