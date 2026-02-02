# Satellite & Drone Refactor - Agent Task 09

## Overview
Refactor the Satellite Surveillance module into two distinct features: **Tactical Drone Mode** and **Executive Travel**. 

**Core Objective:** Implement a 10-mile "Tethered Drone" experience for local scouting and purchasing, while preserving the existing global search logic for the future "Executive Travel" feature.

---

## 1. Technical Requirements

### 1.1 State Refactor (`store/slices/mapSlice.ts`)
- [ ] Add `droneActive: boolean` and `droneTimer: number` (seconds).
- [ ] Add `droneTetherCenter: LatLng | null` (captured from `userLocation` on launch).
- [ ] Implement `startDroneSession()` and `endDroneSession()`.
- [ ] Add `updateDroneTimer()` logic (tick every second via `setInterval` in a hook).
- [ ] Enforce 10-mile (16km) limit in `setSatelliteCameraLocation`. If the target is > 10 miles from `droneTetherCenter`, clamp it or prevent movement.

### 1.2 Component Visuals (`components/GameMap.tsx`)
- [ ] **Dual Marker System:** 
    - Ensure the player's physical avatar (`userLocation`) stays visible and static while in Drone Mode.
    - Implement a `DroneMarker` (use `Drone` icon from Lucide) that follows the `satelliteCameraLocation`.
- [ ] **Blueprint Transition:** Retain the CRT scanlines and tactical blueprint filters.
- [ ] **Boundary Indicator:** (Optional/Polish) Draw a subtle 10-mile radius circle on the map centered at `droneTetherCenter`.

### 1.3 HUD Refactor (`components/hud/`)
- [ ] **SatelliteOverlay.tsx:** 
    - Remove the `SatelliteSearchBar` from the top.
    - Add a **"Battery Meter"** style timer (e.g., 10:00 counting down).
    - Add a "Return to Base" button that calls `toggleSatelliteMode`.
- [ ] **SatelliteSearchBar.tsx:** 
    - Rename/Move to `components/modals/ExecutiveTravelModal.tsx` or similar.
    - Disable/Hide it during the standard Drone session.

### 1.4 Economy & Rules
- [ ] **Purchase Validation:** In `PurchaseModal.tsx`, ensure properties can only be bought if the Drone is within the 10-mile radius of the player's real location.
- [ ] **Remote Fee:** Retain the 10% Remote Filing Fee for drone-based purchases.
- [ ] **Supply Drops:** Ensure `collectDrop` is disabled when `satelliteMode` is true.

---

## 2. Success Criteria
- [x] Launching Drone Mode zooms the map out and shows the player's static location + a moving Drone icon.
- [x] The camera cannot be dragged further than 10 miles from the player's real location.
- [x] A 10-minute timer counts down; the session ends automatically when it hits zero.
- [x] Properties can be purchased remotely (with 10% fee) but Supply Drops cannot be collected.
- [x] Geocoding/Search logic is preserved (hidden but accessible for future Travel feature).

---

## 📋 Project Tracker: World of Influence MVP
**Current Phase:** Phase 5 (Live Operations & Advanced Nav)

### Phase 5: Navigation Pivot
- [in_progress] Satellite Drone Refactor (10-mile tether + 10m Timer)
- [pending] Executive Travel Implementation (Global Search & Leap)

---

*Created by @design (Executive Game Director) on 2026-01-30*
