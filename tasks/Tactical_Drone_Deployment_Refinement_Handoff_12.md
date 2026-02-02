# Tactical Drone Deployment - Strategic Intel & Juice - Task 12

## Overview
This task is the final polish and strategic depth phase for the Tactical Drone Deployment system. The core UI, targeting logic, and stabilization (bug fixes) were completed in Task 11. This phase focuses on turning the drone from a map-pan tool into a strategic "Scouting & Intelligence" system.

---

## 🚀 Phase 2 Roadmap

### 1. Strategic Heatmap Density (`components/GameMap.tsx`)
Currently, the `tacticalGrid` (500m cells) is a uniform pulse. It needs to provide tactical intelligence.
- [ ] **Implementation**: In the `tacticalGrid` useMemo, calculate the density of `ownedParcels` within each cell's bounds.
- [ ] **Visual Rules**: 
  - **High Ownership**: Density > 10% owned = "Growth Green" (#00C805) with 0.3 fillOpacity.
  - **Premium Zone**: Contains any Legendary/Rare = Amber tint (#F59E0B) with 0.2 fillOpacity.
  - **Low Activity**: Default faint Blue/Grey (#94a3b8) with 0.05 fillOpacity.
- [ ] **Interactive**: Tapping a tactical cell should "Zoom into coordinates" at 17x (already partially supported by `handleSelectParcel`).

### 2. Audio Uplink & Signal Loss (`components/hud/SatelliteOverlay.tsx`)
Enhance the "Remote Uplink" immersion with audio and safety protocols.
- [ ] **Signal Loss**: implement a check in `SatelliteOverlay.tsx`. If `signalStrength` hits 0% (user moved > 16km from drone), trigger `cancelDrone()` automatically with a "SIGNAL LOST - RTH INITIATED" toast.
- [ ] **Audio Cues**: (Using `Audio` API or existing system)
  - `uplink_start`: High-pitched data burst when `droneStatus` becomes `targeting`.
  - `drone_flight`: Low-frequency hum that scale with flight progress.
  - `uplink_warning`: Rapid beeping when `droneTimer` < 60s.

### 3. UI/UX Micro-Interactions
- [ ] **Smooth View Toggle**: In `SatelliteWidget.tsx`, add a Framer Motion `layout` transition or a manual scale/fade animation when switching between "Personal" and "Drone" views to avoid the sharp jump.
- [ ] **Timer Sync**: Update the battery percentage calculation in `SatelliteOverlay.tsx` to use `DRONE_SESSION_DURATION_SEC` (1800s) instead of the hardcoded 600s.

### 4. Multiplayer & Rewards
- [ ] **Presence**: Update `hooks/usePresence.ts` to include `droneCurrentLocation` in the presence broadcast.
- [ ] **Scout Rewards**: If a drone remains active over an unowned legendary parcel for > 5 mins, grant a small "Scout Intel" reward (e.g., 5 INK or 1 Bucks).

---

## 🛠 Handover Context (Session 11 Results)

### Completed:
- **UI Standard**: `DeploymentSlider.tsx` is now a bottom slide-up sheet (`max-w-[520px]`).
- **Dynamic Targeting**: Targeting reticle follows map taps; zoom hits 14x on start and 17x on selection.
- **Unit Polish**: Distance now shows `km / mi`.
- **Stabilization**: Fixed browser crashes, infinite `AutoCenter` loops, and `AnimatePresence` reference errors.
- **View-Aware Purchasing**: `PurchaseModal` now correctly detects if you are in "Drone View" (apply 10% fee) or "Personal View" (waive fee).

### Key Files:
- `world-of-influence/components/GameMap.tsx`: Tactical grid and Reticle logic.
- `world-of-influence/components/hud/DeploymentSlider.tsx`: Targeting slide-up UI.
- `world-of-influence/store/slices/mapSlice.ts`: State machine (`idle` -> `targeting` -> `deploying` -> `active`).
- `world-of-influence/components/PurchaseModal.tsx`: Fee and distance validation logic.

---

## 📋 Status Update
- [x] Tactical Drone Deployment Stabilization (Task 11)
- [in_progress] Tactical Drone Strategic Intel & Juice (Task 12)
- [pending] Executive Travel Implementation (Global Search & Leap)

*Created by @rob (Feature Implementation) & @ui (Interface Architect)*
