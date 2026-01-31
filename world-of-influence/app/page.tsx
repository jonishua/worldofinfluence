"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import GameMapClient from "@/components/GameMapClient";
import PropertySheet from "@/components/PropertySheet";
import PurchaseModal from "@/components/PurchaseModal";
import TerminalModal from "@/components/modals/TerminalModal";
import ShopModal from "@/components/modals/ShopModal";
import PlayerProfileModal from "@/components/modals/PlayerProfileModal";
import MayorDashboard from "@/components/modals/MayorDashboard";
import ThemeProvider from "@/components/ThemeProvider";
import LeaderboardPanel from "@/components/hud/LeaderboardPanel";
import LeaderboardWidget from "@/components/hud/LeaderboardWidget";
import SplitLedger from "@/components/hud/SplitLedger";
import SatelliteWidget from "@/components/hud/SatelliteWidget";
import SatelliteOverlay from "@/components/hud/SatelliteOverlay";
import SatelliteSearchBar from "@/components/hud/SatelliteSearchBar";
import { useGovernanceStore } from "@/store/useGameStore";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const selectedJurisdiction = useGovernanceStore((state) => state.selectedJurisdiction);
  const setSelectedJurisdiction = useGovernanceStore((state) => state.setSelectedJurisdiction);

  return (
    <ThemeProvider>
      <div className="relative h-screen w-screen overflow-hidden bg-[var(--bg-color)] text-[var(--text-primary)]">
        <GameMapClient />
        <SatelliteOverlay />
        <SatelliteSearchBar />
        <SplitLedger 
          onOpenProfile={() => setIsProfileOpen(true)}
          isProfileOpen={isProfileOpen}
        />
        <LeaderboardWidget />
        <SatelliteWidget />
        <BottomNav 
          onOpenTerminal={() => setIsTerminalOpen(true)} 
          isTerminalOpen={isTerminalOpen} 
          onOpenShop={() => setIsShopOpen(true)}
        />
        <LeaderboardPanel />
        <PurchaseModal />
        <PropertySheet />
        <TerminalModal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
        <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
        
        <PlayerProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        
        <AnimatePresence>
          {selectedJurisdiction && (
            <MayorDashboard 
              isOpen={true} 
              onClose={() => setSelectedJurisdiction(null)} 
              region={selectedJurisdiction} 
            />
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}
