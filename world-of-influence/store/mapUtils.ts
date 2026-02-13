import { bbox, circle, randomPoint, distance } from "@turf/turf";
import { 
  LatLng, 
  DropRarity, 
  LOOT_TABLE, 
} from "./types";
import { metersToKilometers } from "./utils";

export const pickDropRarity = (): DropRarity => {
  const roll = Math.random();
  if (roll < 0.05) return "Legendary";
  if (roll < 0.15) return "Epic";
  if (roll < 0.4) return "Rare";
  return "Common";
};

export const rollLoot = (rarity: DropRarity) => {
  const table = LOOT_TABLE[rarity];
  if (table.type === "Permit") {
    const amount = Math.floor(Math.random() * (table.max - table.min + 1) + table.min);
    return { type: table.type, amount };
  }
  if (table.decimals) {
    const amount = Math.random() * (table.max - table.min) + table.min;
    return { type: table.type, amount: Number(amount.toFixed(table.decimals)) };
  }
  const amount = Math.floor(Math.random() * (table.max - table.min + 1) + table.min);
  return { type: table.type, amount };
};

export const buildDropsInRadius = (origin: LatLng, count: number, radiusMeters: number) => {
  if (count <= 0) {
    return [];
  }
  const radiusKm = metersToKilometers(radiusMeters);
  const bounds = bbox(circle([origin.lng, origin.lat], radiusKm, { units: "kilometers" }));
  const points = randomPoint(count, { bbox: bounds });
  return points.features.map((feature) => ({
    id: crypto.randomUUID(),
    location: {
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
    },
    collected: false,
    rarity: pickDropRarity(),
  }));
};

export const calculateDistance = (origin: LatLng, dropLocation: LatLng) => {
  return distance(
    [origin.lng, origin.lat],
    [dropLocation.lng, dropLocation.lat],
    { units: "kilometers" }
  );
};
