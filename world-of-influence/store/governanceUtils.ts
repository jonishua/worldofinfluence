import { 
  REGION_HIERARCHY, 
  PayoutEvent 
} from "./types";

export const resolveRegionHierarchy = (regionId: string) => {
  const mapped = REGION_HIERARCHY[regionId];
  return {
    city: regionId,
    state: mapped?.state ?? regionId,
    country: mapped?.country ?? regionId,
  };
};

export const appendPayoutEvent = (events: PayoutEvent[], next: PayoutEvent) => {
  const updated = [...events, next];
  return updated.length > 5 ? updated.slice(-5) : updated;
};

export const addGovernanceBalance = (
  balances: Record<string, number>,
  recipientId: string,
  amount: number,
) => ({
  ...balances,
  [recipientId]: (balances[recipientId] ?? 0) + amount,
});
