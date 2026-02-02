# Store Refactor Verification - Agent Task 06

## Status
- **Agent Assigned**: @QA / @implement
- **Priority**: High
- **Status**: Pending

## 1. Objective
Perform a comprehensive verification of the recently completed modular store refactor. Ensure that the transition from a monolithic `useGameStore` to domain-specific slices (`authSlice`, `economySlice`, `mapSlice`, `propertySlice`, `governanceSlice`) has no regressions and maintains full functionality for persistence and cloud sync.

## 2. Context
The "God Object" `useGameStore.ts` has been broken down into:
- **Slices**: `store/slices/*.ts` (Auth, Economy, Map, Property, Governance)
- **Utilities**: `store/*Utils.ts` (Domain-specific logic)
- **Types**: `store/types.ts` (Centralized definitions)
- **Hooks**: Specialized hooks (`useEconomyStore`, `useMapStore`, etc.) are exported from `useGameStore.ts`.

## 3. Scope of Work

### A. Integrity & Regression Testing
- [ ] **Core Loop**: Verify buying parcels, upgrading parcels, and collecting supply drops.
- [ ] **Economy**: Ensure rent accumulation, boost activation, and fund settlement work across components.
- [ ] **Mini-Games**: Verify "The Terminal" (slots) correctly reads/writes to the new store slices.
- [ ] **HUD Sync**: Ensure `SplitLedger`, `PendingPill`, and `SyncStatusIndicator` reflect the correct modular state.

### B. Persistence & Cloud Sync
- [ ] **Local Persistence**: Verify that `woi-game-store` in localStorage correctly rehydrates all slices upon page refresh.
- [ ] **Supabase Sync**: Verify `syncToCloud` (debounced) and `hydrateFromCloud` are operational.
- [ ] **Partialization**: Check `partialize` in `useGameStore.ts` to ensure only intended fields are persisted.

### C. Technical Cleanup
- [ ] **Search for Legacy References**: Ensure no direct imports of internal slice files are used in components (always use the hooks from `useGameStore.ts` or utility exports).
- [ ] **Circular Dependencies**: Use a tool or manual check to ensure slices don't have illegal circular imports.
- [ ] **Linting**: Run a full lint pass on the `world-of-influence/` directory.

### D. Documentation Update
- [ ] Update `PROJECT_TRACKER.md` to reflect Task 05 completion and Task 06 initiation.
- [ ] Update `MASTER_ARCHITECT.md` Section 7 with the finalized modular store architecture.

## 4. Definition of Done (DoD)
- No console errors related to state or store.
- Game state persists across refreshes and syncs to Supabase.
- All components use specialized hooks.
- Linter passes 100%.
