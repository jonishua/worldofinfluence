# Tactical Drone Deployment - Refinement Task 11

## Overview
This task is a continuation and refinement of the Tactical Drone Deployment system (Task 10). While the core state machine, deployment flow, and range enforcement are implemented, this task focuses on the "Juice," strategic depth, and final polish required for a "Bank Vault" quality experience.

---

## 🚀 Refinement Roadmap

### 1. Strategic Heatmap Density (`components/GameMap.tsx`)
Currently, the `tacticalGrid` (500m cells) displays a uniform green opacity. It should provide actual tactical value.
- [ ] **Implementation**: Calculate property density and ownership within each 500m cell.
- [ ] **Logic**: 
  - **Social Proof (Activity Heat)**: High density of *owned* properties (by any player) = "Growth Green" heat (#00C805). Shows where the market is alive.
  - **Expansion Opportunity**: High density of *unowned* properties = Faint Blue/Grey tint. Shows room for empire building.
  - **Institutional Zones**: High density of *Rare/Upgraded* properties = Amber tint (#F59E0B). Identifies high-value estates.
- [ ] **Goal**: Allow players to visually "scout" for social hubs or open territory before deploying.

### 2. Audio & Signal "Juice" (`components/hud/SatelliteOverlay.tsx`)
Enhance the immersive "Remote Uplink" feeling.
- [ ] **Audio Cues**:
  - `uplink_start`: High-pitched data burst on targeting.
  - `drone_flight`: Low-frequency hum that scales with speed.
  - `uplink_active`: Steady static/beeping during active session.
  - `uplink_warning`: Rapid beeping when battery < 1m or signal < 20%.
- [ ] **Signal Loss Behavior**:
  - If `signalStrength` drops to 0% (user moved too far from drone tether center), trigger an automatic `cancelDrone()` with a "SIGNAL LOST - RTH INITIATED" message.

### 3. UI/UX Micro-Interactions
- [ ] **View Switching**: In `SatelliteWidget.tsx`, add a "Zoom In/Out" transition effect when switching between Personal and Drone views (not just a jump).
- [ ] **Deployment Slider**: Restore the actual "Slide to Confirm" interaction if the current two-button pill feels too "standard."
- [ ] **Battery Scaling**: Update the battery percent calculation (currently assumes 600s, but session is 1800s/30m).

### 4. Rules & Multiplayer (Future Integration)
- [ ] **Multiplayer Presence**: Broadcast `droneCurrentLocation` to Supabase `presence` so other players can see your drone hovering over a neighborhood.
- [ ] **Scout Rewards**: If the drone stays over an unowned legendary for > 5 mins, grant a small "Data Collection" reward (INK/Bucks).

---

## 🛠 Current System Status (Handover Context)

### Implemented Features:
- **State Machine**: `idle` -> `targeting` -> `deploying` -> `active`.
- **Performance**: `isLeaping` grid occlusion during high-speed `flyTo`.
- **Zooms**: 14x for targeting, 19x for landing, 17-21x for active scouting.
- **Range**: 10-mile tether for targeting, 0.5-mile purchase radius for active drone.
- **Visuals**: CRT scanlines, blueprint tint, and jitter restricted to "Drone View."
- **Persistence**: Drone remains fixed at `droneTetherCenter` while active.

### Key Files:
- `world-of-influence/store/slices/mapSlice.ts`: Core state logic.
- `world-of-influence/components/GameMap.tsx`: Marker rendering, tactical grid, and transitions.
- `world-of-influence/components/hud/SatelliteOverlay.tsx`: CRT effects and battery/signal HUD.
- `world-of-influence/components/hud/DeploymentSlider.tsx`: Targeting confirmation UI.
- `world-of-influence/components/PurchaseModal.tsx`: Distance and Remote Fee validation.

---

## 📋 Project Tracker Update
- [x] Tactical Drone Deployment (Task 10)
- [in_progress] Tactical Drone Refinement & Juice (Task 11)
- [pending] Executive Travel Implementation (Global Search & Leap)

*Created by @rob (Feature Implementation) & @master (Lead Architect)*
