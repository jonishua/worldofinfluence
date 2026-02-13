# Bug: Drone Deployment Freeze / Page Unresponsive

**Status:** OPEN — Handoff to new agent  
**Severity:** Critical (blocks core feature)  
**Last Updated:** 2026-02-04  
**Reproduction:** Tap drone → Targeting mode → Tap map → Confirm location → Page freezes immediately with "Page Unresponsive" (drone does not enter "in-flight" mode)

---

## Current Behavior

- Freeze occurs **immediately** when "Confirm Location" is clicked
- Drone never reaches "In-flight / deploying" state before freeze
- Suggests freeze happens in **synchronous** code path (before React paint)

---

## Execution Flow on Confirm (for debugging)

1. **DeploymentSlider** `handleDeploy()` → `confirmDeployment(selectedParcel.center)`
2. **mapSlice.confirmDeployment** runs synchronously:
   - `set({ droneStatus: "deploying", droneTargetLocation, droneCurrentLocation, isLeaping: true, ... })`
   - `triggerMapFlyTo(target)` → `set({ flyToTarget: target })`
   - `get().completeDeployment()` → `set({ droneStatus: "active", droneTetherCenter, ... })`
   - `debounceSync(get().syncToCloud)`
3. **React re-renders** (Zustand subscriptions fire)
4. **MapFlyToHandler** effect runs (flyToTarget changed) → `map.stop?.()`, `map.setView()`, `triggerMapFlyTo(null)`
5. **DeploymentSlider** exits (AnimatePresence) when `droneStatus !== "targeting"`

---

## Fix Attempts (chronological)

| # | Approach | Result |
|---|----------|--------|
| 1 | RAF loop cleanup for drone interpolation | Partial; infinite loop fixed, freeze remained |
| 2 | Throttle updateDroneLocation 60fps → 12fps | Partial |
| 3 | Isolate DroneDeployingMarker component | Partial |
| 4 | Disable drone interpolation entirely | Partial |
| 5 | Use setView instead of flyTo for deployment | Partial; worked once, froze on 2nd deploy |
| 6 | Complete deployment in confirmDeployment (sync in store) | Partial |
| 7 | Remove ALL flyTo; use setView everywhere; map.stop() before moves | **Regression**: Now freezes immediately on first Confirm, never shows in-flight |
| 8 | Defer confirmDeployment with setTimeout(..., 0) | Applied |

---

## Key Files

| File | Relevance |
|------|-----------|
| `world-of-influence/store/slices/mapSlice.ts` | `confirmDeployment`, `completeDeployment`, `cancelDrone` |
| `world-of-influence/components/GameMap.tsx` | `MapFlyToHandler` (lines ~274–317), `DroneDeployingMarker`, grid useMemos |
| `world-of-influence/components/hud/DeploymentSlider.tsx` | Confirm button, `handleDeploy`, AnimatePresence exit |
| `world-of-influence/components/hud/SatelliteOverlay.tsx` | "In-flight / deploying" UI |

---

## Hypotheses for New Agent

1. **Synchronous state cascade** — Multiple `set()` calls in confirmDeployment trigger many re-renders; heavy GameMap/DeploymentSlider trees may block.
2. **DeploymentSlider exit animation** — Framer Motion AnimatePresence exit when `droneStatus` changes could be expensive or blocking.
3. **debounceSync / syncToCloud** — Could do synchronous work that blocks.
4. **map.stop() or map.setView()** — Leaflet calls might block in some edge cases.
5. **Grid/useMemo recomputation** — When `isLeaping` or `droneStatus` change, grid useMemos run; could be heavy.

---

## Suggested Next Steps

1. **Defer confirmDeployment** — Wrap in `setTimeout(..., 0)` to yield to browser before doing work.
2. **Staged updates** — Split the set() into smaller updates or use `flushSync` strategically.
3. **Remove DeploymentSlider exit animation** — Try `mode="sync"` or conditional render without AnimatePresence to test.
4. **Profile** — Add `performance.mark()` / `performance.measure()` around confirmDeployment, MapFlyToHandler effect, and syncToCloud to isolate the bottleneck.
5. **Minimal repro** — Temporarily replace confirmDeployment body with just `completeDeployment()` (skip deploying state, triggerMapFlyTo) to see if simplified path works.

---

## Regression Prevention (if fixed)

- Do NOT re-enable drone interpolation (RAF loop) without rigorous throttling/isolation
- Do NOT use Leaflet `flyTo` — use `setView(animate: false)` only
- Keep `droneCurrentLocation` out of GameMap subscriptions; use isolated marker component
