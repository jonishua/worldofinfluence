"use client";

import L from "leaflet";
import { Briefcase, UserRound, Drone } from "lucide-react";
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
  calculateDistance,
  DRONE_TETHER_RADIUS_KM
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
  const smoothedRef = useRef(target);
  const animationRef = useRef(0);

  useEffect(() => {
    const start = smoothedRef.current;
    const duration = 500;
    const startTime = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = {
        lat: start.lat + (target.lat - start.lat) * eased,
        lng: start.lng + (target.lng - start.lng) * eased,
      };
      setSmoothed(next);
      smoothedRef.current = next;

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
  satelliteMode,
}: {
  center: LatLng;
  isUserInteracting: boolean;
  satelliteMode: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    // In satellite mode, we only auto-center if we're active and not dragging
    // In targeting mode, we don't auto-center (let the user pan)
    if (satelliteMode) {
      // Logic for active drone following or targeting jumps is handled by MapFlyToHandler
      return;
    }

    if (!isUserInteracting) {
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
    }
  }, [center.lat, center.lng, isUserInteracting, map, satelliteMode]);

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
  const minMapZoom = useMapStore((state) => state.minMapZoom);
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  useEffect(() => {
    map.setMinZoom(minMapZoom);
  }, [map, minMapZoom]);

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
  const droneStatus = useMapStore((state) => state.droneStatus);
  const completeDeployment = useMapStore((state) => state.completeDeployment);
  const deploymentTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (flyToTarget) {
      const isDeploying = droneStatus === "deploying";
      const isTargeting = droneStatus === "targeting";
      
      let zoom = 18;
      if (isDeploying) zoom = 19;
      if (isTargeting) zoom = 17;

      // We capture values for the animation
      const target = [flyToTarget.lat, flyToTarget.lng] as [number, number];
      
      // Clear the target immediately to prevent re-triggers, 
      // but only if it's NOT a deployment flight (deployment timer needs flyToTarget to be stable)
      // Actually, it's safer to clear it and manage the deployment timer separately.
      triggerMapFlyTo(null);

      map.flyTo(target, zoom, {
        duration: isDeploying ? 4 : (isTargeting ? 2.5 : 3),
        easeLinearity: isDeploying ? 0.1 : 0.25,
      });

      if (isDeploying) {
        if (deploymentTimerRef.current) clearTimeout(deploymentTimerRef.current);
        deploymentTimerRef.current = setTimeout(() => {
          completeDeployment();
          deploymentTimerRef.current = null;
        }, 4000);
      }
    }
  }, [flyToTarget, map, triggerMapFlyTo, droneStatus, completeDeployment]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (deploymentTimerRef.current) clearTimeout(deploymentTimerRef.current);
    };
  }, []);

  return null;
}

function TargetingReticle() {
  const map = useMap();
  const selectedParcel = useMapStore((state) => state.selectedParcel);
  const droneStatus = useMapStore((state) => state.droneStatus);
  const satelliteMode = useMapStore((state) => state.satelliteMode);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!satelliteMode) {
      requestAnimationFrame(() => setPos(null));
      return;
    }

    if (droneStatus === "active") {
      // Always center in active mode
      const updateCenter = () => {
        const size = map.getSize();
        setPos({ x: size.x / 2, y: size.y / 2 });
      };
      
      // Use requestAnimationFrame to avoid synchronous setState warning
      requestAnimationFrame(updateCenter);
      
      map.on("resize", updateCenter);
      return () => map.off("resize", updateCenter);
    }

    if (droneStatus === "targeting" && selectedParcel) {
      const update = () => {
        const point = map.latLngToContainerPoint(selectedParcel.center);
        setPos({ x: point.x, y: point.y });
      };

      // Use requestAnimationFrame to avoid synchronous setState warning
      requestAnimationFrame(update);
      
      map.on("move zoom", update);
      return () => {
        map.off("move zoom", update);
      };
    }

    requestAnimationFrame(() => setPos(null));
  }, [map, selectedParcel, droneStatus, satelliteMode]);

  if (!pos) return null;

  return (
    <div 
      className="pointer-events-none absolute z-[600] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out"
      style={{ left: pos.x, top: pos.y }}
    >
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
  );
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

