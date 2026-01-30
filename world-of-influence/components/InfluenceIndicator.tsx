"use client";

import { Landmark } from "lucide-react";

import { useEconomyStore } from "@/store/useGameStore";

export default function InfluenceIndicator() {
  const influenceBucks = useEconomyStore((state) => state.influenceBucks);

  return (
    <div className="pointer-events-none absolute right-6 top-6 z-50 flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)]/90 px-3 py-2 text-xs font-semibold text-[var(--text-primary)] shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur">
      <Landmark className="h-4 w-4 text-[var(--accent-color)]" />
      <span className="font-mono">{influenceBucks}</span>
    </div>
  );
}
