/**
 * Seed content for the data layer.
 *
 * Used in two places:
 *  - the localStorage demo adapter seeds these on first run (GitHub Pages / no backend);
 *  - the Cloudflare D1 schema seed (scripts/d1-seed.sql) mirrors the same records.
 *
 * Content is REAL ministry material sourced from the Department of Public Information
 * (dpi.gov.gy) and the ministry's official channels — images are hotlinked to the DPI
 * CDN for the demo; in production these would be re-uploaded to the ministry's own
 * storage (R2). Manage/replace all of this from the admin — never hard-code it in pages.
 */
import type { GalleryItem, Minister, Post } from "./types";

const IMG = "https://i0.wp.com/dpi.gov.gy/wp-content/uploads";
const q = "?w=1000&quality=82&ssl=1";

export const seedPosts: Post[] = [
  {
    id: "post-pathway-workers",
    slug: "pathway-workers-programme-employs-over-17000",
    title: "Pathway Workers Programme employs over 17,000",
    excerpt:
      "The Government's National Pathway Workers Programme has employed 17,450 persons across Guyana as of 31 October 2025.",
    body: "The Government's National Pathway Workers Programme has employed a total of 17,450 persons across Guyana as of October 31, 2025. The programme continues to provide income support and community-based work opportunities in every region.\n\nThrough the Ministry of Local Government and Regional Development, the initiative places workers with local democratic organs to support cleaning, maintenance and community projects.",
    category: "Programmes",
    coverImage: `${IMG}/2026/06/WhatsApp-Image-2026-06-05-at-15.43.23.jpeg${q}`,
    sourceUrl: "https://dpi.gov.gy/pathway-workers-programme-employs-over-17000/",
    tags: ["Programmes", "Employment", "Pathway Workers"],
    status: "published",
    date: "2026-06-09",
    createdAt: "2026-06-09T12:00:00.000Z",
    updatedAt: "2026-06-09T12:00:00.000Z",
  },
  {
    id: "post-ret-programme",
    slug: "over-19000-guyanese-benefitted-from-ret-programme",
    title: "Over 19,000 Guyanese benefitted from RET programme",
    excerpt:
      "More than 19,000 Guyanese have so far benefitted from the Government's Regional Economic Transformation (RET) programme.",
    body: "More than 19,000 Guyanese have so far benefitted from the Government's Regional Economic Transformation (RET) programme. The programme supports community development and local economic activity across the regions.\n\nThe Ministry continues to work with Regional Democratic Councils to expand the reach of the programme and bring development closer to communities.",
    category: "Programmes",
    coverImage: `${IMG}/2026/06/716799478_1463585782472714_4111538104565724208_n.jpg${q}`,
    sourceUrl: "https://dpi.gov.gy/over-19000-guyanese-benefitted-from-ret-programme/",
    tags: ["Programmes", "RET", "Economy"],
    status: "published",
    date: "2026-06-08",
    createdAt: "2026-06-08T12:00:00.000Z",
    updatedAt: "2026-06-08T12:00:00.000Z",
  },
  {
    id: "post-region6-flooding",
    slug: "region-six-prepared-to-respond-to-potential-flooding-impacts",
    title: "Region Six prepared to respond to potential flooding impacts",
    excerpt:
      "Regional Executive Officer of Region Six, Ronald Harsawack, says the region is ready to respond to potential flooding.",
    body: "Regional Executive Officer (REO) of Region Six, Ronald Harsawack, has assured residents that the region is prepared to respond to potential flooding impacts. Drainage and irrigation systems are being monitored as part of ongoing readiness efforts.\n\nThe Ministry of Local Government and Regional Development continues to support the regions in disaster preparedness and response.",
    category: "Regional Development",
    coverImage: `${IMG}/2026/06/716799478_1463585782472714_4111538104565724208_n.jpg${q}`,
    sourceUrl: "https://dpi.gov.gy/region-six-prepared-to-respond-to-potential-flooding-impacts/",
    tags: ["Region 6", "Flooding", "Disaster Preparedness"],
    status: "published",
    date: "2026-06-07",
    createdAt: "2026-06-07T12:00:00.000Z",
    updatedAt: "2026-06-07T12:00:00.000Z",
  },
  {
    id: "post-lgc-legalities",
    slug: "government-to-upkeep-all-legalities-for-local-govt-commission",
    title: "Government to uphold all legalities for the Local Government Commission",
    excerpt:
      "Minister Manickchand assured the National Assembly that all legal obligations under her ministry will be met.",
    body: "Minister of Local Government and Regional Development, Hon. Priya Manickchand, MP, assured the National Assembly that all legal obligations falling under her ministry will be complied with, responding to questions regarding the Local Government Commission.\n\nThe Minister reaffirmed the Government's commitment to the lawful and transparent administration of local government bodies.",
    category: "Governance",
    coverImage: `${IMG}/2026/06/WhatsApp-Image-2026-06-05-at-15.43.22.jpeg${q}`,
    sourceUrl: "https://dpi.gov.gy/government-to-upkeep-all-legalities-for-local-govt-commission-min-manickchand/",
    tags: ["Governance", "Local Government Commission", "Minister"],
    status: "published",
    date: "2026-06-05",
    createdAt: "2026-06-05T12:00:00.000Z",
    updatedAt: "2026-06-05T12:00:00.000Z",
  },
  {
    id: "post-anti-littering",
    slug: "govt-steps-up-anti-littering-efforts",
    title: "Gov't steps up anti-littering efforts to promote a cleaner Guyana",
    excerpt:
      "The Guyana Police Force and the Environmental Protection Agency are enforcing stricter measures against littering.",
    body: "The Government has stepped up anti-littering efforts to promote a cleaner Guyana, with the Guyana Police Force and the Environmental Protection Agency enforcing stricter measures against littering.\n\nThe Ministry of Local Government and Regional Development is encouraging communities and councils to support a cleaner, healthier environment.",
    category: "Environment",
    coverImage: `${IMG}/2026/06/10.jpeg${q}`,
    sourceUrl: "https://dpi.gov.gy/govt-steps-up-anti-littering-efforts-to-promote-a-cleaner-guyana/",
    tags: ["Environment", "Sanitation", "Clean Guyana"],
    status: "published",
    date: "2026-06-03",
    createdAt: "2026-06-03T12:00:00.000Z",
    updatedAt: "2026-06-03T12:00:00.000Z",
  },
  {
    id: "post-region4-reo",
    slug: "new-region-four-reo-vows-people-centred-accountable-leadership",
    title: "New Region Four REO vows people-centred, accountable leadership",
    excerpt:
      "The newly appointed Regional Executive Officer for Region Four pledged a people-centred, accountable administration.",
    body: "The newly appointed Regional Executive Officer (REO) for Region Four has pledged a people-centred and accountable approach to regional administration, committing to improved service delivery and responsiveness to residents' needs.\n\nThe appointment is part of a wider strengthening of leadership across the regions.",
    category: "Local Democracy",
    coverImage: `${IMG}/2026/05/704851274_122185917350891430_1144678879230800056_n-e1779660778741.jpg${q}`,
    sourceUrl: "https://dpi.gov.gy/new-region-four-reo-vows-people-centred-accountable-leadership/",
    tags: ["Region 4", "REO", "Appointments"],
    status: "published",
    date: "2026-05-24",
    createdAt: "2026-05-24T12:00:00.000Z",
    updatedAt: "2026-05-24T12:00:00.000Z",
  },
  {
    id: "post-region8-diversify",
    slug: "region-eight-residents-urged-to-diversify-economy",
    title: "Region Eight residents urged to diversify economy through agriculture, tourism",
    excerpt:
      "Residents of Region Eight were urged to diversify their local economy through agriculture and tourism.",
    body: "Residents of Region Eight have been urged to diversify their local economy through agriculture and tourism, highlighting opportunities to build sustainable livelihoods in the hinterland region.\n\nThe Ministry continues to support regional economic transformation across all ten administrative regions.",
    category: "Regional Development",
    coverImage: `${IMG}/2026/05/WhatsApp-Image-2026-05-24-at-1.20.51-PM.jpeg${q}`,
    sourceUrl: "https://dpi.gov.gy/region-eight-residents-urged-to-diversify-economy-through-agriculture-tourism/",
    tags: ["Region 8", "Agriculture", "Tourism", "Economy"],
    status: "published",
    date: "2026-05-24",
    createdAt: "2026-05-24T11:00:00.000Z",
    updatedAt: "2026-05-24T11:00:00.000Z",
  },
  {
    id: "post-reo-rooplall",
    slug: "resolving-residents-everyday-concerns-is-paramount-reo-rooplall",
    title: "Resolving residents' everyday concerns is paramount – REO Rooplall",
    excerpt:
      "The newly appointed REO for Region Two, Deolall Rooplall, said resolving residents' everyday concerns is paramount.",
    body: "The newly appointed Regional Executive Officer (REO) for Region Two, Deolall Rooplall, said resolving residents' everyday concerns is paramount, committing to a hands-on approach to local administration.\n\nThe Ministry of Local Government and Regional Development continues to engage regional officers to improve service delivery.",
    category: "Local Democracy",
    coverImage: `${IMG}/2026/05/WhatsApp-Image-2026-05-20-at-11.08.39.jpeg${q}`,
    sourceUrl: "https://dpi.gov.gy/resolving-residents-everyday-concerns-is-paramount-reo-rooplall/",
    tags: ["Region 2", "REO", "Service Delivery"],
    status: "published",
    date: "2026-05-20",
    createdAt: "2026-05-20T12:00:00.000Z",
    updatedAt: "2026-05-20T12:00:00.000Z",
  },
  {
    id: "post-reos-appointed",
    slug: "press-release-regional-executive-officers-appointed",
    title: "Press Release: Regional Executive Officers appointed",
    excerpt:
      "The President of Guyana approved the appointment of new Regional Executive Officers across the administrative regions.",
    body: "The President of Guyana has approved the appointment of new Regional Executive Officers (REOs) across the administrative regions. The appointments aim to strengthen regional administration and service delivery.\n\nThe Ministry of Local Government and Regional Development welcomes the new officers to their roles.",
    category: "Press Release",
    coverImage: `${IMG}/2026/05/5-e1779153337600.png${q}`,
    sourceUrl: "https://dpi.gov.gy/press-release-regional-executive-officers-appointed/",
    tags: ["Appointments", "REO", "Press Release"],
    status: "published",
    date: "2026-05-17",
    createdAt: "2026-05-17T12:00:00.000Z",
    updatedAt: "2026-05-17T12:00:00.000Z",
  },
  {
    id: "post-minister-assumes-office",
    slug: "min-manickchand-assumes-office",
    title: "Minister Manickchand assumes office at the Ministry",
    excerpt:
      "Hon. Priya Manickchand officially assumed office as Minister of Local Government and Regional Development.",
    body: "Hon. Priya Manickchand, MP, officially assumed office as Minister of Local Government and Regional Development. She was accompanied by Pauline Sukhai, who serves as Minister within the Ministry, and Director-General Anand Persaud.\n\nMinister Manickchand was welcomed by the staff of the Ministry, who pledged their full support as the new leadership takes office, with a mandate to strengthen local governance and advance regional development.",
    category: "Press Release",
    coverImage: `${IMG}/2025/09/547983471_1109632137997077_619129028257987321_n-1.jpg${q}`,
    sourceUrl: "https://dpi.gov.gy/min-manickchand-assumes-office-at-local-government-ministry/",
    tags: ["Minister", "Leadership", "Press Release"],
    status: "published",
    date: "2025-09-15",
    createdAt: "2025-09-15T12:00:00.000Z",
    updatedAt: "2025-09-15T12:00:00.000Z",
  },
];

