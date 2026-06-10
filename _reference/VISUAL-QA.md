# Visual QA & Enhancement Pass — MLGRD Portal

**Date:** 2026-06-10
**Scope:** Mobile (390×844) + Desktop (1440×900) full-page capture, analysis, fixes, enhancements.
**Method:** Playwright (system Chrome) against the running dev server at `http://localhost:3001`. Each route scrolled in steps (to fire scroll-reveal) then full-page screenshot. Mobile menu-open and the multi-step form mid-flow also captured.

Screenshots for client review:
- `_reference/mobile/` — every route + `menu-open.png`, `form-midflow.png`, `form-step1.png`, `form-step2.png`
- `_reference/desktop/` — every route

## Headline result
The site is in excellent shape. **Zero horizontal overflow** was detected on any of the 20 routes at either viewport (scrollWidth == clientWidth on every page). Grids, filter toolbars, the directory search + region filter, the multi-step form, tables/lists, hero text, and footer all stack correctly at 390px. Tap targets are comfortably sized. No layout bugs required fixing — the responsive design system (`Reveal`, `FloatingMotifs`, brand classes, `container-gov`) is already applied thoroughly and consistently.

Because there were no defects, the pass focused on a **safe, consistent, additive enhancement** rather than corrective work.

## Per-page mobile verdict

| Route | Mobile verdict | Notes |
|---|---|---|
| `/` | OK | Hero, stat marquee/ticker band, services grid, dark "find your council" band, CTA, footer all stack cleanly. |
| `about/` | OK | Stat cards on dot pattern, motion intact. |
| `services/` | OK | Service cards stack 1-col with hover lift. |
| `services/building-permits/` | OK | Informational "how it works" / "what to bring" — no form here (correct). |
| `services/reporting-local-problems/` | OK | Multi-step form stepper + fields + Continue all fit at 390px; advanced to step 2 cleanly. |
| `laws-policies/` | OK | Laws browser filter + cards stack. |
| `laws-policies/local-government-act-chapter-2802/` | OK | Legal sections + "reference entry only" callout fine. |
| `ndcs/` | OK | Search box + region filter stack vertically; "Showing X of Y" + grouped council cards render well. |
| `ndcs/wakenaam/` | OK | Single-council detail, ministry-contact card, prev/next pager all good. |
| `rdcs/` | OK | Region cards with icon + badge stack. |
| `municipalities/` | OK | Card grid → 1-col, hover lift + icon color transition intact. |
| `news/` | OK | News cards stack with category badge + date. |
| `contact/` | OK | Info cards + working OpenStreetMap embed, links wrap fine. |
| `faq/` | OK | Accordion full-width, readable. |
| `ministers-desk/` | OK | Letter + signature block; motifs in hero. |
| `helpdesk/` | OK | Quick-links cards + form stack. |
| `vacancies/` | OK | "How we recruit" cards stack. |
| `privacy/` | OK | Legal prose readable. |
| `accessibility/` | OK | Legal prose readable. |
| `this-page-does-not-exist/` (404) | OK | Themed 404 with nav cards + meteors; footer stacks to single column. |
| Mobile header **menu open** | OK | Sheet covers ~88% width, accordion nav + utility tiles + Report CTA + contact details, all tappable. |

## Issues fixed
None required. No mobile overflow, no cramped/oversized text, no badly wrapping buttons or filters, no non-stacking grids/tables, no hero text overlap, no overflowing images, no footer column problems. The directory search+filter and the multi-step form are both fully usable at 390px.

## Enhancements added (safe + additive)
- **Subtle ministry-themed floating SVG motifs in every interior page hero.** Added an optional `motifs` prop to the shared `PageHero` (`@/components/site/page-hero`), defaulting to the existing `FloatingMotifs` `"band"` preset (scales of justice, handshake, permit document) rendered at very low opacity (`text-white/[0.07]`). This gives the previously flat deep-ink interior heroes the same gentle, living quality as the home hero, applied consistently across ~15 pages at once (about, services, contact, faq, helpdesk, news, vacancies, municipalities, ndcs/rdcs indexes, laws, ministers-desk, privacy, accessibility, etc.).
  - **Mobile-safe:** motifs are `hidden sm:block`, so the 390px hero stays clean and uncluttered — no crowding behind the title/lead.
  - **Reduced-motion safe:** reuses the existing `FloatingMotifs` component, whose drift is already frozen by the app-wide `<MotionConfig reducedMotion="user">`. No new raw infinite animations were introduced.
  - **Opt-out:** `motifs={false}` disables them per-page if ever needed.

No changes were made to the colour palette, logo, `globals.css` tokens, `layout.tsx`, `lib/site.ts`, the forms engine (`multi-step-form.tsx` / `configs.ts`), or `_audit/`.

## Verification
- Re-captured all PageHero-based pages (mobile + desktop) after the edit — still zero overflow on every page; mobile heroes unchanged, desktop heroes show the faint drifting motifs.
- `bunx tsc --noEmit` → **exit 0** (no type errors).
- Dev server was used as-is (not restarted); hot reload picked up the change cleanly.

## Files changed
- `src/components/site/page-hero.tsx` — added optional `motifs` prop + `FloatingMotifs` layer (default `"band"`, hidden on mobile, reduced-motion honoured).
