export type GridBounds = {
  id: string;
  corners: Array<[number, number]>;
  center: {
    lat: number;
    lng: number;
  };
};

export type GridIndex = {
  x: number;
  y: number;
};

const METERS_PER_DEGREE_LAT = 111_320;

function metersPerDegreeLng(latitude: number) {
  return METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180);
}

export function getGridIndices(
  lat: number,
  lng: number,
  gridSizeMeters = 10,
  referenceLat = lat,
): GridIndex {
  const metersPerLng = metersPerDegreeLng(referenceLat);
  const x = lng * metersPerLng;
  const y = lat * METERS_PER_DEGREE_LAT;
  const gridX = Math.floor(x / gridSizeMeters);
  const gridY = Math.floor(y / gridSizeMeters);
  return { x: gridX, y: gridY };
}

export function getGridId(
  lat: number,
  lng: number,
  gridSizeMeters = 10,
  referenceLat = lat,
) {
  const { x, y } = getGridIndices(lat, lng, gridSizeMeters, referenceLat);
  return `${x}:${y}`;
}

export function getGridBoundsForIndex(
  gridX: number,
  gridY: number,
  referenceLat: number,
  gridSizeMeters = 10,
): GridBounds {
  const metersPerLng = metersPerDegreeLng(referenceLat);
  const minX = gridX * gridSizeMeters;
  const maxX = minX + gridSizeMeters;
  const minY = gridY * gridSizeMeters;
  const maxY = minY + gridSizeMeters;

  const latSouth = minY / METERS_PER_DEGREE_LAT;
  const latNorth = maxY / METERS_PER_DEGREE_LAT;
  const lngWest = minX / metersPerLng;
  const lngEast = maxX / metersPerLng;

  const corners: Array<[number, number]> = [
    [latSouth, lngWest],
    [latSouth, lngEast],
    [latNorth, lngEast],
    [latNorth, lngWest],
  ];

  return {
    id: `${gridX}:${gridY}`,
    corners,
    center: {
      lat: latSouth + (latNorth - latSouth) / 2,
      lng: lngWest + (lngEast - lngWest) / 2,
    },
  };
}

export function getGridBounds(lat: number, lng: number, gridSizeMeters = 10): GridBounds {
  const { x, y } = getGridIndices(lat, lng, gridSizeMeters, lat);
  return getGridBoundsForIndex(x, y, lat, gridSizeMeters);
}

export function getGridBoundsWithReference(
  lat: number,
  lng: number,
  referenceLat: number,
  gridSizeMeters = 10,
): GridBounds {
  const { x, y } = getGridIndices(lat, lng, gridSizeMeters, referenceLat);
  return getGridBoundsForIndex(x, y, referenceLat, gridSizeMeters);
}

export function parseGridId(gridId: string): GridIndex | null {
  const [xValue, yValue] = gridId.split(":");
  const x = Number(xValue);
  const y = Number(yValue);
  if (Number.isNaN(x) || Number.isNaN(y)) {
    return null;
  }
  return { x, y };
}
