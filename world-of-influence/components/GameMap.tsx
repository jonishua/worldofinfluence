"use client";

import L from "leaflet";
import { Briefcase, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { motion } from "framer-motion";
import {
  Circle,
  MapContainer,
  Marker,
  Polygon,
  Rectangle,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { 
  getGridBoundsForIndex,
  getGridBoundsWithReference,
  getGridIndices,
  parseGridId,
} from "@/lib/gridSystem";
import { themeById, useThemeStore } from "@/lib/theme";
import AssetMarker from "@/components/AssetMarker";
import { supabase } from "@/lib/supabase";
import { 
  Drop, 
  DropRarity, 
  LatLng, 
  useMapStore, 
  usePropertyStore,
  GlobalDrop,
  calculateDistance
} from "@/store/useGameStore";
import SupplyDropModal from "@/components/modals/SupplyDropModal";

const DEFAULT_LOCATION = {
  lat: 40.7589,
  lng: -73.98513,
};

const INTERACTION_RADIUS_METERS = 50;
type MapBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

function useSmoothedLocation(target: LatLng) {
  const [smoothed, setSmoothed] = useState(target);
  const animationRef = useRef(0);

  useEffect(() => {
    const start = smoothed;
    const duration = 500;
    const startTime = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setSmoothed({
        lat: start.lat + (target.lat - start.lat) * eased,
        lng: start.lng + (target.lng - start.lng) * eased,
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [target.lat, target.lng]);

  return smoothed;
}

function AutoCenter({
  center,
  isUserInteracting,
}: {
  center: LatLng;
  isUserInteracting: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!isUserInteracting) {
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
    }
  }, [center.lat, center.lng, isUserInteracting, map]);

  return null;
}

function MapInteractionWatcher({
  onInteractChange,
}: {
  onInteractChange: (isInteracting: boolean) => void;
}) {
  useMapEvents({
    dragstart: () => onInteractChange(true),
    zoomstart: () => onInteractChange(true),
    dragend: () => onInteractChange(false),
    zoomend: () => onInteractChange(false),
  });

  return null;
}

function ZoomWatcher({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

function MapClickHandler({
  onSelectParcel,
}: {
  onSelectParcel: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (event) => {
      onSelectParcel(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function MapBoundsWatcher({
  onBoundsChange,
}: {
  onBoundsChange: (bounds: MapBounds) => void;
}) {
  const map = useMapEvents({
    move: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      });
    },
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      });
    },
    zoomend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      });
    },
  });

  useEffect(() => {
    const bounds = map.getBounds();
    onBoundsChange({
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast(),
    });
  }, [map, onBoundsChange]);

  return null;
}

function MapFlyToHandler() {
  const map = useMap();
  const flyToTarget = useMapStore((state) => state.flyToTarget);
  const triggerMapFlyTo = useMapStore((state) => state.triggerMapFlyTo);

  useEffect(() => {
    if (flyToTarget) {
      map.flyTo([flyToTarget.lat, flyToTarget.lng], 18, {
        duration: 3,
        easeLinearity: 0.25,
      });
      // Clear the target after flying
      triggerMapFlyTo(null); 
    }
  }, [flyToTarget, map, triggerMapFlyTo]);

  return null;
}

