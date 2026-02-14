"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Lock, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { useEconomyStore } from "@/store/useGameStore";

type VaultCrackerProps = {
  isOpen: boolean;
  onClose: () => void;
};

type GameStatus = "idle" | "countdown" | "playing" | "success" | "gameOver";

const MAX_LIVES = 2;
const TOTAL_LEVELS = 3; // Outer, Middle, Inner

const LEVEL_CONFIGS = [
  { id: 0, name: "Outer", speed: 2, radius: 120, strokeWidth: 20, color: "#4B5563" },
  { id: 1, name: "Middle", speed: 3, radius: 90, strokeWidth: 20, color: "#374151" },
  { id: 2, name: "Inner", speed: 4.5, radius: 60, strokeWidth: 20, color: "#1F2937" },
];

const FEEDBACK_MESSAGES = ["CLINK!", "SECURE!", "ENGAGED!", "LOCKED!", "GOT IT!"];

export default function VaultCracker({ isOpen, onClose }: VaultCrackerProps) {
  const credits = useEconomyStore((state) => state.credits);
  const addCredits = useEconomyStore((state) => state.addCredits);
  const addInfluenceBucks = useEconomyStore((state) => state.addInfluenceBucks);
  const addZoningPermits = useEconomyStore((state) => state.addZoningPermits);

  // Game State
  const [status, setStatus] = useState<GameStatus>("idle");
  const [level, setLevel] = useState(0); // 0 = Outer, 1 = Middle, 2 = Inner
  const [lives, setLives] = useState(MAX_LIVES);
  const [countdown, setCountdown] = useState(3);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [, setIsSuccessfulCrack] = useState(false);
  const [showVaultOpen, setShowVaultOpen] = useState(false);
  
  // Rotation State
  const [currentAngle, setCurrentAngle] = useState(0);
  const [targetAngle, setTargetAngle] = useState(0);
  const [rotationDirection, setRotationDirection] = useState<1 | -1>(1);
  const [lockedRings, setLockedRings] = useState<boolean[]>([false, false, false]);

  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const currentAngleRef = useRef(0);
  const statusRef = useRef<GameStatus>("idle");

  // Sync refs
  useEffect(() => {
    currentAngleRef.current = currentAngle;
  }, [currentAngle]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // SFX and Haptics Helpers
  const triggerHaptic = (pattern: number[]) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const playSFX = (type: "clink" | "miss" | "win" | "tick" | "alarm") => {
    console.log(`SFX: ${type}`);
    // Placeholder for actual audio integration
  };

  const getRandomTargetAngle = () => {
    // Random angle between 0 and 359
    return Math.floor(Math.random() * 360);
  };

  const startGame = () => {
    if (credits < 1) return;
    addCredits(-1);
    setLevel(0);
    setLives(MAX_LIVES);
    setLockedRings([false, false, false]);
    setTargetAngle(getRandomTargetAngle());
    setCurrentAngle(0);
    setRotationDirection(1);
    setStatus("countdown");
    setCountdown(3);
    setIsSuccessfulCrack(false);
  };

  // Countdown logic (defer transition to avoid setState-synchronously-in-effect lint)
  useEffect(() => {
    if (status === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === "countdown" && countdown === 0) {
      const t = setTimeout(() => setStatus("playing"), 0);
      return () => clearTimeout(t);
    }
  }, [status, countdown]);

  // Animation logic (ref pattern to avoid "accessed before declaration" in effect)
  const animateRef = useRef<(time: number) => void>(() => {});
  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      const speed = LEVEL_CONFIGS[level].speed;
      
      setCurrentAngle((prev) => {
        let next = prev + (speed * rotationDirection * (deltaTime / 16.67));
        // Normalize angle to 0-359
        next = next % 360;
        if (next < 0) next += 360;
        return next;
      });

      // Subtle tick haptic/sound every 5 degrees
      if (Math.floor(currentAngleRef.current / 5) !== Math.floor((currentAngleRef.current + speed) / 5)) {
        // Only tick if playing
        if (statusRef.current === "playing") {
          triggerHaptic([5]);
        }
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame((t) => animateRef.current(t));
  }, [level, rotationDirection]);

  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  useEffect(() => {
    if (status === "playing") {
      requestRef.current = requestAnimationFrame((t) => animateRef.current(t));
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = undefined;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status]);

  const handleLock = () => {
    if (status !== "playing") return;

    const angle = currentAngleRef.current;
    const diff = Math.abs(angle - targetAngle);
    const normalizedDiff = Math.min(diff, 360 - diff);
    
    // Tolerance for "hit" - 12 degrees (approx 3% of the circle)
    const tolerance = 12;

    if (normalizedDiff <= tolerance) {
      // Hit!
      triggerHaptic([60]); // Strong single thud
      playSFX("clink");
      
      const newLockedRings = [...lockedRings];
      newLockedRings[level] = true;
      setLockedRings(newLockedRings);

      // Defer random to avoid impure-call-during-render lint
      setTimeout(() => {
        const msg = FEEDBACK_MESSAGES[Math.floor(Math.random() * FEEDBACK_MESSAGES.length)];
        setFeedbackText(msg);
        setTimeout(() => setFeedbackText(null), 800);
      }, 0);

      if (level < TOTAL_LEVELS - 1) {
        // Move to next ring
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setTargetAngle(getRandomTargetAngle());
        // Reverse direction for added challenge
        setRotationDirection((prev) => (prev === 1 ? -1 : 1));
      } else {
        // Vault Cracked!
        setStatus("success");
        setTimeout(() => setShowVaultOpen(true), 500);
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
        setStatus("gameOver");
        playSFX("alarm");
      } else {
        // Reset current level position
        setTargetAngle(getRandomTargetAngle());
      }
    }
  };

  const completeGame = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#00C805", "#C0C0C0", "#FFFFFF"], // Green, Silver, White
      zIndex: 10000,
    });
    
    // Rewards: 25 Influence Bucks + 1 Zoning Permit
    addInfluenceBucks(25);
    addZoningPermits(1);
    setIsSuccessfulCrack(true);
    playSFX("win");

    // Burst confetti!
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ["#00C805", "#FFFFFF"] });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ["#00C805", "#FFFFFF"] });
    }, 250);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[720] flex items-end justify-center bg-black/60 px-4 pb-0 pt-0 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && status === "idle") {
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
            className="relative w-full max-w-[520px] rounded-t-[28px] border border-white/10 bg-[#1F2937] px-6 pb-12 pt-6 shadow-[0_-16px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* CRT Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#00C805]" />
                  VAULT CRACKER
                </h2>
                <div className="mt-1 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  High-Security Protocol • Level {level + 1}/{TOTAL_LEVELS}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={status === "playing" || status === "countdown"}
                className="rounded-full border border-white/10 p-2 text-white/40 hover:bg-white/5 disabled:opacity-20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Game Screen Container */}
            <div className="relative w-full max-w-[340px] mx-auto mb-10">
              {/* The Vault Screen (Circular Area) */}
              <div className="relative aspect-square w-full bg-slate-900/40 rounded-full border border-white/5 overflow-hidden shadow-inner flex items-center justify-center">
                {/* The Vault Tumblers */}
                <svg width="100%" height="100%" viewBox="0 0 300 300" className="absolute inset-0">
                  <defs>
                    <radialGradient id="brushedSteel" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" stopColor="#9CA3AF" />
                      <stop offset="70%" stopColor="#4B5563" />
                      <stop offset="100%" stopColor="#1F2937" />
                    </radialGradient>
                    <filter id="innerShadow">
                      <feOffset dx="0" dy="2" />
                      <feGaussianBlur stdDeviation="3" result="offset-blur" />
                      <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                      <feFlood floodColor="black" floodOpacity="0.5" result="color" />
                      <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                      <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                    </filter>
                  </defs>

                  {/* Draw Rings */}
                  {LEVEL_CONFIGS.map((config, i) => (
                    <g key={config.id}>
                      {/* Background Ring */}
                      <circle
                        cx="150"
                        cy="150"
                        r={config.radius}
                        fill="none"
                        stroke={lockedRings[i] ? "#00C805" : "#111827"}
                        strokeWidth={config.strokeWidth}
                        strokeOpacity={lockedRings[i] ? 0.3 : 1}
                      />
                      
                      {/* Target Pin (on active or locked ring) */}
                      {(level === i && status === "playing") && (
                        <circle
                          cx={150 + config.radius * Math.cos((targetAngle - 90) * (Math.PI / 180))}
                          cy={150 + config.radius * Math.sin((targetAngle - 90) * (Math.PI / 180))}
                          r="6"
                          fill="#00C805"
                          className="animate-pulse"
                          style={{ filter: "drop-shadow(0 0 5px #00C805)" }}
                        />
                      )}

                      {/* Rotating Indicator (only for active level) */}
                      {level === i && status === "playing" && (
                        <g transform={`rotate(${currentAngle}, 150, 150)`}>
                          <line
                            x1="150"
                            y1={150 - config.radius - config.strokeWidth/2}
                            x2="150"
                            y2={150 - config.radius + config.strokeWidth/2}
                            stroke="white"
                            strokeWidth="4"
                            strokeLinecap="round"
                            style={{ filter: "drop-shadow(0 0 3px white)" }}
                          />
                        </g>
                      )}
                    </g>
                  ))}

                  {/* Center Dial */}
                  <circle
                    cx="150"
                    cy="150"
                    r="40"
                    fill="url(#brushedSteel)"
                    stroke="#374151"
                    strokeWidth="2"
                    filter="url(#innerShadow)"
                  />
                  <circle cx="150" cy="150" r="4" fill="#1F2937" />
                </svg>
              </div>

              {/* Status Overlays (Moved outside overflow-hidden for better visibility and no clipping) */}
              <AnimatePresence mode="wait">
                {status === "idle" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="z-10 absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8 bg-slate-900/60 backdrop-blur-[2px] rounded-full border border-[#00C805]/20"
                  >
                    <div className="h-14 w-14 rounded-full bg-[#00C805]/10 flex items-center justify-center mb-1 border border-[#00C805]/30">
                      <ShieldCheck className="h-7 w-7 text-[#00C805]" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Vault Breach</h3>
                    <p className="text-[10px] text-slate-200 leading-relaxed uppercase tracking-widest font-bold max-w-[240px]">
                      Align the tumbler notches with the <span className="text-[#00C805]">Green Pins</span>. 
                      Precision is mandatory. 2 misses trigger the alarm.
                    </p>
                    <button
                      onClick={startGame}
                      className="mt-2 flex items-center gap-2 rounded-full bg-[#00C805] px-8 py-3.5 text-[11px] font-black text-white shadow-[0_0_20px_rgba(0,200,5,0.4)] active:scale-95 transition-all uppercase tracking-widest hover:bg-[#00E005]"
                    >
                      <Zap className="h-3.5 w-3.5 fill-white" />
                      INITIATE BREACH (1 CREDIT)
                    </button>
                  </motion.div>
                )}

                {status === "countdown" && (
                  <motion.div 
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="z-10 absolute inset-0 flex items-center justify-center text-7xl font-black text-[#00C805] font-mono italic drop-shadow-[0_0_15px_rgba(0,200,5,0.5)]"
                  >
                    {countdown === 0 ? "GO!" : countdown}
                  </motion.div>
                )}

                {status === "playing" && feedbackText && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 0 }}
                    animate={{ scale: 1.2, opacity: 1, y: -40 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="z-30 absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <span className="text-4xl font-black text-[#00C805] drop-shadow-[0_0_15px_rgba(0,200,5,0.8)] italic uppercase tracking-tighter">
                      {feedbackText}
                    </span>
                  </motion.div>
                )}

                {status === "gameOver" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="z-10 absolute inset-0 flex flex-col items-center justify-center gap-4 text-center bg-slate-900/80 backdrop-blur-md p-6 rounded-full border border-white/10"
                  >
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-red-500">
                      ALARM TRIGGERED
                    </h3>
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-red-500 mb-1" />
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Security Breach Detected. Extraction Failed.</p>
                    </div>
                    <button
                      onClick={() => setStatus("idle")}
                      className="mt-4 rounded-full bg-white/5 border border-white/10 px-8 py-3 text-[10px] font-black text-white hover:bg-white/10 active:scale-95 transition-all uppercase tracking-widest"
                    >
                      RETURN TO TERMINAL
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Vault Opening Animation Overlay */}
            <AnimatePresence>
              {showVaultOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                  {/* Internal Light Spill */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 2, 4], opacity: [0.5, 1, 0] }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute w-32 h-32 bg-[#00C805] rounded-full blur-[80px]"
                  />
                  
                  {/* Vault Door Swing (Simple 3D-ish effect) */}
                  <div className="relative w-72 h-72 perspective-[1000px]">
                    <motion.div
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: -115 }}
                      transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
                      style={{ transformOrigin: "left" }}
                      className="w-full h-full bg-[#374151] border-4 border-[#4B5563] rounded-[32px] flex items-center justify-center shadow-2xl relative z-10 overflow-hidden"
                    >
                      {/* Brushed Metal Texture Overlay */}
                      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]" />
                      
                      <div className="w-56 h-56 rounded-full border-[12px] border-[#1F2937] flex items-center justify-center shadow-inner relative">
                        {/* Vault Wheel Spokes */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {[0, 45, 90, 135].map((angle) => (
                            <div 
                              key={angle} 
                              className="absolute w-full h-1.5 bg-[#1F2937]" 
                              style={{ transform: `rotate(${angle}deg)` }} 
                            />
                          ))}
                        </div>
                        {/* Center Hub */}
                        <div className="w-12 h-12 rounded-full bg-[#1F2937] border-4 border-[#4B5563] z-10 flex items-center justify-center shadow-lg" />
                      </div>
                    </motion.div>
                    
                    {/* Content behind door - The Unified Reward Screen */}
                    <div className="absolute inset-0 bg-[#111827] rounded-[32px] flex flex-col items-center justify-center gap-6 border-2 border-[#00C805]/40 shadow-[0_0_40px_rgba(0,200,5,0.2)]">
                      <div className="flex flex-col items-center text-center px-4">
                        <div className="relative mb-2">
                          <ShieldCheck className="w-16 h-16 text-[#00C805] drop-shadow-[0_0_15px_rgba(0,200,5,0.6)]" />
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-3 border border-dashed border-[#00C805]/40 rounded-full"
                          />
                        </div>
                        
                        <h2 className="text-3xl font-black text-[#00C805] uppercase tracking-tighter italic">
                          VAULT CRACKED
                        </h2>
                        <div className="mt-1 h-0.5 w-16 bg-[#00C805]/30 rounded-full" />
                      </div>

                      <div className="flex flex-col items-center gap-4 py-2">
                        <div className="flex items-center justify-center gap-6">
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Currency</span>
                            <div className="text-2xl font-mono font-bold text-white flex items-baseline gap-1">
                              +25 <span className="text-[10px] text-slate-400">BUCKS</span>
                            </div>
                          </div>
                          
                          <div className="h-10 w-[1px] bg-slate-800" />
                          
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Asset</span>
                            <div className="text-2xl font-mono font-bold text-white flex items-baseline gap-1">
                              +1 <span className="text-[10px] text-slate-400">PERMIT</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#00C805]/10 rounded-full border border-[#00C805]/20">
                          <Zap className="w-3 h-3 text-[#00C805]" />
                          <span className="text-[9px] font-black text-[#00C805] uppercase tracking-widest">Assets Credited to Wallet</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowVaultOpen(false);
                          setStatus("idle");
                        }}
                        className="group relative flex items-center gap-3 rounded-full bg-[#00C805] px-10 py-4 text-xs font-black text-white shadow-[0_0_30px_rgba(0,200,5,0.4)] active:scale-95 transition-all uppercase tracking-widest hover:bg-[#00E005] hover:shadow-[0_0_40px_rgba(0,200,5,0.6)] overflow-hidden"
                      >
                        <span className="relative z-10">COLLECT ASSETS</span>
                        <motion.div
                          className="absolute inset-0 bg-white/20 translate-x-[-100%]"
                          animate={{ translateX: ["100%", "-100%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Area */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Security Grid</span>
                  <div className="flex gap-2">
                    {[...Array(MAX_LIVES)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
                          i < lives ? "bg-[#00C805] shadow-[0_0_8px_#00C805]" : "bg-red-900/40"
                        }`} 
                      />
                    ))}
                  </div>
                </div>
                
                <div className="text-right flex flex-col gap-1">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Current Ring</span>
                  <div className="text-lg font-mono font-bold text-white uppercase tracking-tighter">
                    {LEVEL_CONFIGS[level].name}
                  </div>
                </div>
              </div>

              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleLock();
                }}
                className={`group relative w-full rounded-[20px] py-8 flex flex-col items-center justify-center transition-all touch-manipulation select-none active:scale-[0.97] ${
                  status === "playing" 
                    ? "bg-[#111827] border-2 border-[#00C805]/30 shadow-[0_0_30px_rgba(0,200,5,0.1)]" 
                    : "bg-slate-900/50 opacity-50 grayscale cursor-not-allowed border border-white/5"
                }`}
              >
                {/* Status-dependent button content */}
                <div className={`text-3xl font-black uppercase tracking-[0.3em] transition-colors ${
                  status === "playing" ? "text-white" : "text-slate-600"
                }`}>
                  LOCK
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className={`h-1 w-1 rounded-full ${status === "playing" ? "bg-[#00C805] animate-pulse" : "bg-slate-600"}`} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Confirm Alignment
                  </span>
                </div>
                
                {/* Internal Glow */}
                {status === "playing" && (
                  <div className="absolute inset-0 rounded-[18px] bg-gradient-to-t from-[#00C805]/5 to-transparent pointer-events-none" />
                )}
              </button>

              <div className="flex items-center justify-center gap-8 opacity-40">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-[#00C805]" />
                  <span className="text-[8px] font-mono text-slate-300 uppercase tracking-widest">Hydraulic: Nominal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-[#00C805]" />
                  <span className="text-[8px] font-mono text-slate-300 uppercase tracking-widest">Tumbler: Calibrated</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
