"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import type { SymbolType } from "@/types/slots";
import { REEL_STRIP } from "@/lib/slotsLogic";
import SlotSymbol from "./SlotSymbol";

type ReelProps = {
  targetSymbol: SymbolType;
  isSpinning: boolean;
  stopDelay: number;
  onStop?: () => void;
  isNearMiss?: boolean;
  isWinner?: boolean;
};

const SYMBOL_HEIGHT = 80;

export default function Reel({
  targetSymbol,
  isSpinning,
  stopDelay,
  onStop,
  isNearMiss = false,
  isWinner = false,
}: ReelProps) {
  const [isStopped, setIsStopped] = useState(false);
  const y = useMotionValue(0);
  
  // Memoize the strip to avoid expensive array operations on every render
  const extendedStrip = useMemo(() => Array(10).fill(REEL_STRIP).flat(), []);

  const onStopRef = useRef(onStop);
  useEffect(() => {
    onStopRef.current = onStop;
  }, [onStop]);

  useEffect(() => {
    if (isSpinning) {
      const timeout = window.setTimeout(() => setIsStopped(false), 0);
      return () => window.clearTimeout(timeout);
    }
  }, [isSpinning]);

  useEffect(() => {
    if (!isSpinning) {
      return;
    }

    // Get the current position to calculate where we are in the strip
    const currentY = y.get();
    const stripLength = REEL_STRIP.length;
    const totalStripHeight = stripLength * SYMBOL_HEIGHT;
    
    // Calculate which index in the single strip we are currently aligned with
    // We use modulo to find our relative position and "snap" back to the first strip iteration
    // This is visually seamless because the strip repeats
    const normalizedY = currentY % totalStripHeight;
    y.set(normalizedY);

    // Now target a symbol deep in our repeated strip (e.g., 7th iteration)
    // This ensures we always spin "down" and cover a consistent distance
    const targetIndexInStrip = REEL_STRIP.indexOf(targetSymbol);
    const targetIndex = (stripLength * 7) + targetIndexInStrip;
    const targetPosition = -(targetIndex * SYMBOL_HEIGHT);

    // Calculate duration - near-miss extends reel 3 by 1s
    const duration = (isNearMiss ? stopDelay + 1000 : stopDelay) / 1000;

    // Use framer-motion's high-performance animate function
    const controls = animate(y, targetPosition, {
      duration: duration,
      ease: [0.45, 0.05, 0.55, 0.95],
      onUpdate: (latest) => {
        // Haptic "ticks" sampled for performance
        const currentSymbolIndex = Math.floor(Math.abs(latest) / SYMBOL_HEIGHT);
        if (currentSymbolIndex % 2 === 0 && latest > targetPosition + 200) {
          if ("vibrate" in navigator) {
            navigator.vibrate(2);
          }
        }
      },
      onComplete: () => {
        // Satisfaction bounce
        animate(y, [targetPosition, targetPosition - 15, targetPosition], {
          duration: 0.4,
          ease: "easeOut",
          onComplete: () => {
            setIsStopped(true);
            onStopRef.current?.();
          }
        });
      }
    });

    return () => controls.stop();
  }, [isSpinning, targetSymbol, stopDelay, isNearMiss, y]);

  return (
    <div className="relative h-[80px] w-[80px] overflow-hidden rounded-[12px] border border-white/20 bg-white/10 backdrop-blur-md">
      {/* Mask for top/bottom fade */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#1F2937] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#1F2937] to-transparent" />
      </div>

      {/* Reel container */}
      <motion.div
        className="flex flex-col items-center justify-start"
        style={{ y }}
      >
        {extendedStrip.map((symbol, index) => (
          <div
            key={`${symbol}-${index}`}
            className="flex h-[80px] w-[80px] items-center justify-center shrink-0"
          >
            <SlotSymbol
              symbol={symbol}
              isSpinning={isSpinning && !isStopped}
              isWinner={isWinner && isStopped && symbol === targetSymbol}
              size={64}
            />
          </div>
        ))}
      </motion.div>

      {/* Center payline indicator */}
      <div className="absolute left-0 right-0 top-1/2 z-20 h-[2px] -translate-y-1/2 bg-[#00C805]/50" />
    </div>
  );
}
