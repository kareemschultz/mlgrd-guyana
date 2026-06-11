import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bell, Newspaper } from "lucide-react";

import { PageHero } from "@/components/site/page-hero";
import { PortalUpdatesSection } from "@/components/site/portal-updates-section";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "What’s New at the Ministry",
  description:
    "Plain-language updates on MLGRD online services, council information, citizen support, notices, and portal improvements.",
  openGraph: {
    title: "What’s New at the Ministry | MLGRD Guyana",
    description:
      "See recent citizen-service updates from the Ministry of Local Government & Regional Development.",
  },
};

export default function UpdatesPage() {
  return (
    <>
      <PageHero
        eyebrow="Ministry updates"
        title="What’s New at the Ministry"
        lead="A simple place to see recent improvements to online services, council information, notices, and citizen support."
        crumbs={[{ label: "What’s New" }]}
      />

      <PortalUpdatesSection standalone />

      <section className="pb-16 sm:pb-20">
        <div className="container-gov grid gap-4 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl border bg-card p-6 shadow-sm">
              <Newspaper className="size-9 text-brand-600" />
              <h2 className="mt-4 font-heading text-xl font-bold">Read Ministry news</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                For announcements, programmes, consultations, and public notices, visit the main news area.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link href="/news">
                  Open news <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="h-full rounded-3xl border bg-brand-600 p-6 text-white shadow-sm">
              <Bell className="size-9 text-gold" />
              <h2 className="mt-4 font-heading text-xl font-bold">Need help with a service?</h2>
              <p className="mt-2 text-sm leading-6 text-white/85">
                Use the helpdesk to contact the Ministry, report a problem, or find the right local authority.
              </p>
              <Button asChild className="mt-5 bg-white text-brand-700 hover:bg-white/90">
                <Link href="/helpdesk">
                  Go to Helpdesk <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
