"use client";

import { useMemo } from "react";

import {
  LeaderboardEntry,
  LeaderboardScope,
  LeaderboardTab,
  useGameStore,
} from "@/store/useGameStore";

const scopeLabels: Record<LeaderboardTab, string> = {
  city: "City",
  state: "State",
  country: "Country",
  officeholders: "Officeholders",
};

const capEntries = (entries: LeaderboardEntry[], limit = 20) =>
  entries.length > limit ? entries.slice(0, limit) : entries;

export default function LeaderboardPanel() {
  const isLeaderboardOpen = useGameStore((state) => state.isLeaderboardOpen);
  const setLeaderboardOpen = useGameStore((state) => state.setLeaderboardOpen);
  const activeScope = useGameStore((state) => state.activeLeaderboardScope);
  const setActiveScope = useGameStore((state) => state.setActiveLeaderboardScope);
  const leaderboards = useGameStore((state) => state.leaderboards);
  const playerPositions = useGameStore((state) => state.playerPositions);
  const officeholders = useGameStore((state) => state.officeholders);

  const entries = useMemo(
    () =>
      activeScope === "officeholders"
        ? []
        : capEntries(leaderboards[activeScope] ?? []),
    [activeScope, leaderboards],
  );
  const playerPosition =
    activeScope === "officeholders" ? null : playerPositions[activeScope];
  const isPlayerListed =
    playerPosition && entries.some((entry) => entry.id === playerPosition.entry.id);

  if (!isLeaderboardOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[750] flex items-end justify-center bg-black/40 px-4 pb-0 pt-10 backdrop-blur-[2px]">
      <div className="slide-up relative w-full max-w-[560px] rounded-t-[24px] bg-white px-6 pb-8 pt-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <button
          type="button"
          onClick={() => setLeaderboardOpen(false)}
          className="absolute -right-3 -top-3 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--card-border)] bg-slate-950 text-lg font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.3)]"
          aria-label="Close leaderboards"
        >
          ×
        </button>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Leaderboards
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              Income Earned Rankings
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {(Object.keys(scopeLabels) as LeaderboardTab[]).map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => setActiveScope(scope)}
              className={`rounded-[12px] border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition ${
                activeScope === scope
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              {scopeLabels[scope]}
            </button>
          ))}
        </div>

        {activeScope === "officeholders" ? (
          <div className="mt-5 space-y-4">
            {officeholders.map((holder) => (
              <div
                key={holder.title}
                className="rounded-[16px] border border-slate-200/70 bg-slate-50/70 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={holder.avatarUrl}
                    alt={`${holder.name} avatar`}
                    className="h-11 w-11 rounded-[10px] border border-slate-200 bg-white object-cover"
                  />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {holder.title}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {holder.name}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      {holder.title} of {holder.region}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                  <span>{holder.parcels.toLocaleString()} Parcels Owned</span>
                  <span className="font-semibold text-emerald-600">
                    +{holder.needed.toLocaleString()} to Overtake
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-[14px] border border-slate-200/70 bg-slate-50/70 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600">
                      {index + 1}
                    </span>
                    <img
                      src={entry.avatarUrl}
                      alt={`${entry.name} avatar`}
                      className="h-11 w-11 rounded-[10px] border border-slate-200 bg-white object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {entry.name}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                        {entry.title} of {entry.region}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      Parcels Owned
                    </p>
                    <p className="text-sm font-semibold text-slate-900 tabular-nums">
                      {entry.parcels.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {!isPlayerListed && playerPosition && (
              <div className="mt-4 flex items-center justify-between rounded-[16px] border border-slate-300/70 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-xs font-semibold text-white">
                    {playerPosition.rank}
                  </span>
                  <img
                    src={playerPosition.entry.avatarUrl}
                    alt={`${playerPosition.entry.name} avatar`}
                    className="h-11 w-11 rounded-[10px] border border-slate-200 bg-white object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {playerPosition.entry.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      {playerPosition.entry.title} of {playerPosition.entry.region}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    Parcels Owned
                  </p>
                  <p className="text-sm font-semibold text-slate-900 tabular-nums">
                    {playerPosition.entry.parcels.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-5">
          <button
            type="button"
            onClick={() => setLeaderboardOpen(false)}
            className="w-full rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
