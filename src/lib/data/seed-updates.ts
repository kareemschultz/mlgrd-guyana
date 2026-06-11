/**
 * Seed for the "What's New at the Ministry" portal updates (changelog).
 * Managed in the admin; the public Updates section renders these. Mirrors
 * scripts/d1-seed.sql for live mode. `icon` is a lucide icon NAME.
 */
import type { PortalUpdate } from "./types";

export const seedUpdates: PortalUpdate[] = [
  {
    id: "update-2026-2",
    version: "2026.2",
    date: "June 2026",
    title: "Citizen service portal readiness",
    summary:
      "An update focused on safer online forms, clearer service pages, and a more reliable experience for citizens.",
    icon: "ShieldCheck",
    order: 0,
    createdAt: "2026-06-10T00:00:00.000Z",
    sections: [
      {
        type: "improved",
        title: "Public service journey",
        items: [
          "Service pages now place clearer next steps beside eligibility, requirements, and contact options.",
          "Homepage movement remains polished while keeping information easy to see on slow devices and for people who prefer less motion.",
          "Main buttons now make it easier to find a council, report a local problem, or contact the Ministry.",
        ],
      },
      {
        type: "fixed",
        title: "Reliability and ease of use",
        items: [
          "Public forms now surface delivery errors instead of showing a misleading success state.",
          "Field help and validation messages are linked to inputs for assistive technology.",
          "Number counters now show useful values for search engines and assistive technology.",
        ],
      },
    ],
  },
  {
    id: "update-2026-1",
    version: "2026.1",
    date: "May 2026",
    title: "Local authority directories expanded",
    summary:
      "Council directories and staff publishing tools were improved for citizens and Ministry teams.",
    icon: "Building2",
    order: 1,
    createdAt: "2026-05-15T00:00:00.000Z",
    sections: [
      {
        type: "new",
        title: "Directory coverage",
        items: [
          "Neighbourhood Democratic Councils, Regional Democratic Councils, and Municipalities are grouped into clearer directory journeys.",
          "Council detail pages provide regional context and easier navigation back to related authorities.",
        ],
      },
      {
        type: "improved",
        title: "Staff publishing workflow",
        items: [
          "The staff dashboard now highlights published posts, gallery items, minister profiles, and citizen messages.",
          "Recent activity helps staff see what changed without digging through every management table.",
        ],
      },
    ],
  },
  {
    id: "update-2026-0",
    version: "2026.0",
    date: "April 2026",
    title: "Digital services foundation",
    summary:
      "The first public portal structure for Ministry information, service guidance, notices, and citizen support.",
    icon: "Megaphone",
    order: 2,
    createdAt: "2026-04-01T00:00:00.000Z",
    sections: [
      {
        type: "new",
        title: "Public portal launch",
        items: [
          "Core Ministry pages, service guidance, laws and policies, news, vacancies, and helpdesk routes were established.",
          "Public gallery and Minister's Desk sections give citizens a more human view of Ministry work.",
        ],
      },
      {
        type: "notice",
        title: "Transparency foundations",
        items: [
          "The portal includes privacy, accessibility, FAQ, and official-contact pages to support public trust.",
          "Robots and sitemap routes are generated for better search visibility and indexing hygiene.",
        ],
      },
    ],
  },
];
