import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { RdcDirectory } from "@/components/directory/rdc-directory";
import rdcs from "@/data/rdcs.json";

export const metadata: Metadata = {
  title: "Regional Democratic Councils (RDCs) Directory",
  description:
    "The ten Regional Democratic Councils of Guyana coordinate development, services and administration across each region. Find each RDC's officials and office contacts.",
};

export default function RdcsPage() {
  return (
    <>
      <PageHero
        eyebrow="Local Authorities"
        title="Regional Democratic Councils"
        lead="Guyana is divided into ten administrative regions, each governed by a Regional Democratic Council (RDC). Browse each council's officials, office address and contact details."
        crumbs={[{ label: "Directories" }, { label: "RDCs" }]}
      />
      <RdcDirectory rdcs={rdcs} />
    </>
  );
}
