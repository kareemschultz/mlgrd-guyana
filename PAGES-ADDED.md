# Pages — ported vs. newly added

This rebuild ports **all real content** from the original MLGRD WordPress site and **adds the
pages that the original navigation linked to but never actually provided**, plus standard
government-site pages that were missing.

## Ported from the original site (real content preserved)

| Page | Route | Notes |
|---|---|---|
| Home | `/` | Hero, stats, services, directories, updates, CTA |
| About | `/about` | Mission, three-tier structure, legal framework |
| NDCs directory | `/ndcs` | **69 councils**, searchable + region filter |
| NDC detail | `/ndcs/[slug]` | 69 data-driven pages (leadership, region, contact) |
| RDCs | `/rdcs` | 10 Regional Democratic Councils |
| Municipalities | `/municipalities` | 10 towns/city |
| Services | `/services` | 6 service areas |
| Service detail | `/services/[slug]` | 6 data-driven pages (steps, documents, contact, online form) |
| Laws & Policies | `/laws-policies` | Searchable + category filter |
| Law detail | `/laws-policies/[slug]` | 9 acts/bills/regulations |

> The leftover **`/test-about/`** staging page from the original site was intentionally **dropped**.

## Newly added (missing from the original site)

| Page | Route | Why it was added |
|---|---|---|
| **Contact** | `/contact` | The original had no contact page; adds details + free OpenStreetMap map + an online form |
| **FAQ** | `/faq` | Linked in the original nav but had **no page**; 10 helpful Q&As |
| **Minister's Desk** | `/ministers-desk` | Linked in the original nav but had **no page** |
| **Helpdesk** | `/helpdesk` | Linked in the original nav but had **no page**; support channels + online form |
| **Job Vacancies** | `/vacancies` | Linked in the original nav but had **no page**; honest empty-state + recruitment info |
| **News & Updates** | `/news` | Home page had a "Latest Updates" section but no news page |
| **Privacy Policy** | `/privacy` | Required for a government site handling form submissions |
| **Accessibility Statement** | `/accessibility` | WCAG 2.1 AA commitment + how to report issues |
| **404 — Not Found** | any unknown route | Branded, helpful error page |

## Interactive form services

Two service pages include a **multi-step online form** (TanStack Form + Zod, animated, validated):

- `/services/reporting-local-problems` — *Report a Local Problem*
- `/services/vendor-and-supplier-enquiries` — *Vendor & Supplier Enquiry*

`/contact` and `/helpdesk` host the *Contact the Ministry* multi-step form.
