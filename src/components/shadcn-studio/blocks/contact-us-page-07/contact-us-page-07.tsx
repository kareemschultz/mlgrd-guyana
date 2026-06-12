import type { ComponentType } from "react";
import { ArrowRightIcon, MailIcon, MapPinIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

type ContactMethod = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  href?: string;
  label?: string;
};

type Location = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

/**
 * Adapted from Shadcn Studio `@ss-blocks/contact-us-page-07`.
 * Original pattern: header card + contact method cards + location cards.
 */
export function StudioHelpdeskContact({
  contactMethods,
  location,
  whatsappUrl,
}: {
  contactMethods: ContactMethod[];
  location: Location;
  whatsappUrl: string;
}) {
  return (
    <section className="py-14">
      <div className="container-gov">
        <div className="grid overflow-hidden rounded-2xl border bg-card shadow-sm md:grid-cols-2 lg:grid-cols-3">
          {/* Contact Header */}
          <Card className="rounded-none border-0 shadow-none">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand-600">
                Helpdesk
              </p>
              <CardTitle className="font-heading text-2xl md:text-3xl">
                Message the Ministry for support
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Use the Ministry of Local Govt Chat Bot for quick assistance, or contact the Ministry through the channels below.
              </CardDescription>
              <Button className="rounded-lg bg-[#25D366] text-base text-white hover:bg-[#1fb85a]" size="lg" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  Open WhatsApp Helpdesk
                  <ArrowRightIcon />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Contact methods */}
          <div className="flex items-center bg-secondary/50 lg:col-span-2">
            <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
              {contactMethods.map((method) => {
                const IconComponent = method.icon;

                return (
                  <div key={method.title} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-brand-600 shadow-sm">
                        <IconComponent className="size-5" />
                      </span>
                      <h3 className="font-heading text-base font-semibold">{method.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{method.description}</p>
                    {method.href && method.label ? (
                      <a
                        href={method.href}
                        target={method.href.startsWith("http") ? "_blank" : undefined}
                        rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="inline-flex text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        {method.label}
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location card */}
          <div className="bg-ink p-6 text-ink-foreground md:col-span-2 lg:col-span-3">
            <h3 className="mb-4 font-heading text-xl font-bold text-white">{location.name}</h3>
            <div className="grid gap-3 text-sm font-medium text-white/85 sm:grid-cols-3">
              <div className="flex items-start gap-2">
                <MapPinIcon className="mt-0.5 size-5 shrink-0 text-gold" />
                <p>{location.address}</p>
              </div>
              <div className="flex items-start gap-2">
                <PhoneIcon className="mt-0.5 size-5 shrink-0 text-gold" />
                <p>{location.phone}</p>
              </div>
              <div className="flex items-start gap-2">
                <MailIcon className="mt-0.5 size-5 shrink-0 text-gold" />
                <p className="break-all">{location.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const studioHelpdeskIcons = {
  MessageCircleIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
};

export default StudioHelpdeskContact;
