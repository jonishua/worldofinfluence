"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Coins, FileText, Landmark } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useEconomyStore } from "@/store/useGameStore";

const TICKER_INTERVAL_MS = 5000;

export default function AssetTicker() {
  const influenceBucks = useEconomyStore((state) => state.influenceBucks);
  const credits = useEconomyStore((state) => state.credits);
  const zoningPermits = useEconomyStore((state) => state.zoningPermits);
  const [index, setIndex] = useState(0);

  const items = useMemo(
    () => [
      {
        key: "influence",
        icon: Landmark,
        label: `${influenceBucks.toLocaleString()} Influence Bucks`,
      },
      {
        key: "credits",
        icon: Coins,
        label: `${credits.toLocaleString()} Credits`,
      },
      {
        key: "permits",
        icon: FileText,
        label: `${zoningPermits.toLocaleString()} Zoning Permit${
          zoningPermits === 1 ? "" : "s"
        }`,
      },
    ],
    [credits, influenceBucks, zoningPermits],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, TICKER_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [items.length]);

  const active = items[index];
  const Icon = active.icon;

  return (
    <div className="pointer-events-none relative">
      <div className="rounded-full bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <Icon className="h-3.5 w-3.5 text-[var(--accent-color)]" />
            <span>{active.label}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
