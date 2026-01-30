"use client";

import L from "leaflet";
import { Briefcase, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
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
import { Drop, DropRarity, LatLng, useGameStore } from "@/store/useGameStore";
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

const buildDropIcon = (rarity: DropRarity, isInRange: boolean) =>
  L.divIcon({
    className: "supply-drop-marker",
    html: renderToStaticMarkup(
      <div
        className={`supply-case supply-case--${rarity.toLowerCase()} ${
          rarity === "Legendary" ? "supply-glow" : ""
        } ${isInRange ? "supply-case--active" : "supply-case--locked"}`}
      >
        <span className="supply-case__backing" />
        <div className="supply-case__lid" />
        <div className="supply-case__band" />
        <div className="supply-case__handle" />
        <Briefcase className="supply-case__icon" />
        {rarity === "Legendary" && <span className="supply-case__badge" />}
      </div>,
    ),
    iconSize: [44, 36],
    iconAnchor: [22, 18],
  });


export default function GameMap() {
  const accentColor = useThemeStore(
    (state) => themeById[state.currentThemeId].accentColor,
  );
  const userLocation = useGameStore((state) => state.userLocation);
  const drops = useGameStore((state) => state.drops);
  const setUserLocation = useGameStore((state) => state.setUserLocation);
  const generateDrops = useGameStore((state) => state.generateDrops);
  const isDropInRange = useGameStore((state) => state.isDropInRange);
  const locationRequestId = useGameStore((state) => state.locationRequestId);
  const selectedParcel = useGameStore((state) => state.selectedParcel);
  const ownedParcels = useGameStore((state) => state.ownedParcels);
  const setSelectedParcel = useGameStore((state) => state.setSelectedParcel);
  const mapZoom = useGameStore((state) => state.mapZoom);
  const setMapZoom = useGameStore((state) => state.setMapZoom);
  const minMapZoom = useGameStore((state) => state.minMapZoom);
  const maxMapZoom = useGameStore((state) => state.maxMapZoom);
  const pickupRadiusMultiplier = useGameStore((state) => state.pickupRadiusMultiplier);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const toastTimeout = useRef<number | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);

  const targetLocation = userLocation ?? DEFAULT_LOCATION;
  const smoothedLocation = useSmoothedLocation(targetLocation);
  const pickupRadius = INTERACTION_RADIUS_METERS * pickupRadiusMultiplier;
  const gridReferenceLat = smoothedLocation.lat;

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
          className="map-tiles"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={maxMapZoom}
          maxNativeZoom={19}
        />

        <MapInteractionWatcher onInteractChange={setIsUserInteracting} />
        <ZoomWatcher onZoomChange={setMapZoom} />
        <AutoCenter center={smoothedLocation} isUserInteracting={isUserInteracting} />
        <MapClickHandler onSelectParcel={handleSelectParcel} />
        <MapBoundsWatcher onBoundsChange={setMapBounds} />

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
                className: owned ? "grid-owned" : "grid-unowned",
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

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[600] -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-slate-950/90 shadow-[0_12px_26px_rgba(15,23,42,0.45)]">
          <UserRound className="h-6 w-6 text-[var(--accent-color)]" />
        </div>
      </div>

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
