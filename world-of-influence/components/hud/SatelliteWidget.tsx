"use client";

import { User, Drone } from "lucide-react";
import { useMapStore } from "@/store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";

export default function SatelliteWidget() {
  const satelliteMode = useMapStore((state) => state.satelliteMode);
  const viewingMode = useMapStore((state) => state.viewingMode);
  const droneStatus = useMapStore((state) => state.droneStatus);
  const userLocation = useMapStore((state) => state.userLocation);
  const droneTetherCenter = useMapStore((state) => state.droneTetherCenter);
  const toggleSatelliteMode = useMapStore((state) => state.toggleSatelliteMode);
  const triggerMapFlyTo = useMapStore((state) => state.triggerMapFlyTo);
  const setSatelliteCameraLocation = useMapStore((state) => state.setSatelliteCameraLocation);
  const setViewingMode = useMapStore((state) => state.setViewingMode);
  
  const handleViewToggle = (view: "personal" | "drone") => {
    setViewingMode(view);
    if (view === "personal" && userLocation) {
      triggerMapFlyTo(userLocation);
      setSatelliteCameraLocation(userLocation);
    } else if (view === "drone" && droneTetherCenter) {
      triggerMapFlyTo(droneTetherCenter);
      setSatelliteCameraLocation(droneTetherCenter);
    }
  };

  return (
    <div className="absolute bottom-32 right-6 z-[500] flex flex-col gap-3">
      <AnimatePresence>
        {(droneStatus === "idle" || droneStatus === "targeting") && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSatelliteMode}
            className={`flex h-14 w-14 items-center justify-center rounded-[16px] shadow-xl transition-all duration-300 ${
              satelliteMode 
                ? "bg-cyan-500 text-[var(--text-primary)] shadow-[0_0_20px_rgba(6,182,212,0.5)] border-none" 
                : "bg-[var(--card-bg)]/90 backdrop-blur-xl text-[var(--text-primary)] border border-[var(--card-border)]"
            }`}
          >
            <Drone className={`h-6 w-6 ${satelliteMode ? "animate-pulse" : ""}`} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {satelliteMode && droneStatus === "active" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleViewToggle("drone")}
              className={`flex h-12 w-12 items-center justify-center rounded-[14px] backdrop-blur-md border shadow-lg transition-colors ${
                viewingMode === "drone" ? "bg-cyan-500 text-slate-950 border-cyan-400" : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
              }`}
              title="View Drone"
            >
              <Drone className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleViewToggle("personal")}
              className={`flex h-12 w-12 items-center justify-center rounded-[14px] backdrop-blur-md border shadow-lg transition-colors ${
                viewingMode === "personal" ? "bg-[var(--gray-bg)] text-[var(--text-primary)] border-[var(--card-border)]" : "bg-[var(--card-bg)]/80 text-[var(--text-muted)] border border-[var(--card-border)]"
              }`}
              title="View Personal"
            >
              <User className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
