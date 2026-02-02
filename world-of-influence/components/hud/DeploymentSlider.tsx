"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Target, X, Rocket } from "lucide-react";
import { useMapStore, calculateDistance, DRONE_TETHER_RADIUS_KM } from "@/store/useGameStore";

export default function DeploymentSlider() {
  const droneStatus = useMapStore((state) => state.droneStatus);
  const selectedParcel = useMapStore((state) => state.selectedParcel);
  const userLocation = useMapStore((state) => state.userLocation);
  const confirmDeployment = useMapStore((state) => state.confirmDeployment);
  const cancelDrone = useMapStore((state) => state.cancelDrone);
  
  const distance = (selectedParcel && userLocation) 
    ? calculateDistance(userLocation, selectedParcel.center) 
    : 0;
  
  const distanceMiles = distance * 0.621371;
  const isOutOfRange = distance > DRONE_TETHER_RADIUS_KM;
  const isReady = selectedParcel && !isOutOfRange;

  const handleDeploy = () => {
    if (isReady) {
      confirmDeployment(selectedParcel.center);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 30, 100]);
      }
    }
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] flex flex-col items-center px-0">
      <AnimatePresence>
        {droneStatus === "targeting" && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="slide-up pointer-events-auto flex w-full max-w-[520px] flex-col items-center gap-6 rounded-t-[24px] bg-[var(--card-bg)]/95 px-6 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl border-x border-t border-cyan-500/20"
          >
            {/* Header / Title */}
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-2 text-cyan-400">
                <Rocket className="h-5 w-5 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Deployment Uplink</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Targeting Mode</h3>
            </div>

            {/* Target Info */}
            <div className="flex w-full flex-col gap-3">
              {selectedParcel ? (
                <div className={`flex items-center justify-between rounded-xl border p-4 transition-colors duration-300 ${isOutOfRange ? 'border-rose-500/30 bg-rose-500/10' : 'border-cyan-500/20 bg-[var(--gray-surface)]/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isOutOfRange ? 'bg-rose-500/10 text-rose-500' : 'bg-cyan-500/10 text-cyan-400'}`}>
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Distance</div>
                    <div className={`font-mono text-sm font-bold ${isOutOfRange ? 'text-rose-500' : 'text-cyan-400'}`}>
                      {distance.toFixed(2)} km / {distanceMiles.toFixed(2)} mi
                    </div>
                  </div>
                  </div>
                  {isOutOfRange && (
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500 animate-pulse">
                      Signal Lost
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--gray-surface)]/30 p-4">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Tap map to set coordinates</span>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Buttons */}
            <div className="flex w-full items-center gap-3">
              <motion.button
                whileHover={{ scale: isReady ? 1.02 : 1 }}
                whileTap={{ scale: isReady ? 0.98 : 1 }}
                onClick={handleDeploy}
                disabled={!isReady}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                  isReady 
                    ? "border-[#00C805]/50 bg-[#00C805] text-white shadow-[0_0_20px_rgba(0,200,5,0.4)]" 
                    : "border-slate-800 bg-slate-900/80 text-slate-600 shadow-inner"
                }`}
              >
                <Rocket className="h-4 w-4" />
                <span>Confirm Location</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelDrone}
                className="flex h-14 w-14 items-center justify-center rounded-xl border border-rose-500/30 bg-[var(--gray-bg)]/90 text-rose-500 shadow-xl transition-colors hover:bg-rose-500 hover:text-[var(--text-primary)]"
                title="Cancel Targeting"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Range Disclaimer */}
            <div className="text-[10px] font-medium text-[var(--text-muted)] italic">
              * Deployment restricted to 10-mile (16km) tether radius.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
