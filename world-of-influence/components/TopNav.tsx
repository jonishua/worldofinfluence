"use client";

import { useState, useEffect } from "react";
import { User, LogOut, ShieldCheck, Cloud, CloudOff, RefreshCw, Users } from "lucide-react";
import BalanceTicker from "@/components/BalanceTicker";
import { AuthModal } from "@/components/auth/AuthModal";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useAuthStore, useMapStore } from "@/store/useGameStore";
import { formatDistanceToNow } from "date-fns";

export default function TopNav() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const isSyncing = useAuthStore((state) => state.isSyncing);
  const lastSyncTime = useAuthStore((state) => state.lastSyncTime);
  const cloudSyncError = useAuthStore((state) => state.cloudSyncError);
  const otherPlayers = useMapStore((state) => state.otherPlayers);

  const onlineCount = Object.keys(otherPlayers).length + (user ? 1 : 0);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <div className="absolute top-6 left-0 right-0 z-50 px-6 flex items-start justify-between pointer-events-none">
        {/* Left: User Profile / Auth */}
        <div className="pointer-events-auto">
          {user ? (
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md border border-slate-700 p-1.5 pr-4 rounded-[14px] shadow-xl group">
              <div className="w-8 h-8 bg-[#00C805]/20 rounded-[10px] flex items-center justify-center border border-[#00C805]/30">
                <User className="w-4 h-4 text-[#00C805]" />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-[10px] font-mono leading-none opacity-50 uppercase tracking-tighter">Operator</span>
                <span className="text-white text-xs font-bold leading-tight truncate max-w-[100px]">
                  {user.user_metadata.username || user.email?.split('@')[0]}
                </span>
              </div>
              <button 
                onClick={handleSignOut}
                className="ml-2 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-slate-500 hover:text-red-400"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md border border-slate-700 p-1.5 pr-4 rounded-[14px] shadow-xl hover:border-[#00C805]/50 transition-all active:scale-95 group"
            >
              <div className="w-8 h-8 bg-slate-700 rounded-[10px] flex items-center justify-center group-hover:bg-[#00C805]/20 transition-colors">
                <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-[#00C805]" />
              </div>
              <span className="text-white text-xs font-bold uppercase tracking-wide">Initialize</span>
            </button>
          )}

          {/* Online Operators Counter */}
          <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-full w-fit">
            <div className="relative">
              <Users className="w-3 h-3 text-[#00C805]" />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#00C805] rounded-full animate-pulse" />
            </div>
            <span className="text-[10px] font-mono text-white/70 uppercase tracking-widest whitespace-nowrap">
              {onlineCount} <span className="opacity-40">Active</span>
            </span>
          </div>
        </div>

        {/* Center: Balance */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <BalanceTicker />
          
          {user && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900/40 backdrop-blur-sm rounded-full border border-slate-700/50">
              {isSyncing ? (
                <RefreshCw className="w-2.5 h-2.5 text-[#00C805] animate-spin" />
              ) : cloudSyncError ? (
                <CloudOff className="w-2.5 h-2.5 text-red-400" />
              ) : (
                <Cloud className="w-2.5 h-2.5 text-[#00C805]" />
              )}
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                {isSyncing 
                  ? "Syncing..." 
                  : cloudSyncError 
                    ? "Sync Error" 
                    : lastSyncTime 
                      ? `Synced ${formatDistanceToNow(lastSyncTime)} ago`
                      : "Cloud Active"}
              </span>
            </div>
          )}
        </div>

        {/* Right: Empty for now (could be settings or notifications) */}
        <div className="w-[120px]" />
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}
