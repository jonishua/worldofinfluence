# **MVP Feature Specification: World of Influence**

Version: 1.9 (MVP \- Visual Boost Juice)  
Theme: "The World is Your Portfolio"

## **1\. The Interactive Map ("The Board")**

*The map is the primary interface. It must feel like a high-end navigation tool (Waze/Uber), not a chaotic video game.***1.1 Real-World Geolocation**

* **Description:** The game renders a 1:1 map of the user's real-world location using GPS data.  
* **Visual Style:** "Waze Grey/White." Clean, minimal streets. Buildings are extruded 3D white blocks with soft shadows.  
* **Grid System:** The world is divided into **10m x 10m** interactive square grids.  
* **Map Scope:**  
  * **Base Drop Radius:** **50 meters** (This is the distance from the player's avatar in which Supply Drops can be interacted with or are visible). This equals a 5-grid-square range.  
  * **View Radius:** **500 meters** (This is the visible area for unowned land, other players, and City Key locations).  
* **Unowned Land:** Faint grey grid lines.  
* **Owned Land:** Bright, solid colored squares.  
* **My Land:** Highlighted in "Growth Green" (\\\#00C805) to signify active assets.  
* **The Avatar:** The user's representation on the map.  
* **Director's Note:** In MVP, keep customization simple. The Avatar floats above the map, reinforcing the "Mayor" status for high-level players.

### **1.2 "Supply Drops" (The Loot Box)**

* **Mechanism:** Users physically walk to find **"Supply Drops"** (Asset Cases) spawned procedurally on the map.  
* **Supply Drop Frequency & Density:**  
  * **Spawn Rule:** Every **4 hours**, **4-6 drops** are generated within the user’s active **Drop Radius** (50 meters).  
  * **The Inventory:** The map also holds a large reserve pool of drops in the broader **View Radius** (500 meters) to incentivize users to explore and walk *beyond* their immediate neighborhood.  
* **The Radius Upgrade (Whale Sink):**  
  * **The Perk:** Users can permanently upgrade their **Drop Radius** to **100 meters** (2x the base).  
  * **Cost:** **2000 Influence Bucks** (20 Land Plots' worth).  
    * $4.99 month  
    * $39.99 Annual  
    * Part of the Explorers Pass (We can rename this to fit our theme)   
    * Invite 2 friends and have them do X (Something meaningful in the game. Purchase 5 plots?)  
  * **Psychology:** This is a high-cost, high-value **Quality-of-Life** improvement that rewards our high-spending "Whales" by making their walking time more efficient, reducing friction, and increasing drop collection per session.  
* **Interaction:**  
  * **Trigger:** "Entering Range" haptic buzz.  
  * **Action:** Tap and hold to "Open Case" (Animation of a lock breaking or a briefcase opening). It should have some sort of haptic feedback and shake as you hold the button to open the briefcase and then it burst open to reveal its contents)  
* **Variable Reward (The Hook):** unlike simple points, the drop is a "Loot Box" containing one of the following:  
  * **Common (60%):** **Credits** (small bundle).  
  * **Rare (25%):** **Credits** (medium bundle).  
  * **Epic (10%):** **INK Cash** (small bundle).  
  * **Legendary (5%):** **"Zoning Permit"** (1–2 permits).  
* **Supply Drop Tier Colors (Map Markers):**  
  * **Grey** = Common drop  
  * **Blue** = Rare drop  
  * **Purple** = Epic drop  
  * **Orange/Gold** = Legendary drop (with glow)  
* **Psychology:** This replaces the predictable "Work" of walking with the exciting **"Gambling" of opening mystery boxes**, ensuring the "Action $\\rightarrow$ Variable Reward" step of the Hook Model is compelling.

## **2\. Land Acquisition Engine ("The Asset")**

*Buying land is the core "Investment" phase. It must feel weighty and permanent, like signing a deed.*

### **2.1 Purchasing Logic**

* **Cost:** 100 **Influence Bucks** per Parcel.  
* **The "Minting" Flow (Security Theater):**  
  * When a user buys a plot, do **not** instantly award it.  
  * **Animation:** Play a 3-stage sequence: "Verifying GPS Coordinates..." $\\rightarrow$ "Securing Digital Deed..." $\\rightarrow$ "Minting Asset...".  
  * **Why:** Friction implies security. It makes the digital asset feel "real" and recorded on a ledger.

### **2.2 Rarity Reveal (The Gacha)**

* **The Gamble:** Every plot bought is a mystery until purchased. The rarity is determined by a weighted RNG.  
* **Rarity Tiers & Drop Rates**:  
  * **Common (50%):** Standard rent ($0.0000001111/sec).  
    * **Visual:** **Landscaping** (Well-kept lawn, flower beds). *Clean, empty potential.*  
  * **Rare (30%):** 1.5x Rent.  
    * **Visual:** **Utility/Commercial** (Solar Panels, Billboards). *Productive assets.*  
  * **Epic (15%):** 2.0x Rent.  
    * **Visual:** **Residential** (Modern House, Brownstone). *High value property.*  
  * **Legendary (5%):** 4.0x Rent.  
    * **Visual:** **Monument** (Golden Statue, Fountain). *Pure Status.*  
* **The "Jackpot" Moment:** If a Legendary plot is found, broadcast a ticker message to all users: "User X just found a Monument in Austin\!".
* **Reveal Juice (Current MVP):**
  * **Epic:** Confetti burst on reveal.
  * **Legendary:** Confetti burst + continuous top-down confetti rain while the reveal panel is open; stops when the panel closes.
  * **Presentation:** Reveal happens inside the slide-up panel with a flip + glow treatment to maintain the bank-vault tone.

### **2.3 Parcel Upgrades & Visual Customization (Asset Management)**

* **Concept:** Unlike *Atlas Earth* where buildings are fixed, "World of Influence" allows for dynamic city planning. Users can upgrade the economic output of a plot and unlock visual assets (Landmarks) that can be moved and rearranged. This turns the map into a dynamic canvas for player expression.  
* **The "Renovation" Cost:**  
  * **Upgrade Requirement:** 1 **"Zoning Permit"** \+ 250 **Influence Bucks**.  
  * **Effect:** Upgrades a parcel to the next Rarity Tier (increasing Rent) AND unlocks a **"Landmark"** of that tier for your inventory.  
* **The Landmark Inventory (Visual Assets):**  
  * **System:** Unlocked buildings are not permanently glued to the ground. They are added to a "Landmark Inventory" and can be placed on any owned land.  
  * **Asset Classes:**  
    * **Common (Tier 1 \- Landscaping):** Well-kept Lawn, Flower Bed, Community Garden, Gravel Path. *Vibe: Clean, empty potential.*  
    * **Rare (Tier 2 \- Utility & Commercial):** **Solar Panel Array**, Food Stand, Billboard, EV Charging Station. *Vibe: Productive assets.*  
    * **Epic (Tier 3 \- Residential):** Modern House, Luxury Cabin, Brownstone, Pool House. *Vibe: Ownership & Comfort.*  
    * **Legendary (Tier 4 \- Monument & Prestige):** Golden Bull Statue, Large Fountain, Helipad, Holographic Spire. *Vibe: Pure Status.*  
* **City Planning (Edit Mode):**  
  * **Move & Rotate:** Users can enter "Edit Mode" to pick up, move, and rotate Landmarks across their contiguous territory.  
  * **Strategic Decorating:** This allows users to group assets logically (e.g., creating a "Solar Farm" on the south side of their property or placing their "Golden Bull" at the front gate) rather than having a chaotic mix of buildings fixed to where they rolled the RNG.  
* **Visibility:** These assets are persistent and visible to ALL players on the map. A user walking by your house will see your curated estate, signaling you are a thoughtful "Mayor."

## **3\. The Economy Engine ("The Yield")**

*This is the "Fintech" layer. The UI here mimics Robinhood/Acorns to build trust.*

### **3.1 Rent Accumulation**

* **Formula:**$$Rent\_{Total} \= \\sum (BaseRate \\times RarityMultiplier) \\times BoostMultiplier$$  
* **Currency:** Rent payouts accrue as **INK Cash** (this is the yield currency).  
* **Visual \- The Odometer:** The balance display uses a monospaced font (Roboto Mono). The cents must animate/roll up like a gas pump to show constant "Flow".  
* **Color Logic:**  
  * **Income:** Always "Growth Green" (\#00C805).  
  * **Spending:** "Neutral Slate" or "Calm Blue" (\#3B82F6). Never use Red for spending; spending is "investing".

### **3.2 The Ad Boost (Revenue Driver)**

* **Concept:** Users exchange attention (Ads) for efficiency (Rent Multiplier).  
* **The Transaction:** Watch 1 video ad (30s) $\\rightarrow$ Receive 30x Rent Multiplier for 1 Hour.  
* **Visual "Juice" (Active State):** When the boost is active, the interface transforms to signal "High Voltage" earnings.  
  * **The "Power Grid" Effect:** Instead of a simple color change (like Atlas Earth), the borders of all user-owned land pulse with a slow, rhythmic "Neon Green" glow (\#39FF14).  
  * **Floating Particles:** Tiny "+$" symbols float upwards from the user's plots like digital steam.  
  * **The Speedometer:** The rent counter accelerates visually. The "cents" column spins faster, blurring slightly to emphasize the speed of income.  
  * **Audio:** A subtle, low-frequency hum (like a server room or high-voltage line) plays in the background, reinforcing the idea that the "Money Machine" is turned on.  
* **Stacking:** Users can stack up to 6 hours. This allows them to "set and forget," respecting their time while guaranteeing our impressions.  
* **Inflation Control:** As users own more land, the multiplier drops (e.g., 151+ parcels drops to 20x). This ensures the economy remains solvent.

## **4\. Inflation Control: The "Tiered Cliff"**

**CRITICAL:** As a user buys more land, maintaining a 30x boost becomes mathematically impossible (we would pay out more than the ad generates).

To solve this, we implement **Dynamic Boost Tiers**. As parcel ownership increases, the Ad Boost multiplier decreases.

| Parcel Count | Ad Boost Multiplier | Logic |
| :---- | :---- | :---- |
| **0 \- 150** | **30x** | High incentive for new users (The "Hook"). |
| **151 \- 220** | **20x** | Soft cap. Payout remains sustainable. |
| **221 \- 290** | **15x** |  |
| **291 \- 365** | **12x** |  |
| **366 \- 435** | **10x** |  |
| **436 \- 545** | **8x** |  |
| **546 \- 625** | **7x** |  |
| **626 \- 730** | **6x** |  |
| **731 \- 875** | **5x** |  |
| **876 \- 1100** | **4x** |  |
| **1101 \- 1500** | **3x** |  |
| **1501+** | **2x** | Whale Tier. Volume makes up for low multiplier. |

*Note: The user is never "punished" for buying more land. The total absolute dollars earned per day always increases, even as the multiplier drops.*

### **3.4 The Income Detail View (Tap-to-Expand)**

When a user taps the "Accrued Income" counter at the top of the map, a detailed breakdown modal slides up. This transparency builds trust and highlights the value of their investments.

* **Structure:**  
  * **Current Rate:** Displays the total rent being earned *per second* (e.g., "$0.000045/sec").  
  * **Source Breakdown (The "Receipt"):**  
    * **Base Rent:** Total form all owned parcels.  
    * **Boost Bonus:** \+3000% (or current active multiplier) \- *Highlighted in Neon Green*.  
    * **Badge Bonus:** \+15% (from City Keys).  
    * **Mayor Royalties:** Income from City Key kickbacks or Treasury (if applicable).  
  * **Projection Graph:** A small, upward-trending line graph showing estimated earnings for the next 24 hours if the Boost is maintained.  
  * **"Reinvest Now" Button:** A prominent CTA to convert the *current accrued balance* directly into **INK Cash** (25 INK per $1.00) with a "20% Bonus" tag, encouraging immediate recycling of funds rather than withdrawal.

### **3.5 The Escrow System ("The Catch")**

To force daily retention without sacrificing the satisfaction of "watching the numbers go up," we separate income into "Pending" and "Secured" states.

* **Mechanism:**  
  * All rent generated flows into a **"Pending Escrow"** tank, not the main Wallet.  
  * The Escrow tank has a **Time Limit** (Default: 4 Hours).  
  * If the tank fills up (i.e., user hasn't logged in for \>4 hours), rent generation **PAUSES**.  
* **The "Continuous Growth" Visual (Important):**  
  * The Odometer at the top of the screen *still* ticks up continuously in real-time, preserving the dopamine loop.  
  * **Visual Cue:** The text color changes based on Escrow fullness:  
    * **0-75% Full:** Growth Green (\#00C805).  
    * **75-90% Full:** Amber (\#F59E0B) \- Warning.  
    * **100% Full:** Red (\#EF4444) \- **RENT PAUSED**.  
* **The "Settle Funds" Action:**  
  * To move money from Pending $\\rightarrow$ Wallet (Secured), the user must tap the **"Settle"** button.  
  * **Animation:** A satisfying "cash counter" sound plays, the Pending Odometer resets to $0.0000000 (and immediately starts ticking up again), and the Main Wallet balance increases.  
* **Upgrades (Monetization Sink):**  
  * Users can spend INK Cash to upgrade their Escrow Duration.  
  * **Level 1:** 4 Hours  
  * **Level 2:** 8 Hours  
  * **Level 3:** 12 Hours  
  * **Level 4:** 24 Hours

## **4\. Social & Status ("The Meta")**

*We use social friction to drive engagement. Users perform for an audience.*

### **4.1 The Feed (Ticker)**

* **Display:** A scrolling stock-ticker at the bottom of the map screen.  
* **Content:** Real-time updates of economic activity. "User AustinKing bought 5 plots in Downtown".  
* **Psychology:** Social Proof. It shows the economy is alive and other people are spending money.

### **4.2 Mayor & Governance (The Political Meta-Game)**

*We use a tiered status system to create a political meta-game, rewarding investment and driving competition across all levels of play.*

* **Stratified Governance Tiers & Perks:**

| Title Tier | Requirement (Status) | Economic Perk (Reward) |
| ----- | ----- | ----- |
| **President** | Highest Total Land Income in the **Country**. | Receives **1%** of all **City Key** purchase revenue in their country. |
| **Governor** | Highest Total Land Income in the **State**. | Receives **2%** of all **City Key** purchase revenue in their state. |
| **Mayor** | Highest Total Land Income in the **City**. | Receives **10%** of the **City Treasury** (Game-generated INK Cash) **AND** **5%** of all **City Key** purchase revenue in their city. |
| **Vice Mayor** | **Second** Highest Total Land Income in the City. | **Guaranteed Daily Payout:** Receives **10 INK Cash** from the City Treasury daily (Game-generated). *Psychology: Anti-friction reward for second place, driving continued effort.* |
| **Ambassador** | Top 5% of players in the City by **Number of Plots Owned**. | **Permanent Perk:** \+1% permanent boost to their Rent Multiplier. *Psychology: Rewards sunk cost and long-term Minnow engagement.* |

* **Leaderboards:** Ranked by **Parcels Owned** per City, State, and Country.  
* **Officeholders Hub:** Mayor/Governor/President are displayed inside the Leaderboards slide-up under an **Officeholders** tab (not always-on map HUD) to reduce HUD clutter while maintaining status aspiration.  
* **Implementation Note (MVP):** Governance **economic perks are not yet wired**; only status/leaderboards UI is surfaced. Hook up revenue shares and treasury payouts in a later economy pass.

### **4.3 The "City Key" System (Travel & Exploration)**

* **Concept:** Users can purchase a digital **"City Key"** for the city, state, or country they are currently physically located in. This is a high-status collectible item that proves they have "unlocked" that region.  
* **Atlas Earth Mapping:** This feature is a direct evolution of **Passport Badges** in Atlas Earth.  
* **Atlas Earth:** Users buy **Badges** to level up their Passport (e.g., Level 1 = +5% Boost).  
* **World of Influence:** We use the same math and progression tiers, but upgrade visuals from stickers to **3D Gold Keys** to fit the fintech theme.  

* **Granularity (The Collection):**  
  * Keys map to every available administrative level: **Neighborhood/District**, **City**, **County**, **State**, **Country**.  
  * Example (Downtown Austin):  
    * "Downtown Austin Key" (Neighborhood/District).  
    * "Austin Key" (City).  
    * "Travis County Key" (County).  
    * "Texas Key" (State).  
    * "USA Key" (Country).  

* **Cost:** 200 **INK Cash** per Key. (Keys are a major currency sink).  

* **The Benefit (Permanent Boost):** Holding multiple Keys permanently increases the user's Rent Boost multiplier.  
  * **Tier 1 (1 Key):** \+5% Boost to Rent.  
  * **Tier 2 (10 Keys):** \+10% Boost to Rent.  
  * **Tier 3 (20 Keys):** \+15% Boost to Rent.  
  * **Tier 4 (50 Keys):** \+20% Boost to Rent.  
  * **Tier 5 (100 Keys):** \+25% Boost to Rent.  

* **The "Royalty" Twist (Improvement over Atlas Earth):**  
  * When a user buys a Key (e.g., "Key to Austin, TX"), the current **Mayor of Austin** receives a **20 INK Cash** kickback.  
  * **Why:** This makes becoming Mayor of a tourist destination (like Las Vegas or Orlando) incredibly valuable, driving intense competition for land in those specific areas.  

* **Visuals:** A 3D, rotating golden key with the City's name etched into the handle. The collection screen looks like a velvet-lined key cabinet.

## **5\. Wallet & Monetization ("The Bank")**

*The bridge between the game loop and real money.*

### **5.1 Cash Out**

* **Threshold:** Minimum $5.00 USD withdrawal.  
* **Trust Signal:** The "Receipt Screen." Show a Transaction ID, Date, and "Estimated Arrival" message (e.g., "Processing Transfer") rather than generic success messages.  
* **Re-Invest Option:** Offer a 20% discount if users convert Rent ($1.00) directly into **INK Cash** (25 INK Cash) instead of withdrawing. This keeps liquidity in the app.

### **5.2 The Asset Exchange (Shop)**

*The shop must look and feel like a curated investment portfolio interface, not a chaotic e-commerce store. Every purchase should feel like an investment, not a transaction.*

* **Architecture:** The Asset Exchange is organized into three specialized tabs:
    1. **Exchange:** High-frequency currency bundles and "Market Opportunity" banners linking to advanced services.
    2. **Capital:** Core growth assets including Architectural Gacha (Landmarks), Zoning Permits, and Municipal Rights.
    3. **Services:** Tiered institutional memberships (subscriptions) providing utility perks.

* **Inventory & Asset Classes:**  
  * **Influence Bucks (IAP Bundles):** Sold in various bundles for Real USD (e.g., $4.99 for 100 Influence Bucks).  
    * *Psychology: The primary on-ramp for "Whales" to scale their empire quickly and buy land parcels.*  
  * **Jurisdictional Rights (Keys):** Purchasable via the **Jurisdiction Grid** in the Capital tab. Tiers are Municipal (Bronze), Provincial (Silver), and Federal (Gold). Acquisition follows the **ICON -> NAME -> PRICE** hierarchy.
    * *Cost:* 200 **INK Cash** per Key.
    * *Psychology: High-status collectibles that provide permanent, tiered boosts to overall Rent Multiplier.*
  * **Institutional Licenses (Subscriptions):** 
    * **Explorer's Pass ($4.99/mo):** 2x Map Radius, Priority GPS.
    * **Day Trader's License ($9.99/mo):** 5x Ad-Free Boosts, 8-Hour Escrow (Inherits Explorer perks).
    * **Insider's Club ($49.99/mo):** 90 IB Daily, Gold Status (Inherits all perks). *Requires ownership of 5 parcels.*
  * **Zoning Permits:** Rare items sold in strictly limited bundles.  
    * *Psychology: Allows "Whales" to bypass progression blockers.*  
  * **Cosmetic Assets:** Specific skins (e.g., "Cyberpunk", "Victorian") for plots can be purchased with **Influence Bucks**.  
    * *Psychology: Pure Status sink that encourages self-expression and visible display of wealth for other players.*  
  * **Merchant Program:** Users link a real-world credit card. Spending at partners (Starbucks, etc.) earns **INK Cash** per dollar spent.  
    * *Psychology: This connects the game economy to the real world, providing a "Found Money" feel like Acorns.*

## **6\. Retention Systems ("The Glue")**

### **6.1 Daily Login Streak**

* **Trigger:** Users must log in every 24 hours to "refresh" their bank connection.  
* **Loss Aversion:** If they fail to login, rent accumulation drops by 50% (Decay).  
* **Reward:** 7-Day Streak grants a "Golden Credit" (Guaranteed 50 **INK Cash**).

### **6.2 Push Notifications**

* **The "Rent Check":** "Your properties earned $0.45 while you slept. Collect it now." (9:00 AM).  
* **The "Trespasser":** "@User123 is visiting your Downtown plot. Check in now\!" (Social Pressure).

## **7\. Currency & Mini-Game Ecosystem**

*This section clarifies the separation of resources and the core **Game Loop**. We have four distinct resources to manage the economy, player investment, and session length.***7.1 Currency Definitions**

1. ### **INK Cash (The Rent/Payout Currency):**

   * **Function:** The earned, real-money-equivalent currency. This is the **Yield** from properties that a user can withdraw (**Cash Out**) or re-invest at a discount.  
   * **Source:** Exclusively accumulated from Land Rent and found *rarely* in Supply Drops.  
   * **Psychology:** This is the ultimate status signifier, representing actual financial growth.

2. ### **Influence Bucks (The Asset Currency):**

   * **Function:** The primary high-value currency used to buy **Land Plots** and **Cosmetic Assets**. This is our version of "Atlas Bucks."  
   * **Equivalency:** 100 Influence Bucks \= 1 Land Plot.  
   * **Source:** **Purchased in Shop** (IAP), won in Mini-Games, or received from re-investing **INK Cash** (at the 20% bonus rate).  
   * **Psychology:** This is the essential currency sink and the direct path for Whales to scale their empire quickly.

3. ### **Credits (The Action Currency):**

   * **Function:** Low-value "Ammo" used to play Mini-Games, specifically the **Neon Slots**.  
   * **Source:** Found commonly in **Supply Drops** (Walking is the primary source) or earned via daily streaks.  
   * **Logic:** Credits cannot buy land directly; they must be "laundered" through the Mini-Game for a chance to win **Influence Bucks** or **Zoning Permits**.

4. ### **Zoning Permits (The Upgrade Currency):**

   * **Function:** The gatekeeping resource used to upgrade the **Rarity Tier** of existing parcels (e.g., Common $\\rightarrow$ Rare).  
   * **Source:** Very Rare find in **Supply Drops** (Loot Box) or as a jackpot win in the **Neon Slots** Mini-Game.  
   * **Psychology:** A powerful **progression blocker** that drives users back to the map to find Supply Drops.

## **7.4 Skill-Based Mini-Games (New)**

These games reward player skill and reaction time, catering to players who dislike pure RNG.

1. **"Market Sniper" (Reaction/Timing)**  
   * Concept: A volatile stock chart line moves rapidly up and down the screen. A horizontal green zone ("The Profit Zone") is fixed at the peak.  
   * Action: The player must tap "SELL" exactly when the line intersects the Profit Zone.  
   * Difficulty: The line moves faster with each successful tap. Miss 3 times and you lose.  
   * Reward: 3 INK Cash for clearing 10 levels.  
2. **"Vault Cracker" (Precision)**  
   * Concept: A rotating dial spins around a circular safe lock.  
   * Action: Tap exactly when the spinner overlaps the glowing "Tumbler". You must hit 5 tumblers in a row to open the safe.  
   * Difficulty: The spinner changes direction and speed after every tap.  
   * Reward: 5 Credits (Refund \+ Bonus) or 1 INK Cash.  
3. **"Asset Audit" (Speed/Sorting)**  
   * Concept: A "Tinder-style" card sorting game. Financial items fly onto the screen.  
   * Action: Swipe RIGHT on Assets (Gold bars, Cash stacks, Deeds). Swipe LEFT on Liabilities (Red arrows, Tax bills, Broken piggy banks).  
   * Difficulty: You have 30 seconds to sort as many as possible. Speed increases over time.  
   * Reward: Score-based payout of INK Cash.  
4. **"Insider Trading" (Memory/Pattern Recognition)**  
   * Concept: A "Memory Match" style game. A grid of face-down cards hides various Company Logos or Stock Tickers (e.g., matching "Bull" with "Bull", "Bear" with "Bear").  
   * Action: Flip two cards to find a match.  
   * Difficulty: The grid size increases (4x4 $\\rightarrow$ 6x6). You have a limited number of "Trades" (moves) to clear the board.  
   * Reward: Clearing the board under the move limit grants Credits or INK Cash.

## 

## **7.2 The Terminal (Mini-Game)**

*Unlike the passive "Spin Wheel" of competitors, this is an active sink for Credits that converts walking effort into gambling excitement.*

* **The Machine:** A classic 3-reel slot machine interface with a clean, bank-vault aesthetic.  
* **Cost:** 1 Credit per Spin (supports 1x, 5x, and 10x multipliers).
* **The Payout Table:**

| Result | Reward | Psychology |
| ----- | ----- | ----- |
| **Jackpot (7-7-7)** | **50 Influence Bucks** (Half a plot) | Massive Variable Reward / Dopamine Hit. |
| **Lucky Win (3 Blueprints)** | **1 Zoning Permit** | Solves a progression blocker. |
| **High Win (3 Diamonds)** | **15 Influence Bucks** | Strong mid-tier reward. |
| **Mid Win (3 Bars)** | **5 Influence Bucks** | Keeps the loop active. |
| **Low Win (Cherries)** | **1 Influence Buck** | Anti-friction, ensures most spins are not a 'Miss'. |
| **Miss** | **0** | Loss Aversion. |

* **Psychology:** This creates the secondary, active loop: **Walk** $\\rightarrow$ **Find Supply Drop (Credits)** $\\rightarrow$ **Spin Slots** $\\rightarrow$ **Win Influence Bucks/Permits** $\\rightarrow$ **Buy/Upgrade Land.**

### **Director's Summary: The "Secret Sauce"**

We are building a **Skinner Box** painted like a **Hedge Fund**.

* **Atlas Earth** succeeds because it pays real money.  
* **We will succeed** because we make that payment process feel like a high-status financial activity, not a grinding chore.

## **8\. "The Insider's Club" (Subscription Model)**

A monthly subscription service targeting power users ("Whales") who want to accelerate their portfolio growth. This replaces the "Atlas Explorer Club" model with our Fintech branding.

* **Cost:** $49.99 / Month.  
* **Requirement:** Users must own at least 5 parcels of land to unlock the ability to subscribe (prevents bot farming).

### **8.1 The "Dividend" Daily Login Bonus**

Unlike free users who get small rewards, Club members get a separate, high-value Daily Login Calendar.

* **Daily Drip:** 90 **INK Cash** per day (Value: $0.90).  
* **Streak Bonuses (The "Dividend"):**  
  * **Day 14:** \+250 INK Cash Bonus.  
  * **Day 30:** \+600 INK Cash Bonus.  
  * **Day 60:** \+1200 INK Cash Bonus.  
  * **Day 90:** \+1 **Zoning Permit** (Rare Item).  
* **Total Monthly Value:** \~3,500 INK Cash (\~35 Plots of Land).  
  * *Comparison:* Buying 3,500 INK Cash in the shop costs \~\\ $140.00. The subscription offers \~3x value but requires daily engagement.

### **8.2 Utility Perks (Making it Better)**

In addition to currency, Club members receive game-breaking utility perks that save time and reduce friction.

1. **"Drone Collection" (2x Radius):**  
   * *Benefit:* Increases the interaction radius for Supply Drops from 40m to **80m**.  
   * *Why:* Allows players to collect drops from their couch or office chair without needing to physically walk across the street.  
2. **"Auto-Settle" (Escrow Upgrade):**  
   * *Benefit:* The Escrow timer is **removed**. Rent generates 24/7 without pausing, even if the user doesn't log in.  
   * *Why:* The ultimate "Passive Income" fantasy.  
3. **"Priority Minting" (Visual Status):**  
   * *Benefit:* When buying land, the purchase animation is upgraded to a "Black Card" aesthetic (Gold/Black particles).  
   * *Why:* Ego and status.

## **8\. Subscription Ecosystem (Battle Pass Model)**

We offer two distinct subscription tiers: one for the casual player ("Minnow") focused on gameplay, and one for the power user ("Whale") focused on empire growth. **Crucially, claiming subscription rewards requires active financial participation (spending money/currency) to ensure the economy remains balanced.**

### **8.1 The "Insider's Club" (Whale Tier)**

A premium subscription for power users who want maximum asset growth and prestige.

* **Cost:** $49.99 / Month.  
* **Requirement:** Users must own at least 5 parcels of land to unlock.

**The "Dividend" Daily Login Bonus:**

* **Daily Drip:** 90 **INK Cash** per day (Value: $0.90).  
* **The "Empire Expansion" Requirement:**  
  * Unlike the daily drip, the massive **Streak Bonuses** (Day 14, 30, etc.) are NOT automatic.  
  * **Condition:** To unlock the Day 30 Bonus (+600 INK), the user must have **acquired at least 5 New Parcels** during that 30-day window.  
  * **Why:** This ensures Whales are actively expanding the map and burning currency, preventing them from just hoarding cash passively.  
* **Streak Bonuses:**  
  * **Day 14:** \+250 INK Cash Bonus.  
  * **Day 30:** \+600 INK Cash Bonus (Requires \+5 Parcels acquired).  
  * **Day 60:** \+1200 INK Cash Bonus (Requires \+10 Parcels acquired).  
  * **Day 90:** \+1 **Zoning Permit** (Rare Item).

**Utility Perks:**

1. **"Drone Collection":** 2x Supply Drop radius (80m).  
2. **"Auto-Settle":** Escrow timer removed (24/7 Passive Income).  
3. **"Priority Minting":** Black/Gold particle effects on purchase.

   ### **8.2 The "Investor's Pass" (Minnow Tier)**

A mass-market "Battle Pass" designed for active players who enjoy the mini-games and want to remove friction.

* **Cost:** $9.99 / Month.  
* **Requirement:** None. Available immediately.

**The "Active Trader" Task System:**

* Instead of a passive login bonus, users must complete **Daily Financial Tasks** to claim their rewards.  
* **Daily Tasks (Reward: 10 Credits):**  
  * *Collect 3 Supply Drops.*  
  * *Spin the Slots 5 times.*  
  * *Settle Escrow Funds once.*  
* **The "Asset Acquisition" Streak (Weekly Bonus):**  
  * **Reward:** \+25 **INK Cash** every 7 days.  
  * **Condition:** User must have purchased at least **1 Parcel** (or spent equivalent in Shop) during the week to unlock the bonus.  
  * **Why:** This trains "Minnows" to become spenders. It forces them to convert their activity into assets, locking them into the ecosystem.

**Utility Perks:**

1. **"Ad-Free Boost":** Activate the 30x Rent Boost without watching a video ad (Limit: 3 times/day).  
2. **"Extended Escrow":** Increases Escrow timer from 4 hours to **8 hours** (Sleep through the night without losing rent).

