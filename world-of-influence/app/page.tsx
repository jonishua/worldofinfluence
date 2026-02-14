"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import GameMapClient from "@/components/GameMapClient";
import PropertySheet from "@/components/PropertySheet";
import PurchaseModal from "@/components/PurchaseModal";
import TerminalModal from "@/components/modals/TerminalModal";
import MarketSniper from "@/components/modals/MarketSniper";
import VaultCracker from "@/components/modals/VaultCracker";
import ArcadeDrawer from "@/components/modals/ArcadeDrawer";
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
import DeploymentSlider from "@/components/hud/DeploymentSlider";
import { useGovernanceStore } from "@/store/useGameStore";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isMarketSniperOpen, setIsMarketSniperOpen] = useState(false);
  const [isVaultCrackerOpen, setIsVaultCrackerOpen] = useState(false);
  const [isArcadeOpen, setIsArcadeOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const selectedJurisdiction = useGovernanceStore((state) => state.selectedJurisdiction);
  const setSelectedJurisdiction = useGovernanceStore((state) => state.setSelectedJurisdiction);

  return (
    <ThemeProvider>
      <div className="relative h-screen w-screen overflow-hidden bg-[var(--bg-color)] text-[var(--text-primary)]">
        <GameMapClient />
        <TopNav />
        <SatelliteOverlay />
        <SatelliteSearchBar />
        <DeploymentSlider />
        <SplitLedger 
          onOpenProfile={() => setIsProfileOpen(true)}
          isProfileOpen={isProfileOpen}
        />
        <LeaderboardWidget />
        <SatelliteWidget />
        <BottomNav 
          onOpenArcade={() => setIsArcadeOpen(true)} 
          isArcadeOpen={isArcadeOpen} 
          onOpenShop={() => setIsShopOpen(true)}
        />
        <LeaderboardPanel />
        <PurchaseModal />
        <PropertySheet />
        <ArcadeDrawer 
          isOpen={isArcadeOpen} 
          onClose={() => setIsArcadeOpen(false)} 
          onSelectGame={(gameId) => {
            if (gameId === 'terminal') {
              setIsArcadeOpen(false);
              setIsTerminalOpen(true);
            } else if (gameId === 'market-sniper') {
              setIsArcadeOpen(false);
              setIsMarketSniperOpen(true);
            } else if (gameId === 'vault-cracker') {
              setIsArcadeOpen(false);
              setIsVaultCrackerOpen(true);
            }
          }}
        />
        <TerminalModal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
        <MarketSniper isOpen={isMarketSniperOpen} onClose={() => setIsMarketSniperOpen(false)} />
        <VaultCracker isOpen={isVaultCrackerOpen} onClose={() => setIsVaultCrackerOpen(false)} />
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
