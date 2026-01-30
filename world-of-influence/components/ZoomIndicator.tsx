"use client";

import { useMapStore } from "@/store/useGameStore";

export default function ZoomIndicator() {
  const mapZoom = useMapStore((state) => state.mapZoom);

  return (
    <div className="pointer-events-none absolute left-6 top-6 z-50 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)]/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur">
      Zoom {mapZoom.toFixed(1)}x
    </div>
  );
}
