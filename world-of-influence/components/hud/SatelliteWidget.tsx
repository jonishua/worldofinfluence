"use client";

import { SatelliteDish, Navigation } from "lucide-react";
import { useMapStore } from "@/store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";

export default function SatelliteWidget() {
  const satelliteMode = useMapStore((state) => state.satelliteMode);
  const toggleSatelliteMode = useMapStore((state) => state.toggleSatelliteMode);
  
  // For now, we'll just have a placeholder for recenter logic 
  // since the map component handles its own auto-centering.
  // In a real scenario, this would trigger the map to fly back to user.

  return (
    <div className="absolute bottom-32 right-6 z-[500] flex flex-col gap-3">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleSatelliteMode}
        className={`flex h-14 w-14 items-center justify-center rounded-[16px] shadow-xl transition-all duration-300 ${
          satelliteMode 
            ? "bg-[#F59E0B] text-white shadow-[0_0_20px_rgba(245,158,11,0.5)] border-none" 
            : "bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-800 dark:text-slate-100 border border-white/20 dark:border-slate-700/50"
        }`}
      >
        <SatelliteDish className={`h-6 w-6 ${satelliteMode ? "animate-pulse" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {satelliteMode && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSatelliteMode} // Toggling off returns to GPS
            className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-800 dark:text-slate-100 border border-white/20 dark:border-slate-700/50 shadow-lg"
          >
            <Navigation className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
