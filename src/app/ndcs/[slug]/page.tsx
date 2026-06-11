import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Mail,
  MapPin,
  Phone,
  Users,
  UserRound,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NdcContactForm } from "@/components/ndc/ndc-contact-form";
import ndcs from "@/data/ndcs.json";
import { ministry } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return ndcs.map((n) => ({ slug: n.slug }));
}

function getNdc(slug: string) {
  return ndcs.find((n) => n.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ndc = getNdc(slug);
  if (!ndc) {
    return { title: "Council not found" };
  }
  return {
    title: `${ndc.name} NDC`,
    description: `Leadership and Ministry contact information for the ${ndc.name} Neighbourhood Democratic Council in ${ndc.region} (${ndc.regionName}), Guyana.`,
    alternates: { canonical: `/ndcs/${ndc.slug}/` },
  };
}

export default async function NdcDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const ndc = getNdc(slug);
  if (!ndc) notFound();

  const idx = ndcs.findIndex((n) => n.slug === slug);
  const prev = idx > 0 ? ndcs[idx - 1] : null;
  const next = idx < ndcs.length - 1 ? ndcs[idx + 1] : null;

  const leadership = [
    { role: "Chairperson", name: ndc.contact.chairperson, icon: UserRound },
    { role: "Deputy Chairperson", name: ndc.contact.deputy, icon: UserRound },
    { role: "Overseer", name: ndc.contact.overseer, icon: Users },
  ].filter((l) => Boolean(l.name));

  return (
    <>
      <PageHero
        eyebrow={`${ndc.region} — ${ndc.regionName}`}
        title={ndc.name}
        lead="Neighbourhood Democratic Council — leadership and how to make an enquiry."
        crumbs={[
          { label: "Directories" },
          { label: "NDCs", href: "/ndcs" },
          { label: ndc.name },
        ]}
      />

      <section className="container-gov py-14 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* ───── Leadership ───── */}
          <Reveal as="div" className="space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
                  <Users className="size-5" />
                </span>
                <div>
                  <h2 className="font-heading text-xl font-bold">Council leadership</h2>
                  <p className="text-sm text-muted-foreground">
                    Elected and appointed officers serving this NDC.
                  </p>
                </div>
              </div>

              {leadership.length > 0 ? (
                <ul className="mt-6 divide-y rounded-xl border">
                  {leadership.map((l) => (
                    <li key={l.role} className="flex items-center gap-4 p-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-brand-600">
                        <l.icon className="size-5" />
                      </span>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {l.role}
                        </p>
                        <p className="font-semibold">{l.name}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 rounded-xl border border-dashed bg-secondary/30 p-4 text-sm text-muted-foreground">
                  Leadership details for this council are being updated.
                </p>
              )}

              {ndc.contact.officeNumber && (
                <div className="mt-5 flex items-center gap-3 rounded-xl bg-secondary/50 p-4">
                  <Phone className="size-5 text-brand-600" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Council office number
                    </p>
                    <a
                      href={`tel:${ndc.contact.officeNumber.replace(/\s+/g, "")}`}
                      className="font-semibold hover:text-brand-600"
                    >
                      {ndc.contact.officeNumber}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Back link */}
            <Button
              asChild
              variant="outline"
              className="hover:border-brand/40 hover:text-brand-700"
            >
              <Link href="/ndcs">
                <ArrowLeft className="size-4" /> Back to all NDCs
              </Link>
            </Button>
          </Reveal>

          {/* ───── Ministry contact ───── */}
          <Reveal as="div" delay={0.1}>
            <div className="rounded-2xl border bg-ink p-6 text-ink-foreground shadow-sm sm:p-8">
              <span className="flex size-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <Building2 className="size-5" />
              </span>
              <h2 className="mt-4 font-heading text-xl font-bold text-white">Ministry contact</h2>
              <p className="mt-1.5 text-sm text-white/70">
                Enquiries for this council are handled centrally by the {ministry.name}.
              </p>

              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-white/50">Address</dt>
                    <dd className="text-white/90">{ministry.address}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-white/50">Phone</dt>
                    <dd>
                      <a
                        href={`tel:${ministry.phone.replace(/\s+/g, "")}`}
                        className="text-white/90 hover:text-gold"
                      >
                        {ministry.phone}
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-white/50">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${ministry.email}`}
                        className="text-white/90 hover:text-gold"
                      >
                        {ministry.email}
                      </a>
                    </dd>
                  </div>
                </div>
              </dl>

              <Badge className="mt-6 rounded-full bg-white/10 text-white/80 hover:bg-white/10">
                Central enquiries point
              </Badge>
            </div>
          </Reveal>
        </div>

        {/* ───── Contact this NDC ───── */}
        <Reveal className="mx-auto mt-12 max-w-3xl">
          <NdcContactForm
            ndcName={ndc.name}
            region={ndc.region}
            regionName={ndc.regionName}
          />
        </Reveal>

        {/* ───── Prev / Next ───── */}
        <Reveal className="mt-12 grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/ndcs/${prev.slug}`}
              className="group flex items-center gap-3 rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
            >
              <ArrowLeft className="size-5 shrink-0 text-brand-600 transition-transform group-hover:-translate-x-1" />
              <span>
                <span className="block text-xs text-muted-foreground">Previous council</span>
                <span className="font-semibold">{prev.name}</span>
              </span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          {next && (
            <Link
              href={`/ndcs/${next.slug}`}
              className="group flex items-center justify-end gap-3 rounded-xl border bg-card p-5 text-right transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
            >
              <span>
                <span className="block text-xs text-muted-foreground">Next council</span>
                <span className="font-semibold">{next.name}</span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-brand-600 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </Reveal>
      </section>
    </>
  );
}
