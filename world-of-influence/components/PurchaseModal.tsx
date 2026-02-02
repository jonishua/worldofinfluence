"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { 
  useEconomyStore, 
  useMapStore, 
  usePropertyStore,
  useGameStore,
  REMOTE_FILING_FEE_MULTIPLIER,
  DRONE_BUY_RADIUS_KM,
  calculateDistance,
  metersToKilometers
} from "@/store/useGameStore";

const PURCHASE_COST = 100;
const BASE_INTERACTION_RADIUS_METERS = 50;

const mintingSteps = [
  "Verifying GPS Coordinates...",
  "Securing Digital Deed...",
  "Minting Asset...",
];

const rarityConfig = {
  common: {
    label: "Common",
    title: "Standard Plot",
    multiplier: "1x",
    emoji: "🌱",
    tagClass: "bg-emerald-100 text-emerald-600",
    accentClass: "text-emerald-600",
  },
  rare: {
    label: "Rare",
    title: "Prime Plot",
    multiplier: "1.5x",
    emoji: "🌳",
    tagClass: "bg-blue-100 text-blue-600",
    accentClass: "text-blue-600",
  },
  epic: {
    label: "Epic",
    title: "Estate Plot",
    multiplier: "2x",
    emoji: "⛲",
    tagClass: "bg-violet-100 text-violet-600",
    accentClass: "text-violet-600",
  },
  legendary: {
    label: "Legendary",
    title: "Monument Plot",
    multiplier: "4x",
    emoji: "👑",
    tagClass: "bg-amber-100 text-amber-600",
    accentClass: "text-amber-600",
  },
} as const;

type Phase = "buy" | "minting" | "reveal";

