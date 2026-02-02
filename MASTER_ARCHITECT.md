# World of Influence - Master Architect Document

## 1. Core Architectural Philosophy
- Ship a stable MVP first; keep systems small, modular, and testable.
- Prefer Next.js App Router conventions and server/client boundaries.
- Favor composition over inheritance for UI.

## 2. Key Systems Summary
- **UI/HUD:** Tailwind-driven, bank-vault aesthetic.
- **Map:** `react-leaflet` with SSR-safe dynamic import; desaturated tiles.
- **State:** Zustand for client state and game session data.
- **Backend:** Supabase for Auth (Session management) and PostgreSQL Database (Cloud Persistence).
- **Economy:** Live balance odometer + boost simulation.
- **Debug Tools:** Cheat menu for currency, pickup radius, zoom limits, and compass.
- **Slide-Ups:** Standardized bottom sheets with shared animation and anchoring.
- **CI/CD:** @devops managed deployments via Vercel; strict pre-push lint/build validation.

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
- 2026-01-30: Initialized GitHub repository and established @devops persona for automated "Push it live" deployments via Vercel.
- 2026-01-30: Approved "Phase 4: Persistence & Multiplayer" plan. Initiated Task 04 (Backend Integration) and scheduled Task 05 (Store Refactor).
- 2026-01-30: Backend Integration (Task 04) completed. Migrated from `localStorage` to Supabase (Auth + DB) with debounced cloud sync.
- 2026-01-30: Store Refactor (Task 05) completed. Split monolithic `useGameStore` into modular slices (`auth`, `economy`, `map`, `property`, `governance`) and extracted domain utilities. Verified build and initial HUD sync.
- 2026-01-30: Build Stabilization (CI/CD): Fixed Vercel deployment crash by making Supabase initialization SSR-safe and environment-aware. Verified production build success.
- 2026-01-30: Lint Guardrails: Fixed 41+ linter errors across the codebase to ensure production-grade stability and prevent cascading re-renders.
- 2026-01-30: Phase 5 (Live Operations) completed. Implemented Real-time Presence, Global Supply Drops, and the Mayor's Dashboard. Standardized cross-device synchronization and production build integrity.
- 2026-01-30: Created `Docs/SYSTEM_ARCHITECTURE.md` as a comprehensive architectural guide for onboarding and feature development.
- 2026-01-31: @devops execution of "Push it live" protocol. Stabilized production build, fixed cascading render lints, and synchronized store types for deployment readiness. Verified production build success and pushed to main.

## 7. Recent Implementation Notes (2026-01-30)
- **Live Operations (Task 07):**
    - *Real-time Presence:* Utilized Supabase Presence to broadcast and track active operators on the map as "Ghost" markers. Added a global "Online Operators" counter in the HUD.
    - *Global Drops:* Implemented a shared `global_drops` system with atomic collection logic via PostgreSQL RPC. Events are synchronized across all clients in real-time.
    - *Governance v1:* Built the Mayor's Dashboard for City Key holders, featuring jurisdictional insights and a "Tax Rate Proposal" voting mechanism.
    - *State Standardization:* Moved `selectedJurisdiction` to the global store and refactored modal rendering to the top-level `page.tsx` to solve layering and stacking context issues.
    - *Production Integrity:* Enforced strict linting and build validation for all "Push it live" sequences. Verified 100% production build success.
- **Satellite Surveillance (Task 08):**
    - *The Drone View:* Implemented remote map exploration decoupled from GPS location. Added "Tactical Blueprint" visual shift with CRT scanlines and a custom Drone Reticle.
    - *Mapbox Search:* Integrated Mapbox Geocoding for text-based location search (cities, zip codes) with smooth high-fidelity "Fly-To" animations.
    - *Remote Economy:* Added Uplink Charges system (anti-spam) and a 10% Remote Filing Fee for non-subscribers, integrated into the acquisition flow.
    - *Haptic Exploration:* Added 100m "Tick" feedback for sensory map dragging and enforced physical presence rules for supply drop retrieval.

## 8. Legacy Implementation Notes (2026-01-29)
- **Property upgrades:** `upgradeParcel()` now costs **250 Influence Bucks + 1 Permit**. Parcel upgrades update `rarity`, `rentRate`, and stamp `lastUpgradedAt` for map pop animation.
- **Property Sheet renovation flow:** multi-phase sequence (demolish/build/reveal) with shake, flash, and centered success toast; disabled state shows missing requirements.
- **Boost UI polish:** Boost button is a compact square with label below; active state glows with shockwave; pending yield text turns neon and shows floating “+” while boosted.
- **Geo reset safeguard:** `locationRequestId` forces geolocation watcher restart after reset to avoid fallback location.
- **Cheat reset:** cheat menu includes “Reset Game” that clears persisted storage and resets state.
- **The Terminal (Mini-Game):** High-fidelity 3-reel slot machine using `framer-motion` for GPU-accelerated animations. Features staggered reel stops (1.5s, 2.0s, 2.5s), near-miss tension on the 3rd reel, and normalized reel positioning to ensure consistent spin direction. Reward logic is strictly validated to prevent "phantom wins" (visual match with 0 reward). Supports 1x, 5x, and 10x bet multipliers.
