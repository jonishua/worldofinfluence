import type { SlotResult, SymbolType, WinTier } from '@/types/slots';

// Probability weights (out of 1000 total)
const PROBABILITY_WEIGHTS = {
  jackpot: 5,      // 0.5% - [777-777-777] → 50 IB
  lucky: 10,       // 1.0% - [Permit-Permit-Permit] → 1 ZP
  high: 50,        // 5.0% - [Diamond-Diamond-Diamond] → 15 IB
  mid: 150,        // 15.0% - [Bar-Bar-Bar] → 5 IB
  low: 300,        // 30.0% - [Coin-Coin-Coin] → 1 IB
  miss: 485,       // 48.5% - Any mismatch → 0
};

// Reel strip with weighted distribution for visual variety
export const REEL_STRIP: SymbolType[] = [
  'COIN', 'BAR', 'COIN', 'DIAMOND', 'COIN', 'SEVEN', 'PERMIT', 'COIN', 'BAR',
  'COIN', 'DIAMOND', 'BAR', 'COIN', 'COIN', 'BAR', 'COIN', 'DIAMOND', 'COIN',
  'BAR', 'COIN', 'SEVEN', 'PERMIT', 'COIN', 'BAR', 'COIN', 'DIAMOND', 'COIN',
];

// High-value symbols for near-miss logic
const HIGH_VALUE_SYMBOLS: SymbolType[] = ['SEVEN', 'PERMIT', 'DIAMOND'];

/**
 * Determines the win tier based on reel combination
 */
function getWinTier(reels: [SymbolType, SymbolType, SymbolType]): WinTier {
  const [r1, r2, r3] = reels;

  // Check for matching combinations
  if (r1 === 'SEVEN' && r2 === 'SEVEN' && r3 === 'SEVEN') {
    return 'jackpot';
  }
  if (r1 === 'PERMIT' && r2 === 'PERMIT' && r3 === 'PERMIT') {
    return 'lucky';
  }
  if (r1 === 'DIAMOND' && r2 === 'DIAMOND' && r3 === 'DIAMOND') {
    return 'high';
  }
  if (r1 === 'BAR' && r2 === 'BAR' && r3 === 'BAR') {
    return 'mid';
  }
  if (r1 === 'COIN' && r2 === 'COIN' && r3 === 'COIN') {
    return 'low';
  }

  return 'miss';
}

/**
 * Gets reward for a win tier
 */
function getRewardForTier(tier: WinTier): { type: 'InfluenceBucks' | 'ZoningPermits' | 'Credits'; amount: number } {
  switch (tier) {
    case 'jackpot':
      return { type: 'InfluenceBucks', amount: 50 };
    case 'lucky':
      return { type: 'ZoningPermits', amount: 1 };
    case 'high':
      return { type: 'InfluenceBucks', amount: 15 };
    case 'mid':
      return { type: 'InfluenceBucks', amount: 5 };
    case 'low':
      return { type: 'InfluenceBucks', amount: 1 };
    case 'miss':
      return { type: 'Credits', amount: 0 };
  }
}

/**
 * Selects a random symbol from the reel strip
 */
function getRandomSymbol(): SymbolType {
  return REEL_STRIP[Math.floor(Math.random() * REEL_STRIP.length)];
}

/**
 * Selects a random high-value symbol for near-miss
 */
function getRandomHighValueSymbol(): SymbolType {
  return HIGH_VALUE_SYMBOLS[Math.floor(Math.random() * HIGH_VALUE_SYMBOLS.length)];
}

/**
 * Calculates the spin result using weighted probability table
 * Result is determined BEFORE animation starts (RNG first)
 */
export function calculateSpinResult(): SlotResult {
  // Roll for win tier based on probability weights
  const roll = Math.random() * 1000;
  let cumulative = 0;
  let selectedTier: WinTier = 'miss';

  for (const [tier, weight] of Object.entries(PROBABILITY_WEIGHTS)) {
    cumulative += weight;
    if (roll < cumulative) {
      selectedTier = tier as WinTier;
      break;
    }
  }

  let reels: [SymbolType, SymbolType, SymbolType];
  let isNearMiss = false;

  // Generate reels based on win tier
  if (selectedTier === 'jackpot') {
    reels = ['SEVEN', 'SEVEN', 'SEVEN'];
  } else if (selectedTier === 'lucky') {
    reels = ['PERMIT', 'PERMIT', 'PERMIT'];
  } else if (selectedTier === 'high') {
    reels = ['DIAMOND', 'DIAMOND', 'DIAMOND'];
  } else if (selectedTier === 'mid') {
    reels = ['BAR', 'BAR', 'BAR'];
  } else if (selectedTier === 'low') {
    reels = ['COIN', 'COIN', 'COIN'];
  } else {
      // Miss - apply near-miss logic
    // 20% chance to force first two reels to match a high-value symbol
    if (Math.random() < 0.2) {
      const highValueSymbol = getRandomHighValueSymbol();
      let s3 = getRandomSymbol();
      // Ensure the third symbol doesn't match, creating an accidental win
      while (s3 === highValueSymbol) {
        s3 = getRandomSymbol();
      }
      reels = [highValueSymbol, highValueSymbol, s3];
      isNearMiss = true;
    } else {
      // Regular miss - ensure it's actually a 'miss' according to the rules
      let s1 = getRandomSymbol();
      let s2 = getRandomSymbol();
      let s3 = getRandomSymbol();
      
      // Safety check: if we accidentally rolled a winning combo on a miss result, re-roll
      while (getWinTier([s1, s2, s3]) !== 'miss') {
        s1 = getRandomSymbol();
        s2 = getRandomSymbol();
        s3 = getRandomSymbol();
      }
      
      reels = [s1, s2, s3];
    }
  }

  const reward = getRewardForTier(selectedTier);

  return {
    reels,
    reward,
    isNearMiss,
  };
}

/**
 * Gets the win tier for a given result (for celebration logic)
 */
export function getWinTierForResult(result: SlotResult): WinTier {
  return getWinTier(result.reels);
}
