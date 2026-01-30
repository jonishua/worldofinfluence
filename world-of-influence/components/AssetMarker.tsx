"use client";

import L from "leaflet";
import { Crown, Home, Store, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker } from "react-leaflet";

import type { ParcelRarity } from "@/store/useGameStore";

type AssetMarkerProps = {
  position: [number, number];
  rarity: ParcelRarity;
  lastUpgradedAt?: number;
};

const rarityColor: Record<ParcelRarity, string> = {
  common: "#00C805",
  rare: "#3b82f6",
  epic: "#8b5cf6",
  legendary: "#f59e0b",
};

const rarityIcon = (rarity: ParcelRarity) => {
  if (rarity === "legendary") return Crown;
  if (rarity === "epic") return Home;
  if (rarity === "rare") return Store;
  return Zap;
};

export default function AssetMarker({ position, rarity, lastUpgradedAt }: AssetMarkerProps) {
  const Icon = rarityIcon(rarity);
  const [isPopping, setIsPopping] = useState(false);

  useEffect(() => {
    if (!lastUpgradedAt) {
      return;
    }
    if (Date.now() - lastUpgradedAt > 2500) {
      return;
    }
    setIsPopping(true);
    const timeout = window.setTimeout(() => setIsPopping(false), 800);
    return () => window.clearTimeout(timeout);
  }, [lastUpgradedAt]);

  const icon = useMemo(
    () =>
      L.divIcon({
        className: `map-asset-icon map-asset-icon--3d ${isPopping ? "map-asset-icon--pop" : ""}`,
        html: renderToStaticMarkup(
          <div style={{ color: rarityColor[rarity] }}>
            <Icon className="h-5 w-5" />
          </div>,
        ),
        iconSize: [28, 28],
        iconAnchor: [14, 20],
      }),
    [Icon, isPopping, rarity],
  );

  const zIndexOffset = Math.round((90 - position[0]) * 1000);

  return <Marker position={position} icon={icon} zIndexOffset={zIndexOffset} />;
}
