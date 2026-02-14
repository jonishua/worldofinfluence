"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Play, Target, Heart, TrendingUp } from "lucide-react";
import confetti from "canvas-confetti";
import { useEconomyStore } from "@/store/useGameStore";

type MarketSniperProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MAX_LEVELS = 10;
const INITIAL_SPEED = 2; // Base speed in pixels per frame (at 60fps)
const SPEED_INCREMENT = 1.15; // 15% increase per level

const FEEDBACK_MESSAGES = ["NICE!", "GOOD SALE!", "KILLING IT!", "CRUSHED IT!", "PERFECT!"];

export default function MarketSniper({ isOpen, onClose }: MarketSniperProps) {
  const credits = useEconomyStore((state) => state.credits);
  const addCredits = useEconomyStore((state) => state.addCredits);
  const addInkCash = useEconomyStore((state) => state.addInkCash);

  // Game State
  const [gameState, setGameState] = useState<"idle" | "countdown" | "playing" | "success" | "gameOver" | "roundWon">("idle");
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [countdown, setCountdown] = useState(3);
  const [linePosition, setLinePosition] = useState(0); // 0 to 100 (%)
  const [profitZoneCenter, setProfitZoneCenter] = useState(90);
  const [profitZoneSize, setProfitZoneSize] = useState(15);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [isButtonTapped, setIsButtonTapped] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [, setShowPayout] = useState(false);
  const [tapLine, setTapLine] = useState<{ position: number; id: number } | null>(null);
  const tapLineIdRef = useRef(0);

  const requestRef = useRef<number | undefined>(undefined);
  const lineDirectionRef = useRef<1 | -1>(1); // 1 for up, -1 for down
  const lastTimeRef = useRef<number | undefined>(undefined);
  const linePositionRef = useRef(0);
  const gameStateRef = useRef<"idle" | "countdown" | "playing" | "success" | "gameOver" | "roundWon">("idle");

  // Sync refs with state for logic checks
  useEffect(() => {
    linePositionRef.current = linePosition;
  }, [linePosition]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // SFX and Haptics Helpers
  const triggerHaptic = (pattern: number[]) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const playSFX = (type: "success" | "miss" | "win" | "heartbeat") => {
    // SFX Implementation placeholder
    console.log(`SFX: ${type}`);
  };

  const getRandomZoneCenter = () => {
    // Random position between 30% and 90%
    return Math.floor(Math.random() * (90 - 30 + 1)) + 30;
  };

  const startGame = () => {
    if (credits < 1) return; // Costs 1 credit to play
    addCredits(-1);
    setLevel(1);
    setLives(3);
    setProfitZoneCenter(90); // Start at top for training
    setProfitZoneSize(15);
    setGameState("countdown");
    setCountdown(3);
  };

  // Countdown logic (defer transition to avoid setState-synchronously-in-effect lint)
  useEffect(() => {
    if (gameState === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "countdown" && countdown === 0) {
      const t = setTimeout(() => {
        setGameState("playing");
        setLinePosition(0);
        lineDirectionRef.current = 1;
      }, 0);
      return () => clearTimeout(t);
    }
  }, [gameState, countdown]);

  // Animation logic (ref pattern to avoid "accessed before declaration" in effect)
  const animateRef = useRef<(time: number) => void>(() => {});
  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      const baseSpeed = INITIAL_SPEED * Math.pow(SPEED_INCREMENT, level - 1);
      
      // Add "volatility": speed fluctuates slightly based on a sine wave + random noise
      const volatility = 1 + (Math.sin(time / 200) * 0.2) + (Math.random() * 0.1);
      const actualSpeed = baseSpeed * volatility;
      
      setLinePosition((prev) => {
        let next = prev + (actualSpeed * lineDirectionRef.current * (deltaTime / 16.67));
        
        if (next >= 100) {
          next = 100;
          lineDirectionRef.current = -1;
        } else if (next <= 0) {
          next = 0;
          lineDirectionRef.current = 1;
        }
        return next;
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame((t) => animateRef.current(t));
  }, [level]);

  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  useEffect(() => {
    if (gameState === "playing") {
      requestRef.current = requestAnimationFrame((t) => animateRef.current(t));
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = undefined;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  const handleSell = () => {
    const currentGameState = gameStateRef.current;
    
    if (currentGameState !== "playing") {
      console.log(`SELL REJECTED: GameState is ${currentGameState}`);
      return;
    }

    // Visual feedback for button tap
    setIsButtonTapped(true);
    setTimeout(() => setIsButtonTapped(false), 150);

    const halfSize = profitZoneSize / 2;
    const min = profitZoneCenter - halfSize;
    const max = profitZoneCenter + halfSize;
    
    // Use Ref for current position to avoid state lag unresponsiveness
    const currentPos = linePositionRef.current;
    const isInZone = currentPos >= min && currentPos <= max;

    console.log(`SELL REGISTERED: pos=${currentPos.toFixed(2)}% zone=[${min.toFixed(2)}% - ${max.toFixed(2)}%] inZone=${isInZone}`);

    // Add tap line indicator for debugging and feedback (use ref for id to avoid impure Date.now() in handler)
    tapLineIdRef.current += 1;
    setTapLine({ position: currentPos, id: tapLineIdRef.current });
    setTimeout(() => setTapLine(null), 800);

    if (isInZone) {
      // Success
      triggerHaptic([50, 50, 50]);
      playSFX("success");
      
      // Feedback text (defer random to avoid impure-call-during-render lint)
      setTimeout(() => {
        const msg = FEEDBACK_MESSAGES[Math.floor(Math.random() * FEEDBACK_MESSAGES.length)];
        setFeedbackText(msg);
        setTimeout(() => setFeedbackText(null), 800);
      }, 0);
      
      if (level < MAX_LEVELS) {
        // Move to next level with delay
        setTimeout(() => {
          setLevel((prev) => prev + 1);
          setProfitZoneCenter(getRandomZoneCenter());
          setProfitZoneSize(level + 1 <= 3 ? 15 : 10); // Levels 1-3 are larger (15%), 4+ are 10%
          setLinePosition(0);
          lineDirectionRef.current = 1;
        }, 300);
      } else {
        // Round won!
        setGameState("roundWon");
        completeGame();
      }
    } else {
      // Miss
      triggerHaptic([100, 50, 100]);
      playSFX("miss");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      
      const nextLives = lives - 1;
      setLives(nextLives);
      
      if (nextLives <= 0) {
        setGameState("gameOver");
      } else {
        // Reset line for current level
        setLinePosition(0);
        lineDirectionRef.current = 1;
      }
    }
  };

  const completeGame = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#00C805", "#39FF14", "#FFFFFF"],
      zIndex: 10000,
    });
    addInkCash(3); // Reward is 3 INK Cash
    setShowPayout(true);
  };

  const resetToIdle = () => {
    setGameState("idle");
    setLevel(1);
    setLives(3);
    setShowPayout(false);
  };

  // Heartbeat haptic/visual logic
  useEffect(() => {
    if (gameState !== "playing") return;

    const baseInterval = 800;
    const interval = baseInterval / Math.pow(1.1, level - 1); // Get faster with level
    
    const heartbeatTimer = setInterval(() => {
      triggerHaptic([40]);
      playSFX("heartbeat");
    }, interval);

    return () => clearInterval(heartbeatTimer);
  }, [gameState, level]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[720] flex items-end justify-center bg-black/40 px-4 pb-0 pt-0 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && gameState === "idle") {
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
            className="w-full max-w-[520px] rounded-t-[28px] border border-white/20 bg-gradient-to-b from-[#1F2937] to-[#111827] px-6 pb-8 pt-6 shadow-[0_-16px_40px_rgba(15,23,42,0.22)] overflow-hidden"
          >
            {/* CRT Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold uppercase tracking-[0.2em] text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#00C805]" />
                  MARKET SNIPER
                </h2>
                <div className="mt-1 text-[10px] font-mono tabular-nums text-[var(--text-muted)] uppercase tracking-widest">
                  Live Exchange • Level {level}/{MAX_LEVELS}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={gameState !== "idle" && gameState !== "gameOver" && gameState !== "roundWon"}
                className="rounded-full border border-white/20 p-2 text-white/60 hover:bg-white/5 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Game Screen */}
            <div className="relative aspect-[4/3] w-full bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden mb-6 flex flex-col items-center justify-center">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
              
              {gameState === "idle" && (
                <div className="z-10 flex flex-col items-center gap-4 text-center px-8">
                  <div className="h-16 w-16 rounded-2xl bg-[#00C805]/10 flex items-center justify-center mb-2">
                    <TrendingUp className="h-8 w-8 text-[#00C805]" />
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">Prepare to Trade</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Time your SELL order in the <span className="text-[#00C805] font-bold">PROFIT ZONE</span>. 
                    Speed increases each level. 3 misses and you&apos;re liquidated.
                  </p>
                  <button
                    onClick={startGame}
                    className="mt-2 flex items-center gap-2 rounded-xl bg-[#00C805] px-8 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(0,200,5,0.4)] active:scale-95 transition-all"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    START TRADING (1 CREDIT)
                  </button>
                </div>
              )}

              {gameState === "countdown" && (
                <motion.div 
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="z-10 text-7xl font-black text-[#00C805] font-mono"
                >
                  {countdown}
                </motion.div>
              )}

              {gameState === "playing" && (
                <>
                  {/* Background Dim Graph (Narrative Spike) */}
                  <div 
                    className="absolute w-full pointer-events-none opacity-20 z-0"
                    style={{ 
                      bottom: `${profitZoneCenter - 15}%`,
                      height: "30%"
                    }}
                  >
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path 
                        d="M 0 100 L 20 95 L 40 100 L 50 20 L 60 100 L 80 95 L 100 100" 
                        stroke="#00C805" 
                        fill="rgba(0,200,5,0.1)" 
                        strokeWidth="1"
                      />
                    </svg>
                  </div>

                  {/* Profit Zone */}
                  <div 
                    className="absolute w-full bg-[#00C805]/20 border-y border-[#00C805]/50 flex items-center justify-center z-10"
                    style={{ 
                      bottom: `${profitZoneCenter - profitZoneSize / 2}%`, 
                      height: `${profitZoneSize}%` 
                    }}
                  >
                    <span className="text-[10px] font-bold text-[#00C805] uppercase tracking-widest animate-pulse">
                      Profit Zone
                    </span>
                  </div>

                  {/* Feedback Overlay */}
                  <AnimatePresence>
                    {feedbackText && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 20 }}
                        animate={{ scale: 1.5, opacity: 1, y: 0 }}
                        exit={{ scale: 2, opacity: 0, y: -20 }}
                        className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                      >
                        <span className="text-4xl font-black text-[#00C805] drop-shadow-[0_0_10px_rgba(0,200,5,0.8)] italic">
                          {feedbackText}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Price Line */}
                  <motion.div 
                    className="absolute w-full h-[2px] bg-white shadow-[0_0_10px_#fff] z-20"
                    style={{ bottom: `${linePosition}%` }}
                  >
                    <div className="absolute right-0 -top-2 bg-white text-slate-900 text-[8px] font-bold px-1 rounded">
                      PRICE
                    </div>
                  </motion.div>

                  {/* Tap Line (Debug/Feedback) */}
                  <AnimatePresence>
                    {tapLine && (
                      <motion.div
                        key={tapLine.id}
                        initial={{ opacity: 1, scaleX: 0 }}
                        animate={{ opacity: 0, scaleX: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute w-full h-[1px] bg-white/40 z-10 pointer-events-none"
                        style={{ bottom: `${tapLine.position}%` }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Indicators */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Lives</div>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <Heart 
                          key={i} 
                          className={`h-4 w-4 ${i < lives ? "text-red-500 fill-red-500" : "text-white/10"}`} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4 z-10 text-right">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Level</div>
                    <div className="text-xl font-mono font-bold text-white">{level}/{MAX_LEVELS}</div>
                  </div>
                </>
              )}

              {(gameState === "gameOver" || gameState === "roundWon") && (
                <div className="z-10 flex flex-col items-center gap-4 text-center">
                  <h3 className={`text-3xl font-black uppercase tracking-tighter ${gameState === "roundWon" ? "text-[#00C805]" : "text-red-500"}`}>
                    {gameState === "roundWon" ? "Market Snipped!" : "Liquidated"}
                  </h3>
                  {gameState === "roundWon" ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-4xl font-mono font-bold text-white">+$3.00</div>
                      <div className="text-[10px] font-bold text-[#00C805] uppercase tracking-widest">INK Cash Credited</div>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">Better luck next time, trader.</p>
                  )}
                  <button
                    onClick={resetToIdle}
                    className="mt-4 rounded-xl bg-white/10 border border-white/20 px-8 py-3 text-sm font-bold text-white hover:bg-white/20 active:scale-95 transition-all"
                  >
                    BACK TO HUB
                  </button>
                </div>
              )}
            </div>

            {/* Action Area */}
            <div className="flex flex-col gap-4">
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleSell();
                }}
                className={`group relative w-full rounded-2xl py-6 flex flex-col items-center justify-center transition-all touch-manipulation select-none active:scale-95 ${
                  gameState === "playing" 
                    ? `bg-slate-800 border-2 ${isButtonTapped ? 'border-[#00C805] scale-[0.97]' : 'border-white/10'}` 
                    : "bg-slate-900/50 opacity-50 grayscale cursor-not-allowed"
                }`}
              >
                {/* Glow effect when in zone */}
                {gameState === "playing" && (
                  linePosition >= profitZoneCenter - (profitZoneSize / 2) && 
                  linePosition <= profitZoneCenter + (profitZoneSize / 2)
                ) && (
                  <div className="absolute inset-0 rounded-2xl bg-[#00C805]/20 animate-pulse shadow-[0_0_30px_rgba(0,200,5,0.4)]" />
                )}
                
                <span className={`text-2xl font-black uppercase tracking-[0.2em] transition-colors ${
                  gameState === "playing" && (
                    linePosition >= profitZoneCenter - (profitZoneSize / 2) && 
                    linePosition <= profitZoneCenter + (profitZoneSize / 2)
                  )
                    ? "text-[#00C805]"
                    : "text-white/40"
                }`}>
                  SELL
                </span>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">
                  Execute Order
                </span>
              </button>

              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#00C805] animate-pulse" />
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Connection: Stable</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Latency: 14ms</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