const droneIcon = L.divIcon({
  className: "drone-marker",
  html: renderToStaticMarkup(
    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-orange-500 bg-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
      <Drone className="h-7 w-7 text-orange-500 animate-pulse" />
    </div>,
  ),
  iconSize: [48, 48],
  iconAnchor: [24, 24],
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
  const viewingMode = useMapStore((state) => state.viewingMode);
  const droneStatus = useMapStore((state) => state.droneStatus);
  const isLeaping = useMapStore((state) => state.isLeaping);
  const droneTetherCenter = useMapStore((state) => state.droneTetherCenter);
  const droneCurrentLocation = useMapStore((state) => state.droneCurrentLocation);
  const droneTargetLocation = useMapStore((state) => state.droneTargetLocation);
  const updateDroneLocation = useMapStore((state) => state.updateDroneLocation);
  const updateDroneTimer = useMapStore((state) => state.updateDroneTimer);
  const satelliteCameraLocation = useMapStore((state) => state.satelliteCameraLocation);
  const drops = useMapStore((state) => state.drops);
  const otherPlayers = useMapStore((state) => state.otherPlayers);
  const globalDrops = useMapStore((state) => state.globalDrops);
  const setUserLocation = useMapStore((state) => state.setUserLocation);
  const generateDrops = useMapStore((state) => state.generateDrops);
  const triggerMapFlyTo = useMapStore((state) => state.triggerMapFlyTo);
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

  useEffect(() => {
    if (droneStatus === "active") {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [droneStatus]);

  useEffect(() => {
    if (droneStatus !== "active") return;
    const interval = setInterval(() => {
      updateDroneTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [droneStatus, updateDroneTimer]);

  // Drone interpolation during deployment
  useEffect(() => {
    if (droneStatus !== "deploying" || !userLocation || !droneTargetLocation) return;
    
    const start = userLocation;
    const end = droneTargetLocation;
    const startTime = performance.now();
    const duration = 4000; // Match flyTo duration

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2; // Ease in out
      
      updateDroneLocation({
        lat: start.lat + (end.lat - start.lat) * eased,
        lng: start.lng + (end.lng - start.lng) * eased,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [droneStatus, userLocation, droneTargetLocation, updateDroneLocation]);

  const targetLocation = (satelliteMode && viewingMode === "drone" && droneStatus === "active" && droneTetherCenter)
    ? droneTetherCenter
    : (satelliteMode && satelliteCameraLocation) 
      ? satelliteCameraLocation 
      : (userLocation ?? DEFAULT_LOCATION);
  const smoothedLocation = useSmoothedLocation(targetLocation);
  const pickupRadius = INTERACTION_RADIUS_METERS * pickupRadiusMultiplier;
  // Stable reference latitude to prevent grid "shimmering" as the user moves.
  // Rounding to 0.1 degree (approx 11km) keeps the local grid math consistent.
  const gridReferenceLat = Math.round(smoothedLocation.lat * 10) / 10;

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

    // Boundary Haptic Pulse
    if (droneTetherCenter) {
      const distFromCenter = calculateDistance(droneTetherCenter, center);
      if (distFromCenter >= DRONE_TETHER_RADIUS_KM - 0.05) { // Within 50m of boundary
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([10, 30, 10]); // Short double pulse
        }
      }
    }
  }, [mapBounds, satelliteMode, droneTetherCenter]);

  useEffect(() => {
    // Zoom is handled by map actions and watchers
  }, [maxMapZoom]);

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
    
    // In targeting mode, fly to the selected location at zoom 17
    if (droneStatus === "targeting") {
      triggerMapFlyTo(parcel.center);
    }
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
    if (mapZoom <= 18 || !mapBounds || isLeaping || droneStatus === "targeting") {
      return [];
    }

    const southWest = getGridIndices(mapBounds.south, mapBounds.west, 10, gridReferenceLat);
    const northEast = getGridIndices(mapBounds.north, mapBounds.east, 10, gridReferenceLat);
    
    // Add a 1-square buffer to prevent pop-in during pans
    const minX = Math.min(southWest.x, northEast.x) - 1;
    const maxX = Math.max(southWest.x, northEast.x) + 1;
    const minY = Math.min(southWest.y, northEast.y) - 1;
    const maxY = Math.max(southWest.y, northEast.y) + 1;
    const squares = [];

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        squares.push(getGridBoundsForIndex(x, y, gridReferenceLat));
      }
    }

    return squares;
  }, [gridReferenceLat, mapBounds, mapZoom, isLeaping, droneStatus]);

  const tacticalGrid = useMemo(() => {
    if (droneStatus !== "targeting" || !mapBounds) {
      return [];
    }

    const cellSize = 500; // 500m Cells for tactical view
    const southWest = getGridIndices(mapBounds.south, mapBounds.west, cellSize, gridReferenceLat);
    const northEast = getGridIndices(mapBounds.north, mapBounds.east, cellSize, gridReferenceLat);
    
    const minX = Math.min(southWest.x, northEast.x) - 1;
    const maxX = Math.max(southWest.x, northEast.x) + 1;
    const minY = Math.min(southWest.y, northEast.y) - 1;
    const maxY = Math.max(southWest.y, northEast.y) + 1;
    const cells = [];

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        cells.push(getGridBoundsForIndex(x, y, gridReferenceLat, cellSize));
      }
    }

    return cells;
  }, [droneStatus, mapBounds, gridReferenceLat]);

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
        preferCanvas={true}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
          className={`map-tiles transition-all duration-700 ${satelliteMode ? 'grayscale brightness-[0.8] contrast-[1.2]' : ''}`}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={maxMapZoom}
          maxNativeZoom={19}
        />

        <MapInteractionWatcher onInteractChange={setIsUserInteracting} />
        <ZoomWatcher onZoomChange={setMapZoom} />
        <AutoCenter center={smoothedLocation} isUserInteracting={isUserInteracting} satelliteMode={satelliteMode} />
        <MapClickHandler onSelectParcel={handleSelectParcel} />
        <MapBoundsWatcher onBoundsChange={setMapBounds} />
        <MapFlyToHandler />
        <TargetingReticle />

        {tacticalGrid.map((cell) => (
          <Rectangle
            key={`tactical-${cell.id}`}
            bounds={cell.corners}
            pathOptions={{
              color: "#00C805",
              weight: 1,
              fillColor: "#00C805",
              fillOpacity: 0.1,
              className: "tactical-cell animate-pulse",
            }}
            eventHandlers={{
              click: (event) => {
                event.originalEvent?.stopPropagation?.();
                handleSelectParcel(cell.center.lat, cell.center.lng);
              },
            }}
          />
        ))}

        {gridSquares.map((square) => {
          const owned = ownedParcels[square.id];
          return (
            <Rectangle
              key={`grid-${square.id}`}
              bounds={square.corners}
              pathOptions={{
                color: owned ? "#ffffff" : "#cbd5e1",
                weight: owned ? 2 : 1,
                fillColor: owned ? "#00C805" : "#94a3b8",
                fillOpacity: owned ? 0.5 : 0.12,
                className: owned ? "grid-owned transition-all duration-500" : "grid-unowned",
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

        {/* User Marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={userIcon} 
            opacity={satelliteMode ? 0.5 : 1}
          />
        )}

        {/* Drone Marker */}
        {droneStatus === "deploying" && droneCurrentLocation && (
          <Marker 
            position={[droneCurrentLocation.lat, droneCurrentLocation.lng]} 
            icon={droneIcon} 
          />
        )}

        {droneStatus === "active" && droneTetherCenter && (
          <Marker 
            position={[droneTetherCenter.lat, droneTetherCenter.lng]} 
            icon={droneIcon} 
          />
        )}

        {droneStatus === "active" && droneTetherCenter && (
          <Circle
            center={[droneTetherCenter.lat, droneTetherCenter.lng]}
            radius={DRONE_TETHER_RADIUS_KM * 1000}
            pathOptions={{
              color: "#F59E0B",
              fillColor: "#F59E0B",
              fillOpacity: 0.03,
              weight: 1,
              dashArray: "10 10",
            }}
          />
        )}

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
          {/* Static center elements for non-targeting modes if needed, but handled by TargetingReticle */}
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
