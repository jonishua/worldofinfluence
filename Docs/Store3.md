# Module Specification: Store Architecture v2.0

**Version:** 2.0 (Major Refactor & Tab Reorganization)
**Context:** Replaces previous Store specs.
**Objective:** Reorganize the store into three distinct financial sectors ("Exchange", "Capital", "Services").
**Core UX Requirement:** **Vertical Scrollability.** All tab containers must support `overflow-y: scroll` with proper bottom-padding to ensure items behind the navigation bar are accessible.

---

## 1. Global Layout & Navigation

### 1.1 The Tab Bar (Top Navigation)
To handle the density of items, we split the store into three focused tabs.

1.  **"Exchange"** (Default): Currency conversion (USD -> Bucks), Ad Rewards, and "Service Banners" (Upsells).
2.  **"Capital"** (Assets): Hard assets. Landmark Crates (Gacha), Zoning Permits, City Keys.
3.  **"Services"** (Subscriptions): Recurring memberships and utility passes.

### 1.2 The Scroll Container
* **Component:** `ScrollableSurface`
* **Behavior:**
    * Fixed Header (Balance display stays pinned to top).
    * Scrollable Body.
    * **Safe Area:** Add `padding-bottom: 120px` to all lists to prevent the last item from being hidden behind the main game navigation dock.
* **Scrollbar:** Hidden (Clean UI).

---

## 2. Tab 1: "The Exchange" (Currencies & Upsells)

*Design Philosophy: The Trading Floor. Fast, transactional, clean.*

### 2.1 The "Opportunity" Banners (New)
Instead of cluttering the page with subscription details, we use high-gloss "Ad Banners" that link to the **Services** tab.

* **Layout:** Horizontal Carousel (Swipeable) or Stacked Banner at the top.
* **Banner A (Targeting Walkers):**
    * *Visual:* A radar sweeping a map.
    * *Text:* "Double Your Acquisition Radius."
    * *CTA:* "Upgrade GPS ->" (Links to Services).
* **Banner B (Targeting Minnows):**
    * *Visual:* A shield blocking ads.
    * *Text:* "Bypass Corporate Sponsors. 5x Boosts Daily."
    * *CTA:* "Get License ->" (Links to Services).

### 2.2 Currency Bundles (Vertical Scroll List)
* **Item:** **"Sponsor Briefing"** (Watch Ad).
    * *Reward:* +5 Bucks.
    * *Visual:* Play Button inside a secure folder.
* **Item:** **"Entry Position"** (100 Bucks / $4.99).
* **Item:** **"Seed Round"** (220 Bucks / $9.99).
* **Item:** **"Series A"** (1,200 Bucks / $49.99).
* **Item:** **"IPO Allocation"** (2,500 Bucks / $99.99).

---

## 3. Tab 2: "Capital" (The Asset Warehouse)

*Design Philosophy: The Warehouse. This is where the "Archives" (Crates) now live. Heavy industrial/blueprint aesthetic.*

### 3.1 The Architectural Archives (Gacha Crates)
*Context:* The loot boxes for Landmarks.
* **Design:** Displayed as large, industrial shipping crates on a metal shelf.
* **Tier 1: "Logistics Crate"** (50 Bucks) - *Wood/Stamps.*
* **Tier 2: "Blueprint Tube"** (150 Bucks) - *Steel/Drafting.*
* **Tier 3: "Executive Vault"** (500 Bucks) - *Gold/Digital Lock.*

### 3.2 Municipal Assets
* **City Keys:** Uses the `CurrentLocationCard`.
    * *Visual:* Golden Key in velvet box.
    * *Text:* "Unlock [City Name] Market."
* **Zoning Permits:**
    * *Single Filing* ($1.99).
    * *Developer Pack* ($4.99).

---

## 4. Tab 3: "Services" (Subscriptions)

*Design Philosophy: "The Black Card." Dark mode aesthetic, gold text, premium schematics. This replaces the old "Archives" look with a high-end "Membership" vibe.*

### 4.1 Subscription Logic (The Stack)
**CRITICAL:** Higher tiers *automatically* inherit the perks of lower tiers.

### 4.2 The Tier List (Scrollable Stack)

#### **Level 1: "The Explorer's Pass"**
* **Visual Style:** "Technical Schematic." A blueprint of a radar dish on a dark grid background.
* **Cost:** $4.99 / mo.
* **Feature Focus:** **Logistics.**
* **Perks List:**
    * [Icon: Radar] **2x Interaction Radius** (50m -> 100m).
    * [Icon: Satellite] **Precision GPS** (Reduced drift).

#### **Level 2: "The Day Trader's License"**
* **Visual Style:** "HFT Terminal." Neon blue line graphs on dark glass.
* **Cost:** $9.99 / mo.
* **Feature Focus:** **Efficiency.**
* **Perks List:**
    * **INCLUDES:** All Explorer Pass features (2x Radius).
    * [Icon: Lightning] **5x Ad-Free Boosts** per day.
    * [Icon: Moon] **8-Hour Escrow** (Extended sleep income).

#### **Level 3: "The Insider's Club"**
* **Visual Style:** "The Black Card." Matte black texture with gold foil stamped text.
* **Gate:** User must own **5 Parcels** to view details.
* **Cost:** $49.99 / mo.
* **Feature Focus:** **Yield & Status.**
* **Perks List:**
    * **INCLUDES:** Explorer Pass + Day Trader License features.
    * [Icon: Crown] **Daily Dividend:** 90 Bucks/Day ($27 value/mo).
    * [Icon: TrendingUp] **Compound Streaks:** Bonus Bucks at Day 14, 30, 60.
    * [Icon: Star] **Verified Status:** Gold name in feed.

---

## 5. Technical Implementation (Data & State)

### 5.1 Updated Subscription Model
```typescript
interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  visualTheme: 'BLUEPRINT' | 'TERMINAL' | 'BLACK_CARD';
  features: string[];
  inheritedFeatures: string[]; // List features from lower tiers for UI clarity
}

const SERVICE_TIERS: SubscriptionTier[] = [
  {
    id: 'explorer',
    name: "Explorer's Pass",
    price: 4.99,
    visualTheme: 'BLUEPRINT',
    features: ['2x Map Radius', 'Priority GPS'],
    inheritedFeatures: []
  },
  {
    id: 'trader',
    name: "Day Trader's License",
    price: 9.99,
    visualTheme: 'TERMINAL',
    features: ['5x Ad-Free Boosts', '8-Hour Escrow'],
    inheritedFeatures: ['2x Map Radius'] // Visual aid: "Includes Explorer Perks"
  },
  {
    id: 'insider',
    name: "The Insider's Club",
    price: 49.99,
    visualTheme: 'BLACK_CARD',
    features: ['90 Bucks Daily', 'Streak Bonuses', 'Gold Status'],
    inheritedFeatures: ['2x Map Radius', '5x Ad-Free Boosts', '8-Hour Escrow']
  }
];