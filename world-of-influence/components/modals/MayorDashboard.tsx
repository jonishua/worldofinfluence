"use client";

import { useMemo, useState } from "react";
import { 
  BarChart3, 
  Users, 
  Building2, 
  History, 
  Vote,
  TrendingUp,
  Percent,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

type MayorDashboardProps = {
  isOpen: boolean;
  onClose: () => void;
  region: string;
};

export default function MayorDashboard({ onClose, region }: MayorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "voting">("stats");
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);

  const mockAcquisitions = useMemo(() => [
    { id: 1, parcelId: 1234, time: "2m ago" },
    { id: 2, parcelId: 5678, time: "5m ago" },
    { id: 3, parcelId: 9012, time: "12m ago" },
  ], []);

  return (
    <div className="fixed inset-0 z-[750] flex items-end justify-center bg-black/40 backdrop-blur-[2px]">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-[520px] rounded-t-[24px] bg-slate-50 px-6 py-7 text-left shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Jurisdiction Control</p>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00C805]" />
              {region}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 hover:text-slate-800"
          >
            Close
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-slate-200/50 rounded-[14px] mb-6">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[10px] text-xs font-bold transition-all ${
              activeTab === "stats" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Insights
          </button>
          <button
            onClick={() => setActiveTab("voting")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[10px] text-xs font-bold transition-all ${
              activeTab === "voting" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            Governance
          </button>
        </div>

        {activeTab === "stats" ? (
          <div className="space-y-4">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-[18px] border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Total Yield</span>
                </div>
                <p className="text-lg font-mono font-bold text-[#00C805] tabular-nums">$1,245.82</p>
                <p className="text-[10px] text-slate-400 mt-1">+12.5% vs last period</p>
              </div>
              <div className="bg-white p-4 rounded-[18px] border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Active Parcels</span>
                </div>
                <p className="text-lg font-mono font-bold text-slate-900 tabular-nums">4,821</p>
                <p className="text-[10px] text-slate-400 mt-1">94% occupancy rate</p>
              </div>
            </div>

            {/* Recent Acquisitions */}
            <div className="bg-white p-4 rounded-[18px] border border-slate-200/60 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <History className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Recent Activity</span>
                </div>
                <span className="text-[10px] font-bold text-[#00C805] uppercase tracking-wider">Live</span>
              </div>
              <div className="space-y-3">
                {mockAcquisitions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-[8px] flex items-center justify-center">
                        <Users className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">New Acquisition</p>
                        <p className="text-[10px] text-slate-400">Parcel #{item.parcelId}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-[18px] border border-slate-200/60 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-[12px] flex items-center justify-center border border-amber-100">
                  <Percent className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tax Rate Proposal</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Prop #104 • Active</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Proposed 0.5% increase to the City Treasury tax for all rental income. Funds will be directed to the Infrastructure Pool for higher-rarity supply drop spawns.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setVoted("yes")}
                  disabled={voted !== null}
                  className={`flex-1 py-3 rounded-[12px] text-xs font-bold transition-all border ${
                    voted === "yes" 
                      ? "bg-[#00C805] text-white border-[#00C805] shadow-[0_4px_12px_rgba(0,200,5,0.3)]" 
                      : "bg-white text-slate-900 border-slate-200 hover:border-[#00C805] hover:text-[#00C805]"
                  } ${voted !== null && voted !== "yes" ? "opacity-50 grayscale" : ""}`}
                >
                  {voted === "yes" ? "Voted Yes" : "Vote Yes"}
                </button>
                <button
                  onClick={() => setVoted("no")}
                  disabled={voted !== null}
                  className={`flex-1 py-3 rounded-[12px] text-xs font-bold transition-all border ${
                    voted === "no" 
                      ? "bg-red-500 text-white border-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.3)]" 
                      : "bg-white text-slate-900 border-slate-200 hover:border-red-500 hover:text-red-500"
                  } ${voted !== null && voted !== "no" ? "opacity-50 grayscale" : ""}`}
                >
                  {voted === "no" ? "Voted No" : "Vote No"}
                </button>
              </div>
              
              {voted && (
                <p className="text-center text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-[0.1em]">
                  Vote recorded on-chain
                </p>
              )}
            </div>

            <div className="bg-slate-900 p-4 rounded-[18px] border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Results</span>
                <span className="text-[10px] font-mono text-[#00C805]">84% Quorum</span>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-white mb-1">
                    <span>YES</span>
                    <span>68%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00C805] rounded-full" style={{ width: "68%" }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-white mb-1">
                    <span>NO</span>
                    <span>32%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: "32%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
