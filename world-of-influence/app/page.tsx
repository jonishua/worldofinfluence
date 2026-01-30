"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import GameMapClient from "@/components/GameMapClient";
import PropertySheet from "@/components/PropertySheet";
import PurchaseModal from "@/components/PurchaseModal";
import TerminalModal from "@/components/modals/TerminalModal";
import ShopModal from "@/components/modals/ShopModal";
import ThemeProvider from "@/components/ThemeProvider";
import LeaderboardPanel from "@/components/hud/LeaderboardPanel";
import LeaderboardWidget from "@/components/hud/LeaderboardWidget";
import SplitLedger from "@/components/hud/SplitLedger";

export default function Home() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="relative h-screen w-screen overflow-hidden bg-[var(--bg-color)] text-[var(--text-primary)]">
        <GameMapClient />
        <SplitLedger />
        <LeaderboardWidget />
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
      </div>
    </ThemeProvider>
  );
}
