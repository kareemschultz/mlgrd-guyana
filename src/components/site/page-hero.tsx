import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingMotifs } from "@/components/site/floating-motifs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mlgrd.gov.gy";

export type Crumb = { label: string; href?: string };

/** BreadcrumbList JSON-LD built from Home + the visible crumbs. */
function breadcrumbJsonLd(crumbs: Crumb[]) {
  const items = [
    { name: "Home", href: "/" },
    ...crumbs.map((c) => ({ name: c.label, href: c.href })),
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.href ? { item: `${SITE_URL}${it.href}` } : {}),
    })),
  };
}

/** Standard interior-page header: deep-ink band, breadcrumb, title, lead. */
export function PageHero({
  title,
  lead,
  crumbs = [],
  eyebrow,
  align = "left",
  motifs = "band",
}: {
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  eyebrow?: string;
  align?: "left" | "center";
  /** Decorative ministry SVG motifs in the hero. Set to false to disable. */
  motifs?: "band" | "hero" | false;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-ink-foreground">
      {crumbs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }}
        />
      )}
      {/* decorative layers */}
      <div className="pointer-events-none absolute inset-0 bg-dot text-white/[0.06]" />
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-gold/10 blur-3xl" />
      {motifs && (
        <FloatingMotifs
          preset={motifs}
          className="hidden text-white/[0.07] sm:block"
        />
      )}

      <div
        className={cn(
          "container-gov relative py-14 sm:py-16",
          align === "center" && "text-center"
        )}
      >
        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" className={cn("mb-4", align === "center" && "flex justify-center")}>
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/70">
            <li>
              <Link href="/" className="flex items-center gap-1 hover:text-gold">
                <Home className="size-3.5" />
                <span className="sr-only">Home</span>
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <ChevronRight className="size-3 text-white/30" />
                {c.href ? (
                  <Link href={c.href} className="hover:text-gold">{c.label}</Link>
                ) : (
                  <span className="text-white/80">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            {eyebrow}
          </p>
        )}
        <h1 className={cn("max-w-3xl font-heading text-3xl font-extrabold sm:text-4xl md:text-[2.6rem]", align === "center" && "mx-auto")}>
          {title}
        </h1>
        {lead && (
          <p className={cn("mt-4 max-w-2xl text-base leading-relaxed text-white/75", align === "center" && "mx-auto")}>
            {lead}
          </p>
        )}
      </div>

      {/* brand base line */}
      <div className="h-1 w-full bg-gradient-to-r from-brand via-gold to-brand" />
    </section>
  );
}
