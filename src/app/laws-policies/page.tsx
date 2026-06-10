import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { LawsBrowser } from "@/components/laws/laws-browser";
import laws from "@/data/laws.json";

export const metadata: Metadata = {
  title: "Laws & Policies",
  description:
    "Reference index of the Acts, draft bills and draft regulations that govern local government and regional development in Guyana. Search and filter by category and status.",
};

export default function LawsPoliciesPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal framework"
        title="Laws & Policies"
        lead="The Acts, draft bills and draft regulations that shape local government and regional development in Guyana. Search by title or filter by category to find an entry."
        crumbs={[{ label: "Laws & Policies" }]}
      />

      <section className="py-16 sm:py-20">
        <div className="container-gov">
          <LawsBrowser laws={laws} />
        </div>
      </section>
    </>
  );
}
