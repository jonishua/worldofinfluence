# Market Sniper - Implementation Task 15

## 🎯 Goal
Implement the **Market Sniper** skill-based mini-game in the Arcade. This game rewards timing and precision, allowing players to "launder" Credits into INK Cash through a high-tension stock-trading simulation.

## 📖 Context
Market Sniper is the first skill-based game in our arcade (Terminal). Unlike the Neon Slots (RNG), this requires the player to hit a "SELL" button at the peak of a volatile price chart.

- **Location:** `world-of-influence/components/modals/MarketSniper.tsx` (to be created)
- **Entry Point:** Added to `ArcadeDrawer.tsx`.
- **Theme:** Fintech / CRT Terminal / High-Trust Security.

## 🛠 Feature Specification (Executive Game Director)

> **[MARKET SNIPER] Specification**
> * **User Story:** As a Day Trader, I want to time my sell orders perfectly so that I can maximize my profit and earn INK Cash.
> * **Competitor Benchmark:** Models after hyper-casual timing games (like *Timberborn's* tree falling or various "perfect hit" mobile games) and the high-tension of the *Robinhood* price chart.
> * **Core Logic:** 
>     - **Level Flow:** 10 successful "snipes" to win the round.
>     - **The Chart:** A green line moves vertically on a volatile path.
>     - **The Profit Zone:** A horizontal green highlighted area at the 85%-95% height of the chart.
>     - **Difficulty:** The line's vertical speed increases by 15% with each successful level.
>     - **Loss Condition:** 3 missed snipes (tapping when not in zone) = Game Over.
>     - **Reward:** 3 INK Cash (successfully credited to `useGameStore`).
> * **The "Whale vs. Minnow" Split:**
>     - *Minnow (Free):* Standard play. 3 lives.
>     - *Whale (Paid):* Future implementation for "Stop-Loss" (extra life) items.
> * **The "Juice" (Directives for Interface Architect):**
>     - *Visual:* Neon green CRT aesthetic. "SELL" button should glow intensely when the line enters the Profit Zone. Add a screen-shake on miss.
>     - *Audio:* A rhythmic "Heartbeat" SFX that increases in tempo as the line moves faster. "Cha-ching" on success. Low-frequency buzz on miss.
>     - *Haptic:* Short "success" tap on hit, heavy "double-thud" on miss.
> * **Required Assets List:** 
>     - `LineChart` Component (Lucide `TrendingUp` for icon).
>     - `Heartbeat.mp3`, `Success_Chime.wav`, `Error_Buzz.mp3`.
> * **KPI Impact:** Increase in Session Length and Daily Active User (DAU) retention.

## ✅ Acceptance Criteria
- [x] New `MarketSniper` component created and integrated into `ArcadeDrawer.tsx`.
- [x] Game starts with a "Prepare to Trade" countdown.
- [x] Chart line moves with increasing speed based on current level (1-10).
- [x] Tapping "SELL" correctly detects if the line is in the "Profit Zone".
- [x] 3-Life system implemented with visual heart/life icons.
- [x] 10-Level progression with a final "Payout" sequence (Confetti + Balance Update).
- [x] Balance update is persisted via `useGameStore` (add `addInkCash` if not present).
- [x] Mobile-responsive layout (Portrait mode).
- [x] **Audit (2026-02-14):** Implemented "Immediate Input" (`onPointerDown`) to fix mobile latency. Added "Tap Line" debug visuals and moving target zones.

## 🚀 Implementation Steps
1. **Scaffold Component:** Create `world-of-influence/components/modals/MarketSniper.tsx`.
2. **State Management:** Implement game state (level, lives, speed, line position, isPlaying).
3. **The Chart Engine:** Use `requestAnimationFrame` for a smooth 60fps chart line movement.
4. **Collision Detection:** Implement the logic to check if `currentPosition` is within `targetRange`.
5. **Juice & SFX:** Add the animations, heartbeat sound, and screen-shake.
6. **Integration:** Hook the component into the `ArcadeDrawer` list.
7. **Refinement:** Implement dynamic zone sizing and "Immediate Input" protocol.

## 🎨 Design Notes
- Use the project's **Growth Green** (#00C805).
- Monospaced font for the "Profit" and "Level" counters.
- Background should be a dark "Slate" (#1F2937) with a subtle grid overlay.
