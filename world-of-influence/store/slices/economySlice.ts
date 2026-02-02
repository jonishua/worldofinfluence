import { StateCreator } from "zustand";
import { GameState, getEscrowLimitMs, getBoostStackLimitMs } from "../types";
import { debounceSync } from "../utils";
import { 
  computePendingRent, 
  selectRentRate, 
  selectIsBoostActive
} from "../economyUtils";

export interface EconomySlice {
  rentBalance: number;
  walletBalance: number;
  credits: number;
  influenceBucks: number;
  zoningPermits: number;
  lastSettledTime: number;
  escrowLimit: number;
  boostEndTime: number | null;
  boostDurationMs: number;
  isBoostActive: (timestamp?: number) => boolean;
  addWalletBalance: (amount: number) => void;
  addCredits: (amount: number) => void;
  addInfluenceBucks: (amount: number) => void;
  addZoningPermits: (amount: number) => void;
  setBoostDurationMs: (durationMs: number) => void;
  activateBoost: () => void;
  extendBoost: () => void;
  getPendingRent: (timestamp?: number) => number;
  settleFunds: (timestamp?: number) => void;
  reinvestFunds: (timestamp?: number) => boolean;
  syncBalance: (timestamp?: number) => void;
}

export const createEconomySlice: StateCreator<GameState, [], [], EconomySlice> = (set, get) => ({
  rentBalance: 0,
  walletBalance: 0,
  credits: 2,
  influenceBucks: 100,
  zoningPermits: 1,
  lastSettledTime: Date.now(),
  escrowLimit: getEscrowLimitMs(),
  boostEndTime: null,
  boostDurationMs: 60 * 60 * 1000,

  isBoostActive: (timestamp = Date.now()) => selectIsBoostActive(get(), timestamp),

  addWalletBalance: (amount) => {
    set((state) => ({ walletBalance: state.walletBalance + amount }));
    debounceSync(get().syncToCloud);
  },
  addCredits: (amount) => {
    set((state) => ({ credits: state.credits + amount }));
    debounceSync(get().syncToCloud);
  },
  addInfluenceBucks: (amount) => {
    set((state) => ({ influenceBucks: state.influenceBucks + amount }));
    debounceSync(get().syncToCloud);
  },
  addZoningPermits: (amount) => {
    set((state) => ({ zoningPermits: state.zoningPermits + amount }));
    debounceSync(get().syncToCloud);
  },
  setBoostDurationMs: (durationMs) =>
    set({ boostDurationMs: Math.max(1000, durationMs) }),

  activateBoost: () => {
    const now = Date.now();
    get().syncBalance(now);
    const state = get();
    const currentEnd = state.boostEndTime ?? now;
    const base = Math.max(currentEnd, now);
    const nextEnd = base + state.boostDurationMs;
    const cap = now + getBoostStackLimitMs();
    set({ boostEndTime: Math.min(nextEnd, cap) });
    debounceSync(get().syncToCloud);
  },

  extendBoost: () => {
    const now = Date.now();
    get().syncBalance(now);
    const state = get();
    const currentEnd = state.boostEndTime ?? now;
    const base = Math.max(currentEnd, now);
    const cap = now + getBoostStackLimitMs();
    set({ boostEndTime: Math.min(base + state.boostDurationMs, cap) });
    debounceSync(get().syncToCloud);
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
    debounceSync(get().syncToCloud);
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
    debounceSync(get().syncToCloud);
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
});
