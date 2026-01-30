import { StateCreator } from "zustand";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { 
  GameState, 
  MOCK_LEADERBOARDS, 
  MOCK_OFFICEHOLDERS, 
  MOCK_GOVERNANCE_OFFICEHOLDERS, 
  MOCK_FEED_EVENTS, 
  MOCK_PLAYER_POSITIONS 
} from "../types";

export interface AuthSlice {
  user: SupabaseUser | null;
  isSyncing: boolean;
  lastSyncTime: number | null;
  cloudSyncError: string | null;
  setUser: (user: SupabaseUser | null) => void;
  hydrateFromCloud: () => Promise<void>;
  syncToCloud: () => Promise<void>;
  resetGame: () => Promise<void>;
}

export const createAuthSlice: StateCreator<GameState, [], [], AuthSlice> = (set, get) => ({
  user: null,
  isSyncing: false,
  lastSyncTime: null,
  cloudSyncError: null,

  setUser: (user) => set({ user }),

  resetGame: async () => {
    const now = Date.now();
    const currentRequestId = get().locationRequestId;
    const { data: { session } } = await supabase.auth.getSession();
    
    // We need getFreshState here or reset fields manually
    // Since we're in a slice, we can't easily call getFreshState if it's in useGameStore
    // Let's assume we'll pass it in or define it in types.ts
    set({
      rentBalance: 0,
      walletBalance: 0,
      credits: 500,
      influenceBucks: 0,
      zoningPermits: 5,
      drops: [],
      lastDropSpawnTime: 0,
      selectedParcel: null,
      ownedParcels: {},
      isMinting: false,
      forceNextLegendary: false,
      lastSettledTime: now,
      boostEndTime: null,
      cityKeysOwned: {},
      treasuryBalances: {},
      governanceBalances: {},
      payoutEvents: [],
      lastSponsorBriefingTime: 0,
      ownedLandmarks: [],
      activeSubscriptions: [],
      locationRequestId: currentRequestId + 1,
      leaderboards: MOCK_LEADERBOARDS,
      officeholders: MOCK_OFFICEHOLDERS,
      governanceOfficeholders: MOCK_GOVERNANCE_OFFICEHOLDERS,
      mayorStatus: {
        title: "Mayor",
        region: "Austin, TX",
        name: "AustinKing",
        income: 0.024512,
      },
      feedEvents: MOCK_FEED_EVENTS,
      playerPositions: MOCK_PLAYER_POSITIONS,
    });
    
    if (session) {
      set({ isSyncing: true });
      try {
        await Promise.all([
          supabase.from("balances").delete().eq("id", session.user.id),
          supabase.from("parcels").delete().eq("user_id", session.user.id),
          supabase.from("city_keys").delete().eq("user_id", session.user.id),
        ]);
      } catch (err) {
        console.error("Cloud reset failed:", err);
      } finally {
        set({ isSyncing: false });
      }
    }
  },

  hydrateFromCloud: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    set({ isSyncing: true, cloudSyncError: null });
    try {
      const [balanceRes, parcelsRes, keysRes] = await Promise.all([
        supabase.from("balances").select("*").eq("id", session.user.id).single(),
        supabase.from("parcels").select("*").eq("user_id", session.user.id),
        supabase.from("city_keys").select("*").eq("user_id", session.user.id),
      ]);

      if (balanceRes.error && balanceRes.error.code !== "PGRST116") throw balanceRes.error;
      if (parcelsRes.error) throw parcelsRes.error;
      if (keysRes.error) throw keysRes.error;

      const balances = balanceRes.data;
      const parcels = parcelsRes.data || [];
      const keys = keysRes.data || [];

      if (balances) {
        set({
          rentBalance: Number(balances.rent_balance),
          walletBalance: Number(balances.wallet_balance),
          credits: Number(balances.credits),
          influenceBucks: Number(balances.influence_bucks),
          zoningPermits: Number(balances.zoning_permits),
          lastSettledTime: Number(balances.last_settled_time),
          boostEndTime: balances.boost_end_time ? Number(balances.boost_end_time) : null,
        });
      }

      if (parcels.length > 0) {
        const ownedParcels: GameState["ownedParcels"] = {};
        parcels.forEach((p) => {
          ownedParcels[p.id] = {
            id: p.id,
            corners: p.corners,
            center: p.center,
            rarity: p.rarity,
            level: p.level,
            purchaseTime: Number(p.purchase_time),
            rentRate: Number(p.rent_rate),
            visualFeature: p.visual_feature,
            lastUpgradedAt: p.last_upgraded_at ? Number(p.last_upgraded_at) : undefined,
          };
        });
        set({ ownedParcels });
      }

      if (keys.length > 0) {
        const cityKeysOwned: Record<string, number> = {};
        keys.forEach((k) => {
          cityKeysOwned[k.region_id] = k.count;
        });
        set({ cityKeysOwned });
      }

      set({ lastSyncTime: Date.now() });
    } catch (err: unknown) {
      console.error("Cloud hydration failed:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      set({ cloudSyncError: message });
    } finally {
      set({ isSyncing: false });
    }
  },

  syncToCloud: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const state = get();
    set({ isSyncing: true, cloudSyncError: null });

    try {
      // 1. Sync Balances
      const { error: balanceError } = await supabase.from("balances").upsert({
        id: session.user.id,
        rent_balance: state.rentBalance,
        wallet_balance: state.walletBalance,
        credits: state.credits,
        influence_bucks: state.influenceBucks,
        zoning_permits: state.zoningPermits,
        last_settled_time: state.lastSettledTime,
        boost_end_time: state.boostEndTime,
        updated_at: new Date().toISOString(),
      });
      if (balanceError) throw balanceError;

      // 2. Sync Parcels
      const parcelEntries = Object.values(state.ownedParcels).map((p) => ({
        id: p.id,
        user_id: session.user.id,
        corners: p.corners,
        center: p.center,
        rarity: p.rarity,
        level: p.level,
        purchase_time: p.purchaseTime,
        rent_rate: p.rentRate,
        visual_feature: p.visualFeature,
        last_upgraded_at: p.lastUpgradedAt,
      }));

      if (parcelEntries.length > 0) {
        const { error: parcelsError } = await supabase.from("parcels").upsert(parcelEntries);
        if (parcelsError) throw parcelsError;
      }

      // 3. Sync City Keys
      const keyEntries = Object.entries(state.cityKeysOwned).map(([regionId, count]) => ({
        user_id: session.user.id,
        region_id: regionId,
        count,
      }));

      if (keyEntries.length > 0) {
        const { error: keysError } = await supabase.from("city_keys").upsert(keyEntries, {
          onConflict: "user_id,region_id",
        });
        if (keysError) throw keysError;
      }

      set({ lastSyncTime: Date.now() });
    } catch (err: unknown) {
      console.error("Cloud sync failed:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      set({ cloudSyncError: message });
    } finally {
      set({ isSyncing: false });
    }
  },
});
