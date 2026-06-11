/**
 * Regional Executive Officer (REO) options, derived from the committed RDC
 * directory (`src/data/rdcs.json`). Each region's REO is the official whose
 * role starts with "Regional Executive Officer". Regions with no named REO are
 * skipped. Used by the public REO-appointment booking form.
 */
import rdcs from "@/data/rdcs.json";

export interface ReoOption {
  /** e.g. "Region 4". */
  region: string;
  /** Region (geographic) name, e.g. "Demerara-Mahaica". */
  regionName: string;
  /** The sitting Regional Executive Officer's name. */
  reoName: string;
}

interface RdcOfficial {
  role: string;
  name: string;
}
interface RdcEntry {
  region: string;
  name: string;
  officials: RdcOfficial[];
}

/** All regions that have a named REO, in source (Region 1…10) order. */
export const reoOptions: ReoOption[] = (rdcs as RdcEntry[])
  .map((rdc) => {
    const reo = rdc.officials.find((o) =>
      o.role.startsWith("Regional Executive Officer"),
    );
    const reoName = reo?.name?.trim() ?? "";
    if (!reoName) return null;
    return {
      region: rdc.region,
      regionName: rdc.name,
      reoName,
    } satisfies ReoOption;
  })
  .filter((o): o is ReoOption => o !== null);

/** Look up an REO option by region key (e.g. "Region 4"). */
export function reoByRegion(region: string): ReoOption | undefined {
  return reoOptions.find((o) => o.region === region);
}

/** Office-hours time slots offered for an REO appointment. */
export const TIME_SLOTS = [
  "09:00–10:00",
  "10:00–11:00",
  "11:00–12:00",
  "13:00–14:00",
  "14:00–15:00",
  "15:00–16:00",
] as const;
