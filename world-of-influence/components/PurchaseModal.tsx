"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { useGameStore } from "@/store/useGameStore";

const PURCHASE_COST = 100;

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
  const selectedParcel = useGameStore((state) => state.selectedParcel);
  const ownedParcels = useGameStore((state) => state.ownedParcels);
  const influenceBucks = useGameStore((state) => state.influenceBucks);
  const isMinting = useGameStore((state) => state.isMinting);
  const setIsMinting = useGameStore((state) => state.setIsMinting);
  const buyParcel = useGameStore((state) => state.buyParcel);
  const setSelectedParcel = useGameStore((state) => state.setSelectedParcel);
  const [phase, setPhase] = useState<Phase>("buy");
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mintedId, setMintedId] = useState<string | null>(null);
  const timeouts = useRef<number[]>([]);
  const lastRevealId = useRef<string | null>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiRainIntervalRef = useRef<number | null>(null);

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
    if (influenceBucks < PURCHASE_COST) {
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
        const purchased = buyParcel(selectedParcel, PURCHASE_COST);
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

  if (!selectedParcel || isOwned) {
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
            className="slide-up w-full max-w-[520px] rounded-t-[24px] bg-white px-6 py-8 text-center shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
          >
            <div className="text-4xl">📍</div>
            <p className="mt-3 text-2xl font-extrabold text-[var(--text-primary)]">
              Acquire Parcel?
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Coordinates:{" "}
              <span className="font-mono">
                {selectedParcel.center.lat.toFixed(4)}, {selectedParcel.center.lng.toFixed(4)}
              </span>
              <br />
              Price: <strong>{PURCHASE_COST} Influence Bucks</strong>
            </p>
            {error && (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handlePurchase}
              disabled={isMinting}
              className="mt-6 w-full rounded-[16px] bg-[var(--text-primary)] px-4 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_6px_16px_rgba(0,0,0,0.15)] transition disabled:opacity-60"
            >
              Confirm Purchase
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full rounded-[16px] bg-slate-100 px-4 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]"
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
            className="slide-up w-full max-w-[520px] rounded-t-[24px] bg-white px-6 py-8 text-center shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
          >
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--accent-color)]" />
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 text-2xl font-extrabold text-[var(--text-primary)]"
            >
              {mintingSteps[stepIndex]}
            </motion.p>
            <p className="mt-2 text-sm text-slate-500">
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
            className="slide-up w-full max-w-[520px] rounded-t-[24px] bg-white px-6 py-8 text-center shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
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
                <p className="mt-2 text-sm text-slate-500">
                  Rent Multiplier: {rarity.multiplier}
                </p>
                <div className={`my-4 text-5xl ${rarity.accentClass}`}>
                  {rarity.emoji}
                </div>
                <div className="space-y-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
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
              className="mt-6 w-full rounded-[16px] bg-[var(--text-primary)] px-4 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_6px_16px_rgba(0,0,0,0.15)]"
            >
              Add to Portfolio
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
