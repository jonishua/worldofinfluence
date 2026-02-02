# Task: UI Prototype Refinement & Integration Readiness

## Context
We have built a comprehensive UI Prototype Gallery at `/prototype` to consolidate the visual language of World of Influence. The goal is to establish a "source of truth" for the **Bank Vault (Rigid Shell) + Casino Core (High Juice)** aesthetic across Light, Dark, and the newly established **Gray Mode** (Medium).

## Current Progress
- **Theme Variables:** Established in `globals.css` with Slate-600/500 palette.
- **Atomic Components:** Matrix of buttons, pills, and typography with `framer-motion` scaling and haptic shockwaves.
- **Module Gallery:** Mock-ups for Land Acquisition, Supply Drop (with scaled Biometric Hold), Mayor's Dashboard, and Marketplace.
- **Juice:** Interactive radial progress, odometer rolls, and confetti triggers.

## Objectives for the Next Agent
1.  **Refine Component Rigidity:** 
    - Audit all prototype modules to ensure they follow the strict `rounded-[14px]` to `rounded-[20px]` container rules.
    - Standardize all borders using `var(--card-border)` or theme-specific variants (`gray-border`).
2.  **Expand Interaction Matrix:**
    - Implement "Processing" and "Locked" states for the Land Acquisition and Store buttons.
    - Add a "Juice Audit" section where common animations (slide-ups, flashes, pulses) can be triggered individually for review.
3.  **Governance UI Polish:**
    - Expand the **Mayor's Dashboard** mock to include a "Voter Sentiment" graph or "Tax Revenue" line chart using Tailwind/CSS (referencing Acorns/Robinhood style).
4.  **Integration Blueprint:**
    - Create a plan for migrating these consolidated styles back into the live components (`components/hud/*`, `components/modals/*`).
    - Identify where `backdrop-blur-xl` should be applied globally to HUD elements.

## Success Criteria
- The `/prototype` page serves as a pixel-perfect reference for all lighting modes.
- Animations feel "heavy" and secure, yet responsive.
- The Gray Mode baseline is approved for full game deployment.

## Reference Files
- `world-of-influence/app/prototype/page.tsx` (Primary)
- `world-of-influence/app/globals.css` (Theme)
- `Docs/UI_PATTERNS.md` (Design Rules)