export const seedMinisters: Minister[] = [
  {
    id: "minister-manickchand",
    name: "Hon. Priya Manickchand, MP",
    title: "Minister of Local Government & Regional Development",
    portrait: `${IMG}/2025/09/547983471_1109632137997077_619129028257987321_n-1.jpg${q}`,
    initials: "PM",
    bio: "Hon. Priya Manickchand, MP, assumed office as Minister of Local Government and Regional Development in September 2025. She leads the Ministry's mandate to strengthen local governance, empower communities and advance regional development across Guyana.",
    profileUrl: "https://www.facebook.com/LocalGovGuyana",
    termStart: "2025",
    termEnd: "",
    current: true,
    order: 0,
    createdAt: "2025-09-15T00:00:00.000Z",
  },
  {
    id: "minister-sukhai",
    name: "Hon. Pauline Sukhai, MP",
    title: "Minister within the Ministry",
    initials: "PS",
    bio: "Hon. Pauline Sukhai, MP, serves as Minister within the Ministry of Local Government and Regional Development, supporting the Ministry's programmes and community development work across the regions.",
    profileUrl: "https://www.facebook.com/LocalGovGuyana",
    termStart: "2025",
    termEnd: "",
    current: true,
    order: 1,
    createdAt: "2025-09-15T00:00:00.000Z",
  },
  {
    id: "official-dg-persaud",
    name: "Anand Persaud",
    title: "Director-General",
    initials: "AP",
    bio: "Anand Persaud serves as Director-General of the Ministry of Local Government and Regional Development, supporting the administration of its programmes, planning and accountability across the ten regions.",
    termStart: "",
    termEnd: "",
    current: true,
    order: 2,
    createdAt: "2025-09-15T00:00:00.000Z",
  },
];

