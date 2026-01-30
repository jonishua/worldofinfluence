# Project Structure for "World of Influence" (Next.js PWA)

/src
  /app
    layout.tsx       # Main layout (handles viewport meta for mobile to prevent zooming)
    page.tsx         # The Game View (Map + HUD overlay)
    /wallet          # The "Bank" view (separate route for performance)
    /shop            # The "Investment Portfolio" view
  /components
    /map
      GameMap.tsx    # Core Mapbox wrapper
      [cite_start]GridLayer.tsx  # The 10m x 10m overlay logic [cite: 65]
      [cite_start]PlayerMarker.tsx # The user's avatar (floating) [cite: 74]
      [cite_start]SupplyDrop.tsx # 3D/2D markers for loot [cite: 76]
    /hud
      [cite_start]BalanceTicker.tsx # The "Odometer" money counter [cite: 20]
      BottomNav.tsx     # Quick access (Shop, Map, Wallet)
      [cite_start]TickerFeed.tsx    # Social proof scrolling text [cite: 47]
    /ui
      # [cite_start]"Fintech Trust" Components [cite: 6]
      TrustButton.tsx   # No cartoony bounce
      GlassCard.tsx     # Modern background panels
      [cite_start]StatSparkline.tsx # Mini graphs for assets [cite: 26]
  /lib
    /economy
      [cite_start]calculations.ts # Rent formulas & Boost logic [cite: 141]
    /constants
      [cite_start]theme.ts        # Color palette (Growth Green, Slate) [cite: 11, 14]
    /mapbox
      [cite_start]styles.ts       # "Waze Grey" map style definitions [cite: 64]
  /store
    useUserStore.ts   # Zustand: Balance, Inventory, XP
    useMapStore.ts    # Zustand: Current Location, Loaded Grids
  /types
    game.ts           # TS Interfaces for Parcel, Drop, User