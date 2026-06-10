import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { PhotoGallery } from "@/components/gallery/photo-gallery";
import { MinisterGallery } from "@/components/gallery/minister-gallery";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description:
    "Photos from the Ministry of Local Government & Regional Development, Guyana — events, engagements, community development and leadership across the regions.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Media"
        title="Photo Gallery"
        lead="Moments from the Ministry's work across Guyana — events, community development, regional engagements and leadership. Tap any photo to view it."
        crumbs={[{ label: "Gallery" }]}
      />

      {/* ───── Photo gallery (animated, filterable) ───── */}
      <section className="py-16 sm:py-20">
        <div className="container-gov">
          <Reveal className="mb-8 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
              <Images className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                Photos
              </p>
              <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">
                Ministry in pictures
              </h2>
            </div>
          </Reveal>
          <PhotoGallery />
        </div>
      </section>

      {/* ───── Leadership ───── */}
      <section className="border-t bg-secondary/30 py-16 sm:py-20">
        <div className="container-gov">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              Leadership
            </p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl">
              The Ministry&apos;s leadership
            </h2>
            <p className="mt-3 text-muted-foreground">
              Meet the Minister and senior officials leading local government and
              regional development across Guyana.
            </p>
          </Reveal>
          <div className="mt-10">
            <MinisterGallery />
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="py-16">
        <div className="container-gov">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-extrabold">
              Keep up with the Ministry
            </h2>
            <p className="mt-3 text-muted-foreground">
              See the latest announcements, programmes and developments.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-brand-600 text-white hover:bg-brand-700">
                <Link href="/news">
                  Read the news <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/ministers-desk">Minister&apos;s Desk</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
