# MLGRD Guyana Website Audit & Improvement Report

Date: 2026-06-10
Scope: public website, admin dashboard, source code, UI/UX, accessibility, performance, security, responsiveness, and deployment readiness.

## What was audited

- Public homepage and key public routes by browser inspection.
- Admin dashboard at `/admin/` using the provided demo credentials.
- Static export behaviour for GitHub Pages base path `/mlgrd-guyana`.
- Source code for auth, API validation, form handling, motion, accessibility, React Compiler lint issues, and maintainability.
- shadcn/studio Track changelog references and public registry availability.

## Critical issues addressed

1. **Admin API auth failed open in live mode**
   - Hardened API credential handling so live API mode requires explicit secrets instead of silently falling back to demo values.

2. **Public form could show success even when delivery failed**
   - Updated public multi-step form handling to surface delivery errors honestly.
   - Improved field error/help wiring with `aria-describedby`.

3. **Unvalidated public message API payloads**
   - Added validation, body-size limits, and safer request handling for message submissions.

4. **Reveal animation could make sections look blank**
   - Preserved motion but changed reveal content to start nearly visible instead of fully hidden.
   - This keeps the site polished without blank screenshot/slow-browser states.

5. **Animated counters rendered `0` as server output**
   - Counters now render meaningful final values for search engines, static output, and assistive technology.

## High-impact improvements implemented

- Added a public, citizen-friendly **“What’s New at the Ministry”** section.
- Promoted **“What’s New at the Ministry”** to a dedicated `/updates/` page for mobile and desktop users.
- Replaced the homepage timeline with a lighter teaser card and clear **View all updates** CTA.
- Added **What’s New** to main navigation and footer navigation.
- Replaced the oversized admin timeline with a compact staff-facing **Latest portal update** card.
- Added Playwright smoke tests for homepage CTA flow, updates page, helpdesk validation, and admin login on desktop and mobile.
- Converted gallery and minister portrait `<img>` usage to static-export-safe `next/image` with reserved dimensions/sizes.
- Added `/updates/` to the sitemap.
- Adapted the free/public shadcn/studio `timeline-component-05` pattern:
  - sticky date/version badges,
  - vertical timeline,
  - update cards,
  - shadcn accordion sections,
  - category badges for New, Improved, Notice, and Fixed.
- Rewrote update wording in plain language suitable for citizens and staff.
- Fixed React Compiler lint errors in several components.
- Removed brittle dynamic component patterns where needed.
- Improved mobile hook/sidebar/admin initial state patterns.
- Added deterministic skeleton/animation behaviour where previous code used unstable render-time values.

## Remaining recommendations

### Security
- Replace demo admin/localStorage authentication with a server-backed session model before using this dashboard for sensitive production content.
- Store operational secrets in an approved secret manager rather than GitHub repo/env fallbacks.
- Add rate limiting/CAPTCHA or abuse protection for public message/helpdesk endpoints if API mode is enabled.

### Performance
- Replace gallery and minister `<img>` usages with `next/image` or another image optimization strategy where compatible with static export.
- Review large data/image payloads on gallery pages.
- Keep Magic UI and motion effects focused on hero, updates, and meaningful transitions only.

### Accessibility
- Continue keyboard-only testing for admin tables, dialogs, and mobile navigation.
- Add automated axe checks to CI when practical.

### Maintainability
- Add a small Playwright smoke test suite covering homepage, admin login, service form validation, and mobile navigation.
- Consider moving public update content to a CMS/admin-editable source later, but keep the wording non-technical.

## Verification results

Commands run:

```bash
npm run lint
npx tsc --noEmit
NEXT_PUBLIC_BASE_PATH=/mlgrd-guyana npm run build
npm run test:smoke
```

Results:

- Lint: passed with 0 errors and 1 warning.
- Typecheck: passed.
- Build: passed.
- Static pages generated: 111.
- Playwright smoke tests: 8 passed across desktop and mobile.
- Tests cover homepage CTA flow, dedicated updates page, helpdesk validation, and admin login/dashboard update card.

Known warnings:

- TanStack Table is skipped by React Compiler because `useReactTable()` returns non-memoizable functions.

## Screenshot evidence

- Public “What’s New at the Ministry” section verified in static export preview.
- Admin compact “What’s New at the Ministry” block verified after demo login.
