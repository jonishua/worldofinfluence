"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useGameStore";

export const SyncManager = () => {
  const hydrateFromCloud = useAuthStore((state) => state.hydrateFromCloud);
  const resetGame = useAuthStore((state) => state.resetGame);

  useEffect(() => {
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        hydrateFromCloud();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        hydrateFromCloud();
      } else if (event === "SIGNED_OUT") {
        resetGame(); // Clear local state on logout
      }
    });

    return () => subscription.unsubscribe();
  }, [hydrateFromCloud, resetGame]);

  return null;
};
