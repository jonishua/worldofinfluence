"use client";

import { useMapStore } from "@/store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";

export default function SatelliteOverlay() {
  const satelliteMode = useMapStore((state) => state.satelliteMode);

  return (
    <AnimatePresence>
      {satelliteMode && (
        <>
          {/* CRT Blink/Power-on effect */}
          <motion.div
            key="crt-blink"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0, 0.5, 0, 0],
              transition: { duration: 0.4, times: [0, 0.1, 0.2, 0.3, 0.4, 0.5] }
            }}
            className="pointer-events-none absolute inset-0 z-[6] bg-white/20"
          />

          {/* Deep Navy Blueprint Tint */}
          <motion.div
            key="blueprint-tint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute inset-0 z-[5] bg-[#0F172A] mix-blend-multiply"
          />

          {/* Scanlines SVG Overlay */}
          <motion.div
            key="scanlines"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-[7]"
          >
            <svg className="h-full w-full opacity-[0.15]">
              <defs>
                <pattern id="scanline-pattern" width="100%" height="4" patternUnits="userSpaceOnUse">
                  <rect width="100%" height="2" fill="black" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#scanline-pattern)" />
            </svg>
            
            {/* Vingette */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/20" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
