"use client";

import { Trophy } from "lucide-react";

import { useGovernanceStore } from "@/store/useGameStore";

export default function LeaderboardWidget() {
  const setLeaderboardOpen = useGovernanceStore((state) => state.setLeaderboardOpen);

  return (
    <div className="pointer-events-none absolute bottom-[104px] left-6 z-[520]">
      <button
        type="button"
        aria-label="Open leaderboards"
        onClick={() => setLeaderboardOpen(true)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-[14px] border border-[var(--card-border)] bg-[var(--card-bg)]/95 text-[var(--text-primary)] shadow-[0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur transition-transform active:scale-95"
      >
        <Trophy className="h-6 w-6 text-[var(--accent-color)]" />
      </button>
    </div>
  );
}
