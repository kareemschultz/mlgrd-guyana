import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, MapPin, Phone, Mail, Building2, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { ServiceIcon } from "@/components/services/service-icons";
import { ServiceFormSlot, serviceHasForm } from "@/components/forms/service-form-slot";
import services from "@/data/services.json";
import { ministry } from "@/lib/site";

type Service = (typeof services)[number];

const ndcServiceItems = [
  "Issue compliance letter for property",
  "Address complaints and route follow-up",
  "Maintenance of NDC drains",
  "Issue burial spot guidance where burial grounds exist",
  "House plan stamping after Single Window approval",
  "Permission for Family Fun Day activities, conditions apply",
  "Renewal of Food Handler Certificate through the EHO",
  "Cash grant registration guidance",
  "Single Window site guidance",
];

function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}/` },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const documents = service.documents ?? [];

  return (
    <>
      <PageHero
        eyebrow="Service"
        title={service.title}
        lead={service.summary}
        crumbs={[{ label: "Services", href: "/services" }, { label: service.title }]}
      />

      <section className="py-16 sm:py-20">
        <div className="container-gov grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* ───── Main column ───── */}
          <div className="space-y-12">
            {/* intro */}
            <Reveal>
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
                  <ServiceIcon slug={service.slug} className="size-6" />
                </div>
                <p className="text-base leading-relaxed text-muted-foreground">{service.body}</p>
              </div>
            </Reveal>

            {/* steps */}
            <Reveal>
              <div>
                <h2 className="font-heading text-2xl font-bold">How it works</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Follow these steps to complete this service correctly.
                </p>
                <ol className="mt-6 space-y-5">
                  {service.steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 font-heading text-sm font-bold text-white shadow-sm">
                        {i + 1}
                      </span>
                      <p className="pt-1 text-sm leading-relaxed text-foreground/90">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            {/* what to bring */}
            {documents.length > 0 && (
              <Reveal>
                <div className="rounded-2xl border bg-secondary/40 p-6">
                  <h2 className="font-heading text-xl font-bold">What to bring</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Have these ready to make your visit faster.
                  </p>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {documents.map((doc) => (
                      <li key={doc} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
                        <span className="text-foreground/90">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}

            {slug === "ndc-services" && (
              <Reveal>
                <section className="rounded-2xl border bg-white p-6 shadow-sm 2xl:p-8">
                  <h2 className="font-heading text-2xl font-bold 2xl:text-3xl">Common NDC services</h2>
                  <p className="mt-1 text-sm text-muted-foreground 2xl:text-base">
                    Based on the MLGRD service note, these are the common citizen-facing services to display clearly.
                  </p>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {ndcServiceItems.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 rounded-xl bg-secondary/45 p-3 text-sm 2xl:text-base">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
                        <span className="text-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            {/* online form slot */}
            {serviceHasForm(slug) && (
              <Reveal>
                <section className="scroll-mt-24">
                  <h2 className="font-heading text-2xl font-bold">Submit online</h2>
                  <p className="mt-1 mb-6 text-sm text-muted-foreground">
                    Prefer not to visit in person? Complete and submit the form below.
                  </p>
                  <ServiceFormSlot slug={slug} />
                </section>
              </Reveal>
            )}
          </div>

          {/* ───── Contact sidebar ───── */}
          <Reveal as="div" delay={0.1}>
            <div className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="border-b bg-ink px-6 py-5 text-ink-foreground">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                    Where to go
                  </p>
                  <p className="mt-1 font-heading text-base font-bold text-white">
                    {service.office}
                  </p>
                </div>
                <div className="space-y-4 px-6 py-6">
                  {slug === "reporting-local-problems" && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                      <div className="flex items-start gap-3">
                        <MessageCircle className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                        <div>
                          <p className="font-heading font-bold">Report through WhatsApp</p>
                          <p className="mt-1 text-emerald-900/80">
                            Message the Ministry of Local Govt Chat Bot for help with local issues.
                          </p>
                          <Button asChild className="mt-3 w-full bg-[#25D366] text-white hover:bg-[#1fb85a]">
                            <a href={ministry.whatsapp.url} target="_blank" rel="noopener noreferrer">
                              Message {ministry.whatsapp.display}
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ministry contact
                  </p>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <Building2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
                      <span className="text-foreground/90">
                        Ministry of Local Government &amp; Regional Development
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />
                      <span className="text-foreground/90">{service.contact.address}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Phone className="mt-0.5 size-4 shrink-0 text-brand-600" />
                      <a
                        href={`tel:${service.contact.phone.replace(/\s/g, "")}`}
                        className="text-foreground/90 hover:text-brand-600 hover:underline"
                      >
                        {service.contact.phone}
                      </a>
                    </li>
                    <li className="flex items-start gap-3">
                      <Mail className="mt-0.5 size-4 shrink-0 text-brand-600" />
                      <a
                        href={`mailto:${service.contact.email}`}
                        className="break-all text-foreground/90 hover:text-brand-600 hover:underline"
                      >
                        {service.contact.email}
                      </a>
                    </li>
                  </ul>
                  {serviceHasForm(slug) && (
                    <Button asChild className="w-full bg-brand-600 text-white hover:bg-brand-700">
                      <Link href="#form">Submit online</Link>
                    </Button>
                  )}
                </div>
              </div>

              <Button asChild variant="ghost" className="mt-4 text-brand-600 hover:text-brand-700">
                <Link href="/services">
                  <ArrowLeft className="size-4" /> All services
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
