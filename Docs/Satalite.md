# Module Specification: Satellite & Drone Operations

**Version:** 1.2
**Context:** Map Screen Widget & Camera Controller
**Objective:** Split "Satellite Mode" into two distinct features: **Tactical Drone Mode** (Local scouting/purchasing) and **Executive Travel** (Global jump/search).

---

## 1. Tactical Drone Mode (Local Ops)

**Design Philosophy:** "The Eye in the Sky." A limited-time, limited-radius scouting session.

### 1.1 Trigger & Session
* **Entry:** Tapping the Satellite Widget (Orange Pulse) launches the drone.
* **Timer:** 10-minute session. UI displays a "Battery/Signal" countdown.
* **Tether:** 10-mile radius limit from the player's physical GPS location (`userLocation`).
* **Exit:** Session ends when timer hits 0, the player hits "Return to Base," or the drone moves out of bounds.

### 1.2 Visuals: "Drone Launch"
* **Player Icon:** Remains at the user's GPS coordinates (static).
* **Drone Icon:** A new high-tech drone sprite appears at the center of the map. It moves as the player drags the map.
* **Map Style:** "Tactical Blueprint" (Deep Navy, Glowing Cyan Grid, CRT Scanlines).
* **Zoom:** Auto-zooms to a strategic level (e.g., Level 15).

### 1.3 Rules & Interactions
* **Purchasing:** Allowed within the 10-mile radius. Incurs a 10% Remote Filing Fee (unless Explorer Pass active).
* **Supply Drops:** Visible but "Signal Weak" (Locked). Cannot collect.
* **Boundary:** If the player drags beyond 10 miles, the camera hits a "Soft Wall" (resistance) or displays "Out of Range."

---

## 2. Executive Travel (Global Ops)

**Design Philosophy:** "The Private Jet." A premium tool for global expansion.

### 2.1 Trigger & Access
* **Access:** Triggered via a separate menu or a "Global" button within the Drone interface (if subscribed/paid).
* **Interface:** Re-uses the Mapbox Geocoding search logic.

### 2.2 Functional Logic
* **Search:** "Enter City or Zip code..."
* **Cost:** 500 Influence Bucks or 1 Travel Permit per "Jump."
* **Effect:** Virtually relocates the player to the target area. Allows full interaction as if physically present (except for physical-only actions like local Supply Drops, which still require physical movement in the target city).

---

## 3. Implementation Details (v1.2)

### 3.1 State Updates (`mapSlice.ts`)
* `droneActive`: boolean
* `droneTimer`: number (seconds remaining)
* `droneTetherCenter`: LatLng (Locked to GPS location on launch)
* `droneTetherRadius`: 16093.4 meters (10 miles)

### 3.2 Component Changes
* **SatelliteWidget:** Now toggles `droneMode`.
* **SatelliteOverlay:** Removed Search Bar. Added Battery Meter and Radius Indicator.
* **GameMap:** 
    * Render `userLocation` marker even when `satelliteMode` is active.
    * Render `DroneMarker` at `satelliteCameraLocation`.
* **PurchaseModal:** Verify coordinates are within `droneTetherRadius` during drone mode.
