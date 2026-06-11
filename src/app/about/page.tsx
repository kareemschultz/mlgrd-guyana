import type { Metadata } from "next";
import Link from "next/link";
import {
  Landmark, Building2, Users, ScrollText, Target, Network,
  ArrowRight, Trees, HeartPulse, GraduationCap, Mountain,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { FloatingMotifs } from "@/components/site/floating-motifs";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import site from "@/content/site.json";

export const metadata: Metadata = {
  title: "About Local Government",
  description:
    "Learn how local government works in Guyana — its mission, the role of local democratic organs, the three-tier structure of RDCs, municipalities and NDCs, and the legal framework underpinning it.",
};

const { about, home } = site;

const tierIcons = [Landmark, Building2, Users];

const directoryIcons: Record<string, typeof Trees> = {
  "Burial Grounds": Trees,
  "Health Centres": HeartPulse,
  Schools: GraduationCap,
  "Hinterland Support Contacts": Mountain,
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About the Ministry"
        title={about.heading}
        lead={about.mission}
        crumbs={[{ label: "About" }]}
      />

      {/* ───── Mission & function ───── */}
      <section className="py-16 sm:py-20">
        <div className="container-gov grid gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
              <Target className="size-6" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-extrabold sm:text-3xl">
              Our mission
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {about.mission}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
              <Network className="size-6" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-extrabold sm:text-3xl">
              The role of Local Government
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {about.function}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ───── Three-tier structure ───── */}
      <section className="relative overflow-hidden bg-ink py-16 text-ink-foreground sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-dot text-white/[0.05]" />
        <FloatingMotifs preset="band" className="text-white/[0.06]" />
        <div className="container-gov relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              How it is organised
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold text-white sm:text-4xl">
              A three-tier system
            </h2>
            <p className="mt-3 text-white/70">
              Local democratic organs serve citizens through 10 Regional
              Democratic Councils, 10 Municipalities, and 70 Neighborhood
              Democratic Councils, each with distinct responsibilities and reach.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {about.structure.tiers.map((tier, i) => {
              const Icon = tierIcons[i] ?? Landmark;
              const numeric =
                typeof tier.count === "number"
                  ? tier.count
                  : parseInt(String(tier.count), 10);
              return (
                <Reveal key={tier.name} delay={i * 0.08}>
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition-colors hover:border-gold/40 hover:bg-white/[0.07]">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-gold/15 text-gold">
                      <Icon className="size-6" />
                    </div>
                    <div className="mt-5 font-heading text-4xl font-extrabold text-white sm:text-5xl">
                      <NumberTicker value={numeric} className="text-white" />
                    </div>
                    <h3 className="mt-2 font-heading text-lg font-bold text-white">
                      {tier.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-white/65">
                      {tier.note}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Legal framework ───── */}
      <section className="py-16 sm:py-20">
        <div className="container-gov">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border bg-card p-8 sm:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
                  <ScrollText className="size-7" />
                </div>
                <div>
                  <Badge variant="secondary" className="mb-3">
                    Legal framework
                  </Badge>
                  <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">
                    Local Democratic Organs Act, Chapter 28:09
                  </h2>
                  <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                    {about.legalFramework}
                  </p>
                  <Button asChild className="mt-6 bg-brand-600 text-white hover:bg-brand-700">
                    <Link href="/laws-policies">
                      Browse laws &amp; policies <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───── Community directories ───── */}
      <section className="border-t bg-secondary/40 py-16 sm:py-20">
        <div className="container-gov">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              Community resources
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold sm:text-4xl">
              Local Directories
            </h2>
            <p className="mt-3 text-muted-foreground">
              The Ministry maintains community-level directories to help citizens
              locate essential local services and contacts.
            </p>
          </Reveal>

          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            {home.communityDirectories.map((d, i) => {
              const Icon = directoryIcons[d] ?? Trees;
              return (
                <Reveal key={d} delay={(i % 2) * 0.06}>
                  <div className="flex items-center gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-brand/40">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand-600">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-heading font-bold">{d}</span>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Separator className="mx-auto mt-12 max-w-xs" />
          <Reveal className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Looking for your local council?
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline">
                <Link href="/ndcs">Find your NDC</Link>
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
