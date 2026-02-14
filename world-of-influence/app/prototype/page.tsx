"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Building2, 
  Lock, 
  Unlock, 
  Sparkles, 
  ArrowUpRight,
  ShieldCheck,
  User,
  LogOut,
  Landmark,
  Box,
  Crown,
  Zap,
  Fingerprint,
  MapPin,
  Package,
  ShoppingBag,
  CheckCircle2,
  Trophy,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import Odometer from "@/components/hud/Odometer";

// Haptic shockwave: expanding ring + optional device vibration for physical tap feedback
const triggerHapticShockwave = () => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(10);
  }
};

type PrototypeButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "accent";
  status?: "active" | "locked";
  theme?: "light" | "gray" | "dark";
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
};

const PrototypeButton = ({ children, variant = "primary", status = "active", theme = "light", className = "", onClick }: PrototypeButtonProps) => {
  const [shockwaveKey, setShockwaveKey] = useState(0);

  const themes: Record<string, Record<string, string>> = {
    light: {
      primary: "bg-slate-900 text-white border-transparent",
      secondary: "bg-white text-slate-900 border-slate-200",
      ghost: "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 shadow-sm",
      accent: "bg-[#00C805] text-white border-transparent shadow-[0_0_15px_rgba(0,200,5,0.4)]"
    },
    gray: {
      primary: "bg-gray-surface text-gray-text border-gray-border/20 shadow-lg",
      secondary: "bg-gray-bg text-gray-text border-gray-border/10",
      ghost: "bg-gray-bg/20 text-gray-text border-gray-border/20 hover:bg-gray-bg/40 shadow-sm",
      accent: "bg-[#00C805] text-white border-transparent shadow-[0_0_15px_rgba(0,200,5,0.3)]"
    },
    dark: {
      primary: "bg-slate-800 text-white border-slate-700 shadow-xl",
      secondary: "bg-slate-700 text-slate-300 border-slate-600",
      ghost: "bg-slate-900/40 text-slate-400 border-slate-700 hover:bg-slate-950 shadow-sm",
      accent: "bg-[#00C805] text-white border-transparent shadow-[0_0_20px_rgba(0,200,5,0.2)]"
    }
  };

  const baseClasses = "relative flex items-center justify-center gap-2 px-6 py-3 rounded-[14px] text-xs font-bold uppercase tracking-widest transition-all border overflow-hidden";
  const themeClasses = themes[theme][variant] || themes.light.primary;
  const lockedClasses = status === "locked" ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer";

  const handlePointerDown = () => {
    if (status === "locked") return;
    triggerHapticShockwave();
    setShockwaveKey((k) => k + 1);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (status === "locked") return;
    onClick?.(e);
  };

  return (
    <motion.button
      whileTap={status !== "locked" ? { scale: 0.96 } : {}}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className={`${baseClasses} ${themeClasses} ${lockedClasses} ${className}`}
    >
      {/* Haptic shockwave: expanding ring on tap */}
      {status !== "locked" && shockwaveKey > 0 && (
        <AnimatePresence>
          <motion.span
            key={shockwaveKey}
            className={`absolute inset-0 rounded-[14px] border-2 pointer-events-none ${
              theme === "light" ? "border-slate-600/60" : theme === "gray" ? "border-white/50" : "border-white/50"
            }`}
            initial={{ scale: 0.5, opacity: 0.7 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ transformOrigin: "center center" }}
          />
        </AnimatePresence>
      )}
      {status === "locked" && <Lock className="w-3 h-3" />}
      {children}
    </motion.button>
  );
};

