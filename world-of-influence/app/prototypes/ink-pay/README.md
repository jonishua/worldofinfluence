# INK Pay - Living Data Prototype

## Overview
This prototype explores the visualization of "Viral / Direct Connections" and the flow of royalties through an "Ink ID" network. 

**Core Goal:** Visualize how money pushes through a lineage of players in a "Heat Map / Mind Map" style.
**Aesthetic:** World of Influence (Bank Vault, Growth Green, Slate, High-Fidelity).
**Vibe:** Living, breathing, organic, sleek, high-class.

## Reference Material
Based on `_Direct Connections _ Royalty Table-130226-220927.pdf`.

### Key Data Concepts
- **Root Node:** The current user (You).
- **Direct Connections:** Users invited directly by Root.
- **Viral Connections:** Users invited by Direct connections (Level 2+).
- **Flow:** Transaction Event -> Connection Resolution -> Royalty Calculation -> Ledger Update.
- **Visual Metaphor:** Money "pushed" through the network.

---

## 5 Proposed Concepts

### 1. The "Neural Treasury" (Force-Directed Graph)
**Concept:** A biological/neural network where the user is the nucleus. Connections are dendrites.
- **Visuals:** Glowing green nodes on a dark slate void. 
- **The "Pulse":** When a sub-node earns, a bright pulse of light travels down the connection line to the nucleus.
- **Heat Map:** High-performing lineages glow brighter and thicker. Dormant ones dim.
- **Interaction:** Drag nodes, pinch to zoom into specific sub-trees.
- **Juice:** "Heartbeat" ambient animation.

### 2. The "Orbital Ledger" (Radial Solar System)
**Concept:** The User is the Sun. Directs are planets. Virals are moons.
- **Visuals:** Concentric rings of influence.
- **The "Flow":** Money enters as "Comets" from the outer void, striking a planet (Direct), which splits the beam to the Sun (User).
- **Heat Map:** Sectors of the orbit light up based on aggregate volume.
- **Structure:** Extremely organized, easy to read depth.
- **Juice:** Smooth orbital rotation. Impact shockwaves on the central sun.

### 3. The "Sentinel Grid" (Isometric City/Chipset)
**Concept:** A digital landscape or PCB board.
- **Visuals:** Isometric view of "Blocks" (users).
- **The "Flow":** Data packets (Cash) travel along grid lines (Traces) at 90-degree angles.
- **Heat Map:** High-value areas raise up vertically (3D bar chart logic) or glow "Hot White".
- **Vibe:** Very "Fintech", "Matrix", "Bank Vault". Secure and rigid structure with fluid data moving inside.

### 4. The "Liquidity Stream" (Fluid/Sankey Simulation)
**Concept:** Money is a liquid.
- **Visuals:** A particle system behaving like a river.
- **The "Flow":** Thousands of green particles flow from the top (Network) into a funnel (The User).
- **Lineages:** Tributaries feeding the main river.
- **Heat Map:** Faster flow = More money. Wider river = More connections.
- **Juice:** Liquid physics, splashing, shimmering surface tension.

### 5. The "Constellation Vault" (Star Map)
**Concept:** A night sky interface.
- **Visuals:** Elegant thin lines connecting stars.
- **The "Flow":** Shooting stars trace the path from the source to the user.
- **Heat Map:** High-value users become "Supernovas" (larger, pulsing stars).
- **Vibe:** The most "High Class" / "Luxury" option. Minimalist.
- **Interaction:** Telescope view to inspect specific clusters.

---

## Technical Architecture
- **Framework:** Next.js 14 (App Router).
- **State:** Zustand (Simulated Live Data).
- **Animation:** Framer Motion (Layout/UI) + Canvas/WebGL (The Graph).
- **Libraries:** 
    - `react-force-graph` or `d3` for logic.
    - `framer-motion` for UI overlays.
    - `lucide-react` for iconography.
