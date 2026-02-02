# [Live Operations] - Agent Task 07

**Status:** PENDING
**Assigned to:** @feature / @implement
**Context:** Phase 5 — Live Operations. The game has moved from `localStorage` to Supabase persistence. Now we must enable real-time multiplayer features and jurisdictional governance.

## 1. Goal
Transition the "World of Influence" from a single-player sandbox to a dynamic, multi-user ecosystem. Enable players to see each other on the map and compete for shared resources.

## 2. Deliverables

### A. Real-time Player Presence (The "Ghost Operators")
- [ ] **Location Broadcasting**: Use Supabase Realtime to broadcast the user's `[lat, lng]` to a `presence` channel.
- [ ] **Ghost Markers**: Implement a `MultiplayerLayer` in `GameMapClient.tsx` that renders other active users as low-opacity "Ghost" markers (use a specialized Lucide `User` icon or a pulsing dot).
- [ ] **Presence List**: Add a small "Online Operators" counter in the `TopNav` or `LeaderboardWidget`.

### B. Global Supply Drops (Competitive Collection)
- [ ] **Global Table**: Create a new Supabase table `global_drops` for drops visible to all players.
- [ ] **Server-Side Spawning (Mock)**: For the MVP, implement a client-side "Event Trigger" that inserts a high-value drop into `global_drops` which all users see.
- [ ] **Atomic Collection**: Ensure that when a global drop is collected, it is removed for everyone using a Supabase RPC or transaction to prevent double-collection.

### C. Governance v1: The Mayor's Dashboard
- [ ] **Jurisdictional Stats**: Build a slide-up panel for City Key holders to view total city yield, number of active parcels, and recent acquisitions in their jurisdiction.
- [ ] **Mock Voting**: Implement the UI for a "Tax Rate Proposal" where key holders can vote (Yes/No) to simulate future economy-shifting mechanics.

## 3. Technical Requirements
- **Supabase Realtime**: Enable replication for `global_drops` and use `presence` for player locations.
- **Optimization**: Debounce location updates to once every 3-5 seconds to save on Supabase throughput.
- **Visuals**: Use "Growth Green" (#00C805) for global events to distinguish them from personal drops.

## 4. Definition of Done
- Players can see at least one other "Ghost" marker on the map (test with two browser tabs).
- A "Global Drop" spawned in one tab appears in the other.
- Collecting a "Global Drop" in one tab removes it from the other.
- City Key holders can access the "Jurisdiction" view from their Profile.
