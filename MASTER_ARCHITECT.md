# World of Influence - Master Architect Document

## 1. Core Architectural Philosophy
- Ship a stable MVP first; keep systems small, modular, and testable.
- Prefer Next.js App Router conventions and server/client boundaries.
- Favor composition over inheritance for UI.

## 2. Key Systems Summary
- **UI/HUD:** Tailwind-driven, bank-vault aesthetic.
- **Map:** `react-leaflet` with SSR-safe dynamic import; desaturated tiles.
- **State:** Zustand for client state and game session data.
- **Economy:** Live balance odometer + boost simulation.
- **Debug Tools:** Cheat menu for currency, pickup radius, zoom limits, and compass.
- **Slide-Ups:** Standardized bottom sheets with shared animation and anchoring.

## 3. Definition of Done (DoD)
- Feature works end-to-end with no console errors.
- UX meets the bank-vault aesthetic and interaction rules.
- Lints pass for touched files.

## 4. Regressive Guardrails (Anti-Regression Protocol)
- Do not break SSR by importing browser-only libraries outside client components.
- Keep map tiles desaturated and grid overlay intact.
- Currency UI must remain monospaced.
- Slide-up panels must anchor to the bottom (no gap), use the shared `slide-up` animation, and rounded top corners.
- Reuse the same bottom-sheet structure for new slide-ups to keep interaction consistent.

## 5. Deep Root Cause Analysis Protocol (Bug Investigation)
1. Reproduce and isolate the failure path.
2. Identify the earliest incorrect state transition or event.
3. Verify all callers and side effects for the failing path.
4. Fix root cause; add targeted regression check.

## 6. History of Major Decisions
- 2026-01-19: Adopted persona system with @master and @QA.
- 2026-01-20: Added live economy loop, boost system, and cheat tooling.
- 2026-01-20: Standardized slide-up panel styling/behavior across HUD flows.
- 2026-01-29: Created Feature Implementation Agent (@feature/@implement) - specialized agent for implementing features with maximum polish, juice, and bug prevention. Optimized for art, animations, haptics, and visual effects.
- 2026-01-29: Implemented "The Terminal" (formerly Neon Slots) mini-game with high-fidelity reel animations, near-miss logic, and bet multipliers.

## 7. Recent Implementation Notes (2026-01-29)
- **Asset Exchange (Shop) v2.0:** Refactored into a 3-tab layout (Exchange, Capital, Services). 
    - *Architecture:* Switched to a `flex flex-col` modal structure with a `flex-1` scrollable center. This ensures fixed headers/footers and reliable scrolling on both mouse wheel and touch devices.
    - *Sub-components:* Created `KeyAssetCard` for jurisdictional assets, implementing a strict **ICON -> NAME -> PRICE** hierarchy. Includes dynamic text scaling for long city names.
    - *Subscription System:* Integrated tiered service plans with inherited perks ("Composite Benefits"). State is persisted in `activeSubscriptions` within `useGameStore`.
- **Jurisdictional Asset Array:** Replaced vertical key list with a high-density 3-column horizontal grid. Connected to multi-level reverse geocoding (City/State/Country).
- **Haptic Feedback Patterns:** Added sharp `[10]` metallic vibration pattern for key acquisitions to distinguish from land purchases.

## 8. Legacy Implementation Notes (2026-01-20)
- **Property upgrades:** `upgradeParcel()` now costs **250 Influence Bucks + 1 Permit**. Parcel upgrades update `rarity`, `rentRate`, and stamp `lastUpgradedAt` for map pop animation.
- **Property Sheet renovation flow:** multi-phase sequence (demolish/build/reveal) with shake, flash, and centered success toast; disabled state shows missing requirements.
- **Boost UI polish:** Boost button is a compact square with label below; active state glows with shockwave; pending yield text turns neon and shows floating “+” while boosted.
- **Geo reset safeguard:** `locationRequestId` forces geolocation watcher restart after reset to avoid fallback location.
- **Cheat reset:** cheat menu includes “Reset Game” that clears persisted storage and resets state.
- **The Terminal (Mini-Game):** High-fidelity 3-reel slot machine using `framer-motion` for GPU-accelerated animations. Features staggered reel stops (1.5s, 2.0s, 2.5s), near-miss tension on the 3rd reel, and normalized reel positioning to ensure consistent spin direction. Reward logic is strictly validated to prevent "phantom wins" (visual match with 0 reward). Supports 1x, 5x, and 10x bet multipliers.
