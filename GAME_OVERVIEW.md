# World of Influence - Game Overview

## 1. Elevator Pitch
A fintech strategy game where players move in the real world to capture opportunities, manage risk, and grow their balance.

## 2. Core Loop
1. Open the map and view your current area.
2. Move to discover supply drops within a 50m radius.
3. Collect rewards to grow balance and unlock upgrades.

## 3. Primary Systems
- **Map & Location:** Leaflet-based map with desaturated tiles and local grid.
- **Supply Drops:** Spawned markers around the player.
- **HUD:** Live balance odometer, boost indicator, parcel actions, and cloud sync status.
- **Parcels:** Select, purchase, and visualize owned plots on the grid.
- **Renovations:** Owned parcels can be upgraded with Influence Bucks + permits to increase rent and change rarity visuals.
- **Boost:** Simulated ad boost for rent acceleration (stackable).
- **Mini-Games (The Terminal):** A 3-reel slot machine that allows players to "launder" low-value Credits (found in Supply Drops) into high-value Influence Bucks and Zoning Permits.
- **Cloud Persistence:** Secure authentication and cross-device data synchronization via Supabase.

## 4. Technical Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Zustand (State Management)
- Supabase (Auth & Database)
- React-Leaflet
- Lucide-React

## 5. Visual Language
- Bank-vault aesthetic: secure, premium, minimal.
- Primary color: Growth Green (#00C805).
- Backgrounds: Slate (#1F2937) and white.
- Currency values use a monospaced font.
