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
  /** Image URL, /public path, or a data: URL (demo mode). Optional. */
  coverImage?: string;
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

export type Collection = "posts" | "gallery" | "ministers" | "messages";

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
