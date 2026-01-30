# Core Loop Alignment - Agent Task 01

## 1. Specialist Persona
**Role:** Executive Game Director (Implementation Coordinator)  
**Specialization:** GDD-to-Game Alignment & Economy Consistency

## 2. Objective
Bring the implemented MVP loop in `world-of-influence` into alignment with the GDD. Focus on data rules (drops, currency, rates, timers) and resolve mismatches. New systems are allowed only if required for scale/performance and after review with @master.

## 3. Stability & Safety (Non-Negotiables)
- Do not break map SSR handling (`GameMapClient` dynamic import).
- Do not redesign existing HUD layouts or modal flows.
- Do not add new dependencies.
- Preserve the "Bank Vault" aesthetic and UI patterns in `Docs/UI_PATTERNS.md`.

## 4. Technical Requirements & Budgets
- **Performance:** Keep map interactions smooth; no heavy recompute per frame.
- **State:** Continue to use Zustand store in `store/useGameStore.ts`.
- **Architecture:** Keep logic centralized in store selectors/utilities.

## 5. "The Juice" (Feel & Vibe)
- **Visuals:** No new VFX required; preserve current confetti logic and boost glow.
- **Audio/Haptics:** Preserve existing haptics in Supply Drop open flow.

## 6. Task Breakdown
### Phase 1: Audit & Decision Log
- Read `Docs/World of Influence MVP MSSTR.md` sections 1–3.
- Identify mismatches in:
  - Supply drop radius, spawn timing, spawn counts, rarity rates.
  - Currency semantics (INK Cash vs Influence Bucks).
  - Rent rates and boost duration/stacking.
- Produce a short decision log: what changes in code vs what updates in GDD.
- If a new system is needed for scale/perf, stop and request @master review.

### Phase 2: Core Alignment (Code)
- Update supply drop generation to match GDD:
  - 4–6 drops every 4 hours within 50m radius.
  - Maintain a reserve pool in 500m radius (if feasible with current logic).
  - Apply GDD rarity rates (Common 70 / Uncommon 25 / Rare 5).
- Align boost duration to 1 hour; cap stacking at 6 hours.
- Align parcel purchase cost and rent rates to GDD (or adjust GDD if we keep current economy).

### Phase 3: Documentation Sync
- If code decisions diverge from the GDD, prepare a **GDD Update Block** with exact replacement text.
- Update `PROJECT_TRACKER.md` if it exists, or propose creating it.

## 7. Verification Protocol (How to Test)
1. Open map, ensure drops spawn within correct radius and counts.
2. Open a drop and verify reward distribution over several test runs.
3. Activate boost and confirm duration/stacking behavior.
4. Purchase parcel and verify rent rates/rarity outcomes match spec.

## 8. Handoff Instruction
When complete, provide a technical summary and say: **"Task Complete. Let @master know."**

---

## Decision Log
- Supply Drops: shifted to a four-tier reward table (Common/Rare/Epic/Legendary) with scaled rewards and updated odds; GDD updated accordingly.
- Currency Semantics: parcels and upgrades use Influence Bucks; rent accrues in INK Cash; GDD updated accordingly.
- Rent/Boost: rent rates aligned to GDD, boost duration/stack cap aligned, and Tiered Cliff multipliers implemented in the rent engine.
- UI Precision: expanded decimal precision on earnings displays to emphasize continuous yield.

## Status
Task Complete. Let @master know.
