"use client";

import { useState, useEffect } from "react";
import { User, LogOut, ShieldCheck, Cloud, CloudOff, RefreshCw, Users, Settings } from "lucide-react";
import BalanceTicker from "@/components/BalanceTicker";
import { AuthModal } from "@/components/auth/AuthModal";
import SettingsModal from "@/components/modals/SettingsModal";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useAuthStore, useMapStore } from "@/store/useGameStore";
import { formatDistanceToNow } from "date-fns";

export default function TopNav() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
            <div className="flex items-center gap-2 bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--card-border)] p-1.5 pr-4 rounded-[14px] shadow-xl group">
              <div className="w-8 h-8 bg-[var(--accent-color)]/20 rounded-[10px] flex items-center justify-center border border-[var(--accent-color)]/30">
                <User className="w-4 h-4 text-[var(--accent-color)]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[var(--text-primary)] text-[10px] font-mono leading-none opacity-50 uppercase tracking-tighter">Operator</span>
                <span className="text-[var(--text-primary)] text-xs font-bold leading-tight truncate max-w-[100px]">
                  {user.user_metadata.username || user.email?.split('@')[0]}
                </span>
              </div>
              <button 
                onClick={handleSignOut}
                className="ml-2 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-[var(--text-muted)] hover:text-red-400"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--card-border)] p-1.5 pr-4 rounded-[14px] shadow-xl hover:border-[var(--accent-color)]/50 transition-all active:scale-95 group"
            >
              <div className="w-8 h-8 bg-[var(--gray-surface)] rounded-[10px] flex items-center justify-center group-hover:bg-[var(--accent-color)]/20 transition-colors">
                <ShieldCheck className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-color)]" />
              </div>
              <span className="text-[var(--text-primary)] text-xs font-bold uppercase tracking-wide">Initialize</span>
            </button>
          )}

          {/* Online Operators Counter */}
          <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-[var(--card-bg)]/40 backdrop-blur-xl border border-[var(--card-border)] rounded-full w-fit">
            <div className="relative">
              <Users className="w-3 h-3 text-[var(--accent-color)]" />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-pulse" />
            </div>
            <span className="text-[10px] font-mono text-[var(--text-primary)]/70 uppercase tracking-widest whitespace-nowrap">
              {onlineCount} <span className="opacity-40">Active</span>
            </span>
          </div>
        </div>

        {/* Center: Balance */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <div className="backdrop-blur-xl rounded-[18px]">
            <BalanceTicker />
          </div>
          
          {user && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--card-bg)]/40 backdrop-blur-xl rounded-full border border-[var(--card-border)]">
              {isSyncing ? (
                <RefreshCw className="w-2.5 h-2.5 text-[var(--accent-color)] animate-spin" />
              ) : cloudSyncError ? (
                <CloudOff className="w-2.5 h-2.5 text-red-400" />
              ) : (
                <Cloud className="w-2.5 h-2.5 text-[var(--accent-color)]" />
              )}
              <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
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

        {/* Right: Settings */}
        <div className="pointer-events-auto flex justify-end">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-[14px] bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--card-border)] shadow-xl text-[var(--text-primary)] hover:border-[var(--accent-color)]/50 transition-all active:scale-95"
            aria-label="Open settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
