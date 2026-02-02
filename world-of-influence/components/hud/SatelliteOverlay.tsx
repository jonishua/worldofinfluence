"use client";

import { 
  useMapStore, 
  calculateDistance, 
  DRONE_TETHER_RADIUS_KM,
  DRONE_SESSION_DURATION_SEC 
} from "@/store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";
import { Battery, Power, Signal, Zap, Crosshair, Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function SatelliteOverlay() {
  const satelliteMode = useMapStore((state) => state.satelliteMode);
  const viewingMode = useMapStore((state) => state.viewingMode);
  const droneStatus = useMapStore((state) => state.droneStatus);
  const droneTimer = useMapStore((state) => state.droneTimer);
  const userLocation = useMapStore((state) => state.userLocation);
  const satelliteCameraLocation = useMapStore((state) => state.satelliteCameraLocation);
  const cancelDrone = useMapStore((state) => state.cancelDrone);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const batteryPercent = (droneTimer / DRONE_SESSION_DURATION_SEC) * 100;

  const signalStrength = useMemo(() => {
    if (!userLocation || !satelliteCameraLocation) return 100;
    const dist = calculateDistance(userLocation, satelliteCameraLocation);
    const strength = Math.max(5, 100 - (dist / DRONE_TETHER_RADIUS_KM) * 100);
    return Math.round(strength);
  }, [userLocation, satelliteCameraLocation]);

  const jitterAmount = useMemo(() => {
    return Math.max(0, (100 - signalStrength) / 20); // Intensity of noise
  }, [signalStrength]);

  const statusLabel = {
    idle: "System Offline",
    targeting: "Awaiting Coordinates",
    deploying: "In-Flight / Deploying",
    active: "Tactical Scout Active",
  }[droneStatus];

  return (
    <AnimatePresence>
      {satelliteMode && (
        <>
          {/* Tactical HUD Elements */}
          <div className="pointer-events-none absolute inset-0 z-[45] flex flex-col items-center p-4 pt-[132px]">
            {/* Top Stats - Integrated Panel */}
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="flex w-full max-w-md flex-col overflow-hidden rounded-b-[20px] border-x border-b border-cyan-500/20 bg-[var(--gray-bg)]/90 shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between p-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                    {droneStatus === 'active' ? (
                      <Battery className={`h-6 w-6 ${droneTimer < 60 ? 'animate-pulse text-rose-500' : ''}`} />
                    ) : droneStatus === 'deploying' ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Crosshair className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      {droneStatus === 'active' ? `Ends in ${formatTime(droneTimer)}` : 'Drone Status'}
                    </div>
                    <div className={`font-mono text-sm font-bold uppercase tracking-wider ${droneStatus === 'active' ? 'text-cyan-400' : 'text-orange-400'}`}>
                      {statusLabel}
                    </div>
                  </div>
                </div>

                <div className="h-10 w-[1px] bg-[var(--card-border)]" />

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Signal</div>
                    <div className="flex items-center justify-end gap-1 font-mono text-xl font-bold text-cyan-400">
                      {signalStrength}% <Signal className="h-4 w-4" />
                    </div>
                  </div>
                  {droneStatus === "active" ? (
                    <button
                      onClick={cancelDrone}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20 text-rose-500 transition-all hover:bg-rose-500 hover:text-[var(--text-primary)] active:scale-95 pointer-events-auto"
                      title="Terminate Uplink"
                    >
                      <Power className="h-5 w-5" />
                    </button>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                      <div className={`h-2.5 w-2.5 rounded-full bg-cyan-400 ${signalStrength > 20 ? 'animate-pulse' : 'bg-rose-500'}`} />
                    </div>
                  )}
                </div>
              </div>

              {/* Status Specific Progress/Info */}
              <div className="h-1.5 w-full bg-[var(--gray-surface)]/50">
                {droneStatus === "active" ? (
                  <motion.div 
                    className={`h-full transition-colors duration-500 ${droneTimer < 60 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                    initial={{ width: "100%" }}
                    animate={{ width: `${batteryPercent}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                ) : droneStatus === "deploying" ? (
                  <motion.div 
                    className="h-full bg-orange-500"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    style={{ width: "30%" }}
                  />
                ) : null}
              </div>
            </motion.div>
          </div>

          {/* CRT Blink/Power-on effect */}
          <motion.div
            key="crt-blink"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0, 0.5, 0, 0],
              transition: { duration: 0.4, times: [0, 0.1, 0.2, 0.3, 0.4, 0.5] }
            }}
            className="pointer-events-none absolute inset-0 z-[6] bg-[var(--card-bg)]/20"
          />

          {/* Deep Navy Blueprint Tint */}
          {viewingMode === "drone" && droneStatus !== "active" && (
            <motion.div
              key="blueprint-tint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-none absolute inset-0 z-[5] bg-[#0F172A] mix-blend-multiply"
            />
          )}

          {/* Scanlines SVG Overlay with Dynamic Jitter */}
          {viewingMode === "drone" && droneStatus !== "active" && (
            <motion.div
              key="scanlines"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                x: [0, -jitterAmount, jitterAmount, 0],
                y: [0, jitterAmount/2, -jitterAmount/2, 0]
              }}
              transition={{ 
                opacity: { duration: 0.5 },
                x: { duration: 0.1, repeat: Infinity },
                y: { duration: 0.15, repeat: Infinity }
              }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-[7]"
            >
              <svg className="h-full w-full opacity-[0.2]">
                <defs>
                  <pattern id="scanline-pattern" width="100%" height="4" patternUnits="userSpaceOnUse">
                    <rect width="100%" height="2" fill="black" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#scanline-pattern)" />
              </svg>
              
              {/* Vingette */}
              <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30" />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
