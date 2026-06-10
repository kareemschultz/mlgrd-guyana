import type { Metadata } from "next";
import { Building2, MapPin, UserRound } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import municipalities from "@/data/municipalities.json";

export const metadata: Metadata = {
  title: "Municipalities Directory",
  description:
    "Guyana's city and towns deliver urban local-government services through municipal councils. Browse all ten municipalities and the regions they serve.",
};

export default function MunicipalitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Local Authorities"
        title="Municipalities"
        lead="Guyana's capital city and its towns deliver urban local-government services — from sanitation and markets to roads and community development — through their municipal councils."
        crumbs={[{ label: "Directories" }, { label: "Municipalities" }]}
      />

      <section className="py-14 sm:py-16">
        <div className="container-gov">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              City &amp; towns
            </p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl">
              Municipal councils across Guyana
            </h2>
            <p className="mt-3 text-muted-foreground">
              Each municipality is governed by an elected council responsible for the day-to-day
              running of its city or town.
            </p>
          </Reveal>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {municipalities.map((m, i) => (
              <Reveal as="li" key={m.name} delay={(i % 3) * 0.05}>
                <div className="group flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <Building2 className="size-6" />
                    </span>
                    <Badge
                      variant={m.type === "City" ? "default" : "secondary"}
                      className="rounded-full"
                    >
                      {m.type}
                    </Badge>
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold">{m.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" /> {m.region} — {m.regionName}
                  </p>

                  {m.officials?.length > 0 && (
                    <div className="mt-4 flex-1 border-t pt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">
                        Council leadership
                      </p>
                      <ul className="mt-3 space-y-2.5">
                        {m.officials.map((o) => (
                          <li
                            key={`${o.role}-${o.name}`}
                            className="flex items-start gap-2.5 text-sm"
                          >
                            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                              <UserRound className="size-3.5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-xs text-muted-foreground">
                                {o.role}
                              </span>
                              <span className="block font-medium leading-snug">
                                {o.name}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
