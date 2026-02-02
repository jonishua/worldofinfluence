# Task: Theme Consistency — Day / Dusk / Night Mode & UI Polish

## Context
The UI Prototype at `/prototype` has established a consolidated visual language across **Day (Light)**, **Dusk (Gray)**, and **Night (Dark)** modes. The live game currently uses a legacy theme system (`bank-vault`, `dark-pool`, etc.) with inconsistent application: many components use hardcoded `slate-*` and `white` colors instead of CSS variables. This creates visual inconsistency and prevents proper theme switching.

**User Story:** As a player, I want to choose between Day, Dusk, and Night modes via a Settings button so that I can tailor the experience to my environment and preference.

---

## Aligned Plan (Master Architect + Executive Game Director + Interface Architect)

### 1. Theme System Simplification
- **Collapse** the current 5-theme system to **3 modes** aligned with the prototype:
  - **Day Mode** (default) — Light, clean, Bank Vault aesthetic. White/slate surfaces, Growth Green accents.
  - **Dusk Mode** — Gray medium. Slate-600/500 palette (`--gray-bg`, `--gray-surface`). The "Waze Grey" feel.
  - **Night Mode** — Dark vault. Deep slate backgrounds, neon accents.
- **Update** `lib/theme.ts`:
  - Replace `ThemeId` with `"day" | "dusk" | "night"`.
  - Define full `cssVars` for each mode (mirror prototype token sets).
  - Persist selection to `localStorage` (key: `woi-theme`) and hydrate on load.
- **Remove** `prefers-color-scheme` override in `globals.css` — theme is user-driven, not system-driven.

### 2. Settings Affordance
- **Add** a Settings (gear) icon to the HUD — placement: TopNav right slot (currently empty) or as a subtle pill next to the profile/auth area.
- **Settings flow:** Tap Settings → Slide-up panel with:
  - **Appearance** section: "Day / Dusk / Night" toggle (3 buttons or segmented control).
  - Optional future: Sound, Notifications (stubs only; do not implement logic).
- **Use** the prototype's `PrototypeButton` / segmented-control styling for theme options.
- **Close** via standard slide-up close affordance.

### 3. CSS Variable Audit
- **Extend** `globals.css` and `theme.ts` so every theme defines:
  - `--bg-color`, `--card-bg`, `--text-primary`, `--text-muted`, `--accent-color`, `--card-border`, `--radius`
  - For Dusk/Night: `--gray-bg`, `--gray-surface`, `--gray-border`, `--gray-text`, `--gray-text-muted` (or equivalent semantic names)
  - `--map-filter` for each mode (Day: grayscale; Dusk: muted; Night: invert/brightness)
- **Reference:** `app/prototype/page.tsx` and `globals.css` for token values.

### 4. Component Sweep (Theme Variable Migration)
Replace hardcoded Tailwind color classes with CSS variable references. **Scope:** All files under `components/`.

| Component / Area | Current Issue | Action |
|------------------|---------------|--------|
| **TopNav** | `bg-slate-800`, `border-slate-700`, `text-white` | Use `var(--card-bg)`, `var(--card-border)`, `var(--text-primary)` |
| **BottomNav** | Mixed slate, white, dark | Full variable migration |
| **SplitLedger** | Hardcoded slate/gray | Variable-based surfaces and text |
| **BalanceTicker** | Hardcoded | Use `var(--text-primary)`, `var(--accent-color)` |
| **BucksPill, CreditsPill, WalletPill** | `bg-white`, `border-slate-*` | `var(--card-bg)`, `var(--card-border)` |
| **LeaderboardPanel, LeaderboardWidget** | Slate hardcoding | Variable migration |
| **SatelliteOverlay, SatelliteWidget, SatelliteSearchBar** | Mixed dark/light | Theme-aware variables |
| **DeploymentSlider** | Hardcoded | Variable migration |
| **Modals:** PurchaseModal, ShopModal, SupplyDropModal, TerminalModal, MayorDashboard, PlayerProfileModal, AuthModal, IncomeDetailModal | Slate/white hardcoding | Full variable migration; ensure slide-up styling uses `var(--card-bg)` |
| **PropertySheet** | Hardcoded | Variable migration |
| **GameMap** (overlays only; tile filter via `--map-filter`) | Ensure map filter respects theme | Already uses `--map-filter`; verify ThemeProvider applies it |
| **slots/** (Reel, SlotSymbol) | Minor hardcoding | Variable migration for backgrounds/borders |

**Pattern:** Prefer `bg-[var(--card-bg)]`, `text-[var(--text-primary)]`, `border-[var(--card-border)]`, etc. Use theme-specific vars where needed (e.g. Dusk uses `--gray-surface`).

### 5. Polish Pass (Bank Vault Aesthetic)
- **Containers:** Enforce `rounded-[14px]` to `rounded-[20px]` per `UI_PATTERNS.md`.
- **Borders:** Standardize on `var(--card-border)` or theme-specific border vars.
- **Blur:** Apply `backdrop-blur-xl` to HUD floating elements (TopNav pills, SplitLedger, BottomNav dock) for premium fintech feel.
- **Shadows:** Use `shadow-xl` or `shadow-[0_-10px_40px_rgba(0,0,0,0.15)]` for slide-ups.
- **Currency:** Ensure all `$` / INK / Bucks use `font-mono` and `tabular-nums` (verify, don’t break).

### 6. ThemeProvider Integration
- **Verify** `ThemeProvider` wraps the app (`page.tsx` — already does).
- **Ensure** ThemeProvider applies `--map-filter` so map tiles respond to Day/Dusk/Night.
- **Remove** or refactor `ThemeSwitcher` — it will be replaced by the Settings slide-up. If ThemeSwitcher is used elsewhere (e.g. cheat menu), either inline a minimal switcher in Settings or keep it in cheat-only context with updated theme IDs.

---

## Definition of Done (Master Architect)
- [ ] All three themes (Day, Dusk, Night) render correctly across the game.
- [ ] Settings slide-up opens from HUD, allows theme change, persists to localStorage.
- [ ] No hardcoded `bg-slate-*`, `text-slate-*`, `border-slate-*`, `bg-white` (or equivalent) in theme-sensitive components — use CSS vars.
- [ ] Map filter updates when theme changes.
- [ ] Lints pass; no console errors.
- [ ] Build succeeds.

---

## Success Criteria (Executive Game Director)
- Day Mode feels clean, secure, and "Bank Vault" — the default for trust.
- Dusk Mode feels like a comfortable middle ground (e.g. evening play).
- Night Mode feels immersive and premium (Uber/Waze reference).
- Settings is discoverable (≤ 2 taps from map view).

---

## Reference Files
- `world-of-influence/app/prototype/page.tsx` — Theme tokens, button matrix, module styling.
- `world-of-influence/app/globals.css` — Current vars, Gray Mode tokens.
- `world-of-influence/lib/theme.ts` — Theme store and config.
- `Docs/UI_PATTERNS.md` — Design rules.
- `Docs/Agents/Interface_Architech.md` — Visual standards.

---

## Suggested Implementation Order
1. Update `lib/theme.ts` (Day/Dusk/Night IDs + full cssVars).
2. Add Settings slide-up modal + gear icon in HUD.
3. Migrate TopNav, BottomNav, SplitLedger (highest visibility).
4. Migrate HUD pills and overlays.
5. Migrate all modals.
6. Migrate PropertySheet, GameMap overlays, slots.
7. Polish pass (radii, blur, shadows).
8. Remove `prefers-color-scheme` override; test all three themes end-to-end.
