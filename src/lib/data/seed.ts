/**
 * Seed content for the data layer.
 *
 * This is the canonical starting content for the portal. It is used in two places:
 *  - the localStorage demo adapter seeds these on first run (GitHub Pages / no backend);
 *  - the Cloudflare D1 schema seed (scripts/d1-seed.sql) mirrors the same records so the
 *    live backend starts with identical content.
 *
 * Public pages also import these as their SSG/initial render, so the site shows real
 * content instantly and then hydrates with any live updates from the backend.
 */
import type { GalleryItem, Minister, Post } from "./types";

const now = "2026-01-01T00:00:00.000Z";

export const seedPosts: Post[] = [
  {
    id: "post-solid-waste-bill",
    slug: "draft-solid-waste-management-bill-consultation",
    title: "Draft Integrated Solid Waste Management Bill open for consultation",
    excerpt:
      "The Ministry has published the draft Integrated Solid Waste Management Bill 2026 for public consultation.",
    body: "The Ministry has published the draft Integrated Solid Waste Management Bill 2026 for public consultation. The proposed framework aims to modernise how waste is collected, managed and recycled across the country.\n\nCitizens, councils and stakeholders are invited to review the draft and share their feedback during the consultation period.",
    category: "Legislation",
    status: "published",
    date: "2026-03-12",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "post-lgc-capacity",
    slug: "local-government-commission-strengthens-regional-capacity",
    title: "Local Government Commission strengthens regional capacity",
    excerpt:
      "Capacity-building initiatives are underway to support the Local Government Commission and councils across the regions.",
    body: "Capacity-building initiatives are underway to support the Local Government Commission and councils across the regions. The programme focuses on improving administration, planning and accountability so that local democratic organs can deliver services more effectively to the communities they serve.",
    category: "Capacity-building",
    status: "published",
    date: "2026-02-20",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "post-report-online",
    slug: "report-a-local-problem-online",
    title: "Report a local problem online through the Ministry portal",
    excerpt:
      "Citizens can now report local issues — such as roads, drainage and sanitation — online through the Ministry portal.",
    body: "Citizens can now report local issues — such as roads, drainage and sanitation — online through the Ministry portal. The new digital service makes it easier to flag problems and route them to the responsible local authority, helping communities get faster, more transparent responses.",
    category: "Digital services",
    status: "published",
    date: "2026-02-04",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "post-community-projects",
    slug: "community-development-projects-expand",
    title: "Community development projects expand across the regions",
    excerpt:
      "Community development projects are expanding across Guyana's regions, including support for hinterland communities.",
    body: "Community development projects are expanding across Guyana's regions, including support for hinterland communities. These initiatives partner with local councils and residents to improve infrastructure, public spaces and livelihoods, bringing tangible benefits closer to where people live.",
    category: "Community development",
    status: "published",
    date: "2026-01-15",
    createdAt: now,
    updatedAt: now,
  },
];

export const seedMinisters: Minister[] = [
  {
    id: "minister-current",
    name: "The Hon. Minister",
    title: "Minister of Local Government & Regional Development",
    initials: "HM",
    bio: "Leading the Ministry's work to deepen local democracy, strengthen councils and bring development closer to every community in Guyana.",
    termStart: "2020",
    termEnd: "",
    current: true,
    order: 0,
    createdAt: now,
  },
  {
    id: "official-ps",
    name: "Permanent Secretary",
    title: "Permanent Secretary",
    initials: "PS",
    bio: "Senior administrative head supporting the Ministry's programmes, planning and accountability across the ten regions.",
    termStart: "",
    termEnd: "",
    current: true,
    order: 1,
    createdAt: now,
  },
];

export const seedGallery: GalleryItem[] = [
  {
    id: "gal-council-visit",
    title: "Council capacity-building session",
    caption: "Regional officers at a planning and accountability workshop.",
    image: "",
    category: "Capacity-building",
    date: "2026-02-18",
    order: 0,
    createdAt: now,
  },
  {
    id: "gal-community-project",
    title: "Community development project",
    caption: "Infrastructure works improving public spaces in the regions.",
    image: "",
    category: "Community",
    date: "2026-01-22",
    order: 1,
    createdAt: now,
  },
  {
    id: "gal-consultation",
    title: "Public consultation",
    caption: "Citizens and stakeholders engaging on new local-government policy.",
    image: "",
    category: "Events",
    date: "2026-03-10",
    order: 2,
    createdAt: now,
  },
];

/**
 * Demo admin credentials (localStorage / GitHub Pages showcase only).
 * On Cloudflare these are NOT used — the live backend verifies a hashed
 * password stored in env/D1. Never treat this as real security.
 */
export const demoAdmin = {
  username: "admin",
  password: "mlgrd2026",
};
