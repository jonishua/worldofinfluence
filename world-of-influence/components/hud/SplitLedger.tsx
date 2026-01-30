"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Lock, Zap, Newspaper, Coins, Landmark, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import PendingPill from "@/components/hud/PendingPill";
import IncomeDetailModal from "@/components/modals/IncomeDetailModal";
import { 
  useEconomyStore, 
  useGovernanceStore, 
} from "@/store/useGameStore";

const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

type SplitLedgerProps = {
  onOpenProfile?: () => void;
  isProfileOpen?: boolean;
};

export default function SplitLedger({ onOpenProfile }: SplitLedgerProps) {
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletPulseId, setWalletPulseId] = useState(0);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adMessage, setAdMessage] = useState("Connecting to Sponsor...");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBoostActive, setIsBoostActive] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isWalletPulsing, setIsWalletPulsing] = useState(false);
  const boostEndTime = useEconomyStore((state) => state.boostEndTime);
  const isBoostActiveSelector = useEconomyStore((state) => state.isBoostActive);
  const extendBoost = useEconomyStore((state) => state.extendBoost);
  const playerAvatar = useGovernanceStore(
    (state) => state.playerPositions.city?.entry.avatarUrl ?? "/globe.svg",
  );
  const playerName = useGovernanceStore((state) => state.playerPositions.city?.entry.name ?? "Player");
  const isTickerVisible = useGovernanceStore((state) => state.isTickerVisible);
  const setTickerVisible = useGovernanceStore((state) => state.setTickerVisible);
  const feedEvents = useGovernanceStore((state) => state.feedEvents);
  const credits = useEconomyStore((state) => state.credits);
  const influenceBucks = useEconomyStore((state) => state.influenceBucks);
  const zoningPermits = useEconomyStore((state) => state.zoningPermits);
  const walletBalance = useEconomyStore((state) => state.walletBalance);

  const formattedCredits = Math.floor(credits).toLocaleString();
  const formattedBucks = Math.floor(influenceBucks).toLocaleString();
  const formattedPermits = Math.floor(zoningPermits).toLocaleString();

  const tickerText = useMemo(
    () => (feedEvents.length > 0 ? feedEvents.join(" • ") : "Market feed online."),
    [feedEvents],
  );

  const adTimeouts = useRef<number[]>([]);
  const toastTimeout = useRef<number | null>(null);
  const boostShockTimeout = useRef<number | null>(null);
  const previousBoost = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showBoostShock, setShowBoostShock] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    const updateBoost = () => {
      const now = Date.now();
      setIsBoostActive(isBoostActiveSelector(now));
      if (boostEndTime) {
        setRemainingSeconds(Math.max(0, Math.floor((boostEndTime - now) / 1000)));
      } else {
        setRemainingSeconds(0);
      }
    };
    updateBoost();
    const interval = window.setInterval(updateBoost, 1000);
    return () => {
      window.clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      adTimeouts.current.forEach((timeout) => window.clearTimeout(timeout));
      if (toastTimeout.current) {
        window.clearTimeout(toastTimeout.current);
      }
      if (boostShockTimeout.current) {
        window.clearTimeout(boostShockTimeout.current);
      }
    };
  }, [isBoostActiveSelector, boostEndTime]);

  useEffect(() => {
    if (isBoostActive && !previousBoost.current) {
      setTimeout(() => setShowBoostShock(true), 0);
      if (boostShockTimeout.current) {
        window.clearTimeout(boostShockTimeout.current);
      }
      boostShockTimeout.current = window.setTimeout(() => {
        setShowBoostShock(false);
      }, 800);
    }
    previousBoost.current = isBoostActive;
  }, [isBoostActive]);

  useEffect(() => {
    if (walletPulseId === 0) {
      return;
    }
    setTimeout(() => setIsWalletPulsing(true), 0);
    const timeout = window.setTimeout(() => setIsWalletPulsing(false), 700);
    return () => window.clearTimeout(timeout);
  }, [walletPulseId]);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimeout.current) {
      window.clearTimeout(toastTimeout.current);
    }
    toastTimeout.current = window.setTimeout(() => setToastMessage(null), 2400);
  };

  const startAdBoost = () => {
    if (isBoostActive) {
      const remaining = boostEndTime
        ? Math.max(0, Math.floor((boostEndTime - Date.now()) / 1000))
        : 0;
      showToast(`Boost active! Time remaining: ${formatDuration(remaining)}`);
      return;
    }
    setIsAdLoading(true);
    setAdMessage("Connecting to Sponsor...");
    const first = window.setTimeout(() => {
      setAdMessage("Verifying View...");
    }, 1000);
    const second = window.setTimeout(() => {
      extendBoost();
      setIsAdLoading(false);
    }, 2000);
    adTimeouts.current = [first, second];
  };

  return (
    <>
      <div className="pointer-events-none fixed left-0 right-0 top-6 z-50 flex flex-col items-center">
        <div className="w-full max-w-[860px] px-4">
          <div
            className={`pointer-events-auto relative flex items-stretch gap-4 rounded-[24px] border border-white/70 bg-white/95 p-3 shadow-2xl backdrop-blur-xl transition-all ${
              isBoostActive ? "ring-2 ring-[#39FF14]/40 shadow-[0_0_30px_-5px_#39FF14]" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => onOpenProfile?.()}
              className="relative flex-shrink-0 group"
            >
              <div className="h-16 w-16 overflow-hidden rounded-[18px] border-2 border-slate-100 shadow-sm transition group-hover:border-[var(--accent-color)]">
                <img
                  src={playerAvatar}
                  alt={`${playerName} avatar`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
            </button>

            <div className="flex flex-1 flex-col justify-between py-0.5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Pending Yield
                  </span>
                  <div className="flex items-baseline gap-2">
                    <PendingPill onClick={() => setIsIncomeOpen(true)} minimal className="!p-0 !shadow-none !border-none" />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-slate-100/50 rounded-xl px-3 py-1.5 border border-slate-200/50">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 leading-none">Status</span>
                    <AnimatePresence mode="wait">
                      {isBoostActive ? (
                        <motion.span
                          key="active"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="font-mono text-[10px] font-black text-[#39FF14] leading-none mt-1"
                        >
                          {formatDuration(remainingSeconds)}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="inactive"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="font-mono text-[10px] font-bold text-slate-400 leading-none mt-1"
                        >
                          READY
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.button
                    type="button"
                    onClick={startAdBoost}
                    animate={{ scale: isBoostActive ? [1, 1.05, 1] : 1 }}
                    transition={{ duration: 1.5, repeat: isBoostActive ? Infinity : 0 }}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                      isBoostActive
                        ? "bg-[#39FF14] text-slate-900 shadow-[0_0_15px_rgba(57,255,20,0.4)]"
                        : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                    }`}
                  >
                    <Zap className={`h-5 w-5 ${isBoostActive ? "fill-slate-900" : ""}`} />
                  </motion.button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-1">
                <div className="flex items-center gap-2" title="Credits">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100">
                    <Coins className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-600 tabular-nums">{formattedCredits}</span>
                </div>
                <div className="flex items-center gap-2" title="Influence Bucks">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50">
                    <Landmark className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-600 tabular-nums">{formattedBucks}</span>
                </div>
                <div className="flex items-center gap-2" title="Zoning Permits">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50">
                    <FileText className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-600 tabular-nums">{formattedPermits}</span>
                </div>
                <button 
                  onClick={() => setIsWalletOpen(true)}
                  className="flex items-center gap-2 border-l border-slate-100 pl-4 hover:opacity-70 transition-opacity"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100/50">
                    <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[var(--accent-color)] tabular-nums">
                    ${walletBalance.toFixed(8)}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-start">
            <motion.div
              layout
              initial={false}
              animate={{ 
                width: isTickerVisible ? "100%" : "42px",
                borderColor: isTickerVisible ? "rgba(0, 200, 5, 0.3)" : "rgba(15, 23, 42, 0.15)",
              }}
              transition={{ type: "spring", damping: 25, stiffness: 150 }}
              className={`pointer-events-auto relative flex h-10 items-center overflow-hidden rounded-full border bg-slate-950/90 shadow-2xl backdrop-blur-xl transition-shadow ${
                isTickerVisible ? "shadow-[0_0_20px_-5px_rgba(0,200,5,0.2)]" : "shadow-lg"
              }`}
            >
              <button
                type="button"
                onClick={() => setTickerVisible(!isTickerVisible)}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center transition-all active:scale-90 ${
                  isTickerVisible ? "text-[var(--accent-color)]" : "text-slate-400 hover:text-slate-200"
                }`}
                aria-label={isTickerVisible ? "Hide News Feed" : "Show News Feed"}
              >
                <Newspaper className={`h-4 w-4 ${isTickerVisible ? "animate-pulse" : ""}`} />
              </button>

              <AnimatePresence>
                {isTickerVisible && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 overflow-hidden pr-4"
                  >
                    <div className="feed-ticker__track py-1">
                      <span className="feed-ticker__content text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-100 whitespace-nowrap">
                        {tickerText}
                      </span>
                      <span className="feed-ticker__content text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-100 whitespace-nowrap" aria-hidden="true">
                        {tickerText}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      <IncomeDetailModal
        isOpen={isIncomeOpen}
        onClose={() => setIsIncomeOpen(false)}
        onSettled={() => setWalletPulseId((prev) => prev + 1)}
        onRequestBoost={startAdBoost}
      />

      {toastMessage && (
        <div className="pointer-events-none fixed left-1/2 top-24 z-[650] -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
          {toastMessage}
        </div>
      )}

      {isAdLoading && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/70 px-6 text-center text-white">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-6 py-5 shadow-xl backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              Ad Boost
            </p>
            <p className="mt-2 text-sm font-semibold">{adMessage}</p>
          </div>
        </div>
      )}

      {isWalletOpen && (
        <div className="fixed inset-0 z-[700] flex items-end justify-center bg-black/40 px-4 pb-6 pt-10 backdrop-blur-[2px]">
          <div className="w-full max-w-[520px] rounded-[20px] bg-white px-6 py-6 text-left shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Wallet
              </p>
              <button
                type="button"
                onClick={() => setIsWalletOpen(false)}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Close
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Cash out options will appear here.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
