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
  const [isPopping, setIsPopping] = useState(false);

  useEffect(() => {
    if (!lastUpgradedAt) {
      return;
    }
    if (Date.now() - lastUpgradedAt > 2500) {
      return;
    }
    
    const startTimeout = window.setTimeout(() => setIsPopping(true), 0);
    const endTimeout = window.setTimeout(() => setIsPopping(false), 800);
    return () => {
      window.clearTimeout(startTimeout);
      window.clearTimeout(endTimeout);
    };
  }, [lastUpgradedAt]);

  const icon = useMemo(() => {
    const Icon = rarityIcon(rarity);
    return L.divIcon({
      className: `map-asset-icon map-asset-icon--3d ${isPopping ? "map-asset-icon--pop" : ""}`,
      html: renderToStaticMarkup(
        <div style={{ color: rarityColor[rarity] }}>
          <Icon className="h-5 w-5" />
        </div>,
      ),
      iconSize: [28, 28],
      iconAnchor: [14, 20],
    });
  }, [isPopping, rarity]);

  const zIndexOffset = Math.round((90 - position[0]) * 1000);

  return <Marker position={position} icon={icon} zIndexOffset={zIndexOffset} />;
}