export const seedGallery: GalleryItem[] = [
  {
    id: "gal-minister-office",
    title: "Minister Manickchand assumes office",
    caption: "Hon. Priya Manickchand is welcomed by ministry staff as she takes office.",
    image: `${IMG}/2025/09/547983471_1109632137997077_619129028257987321_n-1.jpg${q}`,
    category: "Leadership",
    date: "2025-09-15",
    order: 0,
    createdAt: "2025-09-15T00:00:00.000Z",
  },
  {
    id: "gal-ndcs-servants",
    title: "'NDCs are servants of the people'",
    caption: "The Minister engages Neighbourhood Democratic Councils on their responsibilities to residents.",
    image: `${IMG}/2025/10/547946019_1144521707841453_3724198826552246963_n.jpg${q}`,
    category: "Engagements",
    date: "2025-10-20",
    order: 1,
    createdAt: "2025-10-20T00:00:00.000Z",
  },
  {
    id: "gal-region2-rdc",
    title: "Engagement with Region 2 RDC",
    caption: "Minister Manickchand meets the Regional Democratic Council of Pomeroon-Supenaam.",
    image: `${IMG}/2025/10/568326750_1144311641195793_2125096446999873729_n.jpg${q}`,
    category: "Engagements",
    date: "2025-10-21",
    order: 2,
    createdAt: "2025-10-21T00:00:00.000Z",
  },
  {
    id: "gal-region6-flood",
    title: "Region Six flood preparedness",
    caption: "Regional officers monitor drainage and readiness ahead of the rainy season.",
    image: `${IMG}/2026/06/716799478_1463585782472714_4111538104565724208_n.jpg${q}`,
    category: "Regional",
    date: "2026-06-07",
    order: 3,
    createdAt: "2026-06-07T00:00:00.000Z",
  },
  {
    id: "gal-anti-litter",
    title: "A cleaner Guyana",
    caption: "Anti-littering enforcement to promote cleaner communities across the country.",
    image: `${IMG}/2026/06/10.jpeg${q}`,
    category: "Community",
    date: "2026-06-03",
    order: 4,
    createdAt: "2026-06-03T00:00:00.000Z",
  },
  {
    id: "gal-reos-appointed",
    title: "New Regional Executive Officers",
    caption: "Newly appointed REOs take up office to strengthen regional administration.",
    image: `${IMG}/2026/05/5-e1779153337600.png${q}`,
    category: "Leadership",
    date: "2026-05-17",
    order: 5,
    createdAt: "2026-05-17T00:00:00.000Z",
  },
];

/**
 * Admin credentials for the localStorage showcase (GitHub Pages) only.
 * On Cloudflare the live backend verifies a hashed password from env/D1 — this
 * is never real security.
 */
export const demoAdmin = {
  username: "admin",
  password: "mlgrd2026",
};
