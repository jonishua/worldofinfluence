"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Fingerprint, X } from "lucide-react";

import { DropRarity, useGameStore } from "@/store/useGameStore";

const RARITY_VISUALS: Record<
  DropRarity,
  { label: string; accent: string; case: string; aura?: string }
> = {
  Common: {
    label: "Standard Issue",
    accent: "text-slate-400",
    case: "text-slate-400",
  },
  Rare: {
    label: "Secured Payload",
    accent: "text-amber-600",
    case: "text-amber-500",
  },
  Epic: {
    label: "Priority Vault",
    accent: "text-violet-600",
    case: "text-violet-500",
  },
  Legendary: {
    label: "Executive Vault",
    accent: "text-yellow-400",
    case: "text-yellow-400",
    aura: "supply-glow",
  },
};

type SupplyDropModalProps = {
  dropId: string | null;
  onClose: () => void;
};

export default function SupplyDropModal({ dropId, onClose }: SupplyDropModalProps) {
  const drops = useGameStore((state) => state.drops);
  const collectDrop = useGameStore((state) => state.collectDrop);
  const drop = useMemo(() => drops.find((item) => item.id === dropId), [drops, dropId]);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [reward, setReward] = useState<{ type: string; amount: number } | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!dropId) {
      return;
    }
    setProgress(0);
    setIsHolding(false);
    setReward(null);
  }, [dropId]);

  useEffect(() => {
    if (isHolding && !reward) {
      intervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 100;
          }
          if (navigator.vibrate) {
            if (prev > 80) {
              navigator.vibrate(40);
            } else if (prev % 10 === 0) {
              navigator.vibrate(10);
            }
          }
          return prev + 2;
        });
      }, 16);
    } else if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      if (!reward) {
        setProgress(0);
      }
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHolding, reward]);

  useEffect(() => {
    if (progress < 100 || reward || !dropId) {
      return;
    }
    setIsHolding(false);
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 200]);
    }
    setReward(collectDrop(dropId));
  }, [collectDrop, dropId, progress, reward]);

  if (!drop || (drop.collected && !reward)) {
    return null;
  }

  const style = RARITY_VISUALS[drop.rarity];
  const ringDash = 276;
  const ringOffset = ringDash - (ringDash * progress) / 100;

  return (
    <AnimatePresence>
      {dropId && (
        <motion.div
          className="fixed inset-0 z-[720] flex items-end justify-center bg-black/30 px-4 pb-0 pt-0 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="slide-up w-full max-w-[520px] rounded-t-[28px] border border-slate-100/60 bg-white px-6 pb-6 pt-6 shadow-[0_-16px_40px_rgba(15,23,42,0.22)]"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                {style.label} / {drop.rarity}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mb-10 flex justify-center">
              <div className={`relative ${style.aura ?? ""}`}>
                <div className={isHolding && progress < 100 ? "animate-shake" : ""}>
                  <Briefcase className={`h-28 w-28 ${style.case}`} strokeWidth={1.2} />
                </div>
              </div>

              {reward && (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/90 text-center backdrop-blur"
                >
                  <div className="font-mono text-3xl font-semibold text-[#00C805]">
                    +{reward.amount}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                    {reward.type}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex justify-center pb-4">
              {!reward ? (
                <div className="relative">
                  <svg className="h-24 w-24 -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="#e2e8f0"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="#00C805"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={ringDash}
                      strokeDashoffset={ringOffset}
                      className="transition-all duration-75 ease-linear"
                    />
                  </svg>
                  <button
                    type="button"
                    className="absolute inset-0 flex touch-none items-center justify-center text-slate-400 transition-all active:scale-95 active:text-[#00C805]"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.currentTarget.setPointerCapture(event.pointerId);
                      setIsHolding(true);
                    }}
                    onPointerUp={() => setIsHolding(false)}
                    onPointerCancel={() => setIsHolding(false)}
                    onLostPointerCapture={() => setIsHolding(false)}
                    onContextMenu={(event) => event.preventDefault()}
                  >
                    <Fingerprint className="h-12 w-12" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-slate-900 px-8 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-lg"
                >
                  Collect Assets
                </button>
              )}
            </div>

            <div className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Hold to verify biometric signature
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
