"use client";

import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { getBoostMultiplier, useGameStore } from "@/store/useGameStore";

const MAX_STACK_HOURS = 6;

const formatDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;
};

export default function BoostControl() {
  const boostEndTime = useGameStore((state) => state.boostEndTime);
  const activateBoost = useGameStore((state) => state.activateBoost);
  const ownedParcels = useGameStore((state) => state.ownedParcels);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const boostMultiplier = getBoostMultiplier(Object.keys(ownedParcels).length);

  useEffect(() => {
    const tick = () => {
      if (!boostEndTime) {
        setRemainingSeconds(0);
        return;
      }
      const remaining = Math.max(0, Math.floor((boostEndTime - Date.now()) / 1000));
      setRemainingSeconds(remaining);
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [boostEndTime]);

  const maxStackSeconds = MAX_STACK_HOURS * 3600;
  const canStack = remainingSeconds < maxStackSeconds;

  const handleBoost = () => {
    if (isLoading || !canStack) {
      return;
    }
    setIsLoading(true);
    window.setTimeout(() => {
      activateBoost();
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="pointer-events-none fixed bottom-28 right-6 z-50">
      <button
        type="button"
        onClick={handleBoost}
        disabled={!canStack || isLoading}
        className="pointer-events-auto flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 shadow-[0_12px_24px_rgba(15,23,42,0.18)] backdrop-blur transition disabled:opacity-60"
      >
        {isLoading ? (
          <span className="flex h-4 w-4 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
        <span>{isLoading ? "Watching Ad..." : `Boost Rent (${boostMultiplier}x)`}</span>
      </button>
      {remainingSeconds > 0 && (
        <div className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
          ⚡ {formatDuration(remainingSeconds)}
        </div>
      )}
    </div>
  );
}
