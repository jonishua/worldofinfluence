import { StateCreator } from "zustand";
import { 
  GameState, 
  LeaderboardScope, 
  LeaderboardEntry, 
  LeaderboardTab, 
  MayorStatus, 
  LeaderboardPlayerPosition, 
  Officeholder, 
  GovernanceOfficeholders, 
  PayoutEvent, 
  CityKeyLevel,
  MOCK_LEADERBOARDS,
  MOCK_FEED_EVENTS,
  MOCK_PLAYER_POSITIONS,
  MOCK_OFFICEHOLDERS,
  MOCK_GOVERNANCE_OFFICEHOLDERS
} from "../types";
import { debounceSync } from "../utils";
import { 
  resolveRegionHierarchy, 
  appendPayoutEvent, 
  addGovernanceBalance 
} from "../governanceUtils";

export interface GovernanceSlice {
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
  activeSubscriptions: string[];
  isTickerVisible: boolean;
  setLeaderboardOpen: (isOpen: boolean) => void;
  setActiveLeaderboardScope: (scope: LeaderboardTab) => void;
  setTickerVisible: (visible: boolean) => void;
  watchSponsorBriefing: () => { success: boolean; remainingCooldown?: number };
  activateSubscription: (tierId: string) => void;
  purchaseCityKey: (regionId: string, costInk: number, level: CityKeyLevel) => boolean;
  distributeCityKeyRoyalties: (regionId: string, amountInk: number) => void;
  distributeTreasuryPayout: (regionId: string) => void;
  simulateTreasuryTick: (regionId: string, amountInk?: number) => void;
}

export const createGovernanceSlice: StateCreator<GameState, [], [], GovernanceSlice> = (set, get) => ({
  leaderboards: MOCK_LEADERBOARDS,
  activeLeaderboardScope: "city",
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
  activeSubscriptions: [],
  isTickerVisible: false,

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
    debounceSync(get().syncToCloud);
    return { success: true };
  },

  activateSubscription: (tierId) => {
    set((current) => ({
      activeSubscriptions: current.activeSubscriptions.includes(tierId) 
        ? current.activeSubscriptions 
        : [...current.activeSubscriptions, tierId],
    }));
    debounceSync(get().syncToCloud);
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
    debounceSync(get().syncToCloud);
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
});
