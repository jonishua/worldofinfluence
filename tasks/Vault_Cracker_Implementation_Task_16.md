# Vault Cracker - Implementation Task 16

## 🎯 Goal
Implement the **Vault Cracker** mini-game in the Arcade. This game is a high-precision rotation/timing challenge where players must align rotating tumblers to "crack" a high-security vault for significant rewards.

## 📖 Context
Vault Cracker is the second skill-based game in our arcade. It focuses on circular precision and "near-miss" tension. Players must stop a rotating dial exactly on specific target points.

- **Location:** `world-of-influence/components/modals/VaultCracker.tsx` (to be created)
- **Entry Point:** Added to `ArcadeDrawer.tsx`.
- **Theme:** High-End Security / Precision Engineering / Bank Vault.

## 🛠 Feature Specification (Executive Game Director)

> **[VAULT CRACKER] Specification**
> * **User Story:** As a professional safe-cracker, I want to time my dial stops perfectly so that I can unlock the vault and claim the Influence Bucks and Zoning Permits inside.
> * **Competitor Benchmark:** Models after the lock-picking mechanics in *Skyrim* or *Fallout*, combined with the clean, minimalist circular timing games like *Pop the Lock*.
> * **Core Logic:** 
>     - **The Safe:** 3 concentric tumblers (Outer, Middle, Inner).
>     - **The Challenge:** Each tumbler rotates at a different speed. The player must press "LOCK" when the tumbler's indicator aligns with the target pin.
>     - **Progression:** Successfully locking the Outer tumbler moves you to the Middle, then the Inner.
>     - **Difficulty:** Tumbler rotation speed increases as you move inward. Rotation direction may reverse between levels.
>     - **Immediate Input Standard:** MUST use `onPointerDown` for the "LOCK" action to ensure zero-latency response.
>     - **Loss Condition:** 2 missed alignments = Alarm triggered (Game Over).
>     - **Reward:** Scaled based on complexity. Successful crack rewards 25 Influence Bucks + 1 Zoning Permit (successfully credited to `useGameStore`).
> * **The "Whale vs. Minnow" Split:**
>     - *Minnow (Free):* Standard play. 2 lives. Standard dial speed.
>     - *Whale (Paid):* Future "Stethoscope" item to slow down rotation or "Grease" item to increase the target pin size.
> * **The "Juice" (Directives for Interface Architect):**
>     - *Visual:* Brushed steel textures, rotating shadows, and laser-precise target lines. 
>     - *Positive Feedback Overlay:* On successful lock, flash text: "CLINK!", "SECURE!", "ENGAGED!". On final crack, a "Vault Door Swing" animation with internal light spill.
>     - *Audio:* Rhythmic "Tick-Tick-Tick" as the dial rotates. A heavy metallic "THUD" on successful lock. A loud "BUZZ" on miss.
>     - *Haptic:* Light tick vibration on every 5 degrees of rotation. Strong, single thud on success. Heavy double-thud on miss.
> * **Required Assets List:** 
>     - Concentric Ring SVG Component.
>     - `Lock_Thud.wav`, `Dial_Tick.mp3`, `Alarm_Siren.mp3`.
> * **KPI Impact:** High Session Depth; increases "Sunk Cost" engagement (players don't want to fail on the 3rd ring).

## ✅ Acceptance Criteria
- [ ] New `VaultCracker` component created and integrated into `ArcadeDrawer.tsx`.
- [ ] 3-Tumbler system (Outer, Middle, Inner) with independent rotation logic.
- [ ] "LOCK" action uses `onPointerDown` and checks `tumblerAngle` against `targetAngle`.
- [ ] Target pin position changes randomly for each ring.
- [ ] Visual feedback for hits (Locking animation) and misses (Screen shake).
- [ ] Positive feedback text overlays ("CLINK!", etc.) on successful locks.
- [ ] Final reward sequence (Vault opening animation + Balance Update).
- [ ] Responsive UI optimized for both portrait and landscape (iPad/Desktop).

## 🚀 Implementation Steps
1. **Scaffold Component:** Create `world-of-influence/components/modals/VaultCracker.tsx`.
2. **Dial Engine:** Build a circular rotation system using `requestAnimationFrame`.
3. **Collision Logic:** Calculate angular distance between dial indicator and target pin.
4. **State Machine:** Implement levels (Outer -> Middle -> Inner) and life management.
5. **Animation & Juice:** Add ring-locking transitions and feedback text.
6. **Integration:** Enable in `ArcadeDrawer` and `page.tsx`.
