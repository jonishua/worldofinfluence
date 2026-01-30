"use client";

import { FileText, HardHat, Landmark, Shield, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { getBoostMultiplier, useGameStore } from "@/store/useGameStore";

const rarityLabel = {
  common: { label: "Common", multiplier: "1.0x" },
  rare: { label: "Rare", multiplier: "1.5x" },
  epic: { label: "Epic", multiplier: "2.0x" },
  legendary: { label: "Legendary", multiplier: "4.0x" },
} as const;

const nextRarityMap = {
  common: "rare",
  rare: "epic",
  epic: "legendary",
  legendary: null,
} as const;

export default function PropertySheet() {
  const selectedParcel = useGameStore((state) => state.selectedParcel);
  const ownedParcels = useGameStore((state) => state.ownedParcels);
  const influenceBucks = useGameStore((state) => state.influenceBucks);
  const zoningPermits = useGameStore((state) => state.zoningPermits);
  const boostEndTime = useGameStore((state) => state.boostEndTime);
  const isBoostActiveSelector = useGameStore((state) => state.isBoostActive);
  const extendBoost = useGameStore((state) => state.extendBoost);
  const upgradeParcel = useGameStore((state) => state.upgradeParcel);
  const setSelectedParcel = useGameStore((state) => state.setSelectedParcel);
  const [nowTime, setNowTime] = useState(Date.now());
  const [renovationStatus, setRenovationStatus] = useState<
    "idle" | "demolish" | "build" | "reveal"
  >("idle");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timeouts = useRef<number[]>([]);

  const parcel = selectedParcel ? ownedParcels[selectedParcel.id] : null;

  useEffect(() => {
    if (!parcel) {
      return;
    }
    const interval = window.setInterval(() => setNowTime(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [parcel]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach((timeout) => window.clearTimeout(timeout));
      timeouts.current = [];
    };
  }, []);

  const lifetimeRent = useMemo(() => {
    if (!parcel) {
      return 0;
    }
    const elapsedSeconds = Math.max(0, (nowTime - parcel.purchaseTime) / 1000);
    return elapsedSeconds * parcel.rentRate;
  }, [nowTime, parcel]);

  const isBoostActive = useMemo(
    () => isBoostActiveSelector(nowTime || Date.now()),
    [isBoostActiveSelector, nowTime],
  );
  const boostMultiplier = useMemo(
    () => getBoostMultiplier(Object.keys(ownedParcels).length),
    [ownedParcels],
  );

  if (!parcel) {
    return null;
  }

  const currentRarity = rarityLabel[parcel.rarity];
  const nextRarityId = nextRarityMap[parcel.rarity];
  const nextRarity = nextRarityId ? rarityLabel[nextRarityId] : null;
  const canUpgrade = Boolean(nextRarity) && influenceBucks >= 250 && zoningPermits >= 1;
  const needsCash = influenceBucks < 250;
  const needsPermit = zoningPermits < 1;
  const missingText = [
    needsCash ? "250 Influence Bucks" : null,
    needsPermit ? "1 Permit" : null,
  ]
    .filter(Boolean)
    .join(" + ");

  const handleClose = () => {
    timeouts.current.forEach((timeout) => window.clearTimeout(timeout));
    timeouts.current = [];
    setRenovationStatus("idle");
    setSelectedParcel(null);
  };

  const handleUpgrade = () => {
    if (!canUpgrade || renovationStatus !== "idle") {
      return;
    }
    setRenovationStatus("demolish");
    timeouts.current.push(
      window.setTimeout(() => setRenovationStatus("build"), 1000),
      window.setTimeout(() => setRenovationStatus("reveal"), 2000),
      window.setTimeout(() => {
        const result = upgradeParcel(parcel.id);
        if (result.success) {
          setToastMessage("+50% Rent Boost Applied!");
        }
      }, 2500),
      window.setTimeout(() => {
        setRenovationStatus("idle");
        setToastMessage(null);
      }, 3500),
    );
  };

  const handleBoost = () => {
    if (isBoostActive || renovationStatus !== "idle") {
      return;
    }
    extendBoost();
    setToastMessage("Property Boost Activated");
    timeouts.current.push(
      window.setTimeout(() => {
        setToastMessage(null);
      }, 2000),
    );
  };

  const isWorking = renovationStatus === "demolish" || renovationStatus === "build";

  return (
    <div className="fixed inset-0 z-[720] flex items-end justify-center bg-black/40 px-4 pb-0 pt-0 backdrop-blur-[2px]">
      <motion.div
        animate={isWorking ? { x: [-2, 2, -2, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.6, repeat: isWorking ? Infinity : 0 }}
        className="slide-up relative w-full max-w-[520px] overflow-hidden rounded-t-[24px] bg-white px-6 py-7 text-left shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
      >
        {renovationStatus === "reveal" && (
          <div className="absolute inset-0 z-10 animate-fade-flash bg-white/80" />
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Property Performance
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">Parcel {parcel.id}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-500"
            aria-label="Close property details"
          >
            ×
          </button>
        </div>

        {renovationStatus !== "idle" ? (
          <div className="mt-6 flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-inner">
              {renovationStatus === "demolish" && <HardHat className="h-8 w-8" />}
              {renovationStatus === "build" && <Wrench className="h-8 w-8" />}
              {renovationStatus === "reveal" && <Shield className="h-8 w-8" />}
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {renovationStatus === "demolish" && "Breaking Ground..."}
              {renovationStatus === "build" && "Installing Upgrades..."}
              {renovationStatus === "reveal" && "Renovation Complete"}
            </p>
          </div>
        ) : (
          <>
        <div className="mt-4 flex items-center gap-3">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {currentRarity.label}
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Tier {parcel.level}
          </span>
        </div>

        <div className="mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Lifetime Rent Earned
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[#00C805]">
            ${lifetimeRent.toFixed(12)}
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Property Boost
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-700">
                {isBoostActive
                  ? `Active (${boostMultiplier}x)`
                  : `Inactive (${boostMultiplier}x)`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleBoost}
              disabled={isBoostActive}
              className={`rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                isBoostActive
                  ? "cursor-not-allowed bg-[#39FF14]/20 text-[#39FF14]"
                  : "bg-[#39FF14] text-slate-900 shadow-[0_8px_20px_rgba(57,255,20,0.35)]"
              }`}
            >
              {isBoostActive ? "Boosted" : "Boost"}
            </button>
          </div>
          {boostEndTime && isBoostActive && (
            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-emerald-600">
              Boosting output
            </p>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <svg viewBox="0 0 120 40" className="h-16 w-full text-emerald-300">
            <path
              d="M2 32 L18 28 L30 30 L48 20 L62 18 L78 12 L98 8 L118 6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4 text-sm text-slate-600">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Renovation
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span>Current Tier</span>
            <span className="font-semibold text-slate-800">
              {currentRarity.label} ({currentRarity.multiplier})
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Upgrade Offer</span>
            <span className="font-semibold text-slate-800">
              {nextRarity ? `${nextRarity.label} (${nextRarity.multiplier})` : "Maxed"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
            <span>Cost</span>
            <span className="flex items-center gap-3 text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-1">
                <Landmark className="h-4 w-4 text-amber-500" />
                250
              </span>
              <span className="text-slate-400">+</span>
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4 text-emerald-500" />
                1
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={!canUpgrade}
            className="mt-4 w-full rounded-full bg-[#1F2937] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:opacity-100"
          >
            Renovate (250 Bucks + 1 Permit)
          </button>
          {!canUpgrade && missingText && (
            <p className="mt-2 text-center text-[10px] uppercase tracking-[0.18em] text-rose-500">
              Missing {missingText}
            </p>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="mt-3 w-full rounded-full bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700"
          >
            Close
          </button>
          {!nextRarity && (
            <p className="mt-2 text-center text-[10px] uppercase tracking-[0.18em] text-slate-400">
              Legendary tier reached
            </p>
          )}
        </div>
          </>
        )}
        {toastMessage && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="rounded-full bg-[#39FF14] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-[0_12px_30px_rgba(57,255,20,0.35)]">
              {toastMessage}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
