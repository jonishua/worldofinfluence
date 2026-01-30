"use client";

import { Lock } from "lucide-react";
import { useEffect, useState } from "react";

import { useGameStore } from "@/store/useGameStore";

type WalletPillProps = {
  onClick: () => void;
  pulseId: number;
};

export default function WalletPill({ onClick, pulseId }: WalletPillProps) {
  const walletBalance = useGameStore((state) => state.walletBalance);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (pulseId === 0) {
      return;
    }
    setIsPulsing(true);
    const timeout = window.setTimeout(() => setIsPulsing(false), 700);
    return () => window.clearTimeout(timeout);
  }, [pulseId]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`pointer-events-auto flex items-center gap-3 rounded-full border border-transparent bg-[#1F2937] px-5 py-3 text-left shadow-lg ${
        isPulsing ? "wallet-pulse" : ""
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10">
        <Lock className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
          Secured Wallet
        </p>
        <p className="mt-1 text-lg font-semibold text-white">
          ${walletBalance.toFixed(12)}
        </p>
      </div>
    </button>
  );
}
