"use client";

import { Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import LiveBalance from "@/components/LiveBalance";
import {
  computeBaseRentRate,
  computeRentRate,
  getBoostMultiplier,
  useGameStore,
} from "@/store/useGameStore";

const formatDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;
};

export default function BalanceTicker() {
  const ownedParcels = useGameStore((state) => state.ownedParcels);
  const boostEndTime = useGameStore((state) => state.boostEndTime);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const isBoostActive = useMemo(() => {
    if (!boostEndTime) return false;
    return boostEndTime > Date.now();
  }, [boostEndTime, remainingSeconds]);
  
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

  const baseRate = useMemo(() => computeBaseRentRate(ownedParcels), [ownedParcels]);
  const totalRate = useMemo(
    () => computeRentRate(ownedParcels, boostEndTime),
    [boostEndTime, ownedParcels],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`rounded-[var(--radius)] border border-[var(--card-border)] bg-[var(--card-bg)]/90 px-5 py-4 text-left shadow-[0_12px_30px_rgba(31,41,55,0.12)] backdrop-blur ${
          isBoostActive ? "boosted-card" : ""
        }`}
      >
        <div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Net Worth
            </p>
            {isBoostActive && (
              <div className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                <Zap className="h-3 w-3 animate-pulse" />
                <span>{formatDuration(remainingSeconds)}</span>
              </div>
            )}
          </div>
          <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-[var(--accent-color)] tabular-nums">
            <LiveBalance />
          </p>
        </div>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-[700] flex items-end justify-center bg-black/40 px-4 pb-6 pt-10 backdrop-blur-[2px]">
          <div className="w-full max-w-[520px] rounded-[20px] bg-white px-6 py-7 text-left shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Income Detail
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Base Rent</span>
                <span className="font-mono tabular-nums">${baseRate.toFixed(9)}/sec</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Active Boost</span>
                <span className="font-semibold text-emerald-600">
                  {isBoostActive ? `${boostMultiplier}x` : "1x"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="font-semibold text-slate-800">Total Output</span>
                <span className="font-mono tabular-nums text-slate-800">
                  ${totalRate.toFixed(9)}/sec
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
