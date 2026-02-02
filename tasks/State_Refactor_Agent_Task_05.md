# State Refactor - Agent Task 05

## Overview
Deconstruct the monolithic `useGameStore.ts` into domain-specific modules. This refactor is essential for maintainability, performance (reducing unnecessary re-renders), and preparing the architecture for real-time multiplayer features.

## Goals
1. **Modularization**: Split the current "God Object" store into smaller, focused stores.
2. **Performance**: Optimize re-renders by ensuring components only subscribe to the data they need.
3. **Clean Code**: Improve readability and type safety across all state management.

## Proposed Store Structure
- **useAuthStore**: 
    - Session management (Login/Logout).
    - User profiles.
    - Cloud sync status and errors.
- **useEconomyStore**: 
    - Balances (INK Cash, Wallet, Credits, Influence Bucks, Permits).
    - Rent calculation logic.
    - Boost activation and timing.
    - Reinvestment and settlement logic.
- **useMapStore**: 
    - User location.
    - Supply drops (generation, collection).
    - Grid/Parcel selection and minting states.
    - Zoom and map limits.
- **useGovernanceStore**: 
    - Leaderboards.
    - Mayor status and Officeholders.
    - City Keys ownership and royalties.
    - Treasury balances and payouts.

## Requirements
- Maintain backward compatibility for all existing components during the transition.
- Use Zustand's `persist` middleware for each store (with appropriate cloud-sync triggers).
- Ensure all Supabase sync logic is preserved and correctly mapped to the new stores.
- Fix all imports across the codebase.

## Tech Stack
- **Framework**: Next.js 14
- **State**: Zustand (Modularized)
- **Backend**: Supabase (Persistence)

## Definition of Done
- `useGameStore.ts` is eliminated or significantly reduced.
- All game features (Map, Shop, Terminal, HUD) work perfectly with the new stores.
- No regression in Cloud Sync or Auth functionality.
- Performance benchmark: Reduced re-render counts on HUD updates.
