"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  useAuthStore, 
  useMapStore, 
  PlayerPresence, 
  GlobalDrop,
  LatLng,
  DropRarity
} from "@/store/useGameStore";

interface PresenceData {
  username?: string;
  location?: LatLng;
}

interface DBGlobalDrop {
  id: string;
  location: LatLng;
  rarity: string;
  collected_by: string | null;
}

export const usePresence = () => {
  const user = useAuthStore((state) => state.user);
  const userLocation = useMapStore((state) => state.userLocation);
  const setOtherPlayers = useMapStore((state) => state.setOtherPlayers);
  const setGlobalDrops = useMapStore((state) => state.setGlobalDrops);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase.channel("presence-room", {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    const globalDropsChannel = supabase.channel("global-drops-channel");

    // --- Presence Logic ---
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const players: Record<string, PlayerPresence> = {};
        
        Object.entries(state).forEach(([id, presences]) => {
          if (id === user.id) return; // Skip self
          const presence = presences[0] as unknown as PresenceData;
          if (presence.location) {
            players[id] = {
              id,
              username: presence.username || "Anonymous Operator",
              location: presence.location,
              lastActive: Date.now(),
            };
          }
        });
        
        setOtherPlayers(players);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && userLocation) {
          await presenceChannel.track({
            username: user.user_metadata?.username || user.email?.split("@")[0] || "Operator",
            location: userLocation,
            lastActive: Date.now(),
          });
        }
      });

    // --- Global Drops Logic ---
    // Fetch initial uncollected drops
    supabase
      .from("global_drops")
      .select("*")
      .is("collected_by", null)
      .then(({ data }) => {
        if (data) {
          const typedData = data as DBGlobalDrop[];
          setGlobalDrops(typedData.map((d) => ({
            id: d.id,
            location: d.location,
            rarity: d.rarity as DropRarity,
          })));
        }
      });

    globalDropsChannel
      .on(
        "postgres_changes",
        { event: "*", table: "global_drops", schema: "public" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newDrop = payload.new as DBGlobalDrop;
            setGlobalDrops((current: GlobalDrop[]) => [
              ...current,
              { id: newDrop.id, location: newDrop.location, rarity: newDrop.rarity as DropRarity },
            ]);
          } else if (payload.eventType === "UPDATE" || payload.eventType === "DELETE") {
            const updatedDrop = payload.new as DBGlobalDrop | null;
            const oldDrop = payload.old as { id?: string } | null;
            if (updatedDrop?.collected_by || payload.eventType === "DELETE") {
              const idToRemove = oldDrop?.id || updatedDrop?.id;
              if (idToRemove) {
                setGlobalDrops((current: GlobalDrop[]) => 
                  current.filter((d) => d.id !== idToRemove)
                );
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      presenceChannel.unsubscribe();
      globalDropsChannel.unsubscribe();
    };
  }, [user, setOtherPlayers, setGlobalDrops, userLocation]);

  // Update presence location when user moves (debounced)
  useEffect(() => {
    if (!user || !userLocation) return;

    const now = Date.now();
    if (now - lastUpdateRef.current < 3000) return; // 3s debounce

    const channel = supabase.channel("presence-room");
    channel.track({
      username: user.user_metadata?.username || user.email?.split("@")[0] || "Operator",
      location: userLocation,
      lastActive: now,
    });
    
    lastUpdateRef.current = now;
  }, [user, userLocation]);

  return null;
};
