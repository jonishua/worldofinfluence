"use client";

import { useGovernanceStore } from "@/store/useGameStore";

export default function MayorBadge() {
  const mayorStatus = useGovernanceStore((state) => state.mayorStatus);
  const setLeaderboardOpen = useGovernanceStore((state) => state.setLeaderboardOpen);

  if (!mayorStatus) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-28 z-[560] -translate-x-1/2">
      <button
        type="button"
        onClick={() => setLeaderboardOpen(true)}
        className="pointer-events-auto rounded-[16px] border border-white/70 bg-white/95 px-4 py-2 text-left shadow-xl backdrop-blur"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          {mayorStatus.title}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {mayorStatus.name}
        </p>
        <div className="mt-1 flex items-center justify-between gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {mayorStatus.region}
          </span>
          <span className="font-mono text-[11px] font-semibold text-[var(--accent-color)] tabular-nums">
            ${mayorStatus.income.toFixed(6)}/sec
          </span>
        </div>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Open Leaderboards
        </p>
      </button>
    </div>
  );
}
