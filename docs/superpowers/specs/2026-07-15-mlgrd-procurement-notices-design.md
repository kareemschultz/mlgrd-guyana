# Procurement Notices — design spec

**Date:** 2026-07-15
**Requested by:** Kishana (client contact), relayed via Telegram (2 screenshots + voice note + sample IFB doc)

## Problem

The Procurement department needs to post tender/bid notices (Invitation for Bids,
Request for Quotations, etc.) to the public site on their own, without going through
Kishana or KareTech each time. She also wants the empty space in the homepage hero
(left column, below the CTA buttons) filled with something relevant.

Voice note transcript: *"Just a login for him so that he can log in and upload his
stuff, just supply the document or put it somewhere and then it will automatically
show us on this site."*

Sample document received: a real Invitation for Bids (IFB) — title, project list,
non-refundable document fee, submission deadline, submission address, bid validity
period. Confirms these are standard NPTAB-style tender notices with an attached
document per notice.

## Decisions made with Master Kareem

1. **Document storage:** data URL in D1 (matches existing gallery-image pattern; no
   new Cloudflare infra). Accepted trade-off: not suited to very large files, fine
   for typical tender PDFs/DOCX.
2. **Role scope:** new `procurement` role sees **only** the Procurement Notices
   section after login — no Overview, no other content sections.
3. **Notice fields:** kept simple — title, notice type, closing date, short summary,
   one attached document. Not a full re-typed breakdown of the source document (fee,
   submission address, validity period stay inside the attached file itself).
4. **Status:** derived automatically from `closingAt` (Open until it passes, then
   Closed) — no manual toggle.
5. **Public placement:** a compact "Procurement Notices" teaser card fills the blank
   hero space (left column, under the CTA buttons) showing the 2 nearest-closing
   Open notices + a link to a full `/procurement` listing page. No 4th hero button.

## Data model

New type in `src/lib/data/types.ts`:

```ts
type ProcurementNoticeType = "ifb" | "rfq" | "rfp" | "eoi";

interface ProcurementNotice {
  id: string;
  title: string;
  noticeType: ProcurementNoticeType;
  summary: string;          // short plain-text description
  closingAt: string;        // ISO datetime
  publishedAt: string;      // ISO datetime
  documentName: string;     // original filename, e.g. "IFB-compost-bins.docx"
  documentDataUrl: string;  // data: URL, same pattern as gallery images
}
type NewProcurementNotice = Omit<ProcurementNotice, "id" | "publishedAt">;
```

`status` is NOT stored — it's computed at read time (`closingAt > now ? "open" : "closed"`)
both server-side (for the API's default sort/filter) and client-side (for display).

Follows the existing five-place pattern used by every other content type:
`types.ts` → `seed.ts` (seed-procurement-notices.ts) → `client.ts` (new
`data.procurementNotices.{list,create,update,remove}` namespace) → D1
schema/seed (`scripts/d1-schema.sql`, `scripts/d1-seed.sql`) → API router
(`functions/api/[[path]].ts`) → admin section
(`src/components/admin/procurement-section.tsx`).

## Role & access control

- Add `"procurement"` to `ALLOWED_ROLES` in the API router and to the `ROLES`
  dropdown in `src/components/admin/users-section.tsx` (Staff & Roles screen),
  with its own badge colour/label, same as admin/editor/viewer today.
- **Server-side enforcement (new):** currently every authenticated role can hit
  every write endpoint — the UI just hides sections. That's not good enough for
  an externally-facing "restricted" account. Add a small guard in the router:
  if `role === "procurement"`, only `resource === "procurement-notices"` (plus
  `auth/*`) is allowed; everything else returns 403. Existing admin/editor/viewer
  behaviour is untouched.
- **Admin UI:** `dashboard.tsx`'s `NAV` array gets a `roles?: string[]` restriction
  concept (in addition to the existing `adminOnly` flag) so a `procurement` user's
  sidebar shows only "Procurement Notices" and lands there directly on login,
  skipping Overview per Master Kareem's answer.
- **Account creation:** no new UI needed — the existing Staff & Roles admin screen
  (already CRUD, already used for admin/editor/viewer) gains "Procurement" as a
  selectable role. Kishana or Master Kareem creates her colleague's login there,
  same workflow as any other staff account today.

## Admin section (`procurement-section.tsx`)

Mirrors `posts-section.tsx`/`gallery-section.tsx` conventions: a list of notices
(newest first, Open/Closed badge), a create/edit form (title, notice type select,
closing date/time picker, summary textarea, file upload → converted to a data URL
client-side before POST), delete with confirm dialog. Available to `admin` and
`procurement` roles (not `editor`/`viewer`, per Kishana's ask that this be a
dedicated procurement space).

## Public site

- **`src/app/procurement/page.tsx`** — full listing, Open notices first (soonest
  closing date first), then Closed (grayed out, closing date shown, still
  downloadable for transparency/record). Each row: notice type badge, title,
  summary, closing date, download link for the attached document.
- **Homepage hero teaser** — new client component
  `src/components/site/procurement-notices-teaser.tsx`, same
  fetch-with-seed-fallback pattern as `portal-updates-teaser.tsx`. Renders inside
  the hero left column (`src/app/page.tsx`), directly below the "official
  Government of Guyana website" line, filling the blank space confirmed by an
  actual rendered screenshot (1440×900) taken during design — the gap exists
  because the right column (ministry emblem + Latest updates card) is taller
  than the left column's text/buttons. Shows the 2 nearest-closing Open notices
  + "View all procurement notices →"; if zero Open notices, a quiet "No open
  procurement notices right now" state (still links to the full page).

## Out of scope

- No R2 / large-file storage (data URL in D1, per decision 1).
- No automated weekly reminder/notification for Procurement staff — "weekly" was
  Kishana describing expected posting cadence, not a technical requirement.
- No changes to the existing separate "Vendors & Suppliers" services page —
  different, static, informational content.
- No changes to `editor`/`viewer` role permissions (the write-endpoint gating gap
  they share is pre-existing and out of scope for this change).

## Verification plan

- `bun run lint` + Next.js build (`bun run build`) clean.
- Local dev server: log in as a seeded `procurement` demo user, confirm sidebar
  shows only Procurement Notices, confirm posting a notice with an attached file
  works end-to-end and appears on `/procurement` and the homepage teaser.
- Confirm a `procurement`-role token gets 403 on a non-procurement endpoint
  (e.g. `/api/posts`) via curl.
- Screenshot homepage (teaser fills the gap, no layout shift) and `/procurement`
  page before calling UI work done.
- Independent reviewer pass on the diff before merge; merge-gate HTML explainer
  before merging to `main` (client-facing, >5 files).
