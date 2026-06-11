/**
 * Structural site configuration: navigation, brand, ministry contact.
 * Content/copy (home, about, directory records) lives in src/content & src/data,
 * populated from the real MLGRD site.
 */

/** Prefix a public asset path with the configured base path (for GitHub Pages). */
export const asset = (p: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${p}`;

export const ministry = {
  name: "Ministry of Local Government & Regional Development",
  shortName: "MLGRD",
  country: "Guyana",
  tagline: "Empowering communities through effective local democracy",
  address: "Fort Street, Georgetown, Guyana",
  phone: "+592-225-6088",
  email: "info@mlgrd.gov.gy",
  hours: "Monday – Friday, 08:00 – 16:30",
} as const;

export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/MLGRD.Guyana/" },
  { label: "Instagram", href: "https://www.instagram.com/mlgrdguyana/" },
  { label: "TikTok", href: "https://www.tiktok.com/@mlgrdguyana" },
] as const;

export type NavLink = { label: string; href: string; description?: string };
export type NavItem = NavLink & { children?: NavLink[] };

/** Primary navigation (main menu). Directories is a grouped mega-menu. */
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Directories",
    href: "/ndcs",
    children: [
      {
        label: "Neighbourhood Democratic Councils",
        href: "/ndcs",
        description: "All 70 NDCs across Guyana's ten regions",
      },
      {
        label: "Regional Democratic Councils",
        href: "/rdcs",
        description: "The ten Regional Democratic Councils",
      },
      {
        label: "Municipalities",
        href: "/municipalities",
        description: "Towns and municipal councils",
      },
      {
        label: "Community Development Councils",
        href: "/cdcs",
        description: "Active CDCs across the regions",
      },
      {
        label: "Book an REO Appointment",
        href: "/appointments",
        description: "Request a meeting with your Regional Executive Officer",
      },
    ],
  },
  { label: "Services", href: "/services" },
  { label: "What’s New", href: "/updates" },
  { label: "Laws & Policies", href: "/laws-policies" },
  { label: "News", href: "/news" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

/** Secondary links shown in the top utility bar. */
export const utilityNav: NavLink[] = [
  { label: "Minister's Desk", href: "/ministers-desk" },
  { label: "Helpdesk", href: "/helpdesk" },
  { label: "FAQ", href: "/faq" },
  { label: "Job Vacancies", href: "/vacancies" },
];

/** Footer link columns. */
export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Directories",
    links: [
      { label: "NDCs", href: "/ndcs" },
      { label: "RDCs", href: "/rdcs" },
      { label: "Municipalities", href: "/municipalities" },
      { label: "Community Development Councils", href: "/cdcs" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "Building Permits", href: "/services/building-permits" },
      { label: "Business Licences", href: "/services/business-licences" },
      { label: "Rates & Taxes", href: "/services/rates-and-taxes-guidance" },
      { label: "Report a Problem", href: "/services/reporting-local-problems" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "The Ministry", href: "/about" },
      { label: "What’s New", href: "/updates" },
      { label: "Minister's Desk", href: "/ministers-desk" },
      { label: "Gallery", href: "/gallery" },
      { label: "Laws & Policies", href: "/laws-policies" },
      { label: "News & Updates", href: "/news" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Helpdesk", href: "/helpdesk" },
      { label: "FAQ", href: "/faq" },
      { label: "Job Vacancies", href: "/vacancies" },
    ],
  },
];

/** Guyana's ten administrative regions (for directory grouping/filtering). */
export const regions: { id: number; name: string }[] = [
  { id: 1, name: "Barima-Waini" },
  { id: 2, name: "Pomeroon-Supenaam" },
  { id: 3, name: "Essequibo Islands-West Demerara" },
  { id: 4, name: "Demerara-Mahaica" },
  { id: 5, name: "Mahaica-Berbice" },
  { id: 6, name: "East Berbice-Corentyne" },
  { id: 7, name: "Cuyuni-Mazaruni" },
  { id: 8, name: "Potaro-Siparuni" },
  { id: 9, name: "Upper Takutu-Upper Essequibo" },
  { id: 10, name: "Upper Demerara-Berbice" },
];
