import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bell } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { NewsFeed } from "@/components/news/news-feed";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "News & Updates",
  description:
    "Latest news and updates from the Ministry of Local Government & Regional Development, Guyana — legislation, capacity-building, digital services and community development projects.",
};

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

          <NewsFeed />
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
