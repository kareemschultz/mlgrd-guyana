import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { getServiceIcon } from "@/components/services/service-icons";
import services from "@/data/services.json";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Citizen and business services from Guyana's Ministry of Local Government & Regional Development — building permits, business licences, rates & taxes, community projects, reporting local problems and supplier enquiries.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="How can we help?"
        title="Services for citizens & businesses"
        lead="Everything you need to engage with your local authority, in one place. Choose a service to see how it works, what to bring, and where to go."
        crumbs={[{ label: "Services" }]}
      />

      <section className="py-16 sm:py-20">
        <div className="container-gov">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const Icon = getServiceIcon(s.slug);
              return (
                <Reveal key={s.slug} delay={(i % 3) * 0.06}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="group flex h-full flex-col rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
                  >
                    <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <Icon className="size-6" />
                    </div>
                    <h2 className="mt-4 font-heading text-lg font-bold">{s.title}</h2>
                    <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{s.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                      Learn more{" "}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
