# Feature: INK Pay Visualizer (Orbital Ledger)

## Overview
**Feature Name:** INK Pay Visualizer
**Codename:** "The Orbital Ledger"
**Status:** Prototype Complete (v2.2)
**Goal:** A high-fidelity, "living data" visualization tool used during sales conversations to demonstrate the viral power of the INK ID connection system. It simulates how a user's network grows and generates recurring royalties over a year.

---

## 1. Core Mechanics

### The "Orbital" Metaphor
The visualization uses a solar system metaphor to represent the user's network:
- **The Sun (Center):** The User (@YOU).
- **Planets (Inner Ring):** Direct Connections. These are users invited directly by the main user.
- **Moons/Asteroids (Outer Cloud):** Viral Connections. These are users invited by the Directs (Level 2+).

### The Growth Engine (Dream Simulation)
The prototype includes a deterministic "Dream Simulation" that models growth over 365 days based on 5 tiered scenarios:
1.  **Micro (5k Followers):** "The Local Hero"
2.  **Nano (50k Followers):** "The Rising Star"
3.  **Macro (250k Followers):** "The Trendsetter"
4.  **Mega (1M Followers):** "The Icon" (e.g., Nyjah Huston)
5.  **Titan (10M Followers):** "The Global Brand"

**Growth Phases:**
- **Phase 1 (The Drop):** Exponential growth (hockey stick) for the first 45-60 days.
- **Phase 2 (The Tail):** Steady, linear growth for the remainder of the year.
- **Viral Lag:** Viral connections start populating ~20 days after the first Directs.

---

## 2. Technical Architecture

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Rendering:** HTML5 Canvas (via `useRef`) for 60fps performance with 1000+ nodes.
- **UI:** React + Framer Motion for overlays and panels.
- **Audio:** Web Audio API (Custom `AudioEngine` class) for procedural sound generation.

### Performance Optimizations (Crucial)
To maintain 60fps while simulating 100,000+ virtual transactions:
1.  **Visual/Logic Separation:** The visual flying dots ("Comets") are managed in a mutable `useRef` array, completely decoupled from React state. This prevents re-renders on every frame.
2.  **Throttled UI:** The "Live Feed" of transactions updates only once every 150ms, batching incoming data into "Bundled" entries (e.g., "Via Multiple (5)") when velocity is high.
3.  **Super-Nodes:** When the node count exceeds render budgets (e.g., >50 Directs), visual nodes stop multiplying and instead grow in **Size** and **Brightness** to represent density.

---

## 3. Visual & Audio Design (The "Juice")

### "Bank Vault" Aesthetic
- **Colors:** Slate 950 Background, "Growth Green" (#00C805) Accents.
- **Font:** Monospace for all financial data to imply precision and security.
- **Lighting:** Elements glow and cast shadows.

### Interactive Elements
- **Physics Repulsion:** Moving the mouse creates a gravity well, pushing nodes away gently.
- **Heat Map:** Connection lines glow brighter when money flows through them, fading over time.
- **Audio Pulse:** A low ambient drone (55Hz) provides a "room tone", while transactions trigger random high-pitched digital "pings" (800Hz-1200Hz). Whale transactions ($150+) have distinct audio cues.

---

## 4. Usage Guide

### Simulation Mode
1.  Click the **"Simulation"** button in the top right.
2.  Select a **Tier** (Micro to Titan).
3.  The sim automatically resets and plays.
4.  **Timeline Slider:** Drag to scrub through the year.
5.  **Pause/Play:** Toggle playback speed.

### Manual Mode
Allows manual adjustment of:
- Direct Count (3-24)
- Viral Count (100-2000)
- Activity Level (Speed of money flow)

---

## 5. Future Improvements (Roadmap)
- **3D Transition:** Move from 2D Canvas to Three.js/R3F for true depth.
- **Real Data Integration:** Connect to the actual backend websocket for live user data.
- **Geospatial Mode:** Map nodes to a 3D Globe based on IP geolocation.
