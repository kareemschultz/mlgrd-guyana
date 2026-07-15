/**
 * Dataset registry — the single source of truth for the Ministry's reference
 * datasets (schools, health centres, villages, resources, etc.). Each entry
 * declares its columns, which are searchable, the region field for filtering,
 * and which fields are sensitive (excluded from the public/committed JSON).
 *
 * Add a dataset = one entry here + a committed JSON file in
 * `src/data/datasets/<key>.json`. The generic public directory page and the
 * admin dataset manager are both driven entirely by this registry, so nothing
 * else needs hand-coding per dataset.
 *
 * Public-vs-sensitive: the repo is PUBLIC. Fields marked `sensitive: true`
 * (e.g. an Amerindian village Toshao's personal mobile) must never appear in a
 * committed JSON file — they live only in the git-ignored D1 seed for live mode.
 */

export type DatasetColumnType = "text" | "number" | "textarea" | "date" | "url";

export interface DatasetColumn {
  key: string;
  label: string;
  type?: DatasetColumnType;
  /** The main title column (one per dataset). */
  primary?: boolean;
  /** Included in the free-text search. */
  searchable?: boolean;
  /** Rendered as a status/category badge. */
  badge?: boolean;
  /** Shown only in the expanded detail / admin form, not the table. */
  detail?: boolean;
  /** Personal/sensitive — excluded from committed JSON; live (D1) only. */
  sensitive?: boolean;
  /** For type "url": the link label (defaults to "Open"). */
  linkLabel?: string;
}

export interface DatasetDef {
  key: string;
  /** Plural display name, e.g. "Schools". */
  label: string;
  /** Singular, e.g. "School". */
  singular: string;
  description: string;
  /** lucide-react icon name. */
  icon: string;
  /** Public route, e.g. "/directories/schools". */
  route: string;
  /** Mega-menu group: "directory" or "resources". */
  navGroup: "directory" | "resources";
  /** Field holding the region label for the region filter (omit if none). */
  regionField?: string;
  columns: DatasetColumn[];
}

