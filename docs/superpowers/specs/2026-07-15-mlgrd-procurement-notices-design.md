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
3. **Notice fields:** kept simple, but incorporating the two genuinely useful fields
   from the old placeholder "Tenders" dataset (reference number, procurement
   category) since they cost her nothing extra to fill in and are already visible at
   the top of the source document: title, reference number (optional), notice type
   (Invitation for Bids / Request for Quotations / Request for Proposals /
   Expression of Interest), closing date, short summary, one attached document. Still
   not a full re-typed breakdown (fee, submission address, bid security, validity
   period stay inside the attached file itself — the old placeholder's `bid_security`/
   `contact` fields are dropped, not worth re-typing).
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
  refNo?: string;           // e.g. "MLGRD/PROC/2026/001" — optional, from the old Tenders schema
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

## Consolidation with the existing placeholder "Tenders" directory

Discovered during design: `src/lib/data/datasets.ts` already registers a generic
`tenders` dataset (`/directories/tenders`, linked from Directories → Resources
in `src/lib/site.ts`) with entirely fake seed data (`src/data/datasets/tenders.json`
— dummy reference numbers, `documents` pointing at `/assets/docs/*` files that
don't exist). It has no real upload, no restricted role, editable by any authed
staff via the generic Datasets admin screen.

Decision: retire it rather than run two tender-ish sections side by side.
- Remove the `tenders` entry from `datasets.ts` (and its `columns`/`route`).
- Delete `src/data/datasets/tenders.json`.
- Update the "Tenders" nav link in `src/lib/site.ts` to point at `/procurement`
  instead (relabel to "Procurement Notices" for clarity).
- No D1 migration needed for the old dataset rows — the generic `datasets` table
  is keyed by `kind`; simply no code path will read/write `kind = 'tenders'`
  anymore. (If a live D1 already has seeded `tenders` rows from the placeholder,
  they become inert or can be cleaned up with a one-off `DELETE FROM datasets
  WHERE kind = 'tenders'` — not required for correctness.)

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
