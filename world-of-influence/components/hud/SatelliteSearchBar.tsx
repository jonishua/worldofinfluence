"use client";

import { Search, Zap, ArrowRight, X, Loader2 } from "lucide-react";
import { useMapStore } from "@/store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function SatelliteSearchBar() {
  const satelliteMode = useMapStore((state) => state.satelliteMode);
  const showSearchBar = false; // Hidden during standard Drone session
  const toggleSatelliteMode = useMapStore((state) => state.toggleSatelliteMode);
  const uplinkCharges = useMapStore((state) => state.uplinkCharges);
  const consumeUplinkCharge = useMapStore((state) => state.consumeUplinkCharge);
  const refillUplinkCharges = useMapStore((state) => state.refillUplinkCharges);
  const setSatelliteCameraLocation = useMapStore((state) => state.setSatelliteCameraLocation);
  const triggerMapFlyTo = useMapStore((state) => state.triggerMapFlyTo);
  
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-refill charges while in satellite mode
  useEffect(() => {
    if (!satelliteMode) return;
    
    const interval = setInterval(() => {
      refillUplinkCharges();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [satelliteMode, refillUplinkCharges]);

  const handleSearch = async () => {
    if (!searchValue.trim() || isLoading) return;

    // First check if it's already coordinates
    const coords = searchValue.split(',').map(p => parseFloat(p.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      if (consumeUplinkCharge()) {
        const target = { lat: coords[0], lng: coords[1] };
        setSatelliteCameraLocation(target);
        triggerMapFlyTo(target);
        setSearchValue("");
      }
      return;
    }

    // Otherwise, use Mapbox Geocoding
    if (!MAPBOX_TOKEN) {
      console.error("Mapbox token missing");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchValue)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        if (consumeUplinkCharge()) {
          const target = { lat, lng };
          setSatelliteCameraLocation(target);
          triggerMapFlyTo(target);
          setSearchValue("");
        }
      } else {
        alert("Location not found. Please try another search.");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      alert("Error searching for location.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <AnimatePresence>
      {showSearchBar && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="absolute left-1/2 top-[124px] z-[45] w-[calc(100%-64px)] max-w-md -translate-x-1/2"
        >
          <div className="flex flex-col gap-2 rounded-b-[20px] border-x border-b border-orange-500/20 bg-slate-900/95 p-3 pb-4 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl pt-12">
            <div className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-slate-800/60 px-3 py-2 border border-white/5">
                <Search className="h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter city, zip, or coordinates..." 
                  className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
                {searchValue && !isLoading && (
                  <button onClick={() => setSearchValue("")} className="p-1 hover:text-white text-slate-500 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {isLoading && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
                )}
              </div>
              <button 
                onClick={handleSearch}
                disabled={!searchValue.trim() || uplinkCharges === 0 || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between px-1 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Uplink Status</span>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
                        i < uplinkCharges 
                          ? "bg-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]" 
                          : "bg-slate-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-400">
                <Zap className={`h-3 w-3 fill-current ${uplinkCharges > 0 ? "animate-pulse" : "opacity-50"}`} />
                {uplinkCharges}/3 Charges
              </div>
            </div>

            <div className="border-t border-white/5 mt-2 pt-3 flex justify-center">
              <button 
                onClick={toggleSatelliteMode}
                className="group flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 hover:border-orange-500/50 bg-orange-500/5 hover:bg-orange-500/10 transition-all active:scale-95"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500 group-hover:text-orange-400">
                  Terminate Satellite Uplink
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
