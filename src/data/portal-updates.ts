/**
 * Presentation helpers for the public "What's New / Portal Updates" feature.
 *
 * The update CONTENT now lives in the data layer (admin-managed): the canonical
 * seed is `seedUpdates` in `@/lib/data/seed-updates`, overlaid at runtime by
 * `data.updates.list()`. The types are owned by `@/lib/data/types`.
 *
 * This module keeps only the view concerns: tone labels/classes and an
 * icon-NAME → lucide component resolver (icons can't be stored in a database, so
 * `PortalUpdate.icon` is a string like "ShieldCheck").
 */
import {
  Building2,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Wrench,
  Bell,
  Rocket,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

import { seedUpdates } from "@/lib/data/seed-updates";
import type {
  PortalUpdate,
  PortalUpdateSection,
  PortalUpdateTone,
} from "@/lib/data/types";

// Re-export the canonical types so existing importers keep working.
export type { PortalUpdate, PortalUpdateSection, PortalUpdateTone };

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

/**
 * Map a stored lucide icon NAME (e.g. "ShieldCheck") to its component. Falls
 * back to a sensible default so an unknown/empty name never breaks rendering.
 */
const UPDATE_ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  Building2,
  Megaphone,
  Sparkles,
  Wrench,
  Bell,
  Rocket,
  Newspaper,
};

export function updateIcon(name: string): LucideIcon {
  return UPDATE_ICONS[name] ?? Megaphone;
}

/** The lucide icon names the admin can pick from (keys of UPDATE_ICONS). */
export const updateIconNames = Object.keys(UPDATE_ICONS);

/**
 * The most recent update, derived from the seed. Kept for any consumer that
 * needs a static fallback; live pages overlay `data.updates.list()`.
 */
export const latestPortalUpdate: PortalUpdate | undefined = seedUpdates[0];
