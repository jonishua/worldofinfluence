"use client";

import { motion } from "framer-motion";
import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { useGameStore } from "@/store/useGameStore";

type PendingPillProps = {
  onClick: () => void;
  className?: string;
  minimal?: boolean;
};

const getEscrowColor = (progress: number) => {
  if (progress >= 1) {
    return "text-red-500";
  }
  if (progress >= 0.75) {
    return "text-amber-500";
  }
  return "text-[#00C805]";
};

const getEscrowBarColor = (progress: number) => {
  if (progress >= 1) {
    return "bg-red-500";
  }
  if (progress >= 0.75) {
    return "bg-amber-500";
  }
  return "bg-[#00C805]";
};

const boostColorClass = "text-[#39FF14] drop-shadow-[0_0_6px_rgba(57,255,20,0.9)]";
const formatCountdown = (totalMs: number) => {
  const clampedMs = Math.max(0, totalMs);
  const totalSeconds = Math.ceil(clampedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function PendingPill({ onClick, className = "", minimal = false }: PendingPillProps) {
  const getPendingRent = useGameStore((state) => state.getPendingRent);
  const lastSettledTime = useGameStore((state) => state.lastSettledTime);
  const escrowLimit = useGameStore((state) => state.escrowLimit);
  const boostEndTime = useGameStore((state) => state.boostEndTime);
  const isBoostActiveSelector = useGameStore((state) => state.isBoostActive);
  const balanceRef = useRef<HTMLParagraphElement | null>(null);
  const timerRef = useRef<HTMLSpanElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const rafId = useRef(0);
  const currentColor = useRef("text-[#00C805]");
  const currentBarColor = useRef("bg-[#00C805]");
  const currentBoost = useRef(false);
  const carryOverMs = useRef(0);
  const previousElapsed = useRef(0);
  const previousPending = useRef(0);
  const previousSettled = useRef(lastSettledTime);
  const [colorClass, setColorClass] = useState("text-[#00C805]");
  const [barClass, setBarClass] = useState("bg-[#00C805]");
  const [isBoostActive, setIsBoostActive] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const pending = getPendingRent(now);
      if (balanceRef.current) {
        balanceRef.current.textContent = `$${pending.toFixed(12)}`;
      }
      const elapsed = Math.max(0, now - lastSettledTime);
      if (lastSettledTime !== previousSettled.current) {
        if (pending + 0.000001 < previousPending.current) {
          carryOverMs.current = 0;
        } else {
          carryOverMs.current += previousElapsed.current;
        }
        previousSettled.current = lastSettledTime;
      }
      const adjustedElapsed = elapsed + carryOverMs.current;
      const progress = escrowLimit > 0 ? Math.min(adjustedElapsed / escrowLimit, 1) : 1;
      if (timerRef.current) {
        timerRef.current.textContent = `ESCROW TIMER: ${formatCountdown(
          escrowLimit - adjustedElapsed,
        )}`;
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
      previousElapsed.current = elapsed;
      previousPending.current = pending;

      const boostActive = isBoostActiveSelector(now);
      if (boostActive !== currentBoost.current) {
        currentBoost.current = boostActive;
        setIsBoostActive(boostActive);
      }

      const nextBarColor = getEscrowBarColor(progress);
      if (nextBarColor !== currentBarColor.current) {
        currentBarColor.current = nextBarColor;
        setBarClass(nextBarColor);
      }

      if (boostActive) {
        if (boostColorClass !== currentColor.current) {
          currentColor.current = boostColorClass;
          setColorClass(boostColorClass);
        }
      } else {
        const nextColor = getEscrowColor(progress);
        if (nextColor !== currentColor.current) {
          currentColor.current = nextColor;
          setColorClass(nextColor);
        }
      }

      rafId.current = requestAnimationFrame(update);
    };

    rafId.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId.current);
  }, [boostEndTime, escrowLimit, getPendingRent, isBoostActiveSelector, lastSettledTime]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      whileTap={{ scale: 0.98 }}
      className={`pointer-events-auto flex cursor-pointer flex-col ${className}`}
    >
      <div className="relative">
        {!minimal && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Pending Yield
          </p>
        )}
        <div className={`relative mt-2 overflow-hidden rounded-full bg-slate-100/80 px-4 py-2.5 ${minimal ? "mt-0 !bg-transparent !px-0 !py-0" : ""}`}>
          <div
            ref={barRef}
            className={`absolute inset-0 origin-left transition-transform duration-150 ${barClass} escrow-bar-fill ${
              isBoostActive ? "escrow-bar--boost" : ""
            } ${minimal ? "hidden" : ""}`}
            style={{ transform: "scaleX(0)" }}
            aria-hidden="true"
          />
          <p
            className={`relative z-10 font-mono text-xl font-semibold tabular-nums ${colorClass} pending-yield-text ${minimal ? "!text-2xl" : ""}`}
            ref={balanceRef}
          >
            $0.000000
          </p>
        </div>
        {!minimal && (
          <span
            ref={timerRef}
            className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00C805]/45"
          >
            ESCROW TIMER: 00:00
          </span>
        )}
        {isBoostActive && (
          <div className="cash-plus-layer" aria-hidden="true">
            <span className="cash-plus cash-plus--a">+</span>
            <span className="cash-plus cash-plus--b">+</span>
            <span className="cash-plus cash-plus--c">+</span>
          </div>
        )}
      </div>

      <span className="sr-only">
        Boost {isBoostActive ? "active" : "inactive"}
      </span>
    </motion.div>
  );
}
