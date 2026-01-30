export type SymbolType = 'SEVEN' | 'PERMIT' | 'DIAMOND' | 'BAR' | 'COIN';

export type RewardType = 'InfluenceBucks' | 'ZoningPermits' | 'Credits';

export interface SlotReward {
  type: RewardType;
  amount: number;
}

export interface SlotResult {
  reels: [SymbolType, SymbolType, SymbolType];
  reward: SlotReward;
  isNearMiss: boolean;
}

export type WinTier = 'jackpot' | 'lucky' | 'high' | 'mid' | 'low' | 'miss';
