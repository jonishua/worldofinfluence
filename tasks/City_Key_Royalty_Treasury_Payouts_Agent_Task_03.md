# City Key Royalty + Treasury Payouts - Agent Task 03

## 1. Specialist Persona
**Role:** Senior Gameplay Engineer (Economy Systems)  
**Specialization:** Revenue Share, Status Perks, Payout Logic

## 2. Objective
Implement MVP governance economic perks: City Key royalty distribution and City Treasury payouts for Mayor/Vice Mayor, aligned with `Docs/World of Influence MVP MSSTR.md` Section 4.2 and 4.3 (City Keys now include admin-level granularity and a fixed mayor kickback).

## 3. Stability & Safety (Non-Negotiables)
- Do not break core map flow or HUD interactions.
- Do not introduce real-time networking; use mocked/local data for MVP.
- Preserve "Bank Vault" aesthetic per `Docs/UI_PATTERNS.md`.
- No new dependencies without @master review.
- Keep all state in a single Zustand slice (no duplicated sources of truth).

## 4. Technical Requirements & Budgets
- **Performance:** O(1) updates for payouts; avoid per-frame or per-tick loops.
- **State:** Extend `store/useGameStore.ts` with governance state + payout history.
- **Architecture:** Add clear selectors for leaderboard rank and officeholders.
- **Testing:** Provide a deterministic debug path to simulate City Key purchases.

## 5. Scope (MVP)
**In-Scope**
- City Key purchase event triggers royalty distribution:
  - **Fixed kickback:** Mayor of the city receives **20 INK Cash** per Key purchase (per GDD 4.3).
- City Treasury payouts:
  - Mayor receives 10% of City Treasury (game-generated INK Cash).
  - Vice Mayor receives a guaranteed 10 INK Cash daily.
- Minimal audit log (last 5 payout events) for debugging.

**Clarify/Review with @master**
- GDD 4.2 references percentage-based revenue shares (Mayor/Governor/President). If we keep those, confirm math vs the fixed 20 INK kickback in 4.3 before implementation.

**Out-of-Scope**
- Real money payment processing.
- Multiplayer sync, live leaderboard calculations, or remote data.
- Taxes, refunds, or complex payout schedules beyond MVP.

## 6. Suggested Data Model (Draft)
Add to `useGameStore.ts`:
- `cityKeysOwned: Record<string, number>` (by region id)
- `treasuryBalances: Record<string, number>` (by city id)
- `officeholders: { city: { mayorId, viceMayorId }, state: { governorId }, country: { presidentId } }`
- `payoutEvents: Array<{ id, type, amount, recipientId, region, timestamp }>`
- Actions:
  - `purchaseCityKey(regionId, costInk, regionLevel)`
  - `distributeCityKeyRoyalties(regionId, amountInk)`
  - `distributeTreasuryPayout(regionId, amountInk)`
  - `simulateTreasuryTick(regionId)`

## 7. UX / Surface Requirements
- **No new UI required** for MVP, but add optional dev-only triggers in existing cheat menu if needed.
- Preserve monospaced currency display if any numbers are shown.

## 8. Verification Protocol (How to Test)
1. Trigger `purchaseCityKey()` for a sample city.
2. Verify mayor receives a **20 INK** kickback per purchase.
3. Trigger treasury payout and verify mayor + vice mayor receive correct INK Cash.
4. Confirm payout history logs the last 5 events.

## 9. Handoff Instruction
When complete, provide a technical summary and say: **"Task Complete. Let @master know."**

---

## 10. Status
- **State:** Complete
- **Notes:** Added governance state + payout history; implemented fixed kickback plus percent royalties; added cheat menu triggers for key purchases and treasury payouts.
