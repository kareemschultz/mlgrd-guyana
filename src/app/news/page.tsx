import type { Metadata } from "next";
import Link from "next/link";
import {
  Recycle, Landmark, Megaphone, HandHelping, ArrowRight, Bell, Calendar,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "News & Updates",
  description:
    "Latest news and updates from the Ministry of Local Government & Regional Development, Guyana — legislation, capacity-building, digital services and community development projects.",
};

const news = [
  {
    icon: Recycle,
    tag: "Legislation",
    date: "March 2026",
    title: "Draft Integrated Solid Waste Management Bill open for consultation",
    body: "The Ministry has published the draft Integrated Solid Waste Management Bill 2026 for public consultation. The proposed framework aims to modernise how waste is collected, managed and recycled across the country. Citizens, councils and stakeholders are invited to review the draft and share their feedback during the consultation period.",
  },
  {
    icon: Landmark,
    tag: "Capacity-building",
    date: "February 2026",
    title: "Local Government Commission strengthens regional capacity",
    body: "Capacity-building initiatives are underway to support the Local Government Commission and councils across the regions. The programme focuses on improving administration, planning and accountability so that local democratic organs can deliver services more effectively to the communities they serve.",
  },
  {
    icon: Megaphone,
    tag: "Digital services",
    date: "February 2026",
    title: "Report a local problem online through the Ministry portal",
    body: "Citizens can now report local issues — such as roads, drainage and sanitation — online through the Ministry portal. The new digital service makes it easier to flag problems and route them to the responsible local authority, helping communities get faster, more transparent responses.",
  },
  {
    icon: HandHelping,
    tag: "Community development",
    date: "January 2026",
    title: "Community development projects expand across the regions",
    body: "Community development projects are expanding across Guyana's regions, including support for hinterland communities. These initiatives partner with local councils and residents to improve infrastructure, public spaces and livelihoods, bringing tangible benefits closer to where people live.",
  },
];

export default function NewsPage() {
  return (
    <>
      <PageHero
        eyebrow="Updates"
        title="News & updates"
        lead="The latest from the Ministry — legislation, programmes, digital services and community development across Guyana."
        crumbs={[{ label: "News" }]}
      />

      <section className="py-16 sm:py-20">
        <div className="container-gov">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              Updates
            </p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl">
              Recent announcements
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {news.map((item, i) => (
              <Reveal key={item.title} delay={(i % 2) * 0.08}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <item.icon className="size-6" />
                    </div>
                    <Badge variant="secondary">{item.tag}</Badge>
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {item.date}
                  </div>
                  <h3 className="mt-2 font-heading text-xl font-bold leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Subscribe / contact CTA ───── */}
      <section className="pb-16 sm:pb-20">
        <div className="container-gov">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-brand-600 to-brand-700 px-8 py-12 text-center text-white">
              <div className="pointer-events-none absolute inset-0 bg-dot text-white/10" />
              <Bell className="mx-auto size-10 text-gold" />
              <h2 className="mt-4 font-heading text-2xl font-extrabold sm:text-3xl">
                Stay informed
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-white/85">
                Contact the Ministry to keep up to date with announcements,
                consultations and community development news.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="bg-white text-brand-700 hover:bg-white/90">
                  <Link href="/contact">
                    Contact for updates <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/laws-policies">Laws &amp; policies</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
