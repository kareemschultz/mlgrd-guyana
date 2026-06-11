# Deploying the MLGRD portal to Cloudflare Pages (free)

The portal is a **Next.js static export** (`out/`) plus a small **Cloudflare Pages
Functions** API (`functions/api/*`) backed by a free **D1** SQLite database. This
gives a real admin dashboard, news posts, minister gallery and helpdesk inbox with
shared server-side persistence — no Node server, no monthly bill.

> The same codebase also runs as a pure-static **demo** on GitHub Pages: when no
> backend is present the admin and pages fall back to in-browser `localStorage`
> (see `src/lib/data/client.ts`). The steps below switch on the *live* backend.

## The two modes

| | Demo (GitHub Pages) | Live (Cloudflare Pages) |
|---|---|---|
| Data store | browser `localStorage` | D1 (shared, server-side) |
| Admin login | `admin` / `mlgrd2026` (client-only) | server-verified, your secret |
| Switch | `NEXT_PUBLIC_API_BASE` **unset** | `NEXT_PUBLIC_API_BASE=""` at build |

The selector is `NEXT_PUBLIC_API_BASE`. Set it to an empty string `""` for
same-origin `/api`, and the client uses the live HTTP backend.

## One-time setup

Prerequisites: a free Cloudflare account and `npm i -g wrangler` (then `wrangler login`).

```bash
# 1. Create the database (copy the printed database_id into wrangler.toml)
wrangler d1 create mlgrd

# 2. Create the tables and seed starting content
wrangler d1 execute mlgrd --remote --file=scripts/d1-schema.sql
wrangler d1 execute mlgrd --remote --file=scripts/d1-seed.sql

# 2b. (Optional) Load the FULL council/officials directory incl. personal contacts.
#     Generate the git-ignored seed locally first from the ministry spreadsheet:
#       python scripts/import-agencies.py "path/to/Agencies & Administrators.xlsx"
#     then apply it (admin-only data — only exists in D1, never in the public bundle):
wrangler d1 execute mlgrd --remote --file=scripts/d1-seed-directory.sql

# 2c. Reference datasets (schools, health, police, villages, tenders, …).
#     Public datasets (committed, ~1,750 rows):
wrangler d1 execute mlgrd --remote --file=scripts/d1-seed-datasets.sql
#     Amerindian villages WITH personal Toshao contacts (sensitive, git-ignored).
#     Regenerate locally then apply — never commit this file:
#       python scripts/gen-datasets-seed.py --villages "path/to/amerindian-villages.json"
wrangler d1 execute mlgrd --remote --file=scripts/d1-seed-datasets-villages.sql

# 3. Admin secrets (run once; you'll be prompted for the value)
wrangler pages secret put ADMIN_SECRET      # any long random string (signs sessions)
wrangler pages secret put ADMIN_PASSWORD    # the admin login password
# optional: wrangler pages secret put ADMIN_PASSWORD_HASH  (hex SHA-256, instead of ADMIN_PASSWORD)
# optional: wrangler pages secret put ADMIN_USERNAME       (defaults to "admin")
```

## Build & deploy

```bash
# Build the static site in LIVE mode (note the empty API base)
NEXT_PUBLIC_API_BASE="" bun run build      # or: npm run build

# Deploy the static output + functions
wrangler pages deploy out
```

On Windows PowerShell, set the env var first:
```powershell
$env:NEXT_PUBLIC_API_BASE = ""; bun run build
wrangler pages deploy out
```

### Git-based deploys (recommended)

Connect the GitHub repo in the Cloudflare dashboard → **Workers & Pages → Create →
Pages → Connect to Git**, then set:

- **Build command:** `bun run build` (or `npm run build`)
- **Build output directory:** `out`
- **Environment variable:** `NEXT_PUBLIC_API_BASE` = `` (empty string)
- Bind the D1 database (**Settings → Functions → D1 bindings**: `DB` → `mlgrd`)
- Add the secrets `ADMIN_SECRET`, `ADMIN_PASSWORD` under **Settings → Environment variables**

Every push to `main` then builds and deploys automatically.

## Custom domain (e.g. a gov.gy subdomain)

**Pages → your project → Custom domains → Set up a domain.** Point the DNS at
Cloudflare (free SSL is automatic). This is the only step that needs the domain's
DNS to be delegatable to Cloudflare.

## Free-tier limits (generous for a ministry site)

- D1: 5 GB storage, 5M row-reads/day, 100k row-writes/day
- Functions: 100k requests/day
- Bandwidth: unlimited

## Upgrading images to R2 (optional, later)

Uploaded images are currently stored as data URLs in D1 — fine for modest galleries.
For large media, add an **R2** bucket, upload files there from the admin, and store
the public R2 URL in the `image`/`portrait`/`coverImage` field instead. The data
shapes already accept a plain URL, so no schema change is required.

## Security notes (ties back to the audit)

- No CMS, no PHP, nothing to patch — the attack surface is a handful of typed routes.
- Writes require a valid HMAC-signed session token (`ADMIN_SECRET`); reads of drafts
  and the helpdesk inbox are auth-gated. Public can only read published content and
  submit a message.
- Always set a strong `ADMIN_SECRET` and `ADMIN_PASSWORD` (or `ADMIN_PASSWORD_HASH`)
  as Cloudflare **secrets** — never commit them.
