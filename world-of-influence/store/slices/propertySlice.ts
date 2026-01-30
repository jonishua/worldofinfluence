import { StateCreator } from "zustand";
import { GameState, ParcelData, PARCEL_RENT_RATES } from "../types";
import { GridBounds } from "@/lib/gridSystem";
import { debounceSync } from "../utils";
import { 
  pickRarity, 
  pickParcelFeature, 
  getRarityLevel, 
  buildCheatParcels, 
  getNextRarity 
} from "../propertyUtils";

export interface PropertySlice {
  ownedParcels: Record<string, ParcelData>;
  isMinting: boolean;
  forceNextLegendary: boolean;
  ownedLandmarks: string[];
  setIsMinting: (isMinting: boolean) => void;
  setForceNextLegendary: (force: boolean) => void;
  setOwnedParcelsCount: (count: number) => void;
  buyParcel: (parcel: GridBounds, cost: number) => ParcelData | null;
  upgradeParcel: (parcelId: string) => { success: boolean; reason?: string };
  addLandmark: (landmarkId: string) => void;
}

export const createPropertySlice: StateCreator<GameState, [], [], PropertySlice> = (set, get) => ({
  ownedParcels: {},
  isMinting: false,
  forceNextLegendary: false,
  ownedLandmarks: [],

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

    debounceSync(get().syncToCloud);
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
    debounceSync(get().syncToCloud);
    return { success: true };
  },

  addLandmark: (landmarkId) => {
    set((current) => ({
      ownedLandmarks: [...current.ownedLandmarks, landmarkId],
    }));
    debounceSync(get().syncToCloud);
  },
});
