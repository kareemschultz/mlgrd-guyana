import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { MultiStepForm } from "@/components/forms/multi-step-form";
import { ministry } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact the Ministry",
  description:
    "Contact the Ministry of Local Government & Regional Development, Guyana — address, phone, email, office hours, location map and an online contact form.",
};

// Kingston, Georgetown (approx. — Fort Street area)
const LAT = 6.8156;
const LON = -58.1645;
const OSM_EMBED = `https://www.openstreetmap.org/export/embed.html?bbox=${LON - 0.02}%2C${LAT - 0.015}%2C${LON + 0.02}%2C${LAT + 0.015}&layer=mapnik&marker=${LAT}%2C${LON}`;
const OSM_LINK = `https://www.openstreetmap.org/?mlat=${LAT}&mlon=${LON}#map=15/${LAT}/${LON}`;
const GMAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ministry.address)}`;

const details = [
  { icon: MapPin, label: "Address", value: ministry.address },
  { icon: Phone, label: "Telephone", value: ministry.phone, href: `tel:${ministry.phone}` },
  { icon: Mail, label: "Email", value: ministry.email, href: `mailto:${ministry.email}` },
  { icon: Clock, label: "Office hours", value: ministry.hours },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact the Ministry"
        lead="Reach the Ministry of Local Government & Regional Development by phone, email or the online form below. We'll route your message to the right team."
        crumbs={[{ label: "Contact" }]}
      />

      <section className="py-16">
        <div className="container-gov grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Left: details + map */}
          <div>
            <Reveal>
              <div className="grid gap-4 sm:grid-cols-2">
                {details.map((d) => (
                  <div key={d.label} className="rounded-2xl border bg-card p-5">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
                      <d.icon className="size-5" />
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {d.label}
                    </p>
                    {d.href ? (
                      <a href={d.href} className="mt-0.5 block font-medium hover:text-brand-600">
                        {d.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 font-medium">{d.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-5 overflow-hidden rounded-2xl border">
                <iframe
                  title="Ministry location map"
                  src={OSM_EMBED}
                  className="h-72 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="flex items-center justify-between gap-3 border-t bg-card px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{ministry.address}</span>
                  <span className="flex gap-3">
                    <a href={OSM_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline">
                      OpenStreetMap <ExternalLink className="size-3.5" />
                    </a>
                    <a href={GMAPS} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline">
                      Google Maps <ExternalLink className="size-3.5" />
                    </a>
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right: form */}
          <Reveal delay={0.05}>
            <MultiStepForm configId="helpdesk" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
