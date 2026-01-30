# Module Specification: "The Asset Exchange" (Store)

**Version:** 1.0 (MVP Prototype - Mock IAP)
**Context:** "World of Influence" Mobile Application
**Objective:** A high-trust, simulated marketplace where users convert Real USD into "Influence Bucks" (Game Currency) and purchase strategic assets.
**Design Philosophy:** "The Investment Portfolio."
* **Anti-Pattern:** Do *not* make this look like a video game shop or e-commerce cart. No "Sales!" stickers.
* **Pro-Pattern:** Make it look like buying stocks or bonds. [cite_start]Use "Capital," "Equity," and "Acquisition" terminology[cite: 105, 121].

---

## 1. Core Architecture & Logic

### 1.1 The "Mock" Transaction Flow (Simulated IAP)
Since this is a prototype, we must simulate the *feeling* of a native iOS/Android purchase without processing real cards. [cite_start]We lean heavily on "Security Theater" to build trust[cite: 95].

**The Flow:**
1.  **Trigger:** User taps a Price Button (e.g., "$4.99").
2.  **System Modal:** Open a custom modal that mimics the native OS payment sheet (clean, bottom-sheet style).
3.  **Loading State (Friction):** Show a spinner with text: "Contacting Secure Gateway..." (Duration: 1.5s).
4.  **Success State (The Juice):**
    * [cite_start]**Animation:** A "Verified" Checkmark draws itself green[cite: 116].
    * **Haptic:** A heavy "Double Thud" (Success vibration).
    * **Confetti:** "Growth Green" confetti bursts from behind the modal.
    * [cite_start]**Feedback:** Toast message: "Capital Acquired. Portfolio Updated."[cite: 101].

### 1.2 Inventory & Pricing (SKUs)
*Reference: MVP Feature Specification Section 5.2*

**Category A: Capital Injection (Influence Bucks)**
*Used to buy Land (100 Bucks = 1 Plot).*
* [cite_start]**Starter Bundle:** 100 Bucks - $4.99 (Label: "Entry Position")[cite: 55].
* **Growth Bundle:** 220 Bucks - $9.99 (Label: "Seed Round" - *10% Bonus*).
* **Empire Bundle:** 1,200 Bucks - $49.99 (Label: "Series A" - *20% Bonus*).
* **Whale Bundle:** 2,500 Bucks - $99.99 (Label: "IPO Allocation" - *25% Bonus*).

**Category B: Strategic Assets**
* **City Key:** 200 INK Cash (or equivalent USD). *Description: "Unlock permanent rent multiplier for this region."*.
* **Zoning Permit:** Limited availability. *Description: "Authorization to upgrade land rarity."*.

**Category C: Subscriptions**
* **"The Insider's Club":** $49.99/mo.
    * *Visuals:* Black/Gold card aesthetic. "Exclusive daily dividends.".

---

## 2. UI/UX Visual Guidelines

### 2.1 Color Palette & Typography
* **Background:** Clean White (`#FFFFFF`) or very light Slate (`#F8FAFC`) to differentiate from the "Dark Mode" map. [cite_start]This signals "Administration" mode[cite: 79].
* [cite_start]**Primary Action (Buy):** "Growth Green" (`#00C805`) Pill buttons[cite: 77].
* **Text:** Dark Slate (`#1F2937`) for readability. [cite_start]**Monospace** for all pricing and currency values[cite: 88].
* **Icons:** Thin, rounded strokes (Lucide style). [cite_start]Use a "Building" or "Document" icon for buying land currency, *never* a shopping cart[cite: 121].

### 2.2 Layout Structure
**Header:**
* **Title:** "Exchange" or "Marketplace".
* **Balance:** Display current "Influence Bucks" in large Monospace font (e.g., `IB 4,250`).
* [cite_start]**Micro-Graph:** A small sparkline next to the balance trending up[cite: 92].

**Section 1: Special Offers (The Hook)**
* *Design:* A horizontal scrolling carousel of "Cards."
* *Content:* "Starter Pack" (5 Plots + 2x Boost).
* [cite_start]*Visual:* High-gloss 3D render of a land plot with a "Limited Time" tag (in Signal Orange `#F59E0B`)[cite: 83].

**Section 2: Currency Bundles (Vertical List)**
* *Design:* List items looking like Stock Tickers.
* *Left:* Icon (Stack of bills/coins).
* *Center:* "100 Influence Bucks" (Bold) + "Base Capital" (Subtext).
* *Right:* "$4.99" (Green Button).

**Section 3: Merchant Rewards (Found Money)**
* *Design:* "Link Card" banner. [cite_start]"Earn Bucks at Starbucks, Uber, etc."[cite: 58].
* *Visual:* Logos of partners in grayscale, turning color when tapped.

---

## 3. Technical Implementation (Frontend)

### 3.1 Data Model
```typescript
interface StoreProduct {
  id: string;
  type: 'CURRENCY' | 'ASSET' | 'SUBSCRIPTION';
  name: string;
  financialLabel: string; // e.g. "Series A Funding"
  amount: number;         // Amount of Bucks received
  bonusPercent?: number;  // Visual "20% Bonus" tag
  price: number;          // USD
  visualAsset: string;    // Path to 3D/Icon
}

const PRODUCTS: StoreProduct[] = [
  {
    id: 'starter_01',
    type: 'CURRENCY',
    name: '100 Influence Bucks',
    financialLabel: 'Entry Position',
    amount: 100,
    price: 4.99,
    visualAsset: '/assets/store/stack_small.png'
  },
  // ... others
];