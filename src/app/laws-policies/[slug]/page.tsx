import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info, ScrollText, FileText, BookOpen, Hash, Calendar } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ministry } from "@/lib/site";
import laws from "@/data/laws.json";

type Law = (typeof laws)[number];

const CATEGORY_ICON: Record<string, typeof ScrollText> = {
  Act: ScrollText,
  "Draft Bill": FileText,
  "Draft Regulations": BookOpen,
};

function getLaw(slug: string): Law | undefined {
  return laws.find((l) => l.slug === slug);
}

export function generateStaticParams() {
  return laws.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const law = getLaw(slug);
  if (!law) return { title: "Entry not found" };
  return {
    title: law.title,
    description: law.summary,
  };
}

export default async function LawDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const law = getLaw(slug);
  if (!law) notFound();

  const Icon = CATEGORY_ICON[law.category] ?? ScrollText;
  const inForce = law.status === "In Force";

  return (
    <>
      <PageHero
        eyebrow={law.category}
        title={law.title}
        crumbs={[
          { label: "Laws & Policies", href: "/laws-policies" },
          { label: law.title },
        ]}
      />

      <section className="py-16 sm:py-20">
        <div className="container-gov max-w-3xl">
          <Reveal>
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              {/* header */}
              <div className="flex items-start gap-4 border-b p-6">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
                  <Icon className="size-6" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-brand/30 bg-brand/5 text-brand-700">
                    {law.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1.5",
                      inForce
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-amber-300 bg-amber-50 text-amber-700"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        inForce ? "bg-emerald-500" : "bg-amber-500"
                      )}
                    />
                    {law.status}
                  </Badge>
                </div>
              </div>

              {/* meta */}
              <dl className="grid gap-px bg-border sm:grid-cols-2">
                {law.chapter && (
                  <div className="bg-card p-6">
                    <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Hash className="size-3.5" /> Chapter
                    </dt>
                    <dd className="mt-1 font-heading text-lg font-bold">{law.chapter}</dd>
                  </div>
                )}
                {law.year && (
                  <div className="bg-card p-6">
                    <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Calendar className="size-3.5" /> Year
                    </dt>
                    <dd className="mt-1 font-heading text-lg font-bold">{law.year}</dd>
                  </div>
                )}
              </dl>

              {/* summary */}
              <div className="border-t p-6">
                <h2 className="font-heading text-lg font-bold">Summary</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{law.summary}</p>
              </div>
            </div>
          </Reveal>

          {/* reference note */}
          <Reveal delay={0.1}>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm">
              <Info className="mt-0.5 size-5 shrink-0 text-amber-600" />
              <div className="text-amber-900">
                <p className="font-semibold">Reference entry only</p>
                <p className="mt-1 text-amber-800">
                  This is a summary reference entry. The full legislative text or official PDF is
                  not available on this portal. For authoritative copies, please contact the{" "}
                  {ministry.name} or the relevant authority directly.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <Button asChild variant="ghost" className="mt-6 text-brand-600 hover:text-brand-700">
              <Link href="/laws-policies">
                <ArrowLeft className="size-4" /> Back to Laws &amp; Policies
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
