# World of Influence - System Architecture & Developer Guide

## 1. Architectural Philosophy
World of Influence follows a **Modular Monolith** approach on the frontend, utilizing a sliced state management system and a robust backend-as-a-service (Supabase). 

- **State-First:** The UI is a pure reflection of the global Zustand store.
- **Domain Separation:** Logic is extracted into domain utilities to keep components and store slices thin.
- **SSR Safety:** Browser-only features (Map, Auth) are handled with dynamic imports or `useClient` hooks to ensure Next.js stability.

---

## 2. State Management (Zustand Slices)
The monolithic `useGameStore` has been refactored into modular **Slices** located in `world-of-influence/store/slices/`. 

### Current Slices:
- **`authSlice.ts`**: Handles Supabase session state, user profiles, and cloud sync status.
- **`economySlice.ts`**: Manages all currencies (Credits, Influence Bucks, Permits), rent calculation, and the Boost system.
- **`mapSlice.ts`**: Handles user location, zoom levels, and marker visibility.
- **`propertySlice.ts`**: Manages owned parcels, minting logic, and property upgrades.
- **`governanceSlice.ts`**: Tracks City Keys, jurisdictional data, and Mayor/Governor status.

### Domain Utilities:
Each slice is supported by a corresponding `*Utils.ts` file (e.g., `economyUtils.ts`) containing pure logic. **Always prioritize adding logic to utilities over the store itself.**

---

## 3. Backend & Real-time Integration
We use **Supabase** for persistence, authentication, and real-time multiplayer features.

- **Persistence:** State is persisted to `localStorage` for immediate feedback and synchronized to PostgreSQL via a debounced `syncToCloud` process.
- **Presence:** `supabase.channel('map-presence')` tracks active players. Their locations are broadcasted and rendered as "Ghost" markers on the map.
- **Real-time Broadcast:** Global events (like Global Supply Drops) are broadcast to all clients simultaneously.
- **Atomic Operations:** Critical game logic (like collecting global drops) uses PostgreSQL RPC (Remote Procedure Calls) to prevent race conditions.

---

## 4. UI/UX Framework
The game follows a strict **"Bank Vault" Aesthetic**.

### Design Tokens:
- **Primary Color:** Growth Green (`#00C805`)
- **Backgrounds:** Slate (`#1F2937`) and White
- **Typography:** **Monospaced font** MUST be used for all currency data.

### Component Architecture:
- **Top-Level Modals:** All major modals (Shop, Terminal, Mayor Dashboard) are managed at the `page.tsx` level to prevent z-index and layering issues.
- **Slide-Up Panels:** Use the standardized `PropertySheet` pattern: rounded top corners, bottom-anchored, and `framer-motion` animations.
- **Map Engine:** `react-leaflet` is used with a grayscale CSS filter to maintain the "Waze Grey" aesthetic.

---

## 5. Core Game Loops for Developers

### The Economy Tick:
Rent is not calculated by a server interval. Instead, it is computed lazily using `computePendingRent(state, now)`. This allows the balance to tick up at 60fps on the HUD while remaining cryptographically consistent with the last "Settle" event.

### Property Management:
Parcels are mapped to a **10m x 10m grid**. When a user selects a grid cell:
1. `selectedParcel` is updated in `mapSlice`.
2. `PropertySheet` opens to show parcel details.
3. Users can "Mint" (buy) or "Renovate" (upgrade) using `propertySlice` actions.

---

## 6. How to Implement a New Feature
1. **Define Types:** Add any new data structures to `store/types.ts`.
2. **Create Slice/Utils:** If the feature is large, create a new slice in `store/slices/`.
3. **Extend `useGameStore`:** Add the new slice to the combine function in `useGameStore.ts`.
4. **Build Component:** Create the UI in `components/`, following the Bank Vault aesthetic.
5. **Register Modal:** If the feature has a UI overlay, add it to the top-level `page.tsx`.

---

## 7. Quality & Performance Gate
- **No Console Errors:** All features must be tested for SSR hydration mismatches.
- **Performance Budget:** Map markers must be optimized. Use `react-leaflet` efficiently to avoid re-rendering the entire map on every balance tick.
- **Linting:** We enforce strict linting. Run `npm run lint` before any deployment.
