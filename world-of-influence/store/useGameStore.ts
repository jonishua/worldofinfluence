"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GameState, ParcelData, GovernanceOfficeholders, PayoutEvent, MOCK_GOVERNANCE_OFFICEHOLDERS } from "./types";
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
