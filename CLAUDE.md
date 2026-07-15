@AGENTS.md

# MLGRD Guyana Portal — project guide

Official portal for Guyana's Ministry of Local Government & Regional Development.
Rebuilt as a fast, secure static site with an optional free serverless backend.

## Stack
- **Next.js 16** (app router) + **React 19**, **static export** (`output: "export"` → `out/`).
- **Tailwind v4** + shadcn + Magic UI components, `motion` (v12) for animation.
- Brand tokens in `src/app/globals.css`: `brand` (orange), `gold`, `ink` (charcoal),
  utilities `.container-gov`, `.text-gradient-brand`, `.bg-dot`. Use these, not raw hex.
- Path alias `@/` → `src/`. TanStack Form + Zod for forms.

## Hosting (two targets, one codebase)
- **GitHub Pages** — the public showcase/demo. Pure static; the admin runs in
  `localStorage` "demo" mode. Build uses `NEXT_PUBLIC_BASE_PATH=/mlgrd-guyana`.
- **Cloudflare Pages** — production. Same static export **plus** `functions/api/*`
  (Pages Functions) + a free **D1** database for real, shared persistence. Switched
  on by building with `NEXT_PUBLIC_API_BASE=""`. Full steps in `DEPLOY-CLOUDFLARE.md`.
- SiteGround was evaluated and rejected for dynamic use: it supports PHP+MySQL but
  **not Node.js** (verified). Cloudflare gives a free serverless backend instead.

## Content & data layer (the important part)
All mutable content (news posts, minister/officials gallery, photo gallery, helpdesk
& contact messages) flows through one pluggable client — never hard-code this content
in pages again; add it via the admin or the seed.

- `src/lib/data/types.ts` — `Post`, `GalleryItem`, `Minister`, `Message` + `New*` inputs.
- `src/lib/data/seed.ts` — canonical starting content. Public pages import these as
  their initial render so SSG shows real content; mirrored in `scripts/d1-seed.sql`.
- `src/lib/data/client.ts` — exports `data` with async namespaces
  `data.{posts,gallery,ministers,messages}.{list,create,update,remove}` and
  `data.auth.{login,logout,isAuthenticated,getToken}`. It auto-selects a backend:
  **HTTP** (`/api/*`) when `NEXT_PUBLIC_API_BASE` is defined, else **localStorage**.
  `data.mode` is `"live"` or `"demo"`.

Pattern for public pages: keep the `page.tsx` a **server** component (for `metadata`),
seed initial React state from `seed.ts`, then overlay live data via `data.*.list()`
in a `useEffect` inside a `"use client"` child. See `src/components/news/news-feed.tsx`
and `src/components/gallery/*`.

### Directories (NDC / RDC / Municipality / CDC officials)
Council/officials data comes from the ministry's "Agencies & Administrators" spreadsheet
via `scripts/import-agencies.py` (re-run when the client updates the sheet). It enforces
a **public-vs-sensitive split** — this is load-bearing because the repo is **public**:
- **PUBLIC, committed** → `src/data/{ndcs,rdcs,municipalities,cdcs}.json` (names + titles +
  institutional contact only) and `src/lib/data/seed-directory.ts` (the admin's demo seed,
  with personal mobiles/emails/comments STRIPPED).
- **SENSITIVE, git-ignored** → `scripts/d1-seed-directory.sql` (full records incl. personal
  mobiles, personal emails, NDC operational comments, inactive CDCs). Generated locally,
  applied to D1 for live mode only. **Never commit personal contacts.**
The admin's `data.directory` reads the safe seed in demo and the auth-gated `/api/directory`
(full records from D1) in live mode. Public directory pages never read sensitive fields.

## Backend (Cloudflare)
- `functions/api/[[path]].ts` — single catch-all router (Workers runtime, Web Crypto).
  Auth = HMAC-signed session token (`ADMIN_SECRET`). Public can read published content
  and POST a message; all writes + draft/inbox reads require the token.
- `scripts/d1-schema.sql`, `scripts/d1-seed.sql`, `wrangler.toml`.
- Images are stored as data URLs in D1 for now; upgrade to R2 for large media (the
  data shapes already accept a plain URL).

## Admin
- `/admin` (`src/app/admin/*`, `src/components/admin/*`) — a client-only SPA: login +
  CRUD for posts, gallery, ministers, and a helpdesk/contact inbox.
- Public header/footer are hidden on `/admin` via `src/components/site/chrome-gate.tsx`;
  the dashboard renders its own chrome.
- Demo login (localStorage mode): `admin` / `mlgrd2026` (`src/lib/data/seed.ts`).
  Live mode verifies `ADMIN_PASSWORD`/`ADMIN_PASSWORD_HASH` server-side.
- **Roles:** `admin` (full access), `editor` (manage content), `viewer` (read-only),
  and `procurement` (sees ONLY the Procurement Notices section — enforced
  server-side in `functions/api/[[path]].ts`, not just hidden nav). Manage staff
  accounts and roles from the "Staff & Roles" admin screen.

## Conventions
- New mutable content type → add to `types.ts`, `seed.ts`, the client adapters, the
  D1 schema/seed, the API router, and an admin panel. Keep all five in sync.
- Animations: `motion/react`; respect `prefers-reduced-motion` (globals.css already
  damps it). Number count-ups use `src/components/ui/number-ticker.tsx`.
- Don't commit secrets or `.env.local` (Magic UI Pro token). `out/`, `.next/`,
  `node_modules/` stay git-ignored.