const userIcon = L.divIcon({
  className: "user-marker",
  html: renderToStaticMarkup(
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-slate-900/80 shadow-[0_10px_24px_rgba(15,23,42,0.35)]">
      <UserRound className="h-5 w-5 text-[var(--accent-color)]" />
    </div>,
  ),
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const ghostIcon = L.divIcon({
  className: "ghost-marker",
  html: renderToStaticMarkup(
    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-slate-800/40 shadow-lg backdrop-blur-[1px]">
      <UserRound className="h-4 w-4 text-white/60" />
    </div>,
  ),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const buildDropIcon = (rarity: DropRarity, isInRange: boolean, isGlobal: boolean = false) =>
  L.divIcon({
    className: `supply-drop-marker ${isGlobal ? "global-drop" : ""}`,
    html: renderToStaticMarkup(
      <div
        className={`supply-case supply-case--${rarity.toLowerCase()} ${
          rarity === "Legendary" || isGlobal ? "supply-glow" : ""
        } ${isInRange ? "supply-case--active" : "supply-case--locked"} ${
          isGlobal ? "border-2 border-[#00C805] shadow-[0_0_15px_rgba(0,200,5,0.6)]" : ""
        }`}
      >
        <span className="supply-case__backing" />
        <div className="supply-case__lid" />
        <div className="supply-case__band" />
        <div className="supply-case__handle" />
        <Briefcase className={`supply-case__icon ${isGlobal ? "text-[#00C805]" : ""}`} />
        {(rarity === "Legendary" || isGlobal) && <span className="supply-case__badge" />}
      </div>,
    ),
    iconSize: [44, 36],
    iconAnchor: [22, 18],
  });


export default function GameMap() {
  const accentColor = useThemeStore(
    (state) => themeById[state.currentThemeId].accentColor,
  );
  const userLocation = useMapStore((state) => state.userLocation);
  const satelliteMode = useMapStore((state) => state.satelliteMode);
  const satelliteCameraLocation = useMapStore((state) => state.satelliteCameraLocation);
  const drops = useMapStore((state) => state.drops);
  const otherPlayers = useMapStore((state) => state.otherPlayers);
  const globalDrops = useMapStore((state) => state.globalDrops);
  const setUserLocation = useMapStore((state) => state.setUserLocation);
  const generateDrops = useMapStore((state) => state.generateDrops);
  const isDropInRange = useMapStore((state) => state.isDropInRange);
  const locationRequestId = useMapStore((state) => state.locationRequestId);
  const selectedParcel = useMapStore((state) => state.selectedParcel);
  const setSelectedParcel = useMapStore((state) => state.setSelectedParcel);
  const mapZoom = useMapStore((state) => state.mapZoom);
  const setMapZoom = useMapStore((state) => state.setMapZoom);
  const minMapZoom = useMapStore((state) => state.minMapZoom);
  const maxMapZoom = useMapStore((state) => state.maxMapZoom);
  const pickupRadiusMultiplier = useMapStore((state) => state.pickupRadiusMultiplier);

  const ownedParcels = usePropertyStore((state) => state.ownedParcels);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const toastTimeout = useRef<number | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);
  const lastHapticPos = useRef<LatLng | null>(null);

  const targetLocation = (satelliteMode && satelliteCameraLocation) 
    ? satelliteCameraLocation 
    : (userLocation ?? DEFAULT_LOCATION);
  const smoothedLocation = useSmoothedLocation(targetLocation);
  const pickupRadius = INTERACTION_RADIUS_METERS * pickupRadiusMultiplier;
  const gridReferenceLat = smoothedLocation.lat;

  // Haptic ticks for satellite exploration
  useEffect(() => {
    if (!satelliteMode || !mapBounds) {
      lastHapticPos.current = null;
      return;
    }
    
    const center = { 
      lat: (mapBounds.north + mapBounds.south) / 2, 
      lng: (mapBounds.east + mapBounds.west) / 2 
    };

    if (!lastHapticPos.current) {
      lastHapticPos.current = center;
      return;
    }

    const dist = calculateDistance(lastHapticPos.current, center);
    if (dist >= 0.1) { // 100 meters
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(5);
      }
      lastHapticPos.current = center;
    }
  }, [mapBounds, satelliteMode]);

  useEffect(() => {
    setMapZoom(maxMapZoom);
  }, [maxMapZoom, setMapZoom]);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setUserLocation(DEFAULT_LOCATION);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [locationRequestId, setUserLocation]);

  useEffect(() => {
    if (userLocation && drops.length === 0) {
      generateDrops(userLocation);
    }
  }, [userLocation, drops.length, generateDrops]);

  useEffect(() => {
    if (!userLocation) {
      return;
    }
    const interval = window.setInterval(() => {
      generateDrops(userLocation);
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [generateDrops, userLocation]);

  useEffect(() => {
    return () => {
      if (toastTimeout.current) {
        window.clearTimeout(toastTimeout.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimeout.current) {
      window.clearTimeout(toastTimeout.current);
    }
    toastTimeout.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleDropClick = (drop: Drop) => {
    if (!userLocation) {
      return;
    }

    if (satelliteMode) {
      showToast("Signal weak. Must be physically present to retrieve assets.");
      return;
    }

    const inRange = isDropInRange(userLocation, drop, pickupRadius);
    if (!inRange) {
      showToast("Target out of range. Move closer to secure asset.");
      return;
    }

    setSelectedDropId(drop.id);
  };

  const handleSelectParcel = (lat: number, lng: number) => {
    const parcel = getGridBoundsWithReference(lat, lng, gridReferenceLat);
    setSelectedParcel(parcel);
  };

  const handleGlobalDropClick = async (drop: GlobalDrop) => {
    if (!userLocation) return;

    if (satelliteMode) {
      showToast("Signal weak. Must be physically present to retrieve assets.");
      return;
    }

    const inRange = isDropInRange(userLocation, drop, pickupRadius);
    if (!inRange) {
      showToast("Global target out of range. Move closer.");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("collect_global_drop", { drop_id: drop.id });
      if (error) throw error;
      const result = data as { success: boolean; rarity: string; reason?: string };
      if (result.success) {
        showToast(`Secured Global Asset: ${result.rarity}!`);
        // The real-time subscription will remove it from the map
      } else {
        showToast(result.reason || "Failed to secure asset.");
      }
    } catch (err) {
      console.error("Collection error:", err);
      showToast("Error securing global asset.");
    }
  };

  const gridSquares = useMemo(() => {
    if (mapZoom <= 18 || !mapBounds) {
      return [];
    }

    const southWest = getGridIndices(mapBounds.south, mapBounds.west, 10, gridReferenceLat);
    const northEast = getGridIndices(mapBounds.north, mapBounds.east, 10, gridReferenceLat);
    const minX = Math.min(southWest.x, northEast.x);
    const maxX = Math.max(southWest.x, northEast.x);
    const minY = Math.min(southWest.y, northEast.y);
    const maxY = Math.max(southWest.y, northEast.y);
    const squares = [];

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        squares.push(getGridBoundsForIndex(x, y, gridReferenceLat));
      }
    }

    return squares;
  }, [gridReferenceLat, mapBounds, mapZoom]);

  const selectedBounds = useMemo(() => {
    if (!selectedParcel) {
      return null;
    }
    const gridIndex = parseGridId(selectedParcel.id);
    if (!gridIndex) {
      return selectedParcel;
    }
    return getGridBoundsForIndex(gridIndex.x, gridIndex.y, gridReferenceLat);
  }, [gridReferenceLat, selectedParcel]);

  return (
    <>
      <div className="absolute inset-0 z-0">
        <MapContainer
        center={[targetLocation.lat, targetLocation.lng]}
        zoom={maxMapZoom}
        minZoom={minMapZoom}
        maxZoom={maxMapZoom}
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
          className={`map-tiles transition-all duration-700 ${satelliteMode ? 'brightness-[0.4] contrast-[1.5] sepia-[0.3] hue-rotate-[180deg]' : ''}`}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={maxMapZoom}
          maxNativeZoom={19}
        />

        <MapInteractionWatcher onInteractChange={setIsUserInteracting} />
        <ZoomWatcher onZoomChange={setMapZoom} />
        <AutoCenter center={smoothedLocation} isUserInteracting={isUserInteracting || satelliteMode} />
        <MapClickHandler onSelectParcel={handleSelectParcel} />
        <MapBoundsWatcher onBoundsChange={setMapBounds} />
        <MapFlyToHandler />

        {gridSquares.map((square) => {
          const owned = ownedParcels[square.id];
          return (
            <Rectangle
              key={`grid-${square.id}`}
              bounds={square.corners}
              pathOptions={{
                color: satelliteMode ? "#22D3EE" : (owned ? "#ffffff" : "#cbd5e1"),
                weight: owned || satelliteMode ? 2 : 1,
                fillColor: owned ? "#00C805" : (satelliteMode ? "#22D3EE" : "#94a3b8"),
                fillOpacity: owned ? (satelliteMode ? 0.3 : 0.5) : (satelliteMode ? 0.05 : 0.12),
                className: `${owned ? "grid-owned" : "grid-unowned"} transition-all duration-500`,
              }}
              eventHandlers={{
                click: (event) => {
                  event.originalEvent?.stopPropagation?.();
                  handleSelectParcel(square.center.lat, square.center.lng);
                },
              }}
            />
          );
        })}

        {selectedBounds && (
          <Polygon
            positions={selectedBounds.corners}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              dashArray: "6 4",
              fillOpacity: 0,
            }}
          />
        )}

        <Circle
          center={[smoothedLocation.lat, smoothedLocation.lng]}
          radius={pickupRadius}
          pathOptions={{
            color: accentColor,
            fillColor: accentColor,
            fillOpacity: 0.1,
            weight: 1,
            className: "pulse-ring",
          }}
        />

        <Marker position={[smoothedLocation.lat, smoothedLocation.lng]} icon={userIcon} />

        {Object.values(otherPlayers).map((player) => (
          <Marker
            key={`player-${player.id}`}
            position={[player.location.lat, player.location.lng]}
            icon={ghostIcon}
          />
        ))}

        {globalDrops.map((drop) => {
          const inRange = userLocation ? isDropInRange(userLocation, drop, pickupRadius) : false;
          return (
            <Marker
              key={`global-${drop.id}`}
              position={[drop.location.lat, drop.location.lng]}
              icon={buildDropIcon(drop.rarity, inRange, true)}
              eventHandlers={{
                click: () => handleGlobalDropClick(drop),
              }}
            />
          );
        })}

        {Object.values(ownedParcels).map((parcel) => {
          if (parcel.rarity === "common") {
            return null;
          }
          const gridIndex = parseGridId(parcel.id);
          if (!gridIndex) {
            return null;
          }
          const bounds = getGridBoundsForIndex(
            gridIndex.x,
            gridIndex.y,
            gridReferenceLat,
          );
          return (
            <AssetMarker
              key={`asset-${parcel.id}`}
              position={[bounds.center.lat, bounds.center.lng]}
              rarity={parcel.rarity}
              lastUpgradedAt={parcel.lastUpgradedAt}
            />
          );
        })}

        {drops
          .filter((drop) => !drop.collected)
          .map((drop) => {
            const inRange = userLocation
              ? isDropInRange(userLocation, drop, pickupRadius)
              : false;

            return (
              <Marker
                key={drop.id}
                position={[drop.location.lat, drop.location.lng]}
                icon={buildDropIcon(drop.rarity, inRange)}
                eventHandlers={{
                  click: () => handleDropClick(drop),
                }}
              />
            );
          })}
      </MapContainer>

      {!satelliteMode && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[600] -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-slate-950/90 shadow-[0_12px_26px_rgba(15,23,42,0.45)]">
            <UserRound className="h-6 w-6 text-[var(--accent-color)]" />
          </div>
        </div>
      )}

      {satelliteMode && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[600] -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 border-2 border-[#22D3EE]/30 rounded-full animate-[ping_3s_infinite]" />
            <div className="absolute inset-[15%] border border-[#22D3EE]/50 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-0.5 w-full bg-[#22D3EE]/40" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-0.5 h-full bg-[#22D3EE]/40" />
            </div>
            <div className="absolute inset-[35%] border-2 border-orange-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse" />
            
            {/* Rotating elements */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-1/2 h-2 w-0.5 bg-[#22D3EE] -translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 h-2 w-0.5 bg-[#22D3EE] -translate-x-1/2" />
              <div className="absolute left-0 top-1/2 w-2 h-0.5 bg-[#22D3EE] -translate-y-1/2" />
              <div className="absolute right-0 top-1/2 w-2 h-0.5 bg-[#22D3EE] -translate-y-1/2" />
            </motion.div>
          </div>
        </div>
      )}

        {toastMessage && (
          <div className="pointer-events-none absolute left-1/2 top-24 z-[700] -translate-x-1/2">
            <div className="rounded-full border border-[var(--card-border)] bg-[var(--card-bg)]/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)] shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
              {toastMessage}
            </div>
          </div>
        )}
      </div>

      {selectedDropId && (
        <SupplyDropModal dropId={selectedDropId} onClose={() => setSelectedDropId(null)} />
      )}
    </>
  );
}
