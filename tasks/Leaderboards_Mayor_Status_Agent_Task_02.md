# Leaderboards & Mayor Status - Agent Task 02

## 1. Specialist Persona
**Role:** Executive Game Director (Implementation Coordinator)  
**Specialization:** Social Proof + Status Systems

## 2. Objective
Implement the Phase 3 social layer: leaderboards, mayor status, and visible status presence. Align with GDD governance tiers and UI trust patterns.

## 3. Stability & Safety (Non-Negotiables)
- Do not break core map flow or HUD interactions.
- Do not introduce real-time networking; use mocked/local data for MVP.
- Preserve "Bank Vault" aesthetic per `Docs/UI_PATTERNS.md`.
- No new dependencies without @master review.

## 4. Technical Requirements & Budgets
- **Performance:** Leaderboard rendering must remain lightweight (virtualize or cap list length).
- **State:** Use Zustand store for leaderboard/mayor state.
- **Architecture:** Keep leaderboard data in a single slice; avoid cross-component duplication.

## 5. "The Juice" (Feel & Vibe)
- **Visuals:** Status elements feel premium (ticker-like motion, crisp typography).
- **Audio/Haptics:** Optional; if added, keep subtle and gated.

## 6. Task Breakdown
### Phase 1: Spec Alignment
- Read GDD Section 4.2 (Mayor & Governance) and 4.1 (Feed Ticker).
- Define MVP subset for leaderboards + mayor status with mocked data.
- Confirm how “Mayor” is displayed on the map (floating avatar or badge).

### Phase 2: Core Implementation
- Add leaderboard data model and selectors in `store/useGameStore.ts`.
- Build a leaderboard UI panel (slide-up or modal) with city/state/country tabs.
- Add mayor status badge + top-of-map presence (e.g., floating marker).
- Create feed ticker component with mock activity stream.

### Phase 3: Polish & Sync
- Match visuals to UI patterns (rounded rectangles, uppercase labels, monospace currency).
- Ensure state updates don’t regress performance.
- If any GDD details are adjusted, prepare a **GDD Update Block**.

## 7. Verification Protocol (How to Test)
1. Open leaderboard panel; verify tab switching and ordering.
2. Confirm mayor badge/presence renders on map.
3. Validate ticker scrolls smoothly and doesn’t overlap HUD.
4. Check that visuals follow `Docs/UI_PATTERNS.md`.

## 8. Handoff Instruction
When complete, provide a technical summary and say: **"Task Complete. Let @master know."**

---

## 9. Status
- **State:** Complete
- **Notes:** Mayor presence moved into the Leaderboards hub via an "Officeholders" tab; always-on mayor badge removed per product decision.
