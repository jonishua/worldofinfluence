# Store Refactor (Domain-Specific Stores) - Agent Task 05

## Overview
Refactor the monolithic `useGameStore.ts` (currently 1,200+ lines) into modular, domain-specific stores. This will improve maintainability, reduce unnecessary re-renders (performance), and make the codebase easier to scale.

## Goals
1. **Modular Architecture**: Split the state and actions into logical domains.
2. **Performance Optimization**: Use Zustand's selector patterns or separate stores to ensure components only re-render when their specific data changes.
3. **Clean Code**: Move types, constants, and helper functions into appropriate files.

## Requirements

### 1. Identify Domains
Split the existing `GameState` into the following stores (suggested):
- **`useAuthStore`**: Auth session, cloud sync status (`isSyncing`, `lastSyncTime`, `cloudSyncError`), and `hydrateFromCloud`/`syncToCloud` logic.
- **`useEconomyStore`**: All currencies (`walletBalance`, `rentBalance`, `credits`, `influenceBucks`, `zoningPermits`), boost state, and rent calculation logic.
- **`useMapStore`**: `userLocation`, `mapZoom`, `drops`, `selectedParcel`, and location-based actions.
- **`usePropertyStore`**: `ownedParcels` management, `buyParcel`, and `upgradeParcel` logic.
- **`useGovernanceStore`**: Leaderboards, officeholders, regional keys, and payout events.

### 2. Implementation Steps
- Create a `store/` directory (already exists).
- Create individual files for each store (e.g., `useEconomyStore.ts`, `useMapStore.ts`, etc.).
- Move relevant types to a shared `types/` or keep them local to the store if specific.
- **Persistence**: Ensure each store that needs persistence (Economy, Property, Governance) is correctly configured with Zustand's `persist` middleware, maintaining compatibility with the existing `woi-game-store` key if possible, or migrating smoothly.
- **Component Updates**: Update all components (`HUD`, `Map`, `Terminal`, `Shop`) to use the new specialized stores.

### 3. Maintain Cloud Sync
- Ensure the `syncToCloud` and `hydrateFromCloud` logic (from Task 04) is correctly re-integrated. It might be best to keep a "Master Sync" logic or have each store handle its own sync if the backend supports it.

## Definition of Done
- No regression in game functionality.
- `useGameStore.ts` is either removed or significantly reduced to a simple aggregator/bridge.
- Components use smaller, more focused store hooks.
- Cloud sync (Supabase) continues to function correctly for all persisted data.
- Linter passes and there are no circular dependencies between stores.
