"use client";

import { useEffect, useRef } from "react";

import { useGameStore } from "@/store/useGameStore";

type LiveBalanceProps = {
  className?: string;
};

export default function LiveBalance({ className }: LiveBalanceProps) {
  const walletBalance = useGameStore((state) => state.walletBalance);
  const getPendingRent = useGameStore((state) => state.getPendingRent);
  const balanceRef = useRef<HTMLSpanElement | null>(null);
  const rafId = useRef(0);

  useEffect(() => {
    const update = () => {
      const current = getPendingRent();
      if (balanceRef.current) {
        balanceRef.current.textContent = `$${current.toFixed(12)}`;
      }
      rafId.current = requestAnimationFrame(update);
    };

    rafId.current = requestAnimationFrame(update);

    return () => cancelAnimationFrame(rafId.current);
  }, [getPendingRent]);

  useEffect(() => {
    if (balanceRef.current) {
      balanceRef.current.textContent = `$${walletBalance.toFixed(12)}`;
    }
  }, [walletBalance]);

  return (
    <span ref={balanceRef} className={className}>
      ${walletBalance.toFixed(12)}
    </span>
  );
}
