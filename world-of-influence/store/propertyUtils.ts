import { 
  ParcelRarity, 
  ParcelData, 
  PARCEL_RENT_RATES, 
  PARCEL_FEATURES, 
  rarityOrder 
} from "./types";

export const pickRarity = (): ParcelRarity => {
  const roll = Math.random() * 100;
  if (roll < 50) return "common";
  if (roll < 80) return "rare";
  if (roll < 95) return "epic";
  return "legendary";
};

export const pickParcelFeature = (rarity: ParcelRarity) => {
  const options = PARCEL_FEATURES[rarity];
  return options[Math.floor(Math.random() * options.length)];
};

export const pickWeightedParcelRarity = (): ParcelRarity => {
  const roll = Math.random() * 100;
  if (roll < 50) return "common";
  if (roll < 80) return "rare";
  if (roll < 95) return "epic";
  return "legendary";
};

export const getRarityLevel = (rarity: ParcelRarity) => rarityOrder.indexOf(rarity) + 1;

export const buildCheatParcels = (count: number): Record<string, ParcelData> => {
  const parcels: Record<string, ParcelData> = {};
  const now = Date.now();
  for (let index = 0; index < count; index += 1) {
    const rarity = pickWeightedParcelRarity();
    parcels[`cheat-${index}`] = {
      id: `cheat-${index}`,
      corners: [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ],
      center: { lat: 0, lng: 0 },
      rarity,
      level: getRarityLevel(rarity),
      purchaseTime: now,
      rentRate: PARCEL_RENT_RATES[rarity],
      visualFeature: PARCEL_FEATURES[rarity]?.[0] ?? "Lawn",
    };
  }
  return parcels;
};

export const getNextRarity = (rarity: ParcelRarity): ParcelRarity | null => {
  const index = rarityOrder.indexOf(rarity);
  if (index < 0 || index >= rarityOrder.length - 1) {
    return null;
  }
  return rarityOrder[index + 1];
};

export const normalizeParcelData = (parcel: ParcelData): ParcelData => {
  const rarity = parcel.rarity ?? "common";
  const rentRate = Number.isFinite(parcel.rentRate)
    ? parcel.rentRate
    : PARCEL_RENT_RATES[rarity];
  const visualFeature =
    parcel.visualFeature ?? PARCEL_FEATURES[rarity]?.[0] ?? "Lawn";
  return {
    ...parcel,
    rarity,
    level: Number.isFinite(parcel.level) ? parcel.level : getRarityLevel(rarity),
    purchaseTime: Number.isFinite(parcel.purchaseTime) ? parcel.purchaseTime : Date.now(),
    rentRate,
    visualFeature,
  };
};
