import { Building2, Megaphone, ShieldCheck, type LucideIcon } from "lucide-react";

export type PortalUpdateTone = "new" | "improved" | "notice" | "fixed";

export type PortalUpdateSection = {
  type: PortalUpdateTone;
  title: string;
  items: string[];
};

export type PortalUpdate = {
  version: string;
  date: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  sections: PortalUpdateSection[];
};

export const portalUpdates: PortalUpdate[] = [
  {
    version: "2026.2",
    date: "June 2026",
    title: "Citizen service portal readiness",
    summary:
      "An update focused on safer online forms, clearer service pages, and a more reliable experience for citizens.",
    icon: ShieldCheck,
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
    version: "2026.1",
    date: "May 2026",
    title: "Local authority directories expanded",
    summary:
      "Council directories and staff publishing tools were improved for citizens and Ministry teams.",
    icon: Building2,
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
    version: "2026.0",
    date: "April 2026",
    title: "Digital services foundation",
    summary:
      "The first public portal structure for Ministry information, service guidance, notices, and citizen support.",
    icon: Megaphone,
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

export const updateToneLabels: Record<PortalUpdateTone, string> = {
  new: "New",
  improved: "Improved",
  notice: "Notice",
  fixed: "Fixed",
};

export const updateToneClasses: Record<PortalUpdateTone, string> = {
  new: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  improved: "bg-brand/10 text-brand-700 border-brand/20",
  notice: "bg-gold/15 text-[#8a6500] border-gold/25",
  fixed: "bg-flag-red/10 text-flag-red border-flag-red/20",
};

export const latestPortalUpdate = portalUpdates[0];
