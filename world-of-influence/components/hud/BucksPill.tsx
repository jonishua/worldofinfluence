"use client";

import { Building2 } from "lucide-react";

import { useEconomyStore } from "@/store/useGameStore";
import Odometer from "./Odometer";

export default function BucksPill() {
  const influenceBucks = useEconomyStore((state) => state.influenceBucks);

  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-[12px] bg-[var(--card-bg)] border border-[var(--card-border)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] shadow-sm transition-transform active:scale-95 backdrop-blur-xl">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--gray-bg)]">
        <Building2 className="h-3.5 w-3.5 text-[var(--text-primary)]" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] leading-none mb-1">
          Influence
        </span>
        <Odometer 
          value={influenceBucks} 
          className="text-sm tabular-nums leading-none" 
          prefix="IB "
        />
      </div>
    </div>
  );
}
