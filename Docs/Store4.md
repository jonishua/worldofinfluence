# Module Update: Jurisdictional Asset Array

**Version:** 2.1 (Key UI Refactor)
**Context:** Updates the "Keys" section within the `Capital` Tab.
**Objective:** Replace the single vertical Key card with a 3-column horizontal grid (`GeoKeyRow`).
**Design Philosophy:** "The Asset Chip." These should look like high-value trading cards or secure keycards found in a safety deposit box.

---

## 1. UI Layout: The "Jurisdiction" Row

* **Placement:** Inside `Capital` Tab, replacing the previous "City Key Acquisition" block.
* **Header:** "MUNICIPAL RIGHTS" (Tiny Label, Slate Color).
* **Container Style:**
    * `display: grid`
    * `grid-template-columns: 1fr 1fr 1fr` (Three equal columns).
    * `gap: 8px` (Tight spacing to fit on mobile).

---

## 2. The Three Modules (Horizontal Cards)

The system automatically detects the user's location and offers keys for the three primary administrative levels.

### Module A: The Municipal Key (City Level)
* **Target:** The user's current City (e.g., "Austin").
* **Visual Tone:** **Bronze / Local Bond.**
* **Card Layout:**
    * *Top:* Icon (Small 3D Key - Bronze finish).
    * *Middle:* **"AUSTIN"** (Bold, Condensed, Uppercase).
    * *Subtext:* "City Rights".
    * *Bottom:* **200 IB** (Pill Button).
* **Logic:** `ReverseGeocode.City`.

### Module B: The Provincial Key (State Level)
* **Target:** The user's current State (e.g., "Texas").
* **Visual Tone:** **Silver / State Treasury.**
* **Card Layout:**
    * *Top:* Icon (Small 3D Key - Silver finish).
    * *Middle:* **"TEXAS"** (Bold, Condensed, Uppercase).
    * *Subtext:* "State Charter".
    * *Bottom:* **200 IB** (Pill Button).
* **Logic:** `ReverseGeocode.State`.

### Module C: The Federal Key (Country Level)
* **Target:** The user's current Country (e.g., "USA").
* **Visual Tone:** **Gold / National Reserve.**
* **Card Layout:**
    * *Top:* Icon (Small 3D Key - Gold finish).
    * *Middle:* **"USA"** (Bold, Condensed, Uppercase).
    * *Subtext:* "Federal Access".
    * *Bottom:* **200 IB** (Pill Button).
* **Logic:** `ReverseGeocode.Country`.

---

## 3. Technical Implementation (Frontend)

### 3.1 Component Structure
```tsx
// The Container
<div className="w-full flex flex-col gap-2">
  <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">
    Municipal Rights
  </span>
  
  <div className="grid grid-cols-3 gap-2 h-40">
    {/* City */}
    <KeyAssetCard 
      tier="MUNICIPAL" 
      label={currentLocation.city} // "Austin"
      subLabel="City Rights"
      price={200}
      visualClass="bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300"
    />

    {/* State */}
    <KeyAssetCard 
      tier="PROVINCIAL" 
      label={currentLocation.state} // "Texas"
      subLabel="State Charter"
      price={200}
      visualClass="bg-gradient-to-br from-slate-200 to-slate-300 border-slate-400"
    />

    {/* Country */}
    <KeyAssetCard 
      tier="FEDERAL" 
      label={currentLocation.country} // "USA"
      subLabel="Federal Access"
      price={200}
      visualClass="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
    />
  </div>
</div>

3.2 Dynamic Text Sizing
Constraint: Some city names are long (e.g., "San Francisco").

Solution: The KeyAssetCard must use text-overflow: ellipsis or auto-scaling text logic.

Rule: If characters > 8, drop font size from text-lg to text-sm.

3.3 Status States
Locked: Button shows Price ("200 IB").

Owned:

Card Background: Darkens to "Growth Green" gradient.

Icon: Changes to "Checkmark."

Button: Disabled text "OWNED".

4. Assets Needed
Icons: 3 variations of the Key icon (Bronze, Silver, Gold).

Haptics: Tapping a specific key should trigger a sharp, metallic "click" sound, distinctly different from buying land.