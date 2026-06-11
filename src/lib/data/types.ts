/**
 * Shared content/data types for the MLGRD portal.
 *
 * These types are the single contract between three consumers:
 *  - the public site (news, gallery, minister's desk) — reads
 *  - the admin dashboard (/admin) — reads + writes
 *  - the backend (Cloudflare Pages Functions + D1, or the localStorage demo)
 *
 * Keep them backend-agnostic: the same shapes round-trip through both the
 * Cloudflare D1 adapter and the static localStorage demo adapter.
 */

export type ID = string;

export type PostStatus = "draft" | "published";

/** A news / announcement post. */
export interface Post {
  id: ID;
  slug: string;
  title: string;
  excerpt: string;
  /** Plain-text body; blank lines separate paragraphs. */
  body: string;
  /** e.g. "Legislation", "Capacity-building", "Digital services". */
  category: string;
  /** Freeform tags for search/filtering (e.g. ["Region 6", "REO", "flooding"]). */
  tags?: string[];
  /** Image URL, /public path, or a data: URL (demo mode). Optional. */
  coverImage?: string;
  /** Link to the original source / Facebook post for this story. Optional. */
  sourceUrl?: string;
  status: PostStatus;
  /** Display date, ISO `yyyy-mm-dd`. */
  date: string;
  createdAt: string;
  updatedAt: string;
}

/** A photo in the minister / ministry gallery. */
export interface GalleryItem {
  id: ID;
  title: string;
  caption?: string;
  /** Image URL or data: URL. */
  image: string;
  /** e.g. "Events", "Community", "Minister". */
  category?: string;
  date?: string;
  /** Manual ordering (ascending). */
  order: number;
  createdAt: string;
}

/** A minister or senior official shown on the Minister's Desk gallery. */
export interface Minister {
  id: ID;
  name: string;
  /** e.g. "Minister", "Permanent Secretary". */
  title: string;
  /** Portrait image URL or data: URL. */
  portrait?: string;
  /** Initials fallback when no portrait (e.g. "HM"). */
  initials?: string;
  bio?: string;
  /** Link to the official's page / profile / website. Optional. */
  profileUrl?: string;
  termStart?: string;
  termEnd?: string;
  /** True for the sitting minister/official; false for past holders. */
  current: boolean;
  order: number;
  createdAt: string;
}

export type MessageChannel = "helpdesk" | "contact";
export type MessageStatus = "new" | "open" | "resolved";

/** An inbound citizen message (helpdesk ticket or contact-form enquiry). */
export interface Message {
  id: ID;
  channel: MessageChannel;
  name: string;
  email: string;
  subject?: string;
  /** Helpdesk topic / contact reason. */
  category?: string;
  body: string;
  status: MessageStatus;
  createdAt: string;
}

/** An official within a directory entry (council/town leadership). */
export interface DirectoryOfficial {
  role: string;
  name: string;
  /** Institutional/office line (public-safe). */
  officePhone?: string;
  /** Personal mobile — SENSITIVE, admin/live-only, never in the committed seed. */
  personalPhone?: string;
  /** Personal email — SENSITIVE, admin/live-only. */
  email?: string;
}

export type DirectoryKind = "ndc" | "rdc" | "municipality" | "cdc";

/**
 * A local-government directory record (Neighbourhood/Regional Democratic Council,
 * municipality, or Community Development Council). The PUBLIC directories render a
 * curated safe subset (src/data/*.json); the admin manages the fuller record.
 */
export interface DirectoryEntry {
  id: ID;
  kind: DirectoryKind;
  region: string;
  regionName?: string;
  name: string;
  council?: string;
  /** CDCs: "active" | "inactive". */
  status?: string;
  officials: DirectoryOfficial[];
  officeAddress?: string;
  officePhone?: string;
  email?: string;
  facebook?: string;
  website?: string;
  /** Internal operational notes — SENSITIVE, admin/live-only. */
  comments?: string;
  createdAt: string;
}

export type PortalUpdateTone = "new" | "improved" | "notice" | "fixed";

/** A grouped block of bullet points within a portal update. */
export interface PortalUpdateSection {
  type: PortalUpdateTone;
  title: string;
  items: string[];
}

/**
 * A "What's New at the Ministry" entry (changelog/announcement). Managed in the
 * admin; the public Updates section renders these. `icon` is a lucide icon NAME
 * (e.g. "ShieldCheck") resolved to a component on render — components can't be
 * stored in a database.
 */
export interface PortalUpdate {
  id: ID;
  version: string;
  date: string;
  title: string;
  summary: string;
  icon: string;
  sections: PortalUpdateSection[];
  order: number;
  createdAt: string;
}

export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "declined"
  | "completed";

/**
 * A citizen's request to meet a Regional Executive Officer (REO). Submitted
 * from the public booking form; managed in the admin "Appointments" inbox.
 */
export interface Appointment {
  id: ID;
  /** e.g. "Region 4". */
  region: string;
  regionName?: string;
  /** The REO for that region (snapshot at booking time). */
  reoName: string;
  name: string;
  email: string;
  phone?: string;
  /** Preferred date, ISO `yyyy-mm-dd`. */
  date: string;
  /** Preferred time slot, e.g. "09:00–10:00". */
  time?: string;
  subject: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export type Collection =
  | "posts"
  | "gallery"
  | "ministers"
  | "messages"
  | "directory"
  | "updates"
  | "appointments";

/** Shape returned by the auth endpoint / demo login. */
export interface AuthResult {
  token: string;
  /** Epoch millis. */
  expiresAt: number;
}

/** Public, write-safe input shapes (server assigns id/timestamps). */
export type NewPost = Omit<Post, "id" | "createdAt" | "updatedAt">;
export type NewGalleryItem = Omit<GalleryItem, "id" | "createdAt">;
export type NewMinister = Omit<Minister, "id" | "createdAt">;
export type NewMessage = Omit<Message, "id" | "createdAt" | "status">;
export type NewDirectoryEntry = Omit<DirectoryEntry, "id" | "createdAt">;
export type NewPortalUpdate = Omit<PortalUpdate, "id" | "createdAt">;
export type NewAppointment = Omit<Appointment, "id" | "createdAt" | "status">;
