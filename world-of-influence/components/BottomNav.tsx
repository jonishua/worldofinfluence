 "use client";

import { Plus, Sparkles, Map, ShoppingBag, Wallet, Gamepad2 } from "lucide-react";
import { useEffect, useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";

import { 
  useAuthStore,
  useEconomyStore,
  useMapStore,
  usePropertyStore,
  useGovernanceStore,
  useGameStore
} from "@/store/useGameStore";

type BottomNavProps = {
  onOpenTerminal?: () => void;
  onOpenShop?: () => void;
  isTerminalOpen?: boolean;
};

export default function BottomNav({ onOpenTerminal, onOpenShop, isTerminalOpen = false }: BottomNavProps) {
  const [isCheatOpen, setIsCheatOpen] = useState(false);
  const [inkAmount, setInkAmount] = useState(50);
  const [influenceAmount, setInfluenceAmount] = useState(50);
  const [creditAmount, setCreditAmount] = useState(50);
  const [permitAmount, setPermitAmount] = useState(1);
  const [ownedParcelCount, setOwnedParcelCount] = useState(150);
  const [governanceRegion, setGovernanceRegion] = useState("Austin, TX");
  const [cityKeyCost, setCityKeyCost] = useState(200);
  const [treasuryAmount, setTreasuryAmount] = useState(100);
  const [minZoomInput, setMinZoomInput] = useState(17);
  const [maxZoomInput, setMaxZoomInput] = useState(21);
  const [boostDurationSeconds, setBoostDurationSeconds] = useState(60);
  
  const addWalletBalance = useEconomyStore((state) => state.addWalletBalance);
  const addInfluenceBucks = useEconomyStore((state) => state.addInfluenceBucks);
  const addCredits = useEconomyStore((state) => state.addCredits);
  const addZoningPermits = useEconomyStore((state) => state.addZoningPermits);
  const boostDurationMs = useEconomyStore((state) => state.boostDurationMs);
  const setBoostDurationMs = useEconomyStore((state) => state.setBoostDurationMs);

  const setPickupRadiusMultiplier = useMapStore((state) => state.setPickupRadiusMultiplier);
  const pickupRadiusMultiplier = useMapStore((state) => state.pickupRadiusMultiplier);
  const userLocation = useMapStore((state) => state.userLocation);
  const spawnDropsInRadius = useMapStore((state) => state.spawnDropsInRadius);
  const minMapZoom = useMapStore((state) => state.minMapZoom);
  const maxMapZoom = useMapStore((state) => state.maxMapZoom);
  const mapZoom = useMapStore((state) => state.mapZoom);
  const setMapZoomLimits = useMapStore((state) => state.setMapZoomLimits);

  const forceNextLegendary = usePropertyStore((state) => state.forceNextLegendary);
  const setForceNextLegendary = usePropertyStore((state) => state.setForceNextLegendary);
  const setOwnedParcelsCount = usePropertyStore((state) => state.setOwnedParcelsCount);

  const resetGame = useAuthStore((state) => state.resetGame);

  const purchaseCityKey = useGovernanceStore((state) => state.purchaseCityKey);
  const simulateTreasuryTick = useGovernanceStore((state) => state.simulateTreasuryTick);
  const distributeTreasuryPayout = useGovernanceStore((state) => state.distributeTreasuryPayout);
  const pickupRadius = 50 * pickupRadiusMultiplier;

  useEffect(() => {
    setMinZoomInput(minMapZoom);
    setMaxZoomInput(maxMapZoom);
  }, [minMapZoom, maxMapZoom]);

  useEffect(() => {
    setBoostDurationSeconds(Math.round(boostDurationMs / 1000));
  }, [boostDurationMs]);

  return (
    <>
      {isCheatOpen && (
        <div className="fixed inset-0 z-[800] flex flex-col bg-black/40 backdrop-blur-sm">
          <div className="flex-1 overflow-y-auto px-4 pb-24 pt-6">
            <div className="mx-auto w-full max-w-[420px] rounded-[20px] border border-[var(--card-border)] bg-[var(--card-bg)]/95 p-4 text-xs shadow-[0_16px_30px_rgba(15,23,42,0.2)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Cheat Menu
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Influence</span>
                  <input
                    type="number"
                    min={0}
                    value={inkAmount}
                    onChange={(event) => setInkAmount(Number(event.target.value))}
                    className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => addWalletBalance(Math.max(0, inkAmount))}
                    className="flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">INK Cash</span>
                  <input
                    type="number"
                    min={0}
                    value={influenceAmount}
                    onChange={(event) => setInfluenceAmount(Number(event.target.value))}
                    className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => addInfluenceBucks(Math.max(0, influenceAmount))}
                    className="flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Credits</span>
                  <input
                    type="number"
                    min={0}
                    value={creditAmount}
                    onChange={(event) => setCreditAmount(Number(event.target.value))}
                    className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => addCredits(Math.max(0, creditAmount))}
                    className="flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Permits</span>
                  <input
                    type="number"
                    min={0}
                    value={permitAmount}
                    onChange={(event) => setPermitAmount(Number(event.target.value))}
                    className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => addZoningPermits(Math.max(0, permitAmount))}
                    className="flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Owned Parcels</span>
                  <input
                    type="number"
                    min={0}
                    value={ownedParcelCount}
                    onChange={(event) => setOwnedParcelCount(Number(event.target.value))}
                    className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setOwnedParcelsCount(ownedParcelCount)}
                    className="flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                  >
                    <Plus className="h-3 w-3" /> Set
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Pickup</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPickupRadiusMultiplier(2)}
                      className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                    >
                      2x
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickupRadiusMultiplier(5)}
                      className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                    >
                      5x
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Supply Drops</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!userLocation) {
                        return;
                      }
                      spawnDropsInRadius(userLocation, 3, pickupRadius);
                    }}
                    className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                  >
                    Spawn 3
                  </button>
                </div>
                <div className="mt-2 space-y-2 rounded-[calc(var(--radius)_-_4px)] border border-slate-200/80 bg-white/90 p-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Governance
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">City</span>
                    <input
                      type="text"
                      value={governanceRegion}
                      onChange={(event) => setGovernanceRegion(event.target.value)}
                      className="w-32 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">Key Cost</span>
                    <input
                      type="number"
                      min={0}
                      value={cityKeyCost}
                      onChange={(event) => setCityKeyCost(Number(event.target.value))}
                      className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        purchaseCityKey(
                          governanceRegion,
                          Math.max(0, cityKeyCost),
                          "city",
                        )
                      }
                      className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                    >
                      Buy Key
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">Treasury</span>
                    <input
                      type="number"
                      min={0}
                      value={treasuryAmount}
                      onChange={(event) => setTreasuryAmount(Number(event.target.value))}
                      className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        simulateTreasuryTick(
                          governanceRegion,
                          Math.max(0, treasuryAmount),
                        )
                      }
                      className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">Payout</span>
                    <button
                      type="button"
                      onClick={() => distributeTreasuryPayout(governanceRegion)}
                      className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                    >
                      Distribute
                    </button>
                  </div>
                </div>
                <ThemeSwitcher variant="inline" />
                <div className="mt-2 space-y-2 rounded-[calc(var(--radius)_-_4px)] border border-slate-200/80 bg-white/90 p-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Zoom Limits
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <span>Zoom</span>
                    <span className="font-mono text-slate-700">{mapZoom.toFixed(1)}x</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">Out</span>
                    <input
                      type="number"
                      min={0}
                      value={minZoomInput}
                      onChange={(event) => setMinZoomInput(Number(event.target.value))}
                      className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                    />
                    <span className="font-semibold">In</span>
                    <input
                      type="number"
                      min={0}
                      value={maxZoomInput}
                      onChange={(event) => setMaxZoomInput(Number(event.target.value))}
                      className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMapZoomLimits(minZoomInput, maxZoomInput)}
                    className="w-full rounded-md bg-slate-900 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                  >
                    Save Zoom
                  </button>
                </div>
                <div className="mt-2 space-y-2 rounded-[calc(var(--radius)_-_4px)] border border-slate-200/80 bg-white/90 p-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Minting Cheats
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <span>Status</span>
                    <span
                      className={`font-mono ${
                        forceNextLegendary ? "text-amber-600" : "text-slate-500"
                      }`}
                    >
                      {forceNextLegendary ? "Armed" : "Off"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForceNextLegendary(!forceNextLegendary)}
                    className="w-full rounded-md bg-slate-900 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                  >
                    {forceNextLegendary ? "Disable Legendary" : "Force Next Legendary"}
                  </button>
                </div>
                <div className="mt-2 space-y-2 rounded-[calc(var(--radius)_-_4px)] border border-slate-200/80 bg-white/90 p-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Boost Timer
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">Seconds</span>
                    <input
                      type="number"
                      min={1}
                      value={boostDurationSeconds}
                      onChange={(event) =>
                        setBoostDurationSeconds(Number(event.target.value))
                      }
                      className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setBoostDurationMs(Math.max(1, boostDurationSeconds) * 1000)
                      }
                      className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-[calc(var(--radius)_-_4px)] border border-slate-200/80 bg-white/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span>Compass</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-slate-950 text-[11px] font-semibold text-white">
                    N
                  </span>
                </div>
                <div className="mt-2 space-y-2 rounded-[calc(var(--radius)_-_4px)] border border-rose-200/80 bg-rose-50/80 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-500">
                    Reset Save
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-rose-500/80">
                    Clears all local game data
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Reset all progress and start fresh?")) {
                        useGameStore.persist.clearStorage();
                        resetGame();
                        setIsCheatOpen(false);
                      }
                    }}
                    className="w-full rounded-md bg-rose-600 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                  >
                    Reset Game
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex justify-center pb-6">
            <button
              type="button"
              onClick={() => setIsCheatOpen(false)}
              className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--card-border)] bg-slate-950 text-lg font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.3)]"
              aria-label="Close cheat menu"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="relative pointer-events-auto flex items-center gap-6 rounded-[var(--radius)] border border-[var(--card-border)] bg-[var(--card-bg)]/90 px-6 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur">
        <button
          type="button"
          onClick={() => onOpenShop?.()}
          className="flex flex-col items-center gap-1 text-[var(--text-muted)] transition-colors hover:text-[var(--accent-color)]"
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="text-[10px] uppercase tracking-[0.2em]">Shop</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenTerminal?.()}
          className="flex flex-col items-center gap-1 text-[var(--text-muted)] transition-colors hover:text-[var(--accent-color)]"
        >
          <Gamepad2 className={`h-5 w-5 ${isTerminalOpen ? "text-[var(--accent-color)]" : ""}`} />
          <span className={`text-[10px] uppercase tracking-[0.2em] ${isTerminalOpen ? "text-[var(--accent-color)]" : ""}`}>Arcade</span>
        </button>
        <div className="flex flex-col items-center gap-1 text-[var(--accent-color)]">
          <Map className="h-6 w-6" />
          <span className="text-[10px] uppercase tracking-[0.2em]">Map</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-[var(--text-muted)]">
          <Wallet className="h-5 w-5" />
          <span className="text-[10px] uppercase tracking-[0.2em]">Wallet</span>
        </div>

        <button
          type="button"
          onClick={() => setIsCheatOpen((open) => !open)}
          className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--card-border)] bg-slate-950 text-white shadow-[0_8px_18px_rgba(15,23,42,0.35)]"
          aria-label="Open cheat menu"
        >
          <Sparkles className="h-4 w-4 text-[var(--accent-color)]" />
        </button>

      </div>
    </div>
    </>
  );
}
