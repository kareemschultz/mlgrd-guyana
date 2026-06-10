# MLGRD Portal — Scrape Notes

Source: `https://kishanac4.sg-host.com/` (WordPress staging clone of the Guyana Ministry of
Local Government & Regional Development site). Scraped for a faithful rebuild — all content below
is taken verbatim from the live pages; nothing was invented.

## Real ministry contact (used site-wide in the footer)
- **Name:** Ministry of Local Government & Regional Development (MLGRD), Government of Guyana
- **Address:** Fort Street, Georgetown, Guyana
- **Phone:** +592-225-6088
- **Email:** info@mlgrd.gov.gy
- **Footer:** "© 2026 Ministry of Local Government & Regional Development. All rights reserved."

This address/phone/email is the generic ministry contact and is echoed on EVERY page (including
each NDC detail page and every service/law page). It is NOT council-specific — see NDC note below.

## Page-by-page richness

| Page | Status | Notes |
|------|--------|-------|
| `/` (home) | Rich | Hero headline+subtext, 4 stat counters (animate from 0 on live site — Administrative Regions, NDCs & Municipalities, Digital Services, Commitment %), 3 service cards, "Community Directories" list (Burial Grounds, Health Centres, Schools, Hinterland Support Contacts), footer. |
| `/about-us/` | Rich | "About Local Government" — mission, three-tier structure with real counts (10 RDCs, 10 municipalities named, 70+ NDCs), legal basis (Local Democratic Organs Act 28:09). |
| `/ndcs/` | Rich | The most valuable index. Lists all 69 NDCs **grouped by region** (Regions 1,2,3,4,5,6,9,10 — no NDCs listed for Regions 7 & 8). Site claims "70 records". |
| `/rdcs/` | **Stub** | No council data rendered. Only nav + repeated "RDCs" heading + footer. Built rdcs.json from the 10 official regions (Region names sourced from /about-us and standard Guyana administrative regions). |
| `/municipalities/` | **Stub** | No municipality listings render (template/rendering bug — heading repeats 17+ times; mobile screenshot is 7.7 MB due to the repetition). Built municipalities.json from the 10 towns explicitly named on /about-us. |
| `/services/` | Rich | 5 services listed with summaries (vendor-and-supplier-enquiries is a 6th service page not shown on the index but live + in sitemap). |
| `/laws-policies/` | Rich | All 9 acts/bills with chapter numbers, status (In Force / Draft), category, and summaries. |
| NDC detail pages (×69) | Moderate | Each has Council Name, Region, Chairperson, Deputy, Overseer, and an Office Contact Number. See note below. |
| Service detail pages (×6) | Rich | Each has title, summary, 3 numbered steps, office to approach; most list required documents. |
| Law detail pages (×9) | Sparse-Moderate | Title, chapter, year (in brackets, e.g. [1998]), status, category, one-line summary. Full statutory text is only in linked PDFs, not on-page. |

## NDC detail pages — field pattern (important for rebuild)
Each NDC page exposes these REAL per-council fields:
- **Council Name**, **Region**, **Chairperson**, **Deputy** (most), **Overseer** (most),
  **Office Contact Number** (a council-specific landline/mobile).

Fields commonly MISSING (left out of JSON rather than invented):
- **Clerk** — never listed on any NDC page.
- **Council-specific address / email** — none; every page shows only the generic ministry
  Fort Street address + +592-225-6088 + info@mlgrd.gov.gy.
- **Villages/communities covered** — not listed on any NDC page (the council name itself encodes
  the constituent villages, e.g. "Charity / Urasara").
- **Description / summary** — none.

### Office number caveat
On ~9 NDC pages the "Office Contact Number" is shown as **+592-225-6088** — this is the generic
ministry number used as a fallback where the council has no published direct line. In ndcs.json
those councils have the `officeNumber` field **omitted** (to avoid implying a direct council line):
evergreen-paradise, aberdeen-zorg-en-vlygt, moruka-providence, nile-cozier, good-hope-pomona,
hydronie-good-hope, lamaha-yarowkabra (number absent there too), no-64-74, plegt-anker-kortberaadt,
wyburg-caracas, aranaputa-upper-burro-burro. All councils WITH a distinct direct number keep it.

### Acting / variant titles preserved verbatim
- "(a.g)" acting markers kept on chairpersons (e.g. Eccles/Ramsburg "Ramesh Persaud (a.g)").
- Acting overseers noted (Charity/Urasara, Mon Repos).
- A few councils list an extra **Assistant Overseer** (Buxton/Foulis, Adventure/Bushlot,
  Crabwood Creek/Moleson) — captured as `contact.assistantOverseer`.

## Region structure (real)
NDCs exist in Regions 1, 2, 3, 4, 5, 6, 9, 10. Region 1 and Region 9 each have only 1 NDC in the
directory; Region 10 has only Kwakwani. Regions 7 & 8 have no NDCs in the directory.
Region names (Region 7 = Cuyuni-Mazaruni, Region 8 = Potaro-Siparuni) were filled into rdcs.json
from standard Guyana administrative geography since the RDC index is a stub; Regions 1-6,9,10 names
are confirmed by the NDC index headings.

## 404s / errors
- None. Every URL in the sitemap and every requested page resolved (HTTP 200).
- The RDCs and Municipalities pages are live but content-empty (stubs/rendering bug), not 404s.

## Counts captured
- ndcs.json: 69 councils (sitemap contained 69 NDC post slugs; the /ndcs index "70 records" is the
  site's own rounded count).
- rdcs.json: 10 regional councils.
- municipalities.json: 10 towns/city.
- laws.json: 9 acts/bills.
- services.json: 6 service guidance pages.
- site.json: ministry contact, nav, home hero/stats/sections, about mission/structure.

## Screenshots
20 PNGs in `_reference/screenshots/` — desktop (1440×900) and mobile (390×844), full-page:
home, about, ndcs, rdcs, municipalities, services, laws-policies (7 main) +
ndc-detail-wakenaam, service-building-permits, law-town-country-planning (3 representative details).

## Notable for rebuild
- The nav on the live site is: Home · About Us · Directories (NDCs/RDCs/Municipalities) ·
  Services · FAQ · Laws & Policies · Minister's Desk · Helpdesk. (FAQ, Minister's Desk and Helpdesk
  pages were not in scope/sitemap-post-1 and were not scraped — flag if the rebuild needs them.)
- Stat counters render as "0" on first paint (JS count-up animation); use real totals in the rebuild.
- Law titles on detail pages append the revision year in brackets, e.g. "Chapter 20:01 [1998]".
