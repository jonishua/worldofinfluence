# Module Specification: The Terminal (Mini-Game)

**Status:** COMPLETED (2026-01-29)
**Renamed from:** Neon Slots
**Context:** "World of Influence" Mobile Application
**Objective:** A 3-reel slot machine interface that converts low-value "Credits" (Ammo) into high-value "Influence Bucks" (Assets) or "Zoning Permits" (Upgrades).
**Design Philosophy:** "The Bank Vault." This should not look like a cartoon casino. It should look like a high-frequency trading terminal or a cryptographic decryption sequence.

---

## 1. Core Logic & Economy

### 1.1 Currency Flow
* **Input Cost:** 1 Credit per Spin.
    * *Validation:* Check `UserWallet.credits >= 1`.
    * *Deduction:* Immediate deduction upon "Spin" button press.
* **Output Rewards:**
    * [cite_start]**Influence Bucks (IB):** The primary asset currency[cite: 53].
    * **Zoning Permits (ZP):** The rare upgrade currency.
    * **Credits:** Small refunds to reduce friction.

### 1.2 Probability Table (The RNG)
*Reference: MVP Feature Specification Section 7.2*

The RNG logic must determine the outcome *before* the animation starts. The visual reels are merely "playing back" the predetermined result.

| Result Class | Reel Combination | Reward | Probability Weight (0-1000) |
| :--- | :--- | :--- | :--- |
| **Jackpot** | [777] - [777] - [777] | **50 Influence Bucks** | 5 (0.5%) |
| **Lucky Win** | [Permit] - [Permit] - [Permit] | **1 Zoning Permit** | 10 (1.0%) |
| **High Win** | [Diamond] - [Diamond] - [Diamond] | **15 Influence Bucks** | 50 (5.0%) |
| **Mid Win** | [Bar] - [Bar] - [Bar] | **5 Influence Bucks** | 150 (15.0%) |
| **Low Win** | [Coin] - [Coin] - [Coin] | **1 Influence Buck** | 300 (30.0%) |
| **Miss** | Any Mismatched Combo | **0** | 485 (48.5%) |

* **Near Miss Logic (Critical for Retention):**
    * If the result is a **Miss**, generate a 20% chance to force the first two reels to match a High Value symbol (e.g., [777] - [777] - [Coin]).
    * *Psychology:* This creates "Loss Aversion" tension.

---

## 2. UI/UX & Visual Guidelines

### 2.1 Color Palette
[cite_start]*Strict adherence to "Fintech Trust Signals"[cite: 76, 77, 81].*

* **Background:** Deep Slate / Gunmetal Gradient. `linear-gradient(180deg, #1F2937 0%, #111827 100%)`.
* **Reel Container:** "Glassmorphism" effect. Semi-transparent white/slate with a thin 1px border.
* **Win State (Growth):** `#00C805` (Robinhood Green). Used for text, particles, and reel highlights.
* **Spin Button:** Primary Action Button. `#00C805` with a subtle inner glow.
* **Reel Symbols:**
    * **777:** Neon Gold outlines.
    * **Permit:** Holographic Blue blueprint scroll.
    * **Diamond:** Geometric white/cyan wireframe.
    * **Bar:** Stacked Gold Bullion.
    * **Coin:** Simple Silver/Slate coin with the game logo.

### 2.2 Typography
* [cite_start]**Balance Display:** Monospace font (Roboto Mono / SF Mono)[cite: 88].
    * *Why:* Keeps numbers aligned and prevents jumping.
* **Messages:** System Sans-Serif (Inter / SF Pro). Clean, legible.

### 2.3 Layout Structure
1.  **Header:** "THE TERMINAL" (centered). Balance: "CREDITS: [X]" (Monospace).
2.  **The Machine (Center):**
    * Three vertical columns (Reels).
    * A horizontal "Payline" indicator (Neon Green Line, opacity 0.5).
    * Overlay: A "Glass" reflection layer to simulate a screen.
3.  **The Controls (Bottom):**
    * **Spin Button:** Large, circular or pill-shaped. Text: "EXECUTE TRADE" or "SPIN (1 Credit)".
    * **Auto-Spin:** Toggle switch (small).

---

## 3. Animation & Haptics ("The Juice")

### 3.1 Reel Physics
* **Duration:** 2.5 seconds total.
* **Stagger:**
    * Reel 1 stops at 1.5s.
    * Reel 2 stops at 2.0s.
    * Reel 3 stops at 2.5s.
* **Easing:** `cubic-bezier(0.15, 0.85, 0.35, 1.0)` (Fast start, bouncy stop).
* **Blur:** Apply a vertical motion blur (`filter: blur(0px 8px)`) while spinning.

### 3.2 Near Miss Tension
* If Reel 1 and Reel 2 match a Jackpot symbol:
    * Extend Reel 3 spin time by 1.0s.
    * Slow down Reel 3 visual speed slightly to show symbols passing by.
    * **Haptic:** Continuous low-frequency vibration while Reel 3 is "deciding."

### 3.3 Win Celebration
* **Low/Mid Win:**
    * Reels flash Green (`#00C805`).
    * Haptic: Short, sharp "Success" tap.
* **High/Jackpot Win:**
    * Screen Shake: Small magnitude, high frequency.
    * **Confetti:** Green "$" particles explode from the center.
    * **Odometer:** The win amount rolls up in the center screen overlay.

---

## 4. Technical Implementation Steps (Frontend)

### Step 1: Data Structures
Define the Symbol Enum and Asset Map.
```typescript
type SymbolType = 'SEVEN' | 'PERMIT' | 'DIAMOND' | 'BAR' | 'COIN';

interface SlotSymbol {
  id: SymbolType;
  assetUrl: string; // Path to SVG/PNG
  value: number;    // Base value for sorting
}

const REEL_STRIP: SymbolType[] = [
  'COIN', 'BAR', 'COIN', 'DIAMOND', 'COIN', 'SEVEN', 'PERMIT', 'COIN', 'BAR'
  // Populate with weighted distribution for visual variety
];