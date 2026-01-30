"use client";

import { useEffect, useMemo, useState } from "react";

import {
  computeBaseRentRate,
  computeRentRate,
  getBoostMultiplier,
} from "@/store/economyUtils";
import {
  useEconomyStore,
  usePropertyStore,
} from "@/store/useGameStore";

type IncomeDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSettled: () => void;
  onRequestBoost: () => void;
};

const playCashRegister = () => {
  try {
    const AudioContextClass =
      window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.12);
  } catch {
    // No-op if audio is blocked.
  }
};

export default function IncomeDetailModal({
  isOpen,
  onClose,
  onSettled,
  onRequestBoost,
}: IncomeDetailModalProps) {
  const ownedParcels = usePropertyStore((state) => state.ownedParcels);
  const boostEndTime = useEconomyStore((state) => state.boostEndTime);
  const isBoostActiveSelector = useEconomyStore((state) => state.isBoostActive);
  const extendBoost = useEconomyStore((state) => state.extendBoost);
  const getPendingRent = useEconomyStore((state) => state.getPendingRent);
  const settleFunds = useEconomyStore((state) => state.settleFunds);
  const reinvestFunds = useEconomyStore((state) => state.reinvestFunds);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [nowTime, setNowTime] = useState(0);

  const isBoostActive = isBoostActiveSelector(nowTime);
  const baseRate = useMemo(() => computeBaseRentRate(ownedParcels), [ownedParcels]);
  const totalRate = useMemo(
    () => computeRentRate(ownedParcels, boostEndTime),
    [boostEndTime, ownedParcels],
  );
  const boostMultiplier = useMemo(
    () => getBoostMultiplier(Object.keys(ownedParcels).length),
    [ownedParcels],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const updateRemaining = () => {
      const now = Date.now();
      setNowTime(now);
      setPendingAmount(getPendingRent(now));
      if (!boostEndTime) {
        setRemainingSeconds(0);
        return;
      }
      const remaining = Math.max(0, Math.floor((boostEndTime - now) / 1000));
      setRemainingSeconds(remaining);
    };
    updateRemaining();
    const interval = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(interval);
  }, [boostEndTime, isOpen, getPendingRent]);

  // Combined with updateRemaining above to avoid cascading renders
  /*
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setPendingAmount(getPendingRent(nowTime || Date.now()));
  }, [getPendingRent, isOpen, nowTime]);
  */

  const formatDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  if (!isOpen) {
    return null;
  }

  const handleSettle = () => {
    settleFunds();
    playCashRegister();
    onSettled();
    onClose();
  };

  const handleReinvest = () => {
    const success = reinvestFunds();
    if (!success) {
      console.info("Not enough pending rent to reinvest.");
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-end justify-center bg-black/40 px-4 pb-0 pt-0 backdrop-blur-[2px]">
      <div className="slide-up w-full max-w-[520px] rounded-t-[24px] bg-white px-6 py-7 text-left shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Current Yield Velocity
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            Close
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Yield Rate
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-slate-800">
            ${totalRate.toFixed(9)}/sec
          </p>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Pending Escrow
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[#00C805]">
            ${pendingAmount.toFixed(12)}
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-4 text-sm text-slate-600">
          <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
            <span>
              Ad Boost: {isBoostActive ? `ACTIVE (${boostMultiplier}x) ⚡` : "Inactive (1x)"}
            </span>
            {isBoostActive && (
              <span className="font-semibold text-emerald-600">
                {formatDuration(remainingSeconds)} remaining
              </span>
            )}
          </div>
          <div className="mt-3">
            {isBoostActive ? (
              <button
                type="button"
                onClick={extendBoost}
                className="w-full rounded-full bg-slate-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700"
              >
                Extend (+1 Hr)
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequestBoost}
                className="w-full rounded-full bg-[#00C805] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white"
              >
            {`Watch Ad (${boostMultiplier}x Multiplier)`}
              </button>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span>Base Rent</span>
            <span className="font-mono tabular-nums">${baseRate.toFixed(9)}/sec</span>
          </div>
          {isBoostActive && (
            <div className="mt-2 flex items-center justify-between text-emerald-600">
              <span>Boost Bonus</span>
              <span className="font-semibold">+{(boostMultiplier - 1) * 100}%</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between text-slate-500">
            <span>Badge Bonus</span>
            <span className="font-semibold">+0%</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-slate-800">
            <span className="font-semibold">Total Output</span>
            <span className="font-mono tabular-nums">${totalRate.toFixed(9)}/sec</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <svg viewBox="0 0 120 40" className="h-16 w-full text-slate-300">
            <path
              d="M2 30 L20 24 L35 26 L52 18 L68 16 L84 12 L100 8 L118 4"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={handleSettle}
            className="w-full rounded-full bg-[#1F2937] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg"
          >
            Settle to Wallet
          </button>
          <button
            type="button"
            onClick={handleReinvest}
            className="flex w-full items-center justify-between rounded-full border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700"
          >
            <span>Reinvest: Buy 25 Influence Bucks</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-700">
              20% Bonus
            </span>
          </button>
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Cost: $1.00 Rent
          </p>
        </div>
        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
