import { 
  ParcelData, 
  ParcelRarity, 
  PARCEL_RENT_RATES, 
  BOOST_TIERS, 
  GameState,
  getEscrowLimitMs
} from "./types";

export const computeBaseRentRate = (ownedParcels: Record<string, ParcelData>) =>
  Object.values(ownedParcels).reduce((total, parcel) => {
    const rentRate = Number.isFinite(parcel.rentRate)
      ? parcel.rentRate
      : PARCEL_RENT_RATES[parcel.rarity];
    return total + rentRate;
  }, 0);

export const getBoostMultiplier = (parcelCount: number) => {
  const tier = BOOST_TIERS.find(
    (candidate) =>
      parcelCount >= candidate.min &&
      (candidate.max === undefined || parcelCount <= candidate.max),
  );
  return tier ? tier.multiplier : 1;
};

export const computeRentRate = (
  ownedParcels: Record<string, ParcelData>,
  boostEndTime: number | null,
  timestamp = Date.now(),
) => {
  const baseRate = computeBaseRentRate(ownedParcels);
  const isBoostActive = boostEndTime ? boostEndTime > timestamp : false;
  const parcelCount = Object.keys(ownedParcels).length;
  const boostMultiplier = getBoostMultiplier(parcelCount);
  return baseRate * (isBoostActive ? boostMultiplier : 1);
};

export const selectRentRate = (state: GameState, timestamp = Date.now()) =>
  computeRentRate(state.ownedParcels, state.boostEndTime, timestamp);

export const selectIsBoostActive = (state: GameState, timestamp = Date.now()) =>
  state.boostEndTime ? state.boostEndTime > timestamp : false;

export const computePendingRent = (state: GameState, timestamp = Date.now()) => {
  const elapsedMs = Math.max(0, timestamp - state.lastSettledTime);
  const effectiveMs = Math.min(elapsedMs, state.escrowLimit);
  const rate = selectRentRate(state, timestamp);
  return state.rentBalance + rate * (effectiveMs / 1000);
};