export const datasets: DatasetDef[] = [
  {
    key: "schools",
    label: "Schools",
    singular: "School",
    description:
      "Nursery, primary and secondary schools across Guyana's ten regions.",
    icon: "GraduationCap",
    route: "/directories/schools",
    navGroup: "directory",
    regionField: "region_name",
    columns: [
      { key: "name", label: "School", primary: true, searchable: true },
      { key: "school_type", label: "Type", badge: true, searchable: true },
      { key: "grade", label: "Grade", detail: true },
      { key: "region_name", label: "Region" },
      { key: "location", label: "Location", searchable: true },
      { key: "address", label: "Address", detail: true },
      { key: "contact", label: "Contact" },
    ],
  },
  {
    key: "health-centres",
    label: "Health Centres",
    singular: "Health Facility",
    description:
      "Hospitals, health centres and posts in the Ministry of Health network.",
    icon: "HeartPulse",
    route: "/directories/health-centres",
    navGroup: "directory",
    regionField: "region_name",
    columns: [
      { key: "name", label: "Facility", primary: true, searchable: true },
      { key: "facility_type", label: "Type", badge: true, searchable: true },
      { key: "region_name", label: "Region" },
      { key: "location", label: "Location", searchable: true },
      { key: "contact", label: "Contact" },
      { key: "services", label: "Services", detail: true },
      { key: "hours", label: "Hours", detail: true },
      { key: "address", label: "Address", detail: true },
    ],
  },
  {
    key: "police-stations",
    label: "Police Stations",
    singular: "Police Station",
    description: "Guyana Police Force stations and divisions by region.",
    icon: "ShieldCheck",
    route: "/directories/police-stations",
    navGroup: "directory",
    regionField: "region_name",
    columns: [
      { key: "name", label: "Station", primary: true, searchable: true },
      { key: "station_type", label: "Type", badge: true, searchable: true },
      { key: "region_name", label: "Region" },
      { key: "location", label: "Location", searchable: true },
      { key: "contact", label: "Contact" },
      { key: "notes", label: "Notes", detail: true },
    ],
  },
  {
    key: "amerindian-villages",
    label: "Amerindian Villages",
    singular: "Village",
    description:
      "Titled Amerindian and hinterland villages and their administrative regions.",
    icon: "TreePine",
    route: "/directories/amerindian-villages",
    navGroup: "directory",
    regionField: "region_name",
    columns: [
      { key: "village", label: "Village", primary: true, searchable: true },
      { key: "designation", label: "Leadership", badge: true },
      { key: "region_name", label: "Region" },
      { key: "subregion", label: "Sub-region", searchable: true },
      { key: "address", label: "Address", detail: true },
      // Sensitive — live (D1) only, never committed:
      { key: "leader_name", label: "Leader", sensitive: true, detail: true },
      { key: "contact", label: "Contact", sensitive: true, detail: true },
      { key: "notes", label: "Notes", detail: true },
    ],
  },
  {
    key: "burial-grounds",
    label: "Burial Grounds",
    singular: "Burial Ground",
    description: "Public burial grounds and their controlling authorities.",
    icon: "Landmark",
    route: "/directories/burial-grounds",
    navGroup: "directory",
    regionField: "region_name",
    columns: [
      { key: "name", label: "Burial ground", primary: true, searchable: true },
      { key: "control_type", label: "Control", badge: true },
      { key: "region_name", label: "Region" },
      { key: "ndc_name", label: "NDC", searchable: true },
      { key: "location", label: "Location", searchable: true },
    ],
  },
  {
    key: "developments-2026",
    label: "Development Projects",
    singular: "Project",
    description:
      "Planned and ongoing regional development projects for 2026.",
    icon: "Hammer",
    route: "/directories/developments-2026",
    navGroup: "resources",
    regionField: "region",
    columns: [
      { key: "title", label: "Project", primary: true, searchable: true },
      { key: "category", label: "Category", badge: true, searchable: true },
      { key: "status", label: "Status", badge: true },
      { key: "region", label: "Region" },
      { key: "location", label: "Location", searchable: true },
      { key: "year", label: "Year", type: "number", detail: true },
      { key: "summary", label: "Summary", type: "textarea", detail: true },
    ],
  },
  {
    key: "resources",
    label: "Resources & Downloads",
    singular: "Resource",
    description:
      "Acts, policies, forms and publications available to download.",
    icon: "FolderOpen",
    route: "/directories/resources",
    navGroup: "resources",
    columns: [
      { key: "title", label: "Resource", primary: true, searchable: true },
      { key: "category", label: "Category", badge: true, searchable: true },
      { key: "type", label: "Type", badge: true },
      { key: "department", label: "Department", searchable: true },
      { key: "year", label: "Year", type: "number" },
      { key: "size", label: "Size", detail: true },
      { key: "updated", label: "Updated", type: "date", detail: true },
      { key: "file", label: "Download", type: "url", linkLabel: "Download", detail: true },
      { key: "description", label: "Description", type: "textarea", detail: true },
    ],
  },
  {
    key: "staff",
    label: "Ministry Staff",
    singular: "Staff Member",
    description: "Senior officers and departments across the Ministry.",
    icon: "Users",
    route: "/directories/staff",
    navGroup: "resources",
    columns: [
      { key: "name", label: "Name", primary: true, searchable: true },
      { key: "title", label: "Title", searchable: true },
      { key: "department", label: "Department", badge: true, searchable: true },
      { key: "email", label: "Email", type: "url" },
      { key: "phone", label: "Phone" },
      { key: "bio_short", label: "About", type: "textarea", detail: true },
      { key: "bio_long", label: "Full bio", type: "textarea", detail: true },
    ],
  },
];

export function getDataset(key: string): DatasetDef | undefined {
  return datasets.find((d) => d.key === key);
}

/** Columns safe to render publicly (excludes sensitive fields). */
export function publicColumns(def: DatasetDef): DatasetColumn[] {
  return def.columns.filter((c) => !c.sensitive);
}

/** Columns shown in the compact table (primary + non-detail, non-sensitive). */
export function tableColumns(def: DatasetDef): DatasetColumn[] {
  return def.columns.filter((c) => !c.detail && !c.sensitive);
}
