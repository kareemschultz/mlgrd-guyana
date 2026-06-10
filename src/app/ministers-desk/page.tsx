import type { Metadata } from "next";
import Link from "next/link";
import {
  Quote, ArrowRight, Landmark, HandHelping, Users, ShieldCheck,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { FloatingMotifs } from "@/components/site/floating-motifs";
import { MinisterGallery } from "@/components/gallery/minister-gallery";
import { PhotoGallery } from "@/components/gallery/photo-gallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { seedMinisters } from "@/lib/data/seed";

export const metadata: Metadata = {
  title: "Minister's Desk",
  description:
    "A message from the Hon. Minister of Local Government & Regional Development on strengthening local democracy, improving service delivery and advancing community development across Guyana.",
};

const priorities = [
  {
    icon: Landmark,
    title: "Strengthening councils",
    desc: "Building the capacity of regional, municipal and neighbourhood councils so they can plan, deliver and account effectively.",
  },
  {
    icon: HandHelping,
    title: "Improving service delivery",
    desc: "Ensuring roads, drainage, sanitation and public spaces are maintained to a standard that communities deserve.",
  },
  {
    icon: Users,
    title: "Community development",
    desc: "Partnering with citizens on projects that improve livelihoods and create opportunity in every region.",
  },
  {
    icon: ShieldCheck,
    title: "Transparency & accountability",
    desc: "Promoting open, responsive administration so that decisions and resources serve the public interest.",
  },
];

export default function MinistersDeskPage() {
  const minister = seedMinisters.find((m) => m.current) ?? seedMinisters[0];
  return (
    <>
      <PageHero
        eyebrow="Office of the Minister"
        title="Minister's Desk"
        lead="A message on our shared work to deepen local democracy and bring development closer to every community in Guyana."
        crumbs={[{ label: "Minister's Desk" }]}
      />

      {/* ───── Message from the Minister ───── */}
      <section className="py-16 sm:py-20">
        <div className="container-gov grid gap-10 lg:grid-cols-[0.8fr_2fr] lg:gap-14">
          {/* Avatar / identity block */}
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-lg sm:w-52 lg:mx-0">
                <div className="pointer-events-none absolute inset-0 bg-dot text-white/10" />
                {minister.portrait ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={minister.portrait}
                    alt={`Portrait of ${minister.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-heading text-5xl font-extrabold tracking-wide">
                    {minister.initials ?? minister.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="mt-5 text-center lg:text-left">
                <p className="font-heading text-lg font-bold">{minister.name}</p>
                <p className="text-sm text-muted-foreground">{minister.title}</p>
                <Badge variant="secondary" className="mt-3">
                  Office of the Minister
                </Badge>
              </div>
            </div>
          </Reveal>

          {/* Statement */}
          <Reveal delay={0.08}>
            <div className="relative">
              <Quote className="size-10 text-brand/30" aria-hidden />
              <div className="mt-4 space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                <p>
                  Local government is where democracy is felt most directly. It is
                  in our neighbourhoods, towns and regions that citizens
                  experience the quality of public services and the strength of
                  their voice in shaping the places they call home.
                </p>
                <p>
                  Our mission is to empower local democratic organs to serve their
                  communities with competence, integrity and care. By
                  strengthening councils, improving the delivery of everyday
                  services, and partnering with residents on development that
                  matters, we move closer to a Guyana where opportunity reaches
                  every region.
                </p>
                <p>
                  I encourage every citizen to participate — to know your council,
                  to raise the issues that affect your community, and to hold us
                  all to the high standards that good local government demands.
                  Together, with strong councils and engaged communities, we will
                  build a more responsive, transparent and prosperous nation.
                </p>
              </div>
              <p className="mt-8 font-heading text-lg font-bold text-foreground">
                {minister.name}
              </p>
              <p className="text-sm text-muted-foreground">{minister.title}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───── Leadership gallery ───── */}
      <section className="border-t py-16 sm:py-20">
        <div className="container-gov">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              Leadership
            </p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl">
              Ministers &amp; officials
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              The leadership guiding the Ministry&apos;s work with councils and
              communities. Select a profile to read more.
            </p>
          </Reveal>

          <div className="mt-10">
            <MinisterGallery />
          </div>
        </div>
      </section>

      {/* ───── Photo gallery ───── */}
      <section className="border-t py-16 sm:py-20">
        <div className="container-gov">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              Gallery
            </p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl">
              Moments from the Ministry
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Consultations, capacity-building and community development from
              across the regions. Select a photo to view it larger.
            </p>
          </Reveal>

          <div className="mt-10">
            <PhotoGallery />
          </div>
        </div>
      </section>

      {/* ───── Priorities ───── */}
      <section className="relative overflow-hidden bg-ink py-16 text-ink-foreground sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-dot text-white/[0.05]" />
        <FloatingMotifs preset="band" className="text-white/[0.06]" />
        <div className="container-gov relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              Our focus
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold text-white sm:text-4xl">
              Priorities for local development
            </h2>
            <p className="mt-3 text-white/70">
              The commitments guiding the Ministry&apos;s work with councils and
              communities across the country.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {priorities.map((p, i) => (
              <Reveal key={p.title} delay={(i % 4) * 0.06}>
                <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-gold/40 hover:bg-white/[0.07]">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    <p.icon className="size-6" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold text-white">
                    {p.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-white/65">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="py-16 sm:py-20">
        <div className="container-gov">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">
              Get involved in your community
            </h2>
            <p className="mt-3 text-muted-foreground">
              Find your council, report an issue, or reach out to the Ministry.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-brand-600 text-white hover:bg-brand-700">
                <Link href="/ndcs">
                  Find your council <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contact the Ministry</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
