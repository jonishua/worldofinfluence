"use client";

import { useMemo } from "react";

import { useGovernanceStore } from "@/store/useGameStore";

type PlayerProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PlayerProfileModal({ isOpen, onClose }: PlayerProfileModalProps) {
  const playerPosition = useGovernanceStore((state) => state.playerPositions.city);
  const cityKeysOwned = useGovernanceStore((state) => state.cityKeysOwned);
  const setSelectedJurisdiction = useGovernanceStore((state) => state.setSelectedJurisdiction);
  const playerName = playerPosition?.entry.name ?? "Player";
  const playerTitle = playerPosition?.entry.title ?? "Investor";
  const playerRegion = playerPosition?.entry.region ?? "Unknown";
  const playerAvatar = playerPosition?.entry.avatarUrl ?? "/globe.svg";

  const sortedKeys = useMemo(() => {
    return Object.entries(cityKeysOwned).sort(([, countA], [, countB]) => countB - countA);
  }, [cityKeysOwned]);

  const totalKeys = sortedKeys.reduce((sum, [, count]) => sum + count, 0);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[700] flex items-end justify-center bg-black/40 px-4 pb-0 pt-0 backdrop-blur-[2px]">
      <div className="slide-up w-full max-w-[520px] rounded-t-[24px] bg-white px-6 py-7 text-left shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Player Profile
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            Close
          </button>
        </div>

        <div className="mt-5 flex items-center gap-4 rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[16px] border border-white/70 bg-white shadow-sm">
            <img
              src={playerAvatar}
              alt={`${playerName} avatar`}
              className="h-12 w-12 rounded-[12px] object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {playerTitle}
            </p>
            <p className="text-base font-semibold text-slate-900">{playerName}</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {playerRegion}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-[18px] border border-slate-200/80 bg-white px-4 py-4 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="font-semibold uppercase tracking-[0.18em] text-slate-400">City Rank</span>
            <span className="font-semibold text-slate-800">
              {playerPosition?.rank ? `#${playerPosition.rank}` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold uppercase tracking-[0.18em] text-slate-400">Parcels</span>
            <span className="font-semibold text-slate-800">
              {playerPosition?.entry.parcels ?? 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold uppercase tracking-[0.18em] text-slate-400">Income</span>
            <span className="font-mono font-semibold text-[#00C805] tabular-nums">
              ${playerPosition?.entry.income.toFixed(6) ?? "0.000000"}/sec
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              City Keys
            </p>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Total {totalKeys}
            </span>
          </div>
          {sortedKeys.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No keys yet. Grab one to unlock status.</p>
          ) : (
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              {sortedKeys.map(([region, count]) => (
                <div
                  key={region}
                  className="flex items-center justify-between rounded-[14px] border border-white/70 bg-white px-3 py-2"
                >
                  <span className="font-semibold">{region}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedJurisdiction(region)}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#00C805] hover:opacity-80 transition-opacity"
                    >
                      Manage
                    </button>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      ×{count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