export default function PurchaseModal() {
  const selectedParcel = useMapStore((state) => state.selectedParcel);
  const satelliteMode = useMapStore((state) => state.satelliteMode);
  const viewingMode = useMapStore((state) => state.viewingMode);
  const droneStatus = useMapStore((state) => state.droneStatus);
  const ownedParcels = usePropertyStore((state) => state.ownedParcels);
  const influenceBucks = useEconomyStore((state) => state.influenceBucks);
  const activeSubscriptions = useEconomyStore((state) => state.activeSubscriptions);
  const isMinting = usePropertyStore((state) => state.isMinting);
  const setIsMinting = usePropertyStore((state) => state.setIsMinting);
  const buyParcel = usePropertyStore((state) => state.buyParcel);
  const setSelectedParcel = useMapStore((state) => state.setSelectedParcel);
  const [phase, setPhase] = useState<Phase>("buy");
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mintedId, setMintedId] = useState<string | null>(null);
  const timeouts = useRef<number[]>([]);
  const lastRevealId = useRef<string | null>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiRainIntervalRef = useRef<number | null>(null);

  const isSubscriber = activeSubscriptions.length > 0;
  const isDroneView = satelliteMode && droneStatus === "active" && viewingMode === "drone";
  const applyRemoteFee = isDroneView && !isSubscriber;
  const remoteFee = applyRemoteFee ? Math.ceil(PURCHASE_COST * REMOTE_FILING_FEE_MULTIPLIER) : 0;
  const totalCost = PURCHASE_COST + remoteFee;

  const pickupRadiusMultiplier = useMapStore((state) => state.pickupRadiusMultiplier);
  const userLocation = useMapStore((state) => state.userLocation);
  const droneTetherCenter = useMapStore((state) => state.droneTetherCenter);

  const { isOutOfRange, distanceLabel } = useMemo(() => {
    if (!selectedParcel) return { isOutOfRange: false, distanceLabel: "" };

    const interactionRadiusKm = metersToKilometers(BASE_INTERACTION_RADIUS_METERS * pickupRadiusMultiplier);
    
    const isDroneView = satelliteMode && droneStatus === "active" && viewingMode === "drone";
    const origin = isDroneView ? droneTetherCenter : userLocation;

    if (!origin) return { isOutOfRange: true, distanceLabel: "Location error" };

    const dist = calculateDistance(origin, selectedParcel.center);
    const maxRadius = isDroneView ? DRONE_BUY_RADIUS_KM : interactionRadiusKm;
    
    const isOut = dist > maxRadius;
    const label = isDroneView 
      ? `${dist.toFixed(2)} / 0.50 mi`
      : `${(dist * 1000).toFixed(0)} / ${(interactionRadiusKm * 1000).toFixed(0)}m`;

    return { isOutOfRange: isOut, distanceLabel: label };
  }, [selectedParcel, satelliteMode, droneStatus, viewingMode, pickupRadiusMultiplier, userLocation, droneTetherCenter]);

  const isOwned = selectedParcel ? Boolean(ownedParcels[selectedParcel.id]) : false;

  useEffect(() => {
    if (!selectedParcel) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setPhase("buy");
      setStepIndex(0);
      setError(null);
      setMintedId(null);
      setIsMinting(false);
      timeouts.current.forEach((t) => window.clearTimeout(t));
      timeouts.current = [];
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [selectedParcel, setIsMinting]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, []);

  const handleClose = () => {
    if (confettiRainIntervalRef.current) {
      window.clearInterval(confettiRainIntervalRef.current);
      confettiRainIntervalRef.current = null;
    }
    setSelectedParcel(null);
  };

  const handlePurchase = () => {
    if (!selectedParcel || isOwned) {
      return;
    }

    if (isOutOfRange) {
      setError(isDroneView ? "Out of drone scouting range (0.5mi)." : "Target out of physical range.");
      return;
    }

    if (influenceBucks < totalCost) {
      setError("Insufficient Influence Bucks.");
      return;
    }

    setError(null);
    setPhase("minting");
    setIsMinting(true);
    setStepIndex(0);

    timeouts.current.push(
      window.setTimeout(() => setStepIndex(1), 1000),
      window.setTimeout(() => setStepIndex(2), 2000),
      window.setTimeout(() => {
        const purchased = buyParcel(selectedParcel, totalCost);
        setMintedId(purchased?.id ?? null);
        setPhase("reveal");
        setIsMinting(false);
      }, 2500),
    );
  };

  const resultParcel = useMemo(() => {
    if (!mintedId) {
      return null;
    }
    return ownedParcels[mintedId] ?? null;
  }, [mintedId, ownedParcels]);

  useEffect(() => {
    if (phase !== "reveal" || !resultParcel) {
      return;
    }
    if (lastRevealId.current === resultParcel.id) {
      return;
    }
    lastRevealId.current = resultParcel.id;
    const isLegendary = resultParcel.rarity === "legendary";
    const isEpic = resultParcel.rarity === "epic";
    if (isLegendary || isEpic) {
      const canvas = confettiCanvasRef.current;
      const shoot = canvas
        ? confetti.create(canvas, { resize: true, useWorker: true })
        : confetti;
      if (isLegendary) {
        if (confettiRainIntervalRef.current) {
          window.clearInterval(confettiRainIntervalRef.current);
        }
        const fireRain = (particleCount = 20, startVelocity = 20) =>
          shoot({
            particleCount,
            spread: 40,
            startVelocity,
            origin: { x: Math.random(), y: 0 },
            zIndex: 9999,
          });
        confettiRainIntervalRef.current = window.setInterval(fireRain, 350);
        fireRain(28, 28);
      }
      shoot({
        particleCount: isLegendary ? 140 : 90,
        spread: isLegendary ? 70 : 55,
        startVelocity: isLegendary ? 35 : 28,
        origin: { y: 0.65 },
        zIndex: 9999,
      });
    }
    if (navigator.vibrate) {
      navigator.vibrate(isLegendary ? [120, 60, 120, 60, 320] : 140);
    }
  }, [phase, resultParcel]);

  useEffect(() => {
    if (phase !== "reveal" || !selectedParcel) {
      if (confettiRainIntervalRef.current) {
        window.clearInterval(confettiRainIntervalRef.current);
        confettiRainIntervalRef.current = null;
      }
    }
  }, [phase, selectedParcel]);

  useEffect(() => {
    return () => {
      if (confettiRainIntervalRef.current) {
        window.clearInterval(confettiRainIntervalRef.current);
        confettiRainIntervalRef.current = null;
      }
    };
  }, []);

  if (!selectedParcel || isOwned || droneStatus === "targeting" || droneStatus === "deploying") {
    return null;
  }

  const rarity =
    resultParcel?.rarity && rarityConfig[resultParcel.rarity]
      ? rarityConfig[resultParcel.rarity]
      : null;

  return (
    <div className="fixed inset-0 z-[700] flex items-end justify-center bg-black/40 px-4 pb-0 pt-0 backdrop-blur-[2px]">
      <AnimatePresence mode="wait">
        {phase === "buy" && (
          <motion.div
            key="buy"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="slide-up w-full max-w-[520px] rounded-t-[24px] bg-[var(--card-bg)] px-6 py-8 text-center shadow-[0_-10px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl"
          >
            <div className="text-4xl">📍</div>
            <p className="mt-3 text-2xl font-extrabold text-[var(--text-primary)]">
              {isDroneView ? "Remote Acquisition" : "Acquire Parcel?"}
            </p>
            <div className="mt-4 space-y-2 rounded-xl bg-[var(--gray-surface)]/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Base Land Value</span>
                <span className="font-mono font-bold">{PURCHASE_COST} IB</span>
              </div>
              
              {isDroneView && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Remote Filing Fee</span>
                  <span className={`font-mono font-bold ${isSubscriber ? 'text-[#00C805]' : 'text-rose-500'}`}>
                    {isSubscriber ? '-0 IB' : `+${remoteFee} IB`}
                  </span>
                </div>
              )}

              {isDroneView && isSubscriber && (
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#00C805]">
                  <span>Explorer Pass Discount</span>
                  <span>-100% Fee</span>
                </div>
              )}

              <div className="border-t border-[var(--card-border)] pt-2">
                <div className="flex justify-between text-base font-bold">
                  <span>Total Cost</span>
                  <span className="font-mono text-[var(--accent-color)]">{totalCost} IB</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
              Coordinates: {selectedParcel.center.lat.toFixed(4)}, {selectedParcel.center.lng.toFixed(4)}
            </p>

            <div className={`mt-2 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isOutOfRange ? 'text-rose-500' : 'text-[var(--text-muted)]'}`}>
              <div className={`h-1.5 w-1.5 rounded-full ${isOutOfRange ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
              Range: {distanceLabel}
            </div>

            {applyRemoteFee && (
              <button className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#F59E0B] hover:underline">
                Waive fees with Explorer Pass
              </button>
            )}
            {error && (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handlePurchase}
              disabled={isMinting || isOutOfRange}
              className="mt-6 w-full rounded-[16px] bg-[var(--accent-color)] px-4 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_6px_16px_rgba(0,0,0,0.15)] transition disabled:opacity-60 disabled:bg-[var(--text-muted)]"
            >
              {isOutOfRange ? "Out of Range" : "Confirm Purchase"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full rounded-[16px] bg-[var(--gray-surface)] px-4 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {phase === "minting" && (
          <motion.div
            key="minting"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="slide-up w-full max-w-[520px] rounded-t-[24px] bg-[var(--card-bg)] px-6 py-8 text-center shadow-[0_-10px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl"
          >
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[var(--gray-surface)] border-t-[var(--accent-color)]" />
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 text-2xl font-extrabold text-[var(--text-primary)]"
            >
              {mintingSteps[stepIndex]}
            </motion.p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Securing your digital asset on the chain.
            </p>
          </motion.div>
        )}

        {phase === "reveal" && rarity && resultParcel && (
          <motion.div
            key="reveal"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="slide-up w-full max-w-[520px] rounded-t-[24px] bg-[var(--card-bg)] px-6 py-8 text-center shadow-[0_-10px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl"
          >
            <canvas
              ref={confettiCanvasRef}
              className="pointer-events-none absolute inset-0 z-20 h-full w-full"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden">
              {resultParcel.rarity === "legendary" && (
                <div className="legendary-glow" aria-hidden="true" />
              )}
              <div className="jackpot-burst" aria-hidden="true" />
              <motion.div
                initial={{ rotateY: 90, scale: 0.85, opacity: 0 }}
                animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.45, duration: 0.6 }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative z-10"
              >
                <span
                  className={`inline-block rounded-full px-4 py-1 text-xs font-extrabold uppercase tracking-[0.2em] ${rarity.tagClass}`}
                >
                  {rarity.label}
                </span>
                <p className="mt-4 text-2xl font-extrabold text-[var(--text-primary)]">
                  {rarity.title}
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Rent Multiplier: {rarity.multiplier}
                </p>
                <div className={`my-4 text-5xl ${rarity.accentClass}`}>
                  {rarity.emoji}
                </div>
                <div className="space-y-2 text-xs font-mono uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  <div>Feature: {resultParcel.visualFeature ?? "Lawn"}</div>
                  <div>
                    Rent: ${resultParcel.rentRate.toFixed(9)}/s
                  </div>
                </div>
              </motion.div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 w-full rounded-[16px] bg-[var(--accent-color)] px-4 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_6px_16px_rgba(0,0,0,0.15)]"
            >
              Add to Portfolio
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
