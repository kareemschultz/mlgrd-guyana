# MLGRD Portal — Ministry of Local Government & Regional Development (Guyana)

A modern, secure, fully‑static rebuild of the Ministry of Local Government & Regional Development
website, plus a complete **security assessment** of the existing WordPress site it replaces.

The original site (`kishanac4.sg-host.com`) is a WordPress/Elementor build. This project re‑creates it as
a **statically‑exported Next.js application** — no server, no database, no admin panel, no plugins — which
removes most of the attack surface identified in the audit while delivering a faster, more accessible,
more polished experience.

> Brand colours and the ministry emblem are taken from the original site (warm amber/orange + a charcoal
> ink, with the gold/green/red emblem); the design language is consistent and original, not a 1:1 copy.

---

## What's in here

| Deliverable | Location |
|---|---|
| 🔒 **Security audit report (PDF)** | [`SECURITY-AUDIT.pdf`](./SECURITY-AUDIT.pdf) — designed, charted, full report |
| 🔒 Security audit (markdown + evidence) | [`SECURITY-AUDIT.md`](./SECURITY-AUDIT.md), `_audit/` |
| 🌐 The rebuilt website | `src/` (this Next.js app) |
| 🆕 Pages added vs. the original | [`PAGES-ADDED.md`](./PAGES-ADDED.md) |
| 📸 Original‑site reference screenshots | `_reference/screenshots/` |

## Tech stack

- **Next.js 16** (App Router, React 19) — `output: "export"` static site
- **Tailwind CSS v4** + **shadcn/ui** (Radix) + **Magic UI** (motion components)
- **motion** for animations; reduced‑motion honoured globally
- **TanStack Form + Zod** for the multi‑step, validated forms
- **Bun** package manager / runtime; **TypeScript** throughout

## Pages & features

- Home, About, Services (+6 detail), Laws & Policies (+9 detail), Directories (NDCs **69**, RDCs 10,
  Municipalities 10), and added pages: Contact, FAQ, Minister's Desk, Helpdesk, Job Vacancies, News,
  Privacy, Accessibility, 404 — see [`PAGES-ADDED.md`](./PAGES-ADDED.md).
- **Searchable directories** with live search + a region/category dropdown filter (NDCs, Laws).
- **Multi‑step animated forms** (Report a Problem, Vendor Enquiry, Contact/Helpdesk) with per‑step Zod
  validation and a success state. Submissions post to a form service via `NEXT_PUBLIC_FORM_ENDPOINT`.
- **Free OpenStreetMap** embed on Contact (no API key) + Google/Apple/OSM links.
- Custom **ministry‑themed floating SVG motifs**, Magic UI accents (marquee, meteors, number tickers,
  border beam, gradient text), tasteful scroll reveals — all rounded, responsive, mobile‑first.
- **SEO**: per‑route metadata, Open Graph/Twitter, JSON‑LD `GovernmentOrganization`, generated
  `sitemap.xml` + `robots.txt`, and the ministry emblem as favicon/app icons.
- **Accessibility**: semantic HTML, keyboard nav, skip link, focus styles, WCAG‑AA‑minded colour, and
  reduced‑motion support.

## Real content & data

Content was scraped from the live site and stored as structured data:
`src/data/ndcs.json` (69 councils), `rdcs.json`, `municipalities.json`, `laws.json`, `services.json`, and
`src/content/site.json`. Directory and detail pages are generated from these via `generateStaticParams`.

---

## Local development

Requires **Bun ≥ 1.3**.

```bash
bun install
bun run dev      # http://localhost:3000
bun run build    # static export -> ./out
```

### Environment (`.env.local`, see `.env.example`)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_FORM_ENDPOINT` | Form‑service endpoint (e.g. Formspree) for real submissions. Empty = demo mode. |
| `NEXT_PUBLIC_BASE_PATH` | Base path for GitHub Pages **project** sites (e.g. `/mlgrd-portal`). Empty for local / custom domain. |
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL used in `sitemap.xml`, `robots.txt`, JSON‑LD. |
| `MAGICUI_PRO_REGISTRY_TOKEN` | Magic UI **Pro** registry token (used only when adding Pro blocks via `bunx shadcn add @magicui-pro/<block>`). |

## Deployment

### GitHub Pages (showcase) — automated
Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the static export with
`NEXT_PUBLIC_BASE_PATH=/<repo>` and publishes `out/` to Pages. Enable **Settings → Pages → Source: GitHub
Actions**. A `.nojekyll` file is included so `_next/` assets are served.

### Ministry's own hosting (production) — portable
The same `out/` folder is a plain static site. Host it on any web server/CDN. On the production host,
**add the HTTP security headers** the audit recommends (HSTS, CSP, X‑Frame‑Options, X‑Content‑Type‑Options,
Referrer‑Policy, Permissions‑Policy) — GitHub Pages cannot set custom headers, but the ministry's host can,
and a static site makes a strict CSP easy. Set `NEXT_PUBLIC_BASE_PATH=""` (or your subpath) and
`NEXT_PUBLIC_SITE_URL` to the official domain, then rebuild.

## Security posture

This static rebuild structurally eliminates the WordPress/PHP/plugin attack surface (user enumeration,
plugin RCE/upload/LFI CVEs, xmlrpc, wp‑cron, the exposed MCP/AI adapter, the login surface). See
`SECURITY-AUDIT.pdf` §“Recommendation: Static Rebuild” for the full comparison.

---

_Rebuild + security assessment for the Ministry of Local Government & Regional Development, Guyana._
