# Tactical Drone Deployment - Implementation Task 10

## Overview
Refactor the drone system into a multi-phase deployment mechanic: Targeting -> Flight -> Active Scouting (30m). This system leverages previous Satellite foundation but pivots to a targeted deployment model with optimized map performance.

---

## 🚀 Implementation Roadmap (Sequence of Operations)

**@rob - Follow this order EXACTLY to ensure system stability and performance:**

1.  **Phase 1: Core State Refactor** (`store/slices/mapSlice.ts`)
    *   Update types and implement the `droneStatus` state machine.
    *   Build the core logic for targeting, confirming, and expiring sessions.
    *   *Goal: Establish the brain of the drone before building the body.*

2.  **Phase 2: The "Leap" & Grid Optimization** (`components/GameMap.tsx`)
    *   Implement high-speed travel logic.
    *   Add the `isLeaping` performance guardrail to prevent grid-calculation lag.
    *   *Goal: Smooth, 60fps camera movement across long distances.*

3.  **Phase 3: Tactical HUD & Deployment UI** (`components/hud/`)
    *   Build the "Deploy Drone" slider and the "Personal/Drone" toggle.
    *   Update `SatelliteOverlay` with the new Grey/Blue blueprint filters.
    *   *Goal: Give the player control over the new deployment flow.*

4.  **Phase 4: Tactical Heatmap & Drone Sprite**
    *   Implement the low-res grid heatmap for targeting.
    *   Add the animated drone marker flight path.
    *   *Goal: Visual polish and strategic utility.*

5.  **Phase 5: Rule Enforcement & Final Polish**
    *   Enforce the 0.5-mile purchase radius and remote fee logic.
    *   Add haptics and "Signal Noise" effects.
    *   *Goal: Balance and immersive "Juice."*

---

## 1. Technical Requirements

### 1.1 State Refactor (`store/slices/mapSlice.ts`)
- [ ] **State Schema**: 
  - `droneStatus`: `idle` | `targeting` | `deploying` | `active`
  - `droneTargetLocation: LatLng | null`
  - `droneCurrentLocation: LatLng | null` (interpolated during flight)
  - `droneSessionExpiry: number | null`
  - `isLeaping`: `boolean` (performance flag)
- [ ] **Actions**:
  - `startTargeting()`: Sets status to `targeting`, zooms out map to overview.
  - `confirmDeployment(target: LatLng)`: Validates 5-mile range, sets status to `deploying`.
  - `completeDeployment()`: Sets status to `active`, starts 30m timer (timestamp based).
  - `cancelDrone()`: Clean reset to `idle`, clears all drone-related state.
  - `updateDroneLocation(pos: LatLng)`: Updates the flying sprite's position.

### 1.2 Optimized Visualization (`components/GameMap.tsx`)
- [ ] **The "Leap" Transition**:
  - Use `map.flyTo(target, 18, { duration: 4, easeLinearity: 0.1 })`.
  - **Optimization**: Wrap the `gridSquares` mapping in `{!isLeaping && ...}` to instantly stop rendering grid rectangles while the camera is in motion.
- [ ] **Grid-Based Heatmap**:
  - Implementation: When `droneStatus === 'targeting'`, render a low-res version of the grid (e.g., 500m cells).
  - Logic: Reuse `Rectangle` components. Color based on unowned property density (`#00C805` @ 0.2 opacity).
- [ ] **Drone Sprite**:
  - Use a high-fidelity `DroneMarker` that is separate from the `UserMarker`.
  - Fly the sprite from `userLocation` to `droneTargetLocation` using CSS transitions or `framer-motion`.

### 1.3 HUD & Interface Refinement (`components/hud/`)
- [ ] **SatelliteOverlay.tsx**:
  - **Uplink Filter**: Revert to Tactical Grey/Blue (`grayscale(100%) brightness(0.8) contrast(1.2)`).
  - **Dynamic Noise**: Add a CSS `jitter` animation to the scanlines that intensifies when the camera moves far from the drone.
- [ ] **Deployment UI**:
  - Create `DeploymentSlider.tsx`: A "Slide to Deploy" component that confirms the `droneTargetLocation`.
- [ ] **View Toggle**:
  - Add a "Personal / Drone" PIP button to quickly fly the camera back and forth.

### 1.4 Rules & Performance Guardrails
- [ ] **Purchase Radius**: In `PurchaseModal.tsx`, enforce 0.5-mile (800m) buy radius around the `droneTargetLocation`.
- [ ] **Remote Fee**: Drone purchases still incur the 10% Remote Filing Fee (unless subscriber).
- [ ] **Haptics**: Single heavy "Thud" pattern `[100, 50, 100]` on drone arrival.

## 2. Success Criteria
- [ ] Zero lag during "Leap" transition (handled via grid occlusion).
- [ ] Clear visual distinction between physical presence and drone presence.
- [ ] Functional "Slide to Deploy" interaction with 5-mile range validation.
- [ ] Heatmap provides tactical value for finding unowned clusters.

---

## 📋 Project Tracker: World of Influence MVP
**Current Phase:** Phase 5 (Live Operations & Advanced Nav)

### Phase 5: Navigation Pivot
- [completed] Satellite Drone Refactor (10-mile tether) -> *Superseded by Task 10*
- [in_progress] Tactical Drone Deployment (5-mile Targeting + 30m Session)
- [pending] Executive Travel Implementation (Global Search & Leap)

*Reviewed and Optimized by @master (Lead Architect)*
