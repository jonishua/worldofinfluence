"use client";

import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

const GameMap = dynamic(() => import("@/components/GameMap"), { ssr: false });

export default function GameMapClient() {
  return <GameMap />;
}
