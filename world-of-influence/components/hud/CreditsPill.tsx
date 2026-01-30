"use client";

import { Coins } from "lucide-react";

import { useEconomyStore } from "@/store/useGameStore";

export default function CreditsPill() {
  const credits = useEconomyStore((state) => state.credits);

  return (
    <div className="pointer-events-none flex items-center gap-2 rounded-full bg-slate-900/50 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur">
      <Coins className="h-4 w-4 text-white/80" />
      <span className="uppercase tracking-[0.18em]">{credits.toLocaleString()} Credits</span>
    </div>
  );
}
