"use client";

import { motion } from "framer-motion";
import { Coins, FileText, Gem, Box, Circle } from "lucide-react";
import type { SymbolType } from "@/types/slots";

type SlotSymbolProps = {
  symbol: SymbolType;
  isSpinning?: boolean;
  isHighlighted?: boolean;
  isWinner?: boolean;
  size?: number;
};

const SYMBOL_CONFIG: Record<
  SymbolType,
  { icon: typeof Coins; color: string; glowColor?: string }
> = {
  SEVEN: {
    icon: Coins,
    color: "text-yellow-400",
    glowColor: "drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]",
  },
  PERMIT: {
    icon: FileText,
    color: "text-blue-400",
    glowColor: "drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]",
  },
  DIAMOND: {
    icon: Gem,
    color: "text-cyan-300",
    glowColor: "drop-shadow-[0_0_8px_rgba(103,232,249,0.6)]",
  },
  BAR: {
    icon: Box,
    color: "text-yellow-500",
    glowColor: "drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]",
  },
  COIN: {
    icon: Circle,
    color: "text-slate-400",
  },
};

export default function SlotSymbol({
  symbol,
  isSpinning = false,
  isHighlighted = false,
  isWinner = false,
  size = 64,
}: SlotSymbolProps) {
  const config = SYMBOL_CONFIG[symbol];
  const Icon = config.icon;

  return (
    <motion.div
      animate={isWinner ? {
        scale: [1, 1.2, 1],
        filter: [
          "drop-shadow(0 0 0px rgba(0,200,5,0))",
          "drop-shadow(0 0 15px rgba(0,200,5,0.8))",
          "drop-shadow(0 0 0px rgba(0,200,5,0))"
        ]
      } : {
        scale: isHighlighted ? 1.1 : 1,
      }}
      transition={isWinner ? {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      } : {
        duration: 0.3
      }}
      className={`flex items-center justify-center ${
        isSpinning ? "opacity-60 blur-[2px]" : "opacity-100 blur-0"
      }`}
    >
      <Icon
        className={`${config.color} ${config.glowColor ?? ""} ${
          isHighlighted || isWinner ? "text-[#00C805]" : ""
        } transition-colors duration-200`}
        size={size}
        strokeWidth={symbol === "SEVEN" ? 1.5 : 1.2}
      />
    </motion.div>
  );
}
