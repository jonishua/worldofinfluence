# Module Update: Store Expansion v1.1

**Version:** 1.1 (Feature Additions)
**Context:** Expands `Store_Marketplace_Spec.md`
**Objective:** Implement high-value asset sinks (Keys, Permits), subscription models, ad-supported currency, and a "Landmark Gacha" system.
**Tone:** Maintain "Institutional Finance" aesthetic. Even loot boxes must look like "Asset Acquisitions," not slot machines.

---

## 1. New Section: "Municipal Assets" (Keys & Permits)

*Placement: Insert below "Capital Injection" (Currency Bundles).*

### 1.1 Zoning Permits (Upgrade Materials)
*Context:* Items required to upgrade land rarity.
* **Design Pattern:** Do not show them as "Power-ups." Display them as official government documents with wax seals.
* **Inventory (SKUs):**
    1.  **"Single Filing"**: 1 Permit - **$1.99** (or equivalent Bucks).
    2.  **"Developer Pack"**: 3 Permits - **$4.99** (Tag: *Popular*).
    3.  **"City Planner Bundle"**: 10 Permits - **$14.99** (Tag: *Best Value*).

### 1.2 City Keys (Location-Based Collectibles)
*Context:* Replaces "Badges." Users buy the key for their *current* geolocation.
* **Logic:** Detect user's current city (Reverse Geocode).
* **UI Component:** `CurrentLocationCard`.
    * **Visual:** A 3D rotating Golden Key inside a velvet box.
    * **Text:** "Acquire Key to: **[City Name], [State]**".
    * **Cost:** **200 INK Cash** (or 200 Bucks).
    * **Benefit:** "Unlock Tiered Rent Boosts."

---

## 2. New Section: "The Architectural Archives" (Landmark Gacha)

*Context:* Users purchase "Blind Boxes" containing 3D structures (Landmarks) to place on their map.
* **Tone:** "Blueprints" and "Secure Transport Crates," not "Treasure Chests."

### 2.1 The Tiers (SKUs)
* **Tier 1: "Standard Logistics Crate"**
    * **Cost:** 50 Bucks.
    * **Contents:** Common/Rare Assets (Trees, Hedges, Streetlights).
    * **Visual:** Wooden crate with shipping stamps.
* **Tier 2: "Commercial Blueprint Tube"**
    * **Cost:** 150 Bucks.
    * **Contents:** Rare/Epic Assets (Billboards, Solar Arrays, Food Stands).
    * **Visual:** Metallic drafting tube.
* **Tier 3: "Executive Vault"**
    * **Cost:** 500 Bucks.
    * **Contents:** Epic/Legendary Assets (Statues, Helipads, Holograms).
    * **Visual:** Reinforced steel safe with a digital keypad.

### 2.2 Unboxing Animation ("The Reveal")
* **Trigger:** Tap Purchase -> "Authenticating Transaction..."
* **Animation:** The crate/safe appears in center screen.
    * *Tier 1:* Lid pries open with a crowbar sound.
    * *Tier 2:* Tube unscrews with a hollow metallic sound.
    * *Tier 3:* Keypad beeps, heavy bolts retract, door swings open.
* **Result:** The 3D Asset floats out on a rotating pedestal. Confetti if Legendary.

---

## 3. New Section: "The Explorer's Pass" (Subscription)

*Context:* Radius increase service.
* **Placement:** High-visibility banner or dedicated tab.

### 3.1 Subscription Card UI
* **Title:** "Explorer's Pass".
* **Icon:** Radar/Sonar Dish.
* **Value Prop:** "Expand Supply Drop Radius: **50m -> 100m**".
* **Pricing Tiers:**
    * **Monthly:** **$4.99 / mo** (Billed monthly).
    * **Annual:** **$39.99 / yr** (Save 33%).
* **Visual Logic:** Use a "Gold/Black" premium color scheme (The Insider's Club aesthetic) to distinguish from one-time purchases.

---

## 4. New Section: "Subsidized Capital" (Ads & Partners)

*Context:* Free currency methods for "Minnows".

### 4.1 Ad-Supported Grant
* **UI:** A card labeled "Sponsor Grant."
* **Action:** "Watch Briefing" (Play Video Icon).
* **Reward:** **+5 Influence Bucks**.
* **Cooldown:** 20 Minutes (Visual timer counts down if active).

### 4.2 Partner Programs (Offerwall)
* **Header:** "External Yield Opportunities".
* **List Items:**
    1.  **"Market Research"** (Surveys): "Complete surveys to earn Bucks."
    2.  **"Partner Games"** (Play-to-Earn): "Test partner apps for dividends."
* **Interaction:** Tapping opens a web-view or external SDK (e.g., Tapjoy/Pollfish placeholder).

---

## 5. Technical Implementation (Data Model Updates)

### 5.1 Updated Product Interface
```typescript
type ProductType = 
  | 'CURRENCY' 
  | 'PERMIT' 
  | 'KEY' 
  | 'GACHA' 
  | 'SUBSCRIPTION' 
  | 'AD_REWARD';

interface StoreProduct {
  id: string;
  type: ProductType;
  name: string;
  cost: { amount: number; currency: 'USD' | 'BUCKS' | 'INK' };
  metadata?: {
    cityId?: string;       // For Keys
    gachaTier?: 1 | 2 | 3; // For Landmarks
    subPeriod?: 'MO' | 'YR'; // For Subscription
  };
}

const NEW_INVENTORY: StoreProduct[] = [
  // Zoning Permits
  { id: 'permit_01', type: 'PERMIT', name: 'Single Filing', cost: { amount: 1.99, currency: 'USD' } },
  { id: 'permit_03', type: 'PERMIT', name: 'Developer Pack', cost: { amount: 4.99, currency: 'USD' } },
  
  // Subscription
  { 
    id: 'sub_radius_mo', 
    type: 'SUBSCRIPTION', 
    name: 'Explorer Pass (Monthly)', 
    cost: { amount: 4.99, currency: 'USD' },
    metadata: { subPeriod: 'MO' }
  },

  // Gacha
  { 
    id: 'gacha_t1', 
    type: 'GACHA', 
    name: 'Standard Logistics Crate', 
    cost: { amount: 50, currency: 'BUCKS' }, 
    metadata: { gachaTier: 1 } 
  },

  // Ad Grant
  {
    id: 'ad_grant_01',
    type: 'AD_REWARD',
    name: 'Sponsor Grant',
    cost: { amount: 0, currency: 'USD' } // "Cost" is time
  }
];