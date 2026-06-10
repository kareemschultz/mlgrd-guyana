# Security Assessment — Ministry of Local Government & Regional Development (MLGRD) Portal

**Target:** `https://kishanac4.sg-host.com/` (WordPress staging instance of the MLGRD website)
**Assessment date:** 10 June 2026
**Assessment type:** External, black-box, **non-intrusive** (passive reconnaissance + safe unauthenticated endpoint inspection)
**Assessor context:** Pre-hosting security review ahead of the Government of Guyana taking over hosting of this site.

> **Authorization & rules of engagement.** This review was limited to **read-only** techniques: HTTP fingerprinting,
> inspection of *publicly reachable* endpoints, security-header/TLS review, and CVE mapping against disclosed
> software versions. **No exploitation, password attacks, fuzzing, automated scanning, or any state-changing
> request was performed.** No vulnerability was actively exploited; impacts below are assessed from configuration
> and disclosed information only.

---

## 1. Executive summary

The site is a standard **WordPress** build (theme **Hello Elementor**, page-builder **Elementor** + **ElementsKit**,
plus a **Hostinger plugin suite**) hosted on **SiteGround (nginx)**. The host itself applies several good baseline
protections (sensitive files, directory listing, `xmlrpc.php`, and `TRACE` are all blocked; privileged REST routes
require authentication). **However, the application leaks information that materially lowers the cost of attacking it,
and it ships none of the modern HTTP security headers.**

**Highest-priority issues:**

| # | Finding | Severity |
|---|---------|----------|
| F-01 | **Username + email enumeration** wide open (REST `users`, author archives, `?author=N`, users-sitemap) — leaks the **admin login `kishanachang`** and a **personal email** (`darrenxmhinds@gmail.com`) | **High** |
| F-02 | **No HTTP security headers** (no HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) | **High** |
| F-03 | **Software version disclosure** (WordPress, Elementor, theme) easing targeted CVE matching against a frequently-exploited plugin ecosystem | **Medium** |
| F-04 | **Public, indexable staging environment** with real ministry content on a non-government domain + leftover `test-about` page | **Medium** |
| F-05 | **Login surface exposed** (`wp-login.php` 200, lost-password reachable) with **no visible 2FA / rate-limiting**, combined with known usernames | **Medium** |
| F-06 | **WordPress MCP/AI adapter endpoint exposed** (`/wp-json/mcp/...`, accepts POST/GET/DELETE; currently auth-gated) — broad, destructive-capable attack surface | **Medium** |
| F-07 | `wp-cron.php` publicly triggerable; `wp-json` `media/comments/pages/types` fully public; developer-attribution leak; no `security.txt`; cookie missing `SameSite` | **Low** |

Because the Government will host this, the recommendation is twofold: **(a)** harden the existing WordPress instance
before any production cutover (Section 6), and **(b)** strongly prefer the **static rebuild** (Section 7), which
removes the entire class of WordPress/PHP/plugin attack surface.

---

## 2. Target fingerprint

| Property | Value |
|---|---|
| Web server | `nginx` (SiteGround managed) |
| Platform | WordPress (meta generator reports **`WordPress 7.0`** — treat as reported, may be filtered) |
| Theme | **Hello Elementor** v**3.4.9** (disclosed via readable `style.css`) |
| Page builder | **Elementor 4.1.1** (+ `e_font_icon_svg`, custom breakpoints — disclosed in meta generator); **ElementsKit** |
| Other plugins | Hostinger suite: easy-onboarding, **AI assistant**, **amplitude** (analytics), **reach** (CRM/email), tools; Elementor Pro namespaces present |
| Notable REST namespaces | `wp/v2`, `elementor/v1`, `elementor-pro/v1`, `elementskit/v1/*`, **`mcp`**, `hostinger-*/v1`, `wp-abilities/v1` |
| Hosting artifacts | `X-Httpd-Modphp: 1`, `Host-Header: <hash>`, `X-Proxy-Cache-Info` (SiteGround) |
| Developer attribution | User `kishanachang` profile URL `http://kishanachang.wpendgame.com` (WP migration/staging service) |

---

## 3. Findings (detail)

### F-01 — Username & email enumeration / PII disclosure — **High**
**Evidence.**
- `GET /wp-json/wp/v2/users` → `200` and returns the full author list **without authentication**:
  - `id:1` → name `kishanachang`, slug `kishanachang` (an **administrator** login name).
  - `id:3` → name `Darren Hinds`, slug `darrenxmhindsgmail-com` → **reconstructs the email `darrenxmhinds@gmail.com`**.
- `GET /?author=1` → `301` to `/author/kishanachang/` (confirms username).
- `GET /wp-sitemap-users-1.xml` → lists `/author/kishanachang/`.

**Impact.** Valid usernames are the first half of every credential attack. One account is a personal Gmail
(phishing target + credential-stuffing pivot); the other is the site administrator. This converts a "guess
username + password" problem into a "guess password only" problem and enables targeted spear-phishing.

