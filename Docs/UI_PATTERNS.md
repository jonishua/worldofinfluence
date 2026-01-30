# World of Influence - UI Patterns

This document captures the current UI interaction and styling patterns. It is meant to guide new UI work while still allowing exploration. Deviate only when explicitly requested.

## 1. Core Visual Language
- **Aesthetic:** "Bank Vault" — secure, premium, minimal.
- **Primary Color:** Growth Green `#00C805` for positive actions and income.
- **Neutrals:** Slate `#1F2937`, white backgrounds, soft grayscale map.
- **Typography:** Currency must use monospaced font. Prefer tabular numbers.
- **Shapes:** Rounded rectangles over oblong pills. Use consistent radii.

## 2. HUD Foundations
- **Top HUD Bar:** Single container with rounded rectangle edges, not full pills.
- **Bottom HUD:** Floating dock, rounded rectangle, subdued shadow.
- **Spacing:** Tight and intentional; avoid overpadding.
- **Layering:** HUD above map, blur backgrounds where appropriate.

## 3. Slide-Up Panels (Bottom Sheets)
**Use this style for all slide-up overlays.**
- **Anchor:** Flush to bottom edge (no gap).
- **Corners:** Rounded top only, `rounded-t-[24px]`.
- **Animation:** `slide-up` with 0.3s ease (`cubic-bezier(0.2, 0.8, 0.2, 1)`).
- **Overlay:** Dim background with blur for focus.
- **Close:** Include a clear close affordance. For dense panels, add a bottom close button.

Reference class names:
- `slide-up` (animation)
- `rounded-t-[24px]`
- `bg-white` with `shadow-[0_-10px_40px_rgba(0,0,0,0.2)]`

## 4. Cards & Panels
- **Rounded Rectangles:** Use `rounded-[14px]` to `rounded-[18px]` for primary panels.
- **Borders:** Subtle `border` with `var(--card-border)` where appropriate.
- **Shadows:** Soft, directional drop shadows for depth (`shadow-xl`).

## 5. Buttons
- **Primary:** Dark slate background, white text, uppercase, tracking.
- **Secondary:** Soft slate/white, muted text, uppercased.
- **Actionable Currency:** Use green accents for positive flows.
- **No bounce:** Avoid playful animation; keep crisp, decisive press feedback.

## 6. Map Overlays
- **Grid:** Visible only on zoom > 18 (fade off at 18 and below).
- **Owned Parcels:** Solid Growth Green fill with clean white stroke.
- **Selection Outline:** Dashed white border.
- **Supply Drops:** Subtle, premium styling with accent dot.

## 7. Boost Visuals
- **Active State:** Neon glow `#39FF14`.
- **Speed:** Faster ticking numbers; visible motion.
- **Icon:** Lightning bolt in proximity to the balance.

## 8. Currency & Numbers
- **Monospace:** Always for `$` values.
- **Precision:** Keep 6–8 decimals visible for perceived motion.
- **Tabular nums:** `font-variant-numeric: tabular-nums`.

## 9. Cheat & Debug UI
- **Presentation:** Full-screen, scrollable overlay.
- **Actions:** Short, uppercase labels.
- **Consistency:** Same fonts, rounded rectangles, and subdued shadows.
- **Close:** Dedicated `X` button at the bottom.

## 10. Motion & Feedback
- **Use sparingly:** Motion to confirm actions or status changes.
- **No playful bounce:** Avoid game-like effects.
- **Transitions:** Keep under 300ms for responsiveness.
- **Confetti (High-Impact Only):**
  - Use a dedicated overlay canvas so particles render above slide-up panels.
  - Epic reveals: single burst.
  - Legendary reveals: burst + continuous top rain while reveal is open.
  - Stop confetti loops when the reveal closes.

## 11. Do / Don’t Summary
**Do**
- Use rounded rectangles and consistent spacing.
- Keep monetary UI monospaced.
- Anchor slide-ups to the bottom with shared animation.
- Prioritize clarity and trust signaling.

**Don’t**
- Use bubbly or playful UI motion.
- Overuse pill shapes for large containers.
- Hide close actions in ambiguous icons.
- Use confetti for routine actions; reserve for Epic/Legendary reveals.
