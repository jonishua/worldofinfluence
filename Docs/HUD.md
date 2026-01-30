# TASK: UI Theming Engine & Home Screen Prototype

**Role:** Senior Frontend UX Engineer
**Goal:** Create a "Theme Switcher" prototype for the "World of Influence" PWA. This allows the Product Director to toggle between 5 distinct visual styles to finalize the art direction.

## 1. The Requirement
We need to overlay a high-fidelity HUD (Heads Up Display) on top of the Leaflet map. We also need a temporary floating control panel that changes the CSS variables and Map Filter styles instantly.

## 2. The 5 Themes (CSS Variables)

Implement a state manager (Zustand or React Context) to handle `currentTheme`. Define these 5 presets:

### Theme 1: "Bank Vault" (Primary / MVP Target)
- **Map Filter:** `grayscale(100%) contrast(1.2)` (Removes all color from map tiles)
- **Bg Color:** `#F3F4F6` (Light Grey)
- **Card Bg:** `#FFFFFF` (Pure White)
- **Text Primary:** `#1F2937` (Slate 800)
- **Accent Color:** `#00C805` (Growth Green - Robinhood style)
- **Font:** Sans-serif for UI, Monospace for numbers.
- **Border Radius:** `8px` (Professional)

### Theme 2: "Dark Pool" (Night Mode)
- **Map Filter:** `invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)` (Dark Map)
- **Bg Color:** `#111827` (Gray 900)
- **Card Bg:** `#1F2937` (Gray 800)
- **Text Primary:** `#F9FAFB` (Gray 50)
- **Accent Color:** `#39FF14` (Neon Green)
- **Border Radius:** `4px` (Tech/Sharp)

### Theme 3: "Paper Map" (Soft/Airbnb)
- **Map Filter:** `sepia(20%) brightness(105%)` (Warm tone)
- **Bg Color:** `#FAF9F6` (Off-white)
- **Card Bg:** `rgba(255, 255, 255, 0.8)` (Glassmorphism with backdrop-blur)
- **Text Primary:** `#4B5563` (Gray 600)
- **Accent Color:** `#3B82F6` (Calm Blue)
- **Border Radius:** `16px` (Friendly/Round)

### Theme 4: "Black Card" (Luxury)
- **Map Filter:** `grayscale(100%) brightness(50%)` (Dark Grey)
- **Bg Color:** `#000000`
- **Card Bg:** `#1A1A1A`
- **Text Primary:** `#FFFFFF`
- **Accent Color:** `#D4AF37` (Metallic Gold)
- **Border:** `1px solid #D4AF37`

### Theme 5: "Gamer" (The Control Group)
- **Map Filter:** `none` (Default OpenStreetMap colors)
- **Bg Color:** `#FFFFFF`
- **Card Bg:** `#FFFBEB` (Light Yellow)
- **Text Primary:** `#000000`
- **Accent Color:** `#F59E0B` (Orange)
- **Buttons:** 3D bevel effect (border-bottom: 4px solid darkorange)

## 3. Components to Scaffold
Don't just build the themes; build the UI components to demonstrate them.

1.  **Top Navigation (The Wallet):**
    * Display "Net Worth" in large text.
    * Display "Daily Yield" in smaller text (+percentage).
    * Must use Monospace font for numbers.
2.  **Bottom Navigation:**
    * 3 Icons: Map (Center), Shop (Left), Wallet (Right).
    * Use `lucide-react` icons.
3.  **The "Theme Switcher" (Dev Tool):**
    * A small, fixed panel in the top-right corner.
    * 5 Buttons labeled with the Theme names.
    * Clicking a button instantly updates Tailwind config/CSS variables and the Leaflet TileLayer CSS filter.

## 4. Implementation Details
- **Map Integration:** Apply the CSS filters directly to the `.leaflet-tile-pane` class based on the selected theme.
- **Typography:** Import `Roboto Mono` from Google Fonts for the financial data.
- **Tailwind:** Use the `style` prop or a dynamic class wrapper to inject the theme colors into Tailwind's arbitrary value system (e.g., `bg-[var(--card-bg)]`).

## 5. Output
A functional prototype where I can walk around the map (using the existing Leaflet setup) and click the buttons to see how the "Trust Signals" change with the visual style.