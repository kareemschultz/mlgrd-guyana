import type { Metadata } from "next";

import { PageHero } from "@/components/site/page-hero";
import { ProcurementList } from "@/components/procurement/procurement-list";

export const metadata: Metadata = {
  alternates: { canonical: "/procurement" },
};

export default function ProcurementPage() {
  return (
    <>
      <PageHero
        eyebrow="Procurement"
        title="Procurement Notices"
        lead="Current tenders, requests for quotations and requests for proposals from the Ministry of Local Government & Regional Development."
        crumbs={[{ label: "Procurement Notices" }]}
      />
      <section className="container-gov py-12 sm:py-16">
        <ProcurementList />
      </section>
    </>
  );
}
