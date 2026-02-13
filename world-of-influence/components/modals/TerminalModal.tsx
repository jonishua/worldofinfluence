"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Play } from "lucide-react";
import confetti from "canvas-confetti";
import { IBIcon } from "@/components/hud/IBIcon";
import { useEconomyStore, useGameStore } from "@/store/useGameStore";
import { calculateSpinResult, getWinTierForResult } from "@/lib/slotsLogic";
import type { SlotResult, WinTier } from "@/types/slots";
import Reel from "@/components/slots/Reel";

type TerminalModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const REEL_STOP_DELAYS = [1500, 2000, 2500]; // ms delays for each reel

export default function TerminalModal({ isOpen, onClose }: TerminalModalProps) {
  const credits = useEconomyStore((state) => state.credits);
  const addCredits = useEconomyStore((state) => state.addCredits);
  const addInfluenceBucks = useEconomyStore((state) => state.addInfluenceBucks);
  const addZoningPermits = useEconomyStore((state) => state.addZoningPermits);

  const [isSpinning, setIsSpinning] = useState(false);
  const isSpinningRef = useRef(isSpinning);
  
  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  const [spinResult, setSpinResult] = useState<SlotResult | null>(null);
  
  // Use a ref to ensure we only initialize once
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && !spinResult) {
      setTimeout(() => setSpinResult(calculateSpinResult()), 0);
      initializedRef.current = true;
    }
  }, [spinResult]);

  const [autoSpin, setAutoSpin] = useState(false);
  const autoSpinRef = useRef(autoSpin);

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  const [betMultiplier, setBetMultiplier] = useState(1);
  const betMultiplierRef = useRef(betMultiplier);

  useEffect(() => {
    betMultiplierRef.current = betMultiplier;
  }, [betMultiplier]);

  const [, setReelsStopped] = useState([false, false, false]);
  const [winTier, setWinTier] = useState<WinTier | null>(null);
  const [showWinDisplay, setShowWinDisplay] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const autoSpinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSpinDelayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const multipliers = [1, 5, 10];

  // Trigger haptic feedback
  const triggerHaptic = useCallback((pattern: number[]) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const celebrateWin = useCallback(
    (tier: WinTier) => {
      if (tier === "miss") {
        return;
      }

      if (tier === "low" || tier === "mid") {
        // Low/Mid Win: Flash green, small confetti, triple tap haptic
        triggerHaptic([50, 50, 50]);
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#00C805", "#39FF14"],
        });
      } else if (tier === "high" || tier === "jackpot" || tier === "lucky") {
        // High/Jackpot Win: Screen shake, large confetti, celebration haptic
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        triggerHaptic([200, 100, 200, 100, 200]);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#00C805", "#39FF14"],
        });
      }
    },
    [triggerHaptic]
  );

  // Handle spin action
  const handleSpin = useCallback(() => {
    // Get latest state to avoid stale closures
    const currentCredits = useGameStore.getState().credits;
    const currentIsSpinning = isSpinningRef.current;
    const currentMultiplier = betMultiplierRef.current;
    
    if (currentIsSpinning || currentCredits < currentMultiplier) {
      return;
    }

    // Clear any existing auto-spin timeout
    if (autoSpinTimeoutRef.current) {
      clearTimeout(autoSpinTimeoutRef.current);
      autoSpinTimeoutRef.current = null;
    }

    // Deduct credits based on multiplier
    addCredits(-currentMultiplier);

    // Calculate result BEFORE animation
    const result = calculateSpinResult();
    setSpinResult(result);
    setReelsStopped([false, false, false]);
    setWinTier(null);
    setShowWinDisplay(false);
    setIsShaking(false);
    setIsSpinning(true);
    isSpinningRef.current = true;
  }, [addCredits]);

  // Auto-spin trigger when toggled ON
  useEffect(() => {
    // Only trigger a new spin if auto-spin was just turned on and we are idle
    if (autoSpin && !isSpinning && isOpen && credits >= betMultiplier && !autoSpinTimeoutRef.current) {
      setTimeout(() => handleSpin(), 0);
    }
  }, [autoSpin, isOpen, credits, betMultiplier, isSpinning, handleSpin]); // Added missing dependencies

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsSpinning(false);
        isSpinningRef.current = false;
        // We no longer clear spinResult here so it persists
        setReelsStopped([false, false, false]);
        setWinTier(null);
        setShowWinDisplay(false);
        setAutoSpin(false);
        autoSpinRef.current = false;
        setBetMultiplier(1);
        betMultiplierRef.current = 1;
        setIsShaking(false);
      }, 0);
      
      if (autoSpinTimeoutRef.current) clearTimeout(autoSpinTimeoutRef.current);
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
      if (autoSpinDelayTimeoutRef.current) clearTimeout(autoSpinDelayTimeoutRef.current);
      
      autoSpinTimeoutRef.current = null;
      resultTimeoutRef.current = null;
      autoSpinDelayTimeoutRef.current = null;
    }
  }, [isOpen]);


  // Handle reel stop callbacks
  const handleReelStop = useCallback(
    (reelIndex: number) => {
      setReelsStopped((prev) => {
        const updated = [...prev];
        updated[reelIndex] = true;
        return updated;
      });

      // Check for near-miss on reel 2 stop
      if (reelIndex === 1 && spinResult?.isNearMiss) {
        triggerHaptic([100, 50, 100]); // Continuous tension haptic
      }

      // All reels stopped - show result
      if (reelIndex === 2) {
        resultTimeoutRef.current = setTimeout(() => {
          if (spinResult) {
            const tier = getWinTierForResult(spinResult);
            setWinTier(tier);
            setShowWinDisplay(true);
            celebrateWin(tier);

            // Award rewards scaled by multiplier
            const currentMultiplier = betMultiplierRef.current;
            const scaledAmount = spinResult.reward.amount * currentMultiplier;
            if (spinResult.reward.type === "InfluenceBucks") {
              addInfluenceBucks(scaledAmount);
            } else if (spinResult.reward.type === "ZoningPermits") {
              addZoningPermits(scaledAmount);
            } else if (spinResult.reward.type === "Credits") {
              addCredits(scaledAmount);
            }

            // Auto-spin logic - check credits after rewards are added
            autoSpinDelayTimeoutRef.current = setTimeout(() => {
              const updatedCredits = useGameStore.getState().credits;
              setIsSpinning(false); // Always reset spinning state first
              isSpinningRef.current = false;
              
              if (autoSpinRef.current && updatedCredits >= currentMultiplier) {
                autoSpinTimeoutRef.current = setTimeout(() => {
                  handleSpin();
                }, 2000);
              } else {
                if (updatedCredits < currentMultiplier) {
                  setAutoSpin(false); // Disable auto-spin if no credits
                  autoSpinRef.current = false;
                }
              }
            }, 100);
          }
        }, 500);
      }
    },
    [spinResult, celebrateWin, triggerHaptic, addInfluenceBucks, addZoningPermits, addCredits, handleSpin]
  );

  const onStop0 = useCallback(() => handleReelStop(0), [handleReelStop]);
  const onStop1 = useCallback(() => handleReelStop(1), [handleReelStop]);
  const onStop2 = useCallback(() => handleReelStop(2), [handleReelStop]);

  const canSpin = !isSpinning && credits >= betMultiplier;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[720] flex items-end justify-center bg-black/40 px-4 pb-0 pt-0 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSpinning) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ 
              y: 0,
              x: isShaking ? [0, -10, 10, -10, 10, -5, 5, 0] : 0,
            }}
            exit={{ y: "100%" }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              x: { duration: 0.5 }
            }}
            className="slide-up w-full max-w-[520px] rounded-t-[28px] border border-white/20 bg-gradient-to-b from-[#1F2937] to-[#111827] px-6 pb-8 pt-6 shadow-[0_-16px_40px_rgba(15,23,42,0.22)]"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-center flex-1">
                <h2 className="text-lg font-semibold uppercase tracking-[0.2em] text-white">
                  THE TERMINAL
                </h2>
                <div className="mt-1 text-xs font-mono tabular-nums text-[#00C805]">
                  CREDITS: {credits.toFixed(0)}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSpinning}
                className="rounded-full border border-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Machine Center - Three Reels */}
            <div className="relative mb-4 flex items-center justify-center gap-4">
              {/* Payline Indicator */}
              <div className="absolute left-1/2 top-1/2 z-10 h-[2px] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 bg-[#00C805]/50" />

              {/* Reels */}
              {spinResult && (
                <>
                  <Reel
                    targetSymbol={spinResult.reels[0]}
                    isSpinning={isSpinning}
                    stopDelay={REEL_STOP_DELAYS[0]}
                    onStop={onStop0}
                    isNearMiss={false}
                    isWinner={winTier !== null && winTier !== "miss"}
                  />
                  <Reel
                    targetSymbol={spinResult.reels[1]}
                    isSpinning={isSpinning}
                    stopDelay={REEL_STOP_DELAYS[1]}
                    onStop={onStop1}
                    isNearMiss={false}
                    isWinner={winTier !== null && winTier !== "miss"}
                  />
                  <Reel
                    targetSymbol={spinResult.reels[2]}
                    isSpinning={isSpinning}
                    stopDelay={REEL_STOP_DELAYS[2]}
                    onStop={onStop2}
                    isNearMiss={spinResult.isNearMiss}
                    isWinner={winTier !== null && winTier !== "miss"}
                  />
                </>
              )}

              {/* Win Flash Effect */}
              {showWinDisplay && winTier && winTier !== "miss" && (
                <motion.div
                  className="absolute inset-0 rounded-[12px] border-2 border-[#00C805]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                />
              )}
            </div>

            {/* Win Display Area - Moved below reels */}
            <div className="h-16 mb-4 flex flex-col items-center justify-center">
              <AnimatePresence>
                {showWinDisplay && spinResult && winTier && winTier !== "miss" && (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.6, opacity: 0, y: 10 }}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    <div className="flex items-center justify-center gap-2 font-mono text-3xl font-semibold tabular-nums text-[#00C805]">
                      +{(spinResult.reward.amount * betMultiplier).toFixed(0)}
                      {spinResult.reward.type === "InfluenceBucks" && (
                        <IBIcon size={24} className="text-[#00C805]" />
                      )}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                      {spinResult.reward.type === "InfluenceBucks"
                        ? "INFLUENCE BUCKS"
                        : spinResult.reward.type === "ZoningPermits"
                          ? "ZONING PERMITS"
                          : "CREDITS"}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bet Multiplier Selector */}
            <div className="mb-6 flex items-center justify-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">STAKE</span>
              <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
                {multipliers.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setBetMultiplier(m)}
                    disabled={isSpinning}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      betMultiplier === m
                        ? "bg-[#00C805] text-white shadow-[0_0_10px_rgba(0,200,5,0.3)]"
                        : "text-white/60 hover:bg-white/10"
                    } disabled:opacity-50`}
                  >
                    {m}x
                  </button>
                ))}
              </div>
            </div>

            {/* Controls Bottom */}
            <div className="space-y-4">
              {/* Spin Button */}
              <button
                type="button"
                onClick={handleSpin}
                disabled={!canSpin}
                className={`w-full rounded-[14px] px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] transition-all ${
                  canSpin
                    ? "bg-[#00C805] text-white shadow-[0_0_20px_rgba(0,200,5,0.5)] active:scale-95"
                    : "bg-[var(--gray-surface)]/50 text-[var(--text-muted)] cursor-not-allowed"
                }`}
              >
                {isSpinning ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    EXECUTING...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Play className="h-4 w-4" />
                    EXECUTE TRADE ({betMultiplier} {betMultiplier === 1 ? "CREDIT" : "CREDITS"})
                  </span>
                )}
              </button>

              {/* Auto-Spin Toggle */}
              <div className="flex items-center justify-center gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                  AUTO-SPIN
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const nextValue = !autoSpin;
                    setAutoSpin(nextValue);
                    autoSpinRef.current = nextValue;
                    if (!nextValue && autoSpinTimeoutRef.current) {
                      clearTimeout(autoSpinTimeoutRef.current);
                      autoSpinTimeoutRef.current = null;
                    }
                  }}
                  disabled={isSpinning || credits < 1}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    autoSpin ? "bg-[#00C805]" : "bg-slate-600"
                  } disabled:opacity-50`}
                >
                  <motion.div
                    className="absolute top-1 h-4 w-4 rounded-full bg-[var(--card-bg)]"
                    animate={{ x: autoSpin ? 20 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
