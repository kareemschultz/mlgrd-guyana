/**
 * Build-time barrel mapping each dataset key to its committed public records.
 * Used by the generic public directory page (server component) to seed initial
 * SSG content; the admin overlays live edits via the data layer.
 *
 * These JSON files are the PUBLIC-safe copies — sensitive fields (e.g. village
 * Toshao personal contacts) are stripped and live only in the D1 seed.
 */
import schools from "./schools.json";
import healthCentres from "./health-centres.json";
import policeStations from "./police-stations.json";
import amerindianVillages from "./amerindian-villages.json";
import burialGrounds from "./burial-grounds.json";
import developments2026 from "./developments-2026.json";
import tenders from "./tenders.json";
import resources from "./resources.json";
import staff from "./staff.json";

export type DatasetRecord = Record<string, string | number | string[] | undefined> & {
  id: string;
};

export const datasetRecords: Record<string, DatasetRecord[]> = {
  schools: schools as DatasetRecord[],
  "health-centres": healthCentres as DatasetRecord[],
  "police-stations": policeStations as DatasetRecord[],
  "amerindian-villages": amerindianVillages as DatasetRecord[],
  "burial-grounds": burialGrounds as DatasetRecord[],
  "developments-2026": developments2026 as DatasetRecord[],
  tenders: tenders as DatasetRecord[],
  resources: resources as DatasetRecord[],
  staff: staff as DatasetRecord[],
};
