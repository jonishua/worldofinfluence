"use client";

import { Coins } from "lucide-react";

import { useEconomyStore } from "@/store/useGameStore";

export default function CreditsPill() {
  const credits = useEconomyStore((state) => state.credits);

  return (
    <div className="pointer-events-none flex items-center gap-2 rounded-full bg-[var(--card-bg)]/80 border border-[var(--card-border)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] shadow-lg backdrop-blur-xl">
      <Coins className="h-4 w-4 text-[var(--text-muted)]" />
      <span className="uppercase tracking-[0.18em]">{credits.toLocaleString()} Credits</span>
    </div>
  );
}