**Remediation.**
- Disable REST user enumeration for unauthenticated requests (security plugin, or filter `rest_endpoints` to remove
  `/wp/v2/users` for guests; Wordfence/Solid Security/“disable REST users” snippet).
- Block `?author=N` author-scan redirects; remove the **users** sitemap (`wp_sitemaps_add_provider` filter).
- Set **display names ≠ login names**; never derive a username/email from the public slug. Rotate the admin
  username away from `kishanachang`.

### F-02 — Missing HTTP security headers — **High**
**Evidence.** Response headers for `/` contain **none** of: `Strict-Transport-Security`, `Content-Security-Policy`,
`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. (HTTP does 301→HTTPS, but with
**no HSTS** there is an SSL-strip window on first visit.)

**Impact.** No clickjacking protection (no `X-Frame-Options`/`frame-ancestors`); MIME-sniffing possible
(`X-Content-Type-Options` absent); no CSP to contain any XSS (and the Elementor stack has a history of stored XSS);
referrer leakage; no transport pinning.

**Remediation.** Add at the edge (nginx / SiteGround / Cloudflare) for every response:
`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, a tested
`Content-Security-Policy`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, and a least-privilege `Permissions-Policy`.

### F-03 — Software / version disclosure — **Medium**
**Evidence.** Meta generator leaks `WordPress 7.0` and `Elementor 4.1.1` (+ feature flags); theme `style.css`
readable → `Hello Elementor 3.4.9`; per-asset `?ver=` query strings.

**Impact.** Lets an attacker match the exact stack to public CVEs without touching the app. The Elementor ecosystem
is heavily targeted — 2025–2026 examples include **CVE-2025-49387** (unauthenticated file-upload → RCE in an
Elementor Forms upload add-on), **CVE-2025-8081** (Elementor arbitrary file read ≤3.30.2), **CVE-2025-13067**
(Royal Addons RCE), **CVE-2026-4659** (Unlimited Elements LFI), and multiple King-Addons criticals (CVSS up to 10.0).

**Remediation.** Strip the `generator` meta and asset `?ver=` strings; suppress theme/plugin version files where
possible. Treat version-hiding as defense-in-depth, **not** a substitute for patching (F-08).

### F-04 — Public, indexable staging environment — **Medium**
**Evidence.** Live, crawlable site (`robots.txt` allows general crawling; sitemap published) serving **real ministry
content** on a **non-government domain** (`*.sg-host.com`). A leftover **`/test-about/`** page is published.

**Impact.** Search engines index an unofficial copy of government content → citizen confusion, duplicate-content,
and a ready-made template for **phishing/impersonation**. Staging sites also commonly run looser config and debug
features. Leftover test pages signal an unfinished, unreviewed surface.

**Remediation.** Until launch: `noindex` + HTTP Basic auth/IP allow-list on the staging host; remove `test-about`
and any other scaffold pages; serve production only from the official `*.gov.gy` domain with a valid cert.

### F-05 — Exposed authentication surface, no visible MFA/rate-limiting — **Medium**
**Evidence.** `wp-login.php` → `200`; `?action=lostpassword` → `200`; registration (`?action=register`) → `302`
(appears disabled — good). No challenge, throttling, or 2FA observed. Usernames already known (F-01).

**Impact.** Direct credential-stuffing / brute-force target. Lost-password flow can aid user enumeration.

**Remediation.** Enforce **2FA** for all admin/editor accounts; add login rate-limiting/lockout (Wordfence/Solid
Security/Limit-Login); restrict `wp-admin`/`wp-login.php` by IP allow-list or move behind SSO/VPN; use strong,
unique passwords; consider a custom login path.

### F-06 — WordPress MCP / AI adapter endpoint exposed — **Medium**
**Evidence.** `/wp-json/mcp` is publicly **listed** and exposes `/wp-json/mcp/mcp-adapter-default-server` accepting
**POST, GET, DELETE**. Unauthenticated calls currently return `401 rest_forbidden` (good), but the **AI/agent control
surface is discoverable** and includes a destructive verb.

**Impact.** An AI "tools" bridge is a powerful, fast-evolving attack surface. If any credential or **application
password** leaks (note app-passwords are enabled), an attacker could drive AI/automation tools — potentially
content deletion or config change — via a single endpoint. New MCP/abilities plugins are immature and under-audited.

**Remediation.** If MCP/AI features are not required in production, **disable** the MCP adapter, the
`hostinger-ai-assistant`, and `wp-abilities` plugins. If required, restrict the route to authenticated admins over
an allow-listed network, audit-log every call, and disable application passwords unless explicitly needed.

### F-07 — Lower-severity hygiene issues — **Low**
- **`wp-cron.php` → 200** (anyone can trigger scheduled tasks → mild resource-abuse/DoS amplification). *Fix:* set
  `define('DISABLE_WP_CRON', true)` and run a real system cron; block external access to `wp-cron.php`.
- **Public REST collections**: `wp/v2/media`, `comments`, `pages`, `types` all `200` (standard, but `media` enables
  full attachment/author enumeration). *Fix:* restrict where feasible; ensure no draft/PII content is exposed.
