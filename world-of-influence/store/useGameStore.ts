"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  GameState, 
  ParcelData, 
  GovernanceOfficeholders, 
  PayoutEvent, 
  MOCK_GOVERNANCE_OFFICEHOLDERS,
  SATELLITE_MAX_CHARGES
} from "./types";
import { normalizeParcelData } from "./propertyUtils";
import { createAuthSlice, AuthSlice } from "./slices/authSlice";
import { createEconomySlice, EconomySlice } from "./slices/economySlice";
import { createMapSlice, MapSlice } from "./slices/mapSlice";
import { createPropertySlice, PropertySlice } from "./slices/propertySlice";
import { createGovernanceSlice, GovernanceSlice } from "./slices/governanceSlice";

// Combine slices into GameState
export type CombinedState = AuthSlice & EconomySlice & MapSlice & PropertySlice & GovernanceSlice;

export const useGameStore = create<GameState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createEconomySlice(...a),
      ...createMapSlice(...a),
      ...createPropertySlice(...a),
      ...createGovernanceSlice(...a),
    }),
    {
      name: "woi-game-store",
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Drone session validation: only show slide-out if timer still active
        const now = Date.now();
        const persistedDroneStatus = state.droneStatus as "idle" | "targeting" | "deploying" | "active" | undefined;
        const persistedExpiry = Number.isFinite(state.droneSessionExpiry) ? (state.droneSessionExpiry as number) : null;

        if (persistedDroneStatus === "active" && persistedExpiry) {
          if (now >= persistedExpiry) {
            // Session expired on refresh → reset to normal mode
            state.satelliteMode = false;
            state.droneStatus = "idle";
            state.droneTimer = 0;
            state.droneSessionExpiry = null;
            state.droneTetherCenter = null;
            state.viewingMode = "personal";
            state.droneTargetLocation = null;
            state.droneCurrentLocation = null;
          } else {
            // Valid active session → keep slide-out, sync timer
            state.satelliteMode = true;
            state.droneTimer = Math.max(0, Math.floor((persistedExpiry - now) / 1000));
          }
        } else if (state.satelliteMode && (persistedDroneStatus === "idle" || !persistedDroneStatus)) {
          // Stale: satelliteMode persisted but no active session → reset
          state.satelliteMode = false;
          state.droneStatus = "idle";
          state.viewingMode = "personal";
        } else if (persistedDroneStatus === "targeting" || persistedDroneStatus === "deploying") {
          // Transient states can't be restored on refresh → reset
          state.satelliteMode = false;
          state.droneStatus = "idle";
          state.viewingMode = "personal";
          state.droneTargetLocation = null;
          state.droneCurrentLocation = null;
          state.droneSessionExpiry = null;
          state.droneTetherCenter = null;
        }

        // Normalized rehydration
        const normalizedParcels = Object.fromEntries(
          Object.entries(state.ownedParcels || {}).map(([id, parcel]) => [
            id,
            normalizeParcelData(parcel as ParcelData),
          ])
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
        satelliteMode: !!state.satelliteMode,
        satelliteCameraLocation: state.satelliteCameraLocation || null,
        flyToTarget: null,
        uplinkCharges: Number.isFinite(state.uplinkCharges) ? state.uplinkCharges : SATELLITE_MAX_CHARGES,
        lastUplinkRefillTime: Number.isFinite(state.lastUplinkRefillTime) ? state.lastUplinkRefillTime : Date.now(),
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
      satelliteMode: state.satelliteMode,
      satelliteCameraLocation: state.satelliteCameraLocation,
      uplinkCharges: state.uplinkCharges,
      lastUplinkRefillTime: state.lastUplinkRefillTime,
      droneStatus: state.droneStatus,
      droneSessionExpiry: state.droneSessionExpiry,
      droneTetherCenter: state.droneTetherCenter,
      droneTimer: state.droneTimer,
      viewingMode: state.viewingMode,
    }),
    }
  )
);

// Domain-specific hooks for better performance and cleaner imports
export const useAuthStore = <T>(selector: (state: GameState) => T) => useGameStore(selector);
export const useEconomyStore = <T>(selector: (state: GameState) => T) => useGameStore(selector);
export const useMapStore = <T>(selector: (state: GameState) => T) => useGameStore(selector);
export const usePropertyStore = <T>(selector: (state: GameState) => T) => useGameStore(selector);
export const useGovernanceStore = <T>(selector: (state: GameState) => T) => useGameStore(selector);

// Re-export types and utilities for convenience
export * from "./types";
export * from "./economyUtils";
export * from "./propertyUtils";
export * from "./mapUtils";
export * from "./governanceUtils";
export * from "./utils";
