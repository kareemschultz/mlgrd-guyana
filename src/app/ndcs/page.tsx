import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { NdcDirectory } from "@/components/directory/ndc-directory";
import ndcs from "@/data/ndcs.json";

export const metadata: Metadata = {
  title: "Neighbourhood Democratic Councils (NDCs) Directory",
  description:
    "Search and browse all Neighbourhood Democratic Councils across Guyana's ten administrative regions. Filter by region and find each NDC's leadership and contact details.",
};

export default function NdcsPage() {
  return (
    <>
      <PageHero
        eyebrow="Local Authorities"
        title="Neighbourhood Democratic Councils"
        lead={`Find your NDC among ${ndcs.length} councils across Guyana. Search by name, filter by region, and view leadership and contact information for each council.`}
        crumbs={[{ label: "Directories" }, { label: "NDCs" }]}
      />
      <NdcDirectory ndcs={ndcs} />
    </>
  );
}