- **No `/.well-known/security.txt`** (`404`). *Fix:* publish `security.txt` with a disclosure contact (expected for
  a government site).
- **Login cookie lacks `SameSite`** (`Secure; HttpOnly` set, `SameSite` absent). *Fix:* add `SameSite=Lax/Strict`.
- **Developer attribution leak** (`kishanachang.wpendgame.com`) reveals build tooling/provenance. *Fix:* sanitize
  user profile URLs.

---

## 4. Controls confirmed working (positives)

- HTTP **301 → HTTPS** enforced; valid TLS in use.
- `xmlrpc.php` → **403** (blocks pingback DDoS + XML-RPC password brute-force).
- Sensitive files all **403**: `.git/config`, `.env`, `wp-config.php.bak/~/.save`, `backup.zip`, `wp-content/debug.log`, `.user.ini`.
- **Directory listing disabled** for `/wp-content/uploads/`, `/plugins/`, `/themes/`.
- Privileged REST routes require auth: `wp/v2/settings`, `wp/v2/plugins`, `wp/v2/themes` → **401**.
- Application-passwords authorize page requires auth (**302** to login); MCP adapter calls → **401**.
- **`TRACE` → 405** (no cross-site tracing); CORS is **not** wildcard-open.
- User **registration appears disabled** (`302`).

---

## 5. CVE watch-list (verify against the *installed* versions)

The exact plugin builds couldn't be confirmed unauthenticated, so this is a **patch-priority list** for the admin to
check in `wp-admin → Plugins` and against [WPScan](https://wpscan.com/plugin/elementor-pro/) / Patchstack:

- **Elementor / Elementor Pro** — stored XSS fixed in Pro ≥ 3.29.1; arbitrary file read **CVE-2025-8081** (≤3.30.2); historic upload→RCE **CVE-2023-48777**.
- **Elementor Forms / upload add-ons** — unauthenticated upload→RCE **CVE-2025-49387**.
- **ElementsKit** — recurring auth'd file-upload / LFI / SSRF class issues across releases.
- **Third-party Elementor add-ons** — King Addons **CVE-2025-6327/6325** (CVSS 10.0), Royal Addons **CVE-2025-13067**, Unlimited Elements **CVE-2026-4659**.

**Action:** update WordPress core + every plugin/theme to current, enable auto-updates for security releases,
and remove unused plugins (each Hostinger/Elementor add-on is extra attack surface).

---

## 6. Prioritized remediation roadmap (existing WordPress site)

**Immediate (before any production cutover)**
1. Kill user/email enumeration (REST `users`, `?author=N`, users-sitemap) and rotate the `kishanachang` admin name. *(F-01)*
2. Add the full security-header set + HSTS at the edge. *(F-02)*
3. Take staging out of the index (noindex + auth/IP allow-list); delete `test-about`. *(F-04)*
4. Enforce 2FA + login rate-limiting; restrict `wp-admin`/`wp-login.php`. *(F-05)*
5. Patch WordPress core + all plugins/themes; remove unused ones. *(F-03/F-08)*

**Short term**
6. Disable MCP/AI/abilities + application passwords unless explicitly needed; audit-log if kept. *(F-06)*
7. Disable HTTP `wp-cron`; add `security.txt`; set cookie `SameSite`; strip version strings. *(F-03/F-07)*

**Ongoing**
8. Managed WAF (SiteGround/Cloudflare), file-integrity monitoring, off-site backups, least-privilege accounts,
   quarterly review. Move production to an official `*.gov.gy` domain.

---

## 7. Security posture of the replacement site (the rebuild)

The Government should host a **statically-exported Next.js site** (this project). It **structurally eliminates** most
of the findings above:

| Existing WordPress risk | Static rebuild |
|---|---|
| PHP + DB + admin panel + 10+ plugins on the host | **No server code, no DB, no admin, no plugins** — only static HTML/CSS/JS |
| User/email enumeration (F-01) | **No user accounts on the host** — nothing to enumerate |
| Plugin RCE/file-upload/LFI CVEs (F-03/F-08) | **No plugins / no upload handlers** — entire CVE class removed |
| `xmlrpc`, `wp-cron`, MCP adapter, login surface (F-05/F-06/F-07) | **None of these endpoints exist** |
| Missing security headers (F-02) | Ships **HSTS + CSP + X-Frame-Options + nosniff + Referrer-Policy + Permissions-Policy** by default |

**Additional hardening built into the rebuild:** subresource-integrity-friendly bundling, no third-party trackers by
default (consent-gated if added), form submissions via a vetted endpoint (no PHP mailer), pinned dependencies with
automated audit (`npm audit`/Dependabot), `security.txt`, and an official-domain + valid-cert deployment. Net effect:
the attack surface drops from "a full CMS" to "a CDN serving files."

---

## Appendix — evidence
Raw header dumps and endpoint responses captured under `_audit/` (e.g. `root_headers.txt`, `users_rest.json`).
All probes were unauthenticated `GET`/`HEAD`/`OPTIONS`/`TRACE` requests; no payloads were submitted.
