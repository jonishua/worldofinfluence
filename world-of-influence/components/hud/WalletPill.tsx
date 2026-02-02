"use client";

import { Lock } from "lucide-react";
import { useEffect, useState } from "react";

import { useEconomyStore } from "@/store/useGameStore";

type WalletPillProps = {
  onClick: () => void;
  pulseId: number;
};

export default function WalletPill({ onClick, pulseId }: WalletPillProps) {
  const walletBalance = useEconomyStore((state) => state.walletBalance);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (pulseId === 0) {
      return;
    }
    const startTimeout = window.setTimeout(() => setIsPulsing(true), 0);
    const endTimeout = window.setTimeout(() => setIsPulsing(false), 700);
    return () => {
      window.clearTimeout(startTimeout);
      window.clearTimeout(endTimeout);
    };
  }, [pulseId]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`pointer-events-auto flex items-center gap-3 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-5 py-3 text-left shadow-lg backdrop-blur-xl ${
        isPulsing ? "wallet-pulse" : ""
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--gray-surface)]/50">
        <Lock className="h-4 w-4 text-[var(--text-primary)]" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Secured Wallet
        </p>
        <p className="mt-1 text-lg font-semibold font-mono tabular-nums text-[var(--text-primary)]">
          ${walletBalance.toFixed(12)}
        </p>
      </div>
    </button>
  );
}
