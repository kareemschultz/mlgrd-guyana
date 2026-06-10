import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { CdcDirectory } from "@/components/directory/cdc-directory";
import cdcs from "@/data/cdcs.json";

export const metadata: Metadata = {
  title: "Community Development Councils (CDCs) Directory",
  description:
    "Browse Guyana's active Community Development Councils by region. Search by community, chairman or region and find the leadership of each CDC.",
};

export default function CdcsPage() {
  const active = cdcs.filter(
    (c) => c.name.trim() !== "" && c.chairman.trim() !== "",
  );

  return (
    <>
      <PageHero
        eyebrow="Local Authorities"
        title="Community Development Councils"
        lead={`Find your CDC among ${active.length} active Community Development Councils across Guyana. Search by community, filter by region, and view each council's chairman.`}
        crumbs={[{ label: "Directories" }, { label: "CDCs" }]}
      />
      <CdcDirectory cdcs={cdcs} />
    </>
  );
}
