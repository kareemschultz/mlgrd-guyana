import type { Metadata } from "next";
import { Landmark, MapPin } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { FloatingMotifs } from "@/components/site/floating-motifs";
import { Badge } from "@/components/ui/badge";
import rdcs from "@/data/rdcs.json";

export const metadata: Metadata = {
  title: "Regional Democratic Councils (RDCs) Directory",
  description:
    "The ten Regional Democratic Councils of Guyana coordinate development, services and administration across each of the country's administrative regions.",
};

function regionNumber(region: string): number {
  const m = region.match(/\d+/);
  return m ? Number.parseInt(m[0], 10) : 999;
}

export default function RdcsPage() {
  const ordered = [...rdcs].sort(
    (a, b) => regionNumber(a.region) - regionNumber(b.region)
  );

  return (
    <>
      <PageHero
        eyebrow="Local Authorities"
        title="Regional Democratic Councils"
        lead="Guyana is divided into ten administrative regions, each governed by a Regional Democratic Council (RDC) that coordinates development, services and local administration."
        crumbs={[{ label: "Directories" }, { label: "RDCs" }]}
      />

      <section className="relative overflow-hidden py-14 sm:py-16">
        <FloatingMotifs preset="band" className="text-brand/[0.05]" />
        <div className="container-gov relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              The regional tier
            </p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl">
              Ten regions, ten councils
            </h2>
            <p className="mt-3 text-muted-foreground">
              Each RDC is the elected body responsible for planning and delivering services
              such as roads, drainage, education support and health coordination within its
              region.
            </p>
          </Reveal>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ordered.map((r, i) => (
              <Reveal as="li" key={r.region} delay={(i % 3) * 0.05}>
                <div className="group flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <Landmark className="size-6" />
                    </span>
                    <Badge variant="secondary" className="rounded-full">
                      {r.region}
                    </Badge>
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold">{r.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" /> {r.council}
                  </p>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">
                    The Regional Democratic Council for {r.name} ({r.region}) oversees regional
                    development planning, infrastructure and the coordination of local services.
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