const BiometricHold = ({ theme, onComplete }: { theme: string; onComplete?: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isHolding) {
      timerRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (timerRef.current) clearInterval(timerRef.current);
            onComplete?.();
            return 100;
          }
          return prev + 2;
        });
      }, 30);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      const id = setTimeout(() => setProgress(0), 0);
      return () => {
        clearTimeout(id);
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHolding, onComplete]);

  const ringDash = 339.29; // 2 * PI * 54
  const ringOffset = ringDash - (ringDash * progress) / 100;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="54"
            stroke={theme === 'light' ? '#e2e8f0' : '#ffffff10'}
            strokeWidth="4"
            fill="transparent"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="54"
            stroke="#00C805"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={ringDash}
            animate={{ strokeDashoffset: ringOffset }}
            transition={{ duration: 0.1 }}
          />
        </svg>

        {/* Fingerprint Button */}
        <motion.div
          onPointerDown={() => setIsHolding(true)}
          onPointerUp={() => setIsHolding(false)}
          onPointerLeave={() => setIsHolding(false)}
          animate={isHolding ? { scale: 0.9, backgroundColor: 'rgba(0, 200, 5, 0.1)' } : { scale: 1 }}
          className={`w-24 h-24 rounded-full border-2 ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-white/10 bg-white/5'} flex items-center justify-center cursor-pointer shadow-inner touch-none`}
        >
          <Fingerprint className={`w-12 h-12 ${isHolding ? 'text-[#00C805]' : theme === 'light' ? 'text-slate-400' : 'text-white/40'} transition-colors`} />
        </motion.div>
      </div>
      <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isHolding ? 'text-[#00C805] animate-pulse' : theme === 'light' ? 'text-slate-400' : 'text-white/40'}`}>
        {progress >= 100 ? 'Verified' : isHolding ? 'Scanning...' : 'Hold Biometric'}
      </p>
    </div>
  );
};

type MockSlideUpProps = {
  theme: "light" | "gray" | "dark";
  title: string;
  subtitle: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  isOpen?: boolean;
};

const MockSlideUp = ({ theme, title, subtitle, children, icon: Icon, isOpen = true }: MockSlideUpProps) => {
  const containerClasses = {
    light: "bg-white border-slate-100",
    gray: "bg-gray-surface border-gray-border/20",
    dark: "bg-slate-800 border-slate-700"
  };

  const textClasses = {
    light: "text-slate-900",
    gray: "text-gray-text",
    dark: "text-white"
  };

  const mutedClasses = {
    light: "text-slate-400",
    gray: "text-gray-text-muted",
    dark: "text-slate-500"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`w-full max-w-[400px] rounded-t-[32px] border-t border-x p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.15)] ${containerClasses[theme as keyof typeof containerClasses]} backdrop-blur-xl relative overflow-hidden`}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${mutedClasses[theme as keyof typeof mutedClasses]}`}>{subtitle}</p>
                <h3 className={`text-xl font-black uppercase tracking-tight mt-1 ${textClasses[theme as keyof typeof textClasses]}`}>{title}</h3>
              </div>
              {Icon && (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white'}`}>
                  <Icon className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ThemeContainer = ({ children, theme, title }: { children: React.ReactNode, theme: 'light' | 'gray' | 'dark', title: string }) => {
  const bgClasses = {
    light: "bg-[#f3f4f6]/95 backdrop-blur-xl text-[#1f2937]",
    gray: "bg-gray-bg/95 backdrop-blur-xl text-gray-text",
    dark: "bg-slate-900/95 backdrop-blur-xl text-white"
  };

  return (
    <div className={`p-8 rounded-[24px] border ${bgClasses[theme]} border-black/5 flex-1 min-w-[350px] shadow-2xl relative`}>
      <div className="relative z-10">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-8">{title}</h3>
        <div className="space-y-12">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function PrototypePage() {
  const [isLocked, setIsLocked] = useState(false);
  const [visibleThemes, setVisibleThemes] = useState({ light: true, gray: true, dark: true });
  const [rewardValue, setRewardValue] = useState(1240.50);
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleThemeVisibility = (theme: keyof typeof visibleThemes) => {
    setVisibleThemes(prev => ({ ...prev, [theme]: !prev[theme] }));
  };

  const triggerReward = () => {
    setIsSuccess(true);
    setRewardValue(prev => prev + 250);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#00C805", "#39FF14", "#FFFFFF"],
      zIndex: 10000,
    });
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans selection:bg-[#00C805]/30">
      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[32px] p-12 shadow-[0_0_100px_rgba(0,200,5,0.2)] border border-[#00C805]/20 flex flex-col items-center gap-4 text-center"
            >
              <div className="w-20 h-20 bg-[#00C805] rounded-full flex items-center justify-center shadow-lg shadow-[#00C805]/30">
                <CheckCircle2 className="text-white w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">ASSET ACQUIRED</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Institutional Verification Complete</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#00C805] rounded-[14px] flex items-center justify-center shadow-lg shadow-[#00C805]/20">
                <Sparkles className="text-white w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900">
                UI<span className="text-[#00C805]">PROTOTYPE</span>
              </h1>
            </div>
            <p className="text-slate-500 max-w-md font-medium leading-relaxed">
              Consolidating the World of Influence visual language. Focusing on the &quot;Gray Mode&quot; medium and &quot;Bank Vault&quot; security.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Visibility Toggles */}
            <div className="flex bg-white border border-slate-200 rounded-[14px] p-1 shadow-sm">
              <button 
                onClick={() => toggleThemeVisibility('light')}
                className={`px-4 py-2 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all ${visibleThemes.light ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Light
              </button>
              <button 
                onClick={() => toggleThemeVisibility('gray')}
                className={`px-4 py-2 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all ${visibleThemes.gray ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Gray
              </button>
              <button 
                onClick={() => toggleThemeVisibility('dark')}
                className={`px-4 py-2 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all ${visibleThemes.dark ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Dark
              </button>
            </div>

            <button 
              onClick={() => setIsLocked(!isLocked)}
              className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-[14px] shadow-sm hover:border-[#00C805] transition-all group"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isLocked ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">Global State</div>
                <div className="text-xs font-black uppercase text-slate-900">{isLocked ? 'All Locked' : 'All Active'}</div>
              </div>
            </button>
          </div>
        </header>

        <main className="space-y-12">
          {/* Theme Grid */}
          <div className="flex flex-col xl:flex-row gap-8">
            {/* LIGHT THEME */}
            {visibleThemes.light && (
              <ThemeContainer theme="light" title="Day Mode (Light)">
                <Section title="Typography & Data">
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest opacity-40 mb-1">Monospace Data</div>
                      <div className="font-mono text-3xl font-bold tabular-nums">$1,240.500000</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest opacity-40 mb-1">Heading Sans</div>
                      <div className="text-xl font-black uppercase tracking-tight">Main Security Vault</div>
                    </div>
                  </div>
                </Section>

                <Section title="Action Matrix">
                  <div className="grid grid-cols-2 gap-3">
                    <PrototypeButton theme="light" variant="primary" status={isLocked ? "locked" : "active"}>Primary Action</PrototypeButton>
                    <PrototypeButton theme="light" variant="accent" status={isLocked ? "locked" : "active"}>Growth Action</PrototypeButton>
                    <PrototypeButton theme="light" variant="secondary" status={isLocked ? "locked" : "active"}>Secondary</PrototypeButton>
                    <PrototypeButton theme="light" variant="ghost" status={isLocked ? "locked" : "active"}>Cancel</PrototypeButton>
                  </div>
                </Section>

                <Section title="HUD Modules">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <div className="px-4 py-2 bg-white rounded-[14px] border border-slate-100 shadow-sm flex items-center gap-3 backdrop-blur-md">
                        <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center">
                          <Building2 className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-mono font-bold">14,200.00</span>
                      </div>
                      <div className="px-4 py-2 bg-[#00C805]/10 rounded-[14px] border border-[#00C805]/20 flex items-center gap-3 backdrop-blur-md">
                        <div className="w-6 h-6 bg-[#00C805] rounded-full flex items-center justify-center">
                          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-mono font-bold text-[#00C805]">$250.40</span>
                      </div>
                    </div>
                    {/* Specialized Modules */}
                    <div className="p-4 bg-slate-50 rounded-[18px] border border-slate-200 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Deployment Status</span>
                        <span className="text-[10px] font-mono font-bold text-[#00C805]">85%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00C805] rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>
                </Section>
              </ThemeContainer>
            )}

            {/* GRAY THEME (THE FOCUS) */}
            {visibleThemes.gray && (
              <ThemeContainer theme="gray" title="Dusk Mode (The Gray Medium)">
                <Section title="Typography & Data">
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-text-muted mb-1">Monospace Data</div>
                      <div className="font-mono text-3xl font-bold tabular-nums text-[#00C805]">$1,240.500000</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-text-muted mb-1">Heading Sans</div>
                      <div className="text-xl font-black uppercase tracking-tight text-gray-text">Main Security Vault</div>
                    </div>
                  </div>
                </Section>

                <Section title="Action Matrix">
                  <div className="grid grid-cols-2 gap-3">
                    <PrototypeButton theme="gray" variant="primary" status={isLocked ? "locked" : "active"}>Primary Action</PrototypeButton>
                    <PrototypeButton theme="gray" variant="accent" status={isLocked ? "locked" : "active"}>Growth Action</PrototypeButton>
                    <PrototypeButton theme="gray" variant="secondary" status={isLocked ? "locked" : "active"}>Secondary</PrototypeButton>
                    <PrototypeButton theme="gray" variant="ghost" status={isLocked ? "locked" : "active"}>Cancel</PrototypeButton>
                  </div>
                </Section>

                <Section title="HUD Modules">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <div className="px-4 py-2 bg-gray-surface rounded-[14px] border border-gray-border/20 shadow-md flex items-center gap-3 backdrop-blur-md">
                        <div className="w-6 h-6 bg-gray-bg rounded-full flex items-center justify-center">
                          <Building2 className="w-3.5 h-3.5 text-gray-text" />
                        </div>
                        <span className="font-mono font-bold text-gray-text">14,200.00</span>
                      </div>
                      <div className="px-4 py-2 bg-gray-surface rounded-[14px] border border-[#00C805]/30 shadow-md flex items-center gap-3 backdrop-blur-md">
                        <div className="w-6 h-6 bg-[#00C805] rounded-full flex items-center justify-center">
                          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-mono font-bold text-[#00C805]">$250.40</span>
                      </div>
                    </div>
                    {/* Specialized Modules */}
                    <div className="p-4 bg-gray-surface rounded-[18px] border border-gray-border/10 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-text-muted">Deployment Status</span>
                        <span className="text-[10px] font-mono font-bold text-[#00C805]">85%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-bg rounded-full overflow-hidden">
                        <div className="h-full bg-[#00C805] rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>
                </Section>
              </ThemeContainer>
            )}

            {/* DARK THEME */}
            {visibleThemes.dark && (
              <ThemeContainer theme="dark" title="Night Mode (Dark Vault)">
                <Section title="Typography & Data">
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest opacity-40 mb-1">Monospace Data</div>
                      <div className="font-mono text-3xl font-bold tabular-nums text-white">$1,240.500000</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest opacity-40 mb-1">Heading Sans</div>
                      <div className="text-xl font-black uppercase tracking-tight text-white">Main Security Vault</div>
                    </div>
                  </div>
                </Section>

                <Section title="Action Matrix">
                  <div className="grid grid-cols-2 gap-3">
                    <PrototypeButton theme="dark" variant="primary" status={isLocked ? "locked" : "active"}>Primary Action</PrototypeButton>
                    <PrototypeButton theme="dark" variant="accent" status={isLocked ? "locked" : "active"}>Growth Action</PrototypeButton>
                    <PrototypeButton theme="dark" variant="secondary" status={isLocked ? "locked" : "active"}>Secondary</PrototypeButton>
                    <PrototypeButton theme="dark" variant="ghost" status={isLocked ? "locked" : "active"}>Cancel</PrototypeButton>
                  </div>
                </Section>

                <Section title="HUD Modules">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <div className="px-4 py-2 bg-slate-800 rounded-[14px] border border-slate-700 shadow-xl flex items-center gap-3 backdrop-blur-md">
                        <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
                          <Building2 className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                        <span className="font-mono font-bold text-slate-100">14,200.00</span>
                      </div>
                      <div className="px-4 py-2 bg-slate-800 rounded-[14px] border border-[#00C805]/30 shadow-xl flex items-center gap-3 backdrop-blur-md">
                        <div className="w-6 h-6 bg-[#00C805] rounded-full flex items-center justify-center">
                          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-mono font-bold text-[#00C805]">$250.40</span>
                      </div>
                    </div>
                    {/* Specialized Modules */}
                    <div className="p-4 bg-slate-800 rounded-[18px] border border-slate-700/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Deployment Status</span>
                        <span className="text-[10px] font-mono font-bold text-[#00C805]">85%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00C805] rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>
                </Section>
              </ThemeContainer>
            )}
          </div>

          {/* Navigation Consolidation Section */}
          <section className="mt-24 p-12 bg-white rounded-[32px] border border-slate-100 shadow-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-slate-900">Navigation Consolidation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">User Profile Component</h3>
                <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-[20px] shadow-xl w-fit">
                  <div className="w-12 h-12 bg-[#00C805]/20 rounded-[14px] flex items-center justify-center border border-[#00C805]/30">
                    <User className="w-6 h-6 text-[#00C805]" />
                  </div>
                  <div className="flex flex-col pr-8">
                    <span className="text-white text-[10px] font-mono opacity-50 uppercase tracking-widest">Operator</span>
                    <span className="text-white text-lg font-black leading-tight">CLOUD_NINE</span>
                  </div>
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer">
                    <LogOut className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Contextual Action Bar (Shop Standard)</h3>
                <div className="flex gap-1 rounded-2xl bg-slate-50 p-1 border border-slate-200 shadow-sm w-fit">
                  <button className="flex items-center justify-center gap-2 rounded-xl py-2 px-6 text-[10px] font-bold uppercase tracking-widest transition-all text-slate-400 hover:text-slate-600">
                    <Landmark className="h-3 w-3" />
                    Exchange
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-xl py-2 px-6 text-[10px] font-bold uppercase tracking-widest transition-all text-slate-400 hover:text-slate-600">
                    <Box className="h-3 w-3" />
                    Capital
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-xl py-2 px-6 text-[10px] font-bold uppercase tracking-widest transition-all bg-white text-slate-900 shadow-md border border-slate-100">
                    <Crown className="h-3 w-3 text-[#00C805]" />
                    Services
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Odometer & Motion Review */}
          <section className="mt-12 p-12 bg-gray-bg rounded-[32px] border border-gray-border/20 shadow-2xl text-gray-text relative overflow-hidden">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-white">Motion & Odometer (Gray Mode)</h2>
            <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">The &quot;Odometer&quot; Effect</div>
                <div className="text-6xl font-black font-mono tracking-tighter text-[#00C805]">
                  <Odometer value={rewardValue} prefix="$" />
                </div>
                <p className="text-xs text-gray-text-muted max-w-xs mt-4">
                  Continuous rolling animation for rent yield. Tabular numbers ensure layout stability during rapid updates.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={triggerReward}
                  className="p-6 bg-gray-surface rounded-[20px] border border-gray-border/10 flex flex-col items-center gap-4 group cursor-pointer active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 bg-[#00C805]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="text-[#00C805] w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Collect Reward</span>
                </div>
                <div className="p-6 bg-gray-surface rounded-[20px] border border-gray-border/10 flex flex-col items-center gap-4 group cursor-pointer active:scale-95 transition-all">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Sparkles className="text-white w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Boost Luck</span>
                </div>
              </div>
            </div>
          </section>

          {/* Recommendations Section */}
          <section className="mt-24">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-slate-900">Strategic Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-white rounded-[24px] border border-slate-100 shadow-xl text-slate-900">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">Implemented</div>
                </div>
                <h4 className="text-sm font-black uppercase mb-2">Adaptive Blur Surfaces</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">Applied `backdrop-blur-xl` to main containers and `backdrop-blur-md` to buttons. Signifies premium fintech UX and ensures legibility.</p>
                <div className="h-1.5 w-full bg-slate-100 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="p-8 bg-white rounded-[24px] border border-slate-100 shadow-xl text-slate-900">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">Implemented</div>
                </div>
                <h4 className="text-sm font-black uppercase mb-2">Haptic Shockwaves</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">Subtle &quot;shockwave&quot; animations added to prototype buttons. Click any button to see the physical feedback effect.</p>
                <div className="h-1.5 w-full bg-slate-100 rounded-full">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="p-8 bg-white rounded-[24px] border border-slate-100 shadow-xl text-slate-900">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">82% Success</div>
                </div>
                <h4 className="text-sm font-black uppercase mb-2">Micro-Trust Indicators</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">Add tiny &quot;Live&quot; pulses or &quot;Encrypted&quot; lock icons to all currency displays. Reinforces the &quot;Bank Vault&quot; persona by signaling security.</p>
                <div className="h-1.5 w-full bg-slate-100 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Slide-Up Module Gallery */}
          <section className="mt-24">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-slate-900">Slide-Up Module Architecture</h2>
            <div className="flex flex-col xl:flex-row gap-8 items-end">
              
              {/* LAND ACQUISITION */}
              <div className="flex-1 min-w-[350px]">
                <MockSlideUp theme="light" title="Parcel Acquisition" subtitle="Real Estate" icon={MapPin}>
                  <div className="p-6 bg-slate-50 rounded-[20px] border border-slate-100 flex flex-col items-center text-center">
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest mb-4">Rare Opportunity</div>
                    <div className="text-3xl font-black text-slate-900 mb-1">$450.00</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Value Estimate</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-white rounded-[18px] border border-slate-100 shadow-sm flex flex-col gap-1">
                      <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Base Rent</div>
                      <div className="font-mono font-bold text-slate-900">$0.004/sec</div>
                    </div>
                    <div className="p-4 bg-white rounded-[18px] border border-slate-100 shadow-sm flex flex-col gap-1">
                      <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Multiplier</div>
                      <div className="font-mono font-bold text-[#00C805]">1.5x Boost</div>
                    </div>
                  </div>
                  <PrototypeButton theme="light" variant="accent" className="w-full py-4 shadow-xl">Acquire Property</PrototypeButton>
                </MockSlideUp>
              </div>

              {/* SUPPLY DROP */}
              <div className="flex-1 min-w-[350px]">
                <MockSlideUp theme="gray" title="Priority Vault" subtitle="Supply Drop" icon={Package}>
                  <div className="py-8 flex flex-col items-center gap-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#00C805]/20 blur-3xl animate-pulse rounded-full" />
                      <div className="w-32 h-32 bg-gray-bg rounded-3xl border-2 border-gray-border/30 flex items-center justify-center shadow-2xl relative z-10">
                        <Package className="w-16 h-16 text-gray-text opacity-80" />
                      </div>
                    </div>
                    
                    <BiometricHold theme="gray" onComplete={triggerReward} />
                  </div>
                  <PrototypeButton theme="gray" variant="ghost" className="w-full">Cancel Extraction</PrototypeButton>
                </MockSlideUp>
              </div>

              {/* MAYOR DASHBOARD */}
              <div className="flex-1 min-w-[350px]">
                <MockSlideUp theme="gray" title="City Hall" subtitle="Governance" icon={Trophy}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-bg/50 rounded-[20px] border border-gray-border/10">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-[14px] flex items-center justify-center border border-amber-500/30">
                        <Trophy className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-text-muted uppercase tracking-widest leading-none mb-1">Current Mayor</div>
                        <div className="text-sm font-black text-gray-text uppercase">Operator CLOUD_NINE</div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-bg/30 rounded-[20px] border border-gray-border/10">
                      <div className="text-[10px] font-bold text-gray-text-muted uppercase tracking-widest mb-3">Treasury Activity</div>
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Activity className="w-3 h-3 text-[#00C805]" />
                              <span className="text-[10px] text-gray-text font-medium">Payout Batch #{i}024</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#00C805]">+$12.40</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <PrototypeButton theme="gray" variant="primary" className="w-full">Manage Region</PrototypeButton>
                  </div>
                </MockSlideUp>
              </div>

              {/* STORE / SUBSCRIPTION */}
              <div className="flex-1 min-w-[350px]">
                <MockSlideUp theme="dark" title="Institutional Pass" subtitle="Marketplace" icon={ShoppingBag}>
                  <div className="space-y-4">
                    <div className="p-6 bg-slate-900 rounded-[24px] border border-slate-700 shadow-inner relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Crown className="w-24 h-24 text-amber-500" />
                      </div>
                      <div className="relative z-10">
                        <div className="text-xl font-black text-white mb-1">Insider Club</div>
                        <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-4">Elite Tier Membership</div>
                        <ul className="space-y-2">
                          <li className="text-[10px] text-slate-400 flex items-center gap-2">
                            <div className="w-1 h-1 bg-amber-500 rounded-full" />
                            90 BUCKS DAILY INJECTION
                          </li>
                          <li className="text-[10px] text-slate-400 flex items-center gap-2">
                            <div className="w-1 h-1 bg-amber-500 rounded-full" />
                            INSTANT RENT RE-INVESTMENT
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded-[18px] border border-slate-700">
                      <div className="flex flex-col">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subscription</div>
                        <div className="text-sm font-bold text-white">$49.99/mo</div>
                      </div>
                      <PrototypeButton theme="dark" variant="accent" className="px-4 py-2 text-[10px]">Subscribe</PrototypeButton>
                    </div>
                  </div>
                </MockSlideUp>
              </div>

            </div>
          </section>

        </main>

        <footer className="mt-24 pt-12 border-t border-slate-200 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">
            World of Influence - Interface Guidelines v1.0
          </p>
        </footer>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-25">{title}</h4>
      {children}
    </div>
  );
}
