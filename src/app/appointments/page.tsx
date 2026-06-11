import type { Metadata } from "next";
import { CalendarCheck, Clock, Mail, ShieldCheck } from "lucide-react";

import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { BookingForm } from "@/components/appointments/booking-form";
import { ministry } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book an REO Appointment",
  description:
    "Request a meeting with your Regional Executive Officer (REO). Choose your region, a preferred date and time, and the REO's office will follow up to confirm.",
};

const steps = [
  {
    icon: CalendarCheck,
    title: "Choose your REO & date",
    body: "Pick your region to see your Regional Executive Officer, then a preferred date and office-hours time slot.",
  },
  {
    icon: Mail,
    title: "Tell us the reason",
    body: "Add your contact details and a short subject so the office can prepare for your meeting.",
  },
  {
    icon: ShieldCheck,
    title: "The office confirms",
    body: "The REO's office reviews every request and follows up by email to confirm or propose another time.",
  },
];

export default function AppointmentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Regional Executive Officers"
        title="Book an REO Appointment"
        lead="Request a meeting with your Regional Executive Officer. Choose your region, a preferred date and time, and the office will follow up to confirm."
        crumbs={[{ label: "Book an REO" }]}
      />

      <section className="py-16">
        <div className="container-gov grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left: how it works */}
          <div>
            <Reveal>
              <h2 className="font-heading text-2xl font-extrabold tracking-tight">
                How it works
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Regional Executive Officers are the chief administrative officers
                of Guyana&rsquo;s ten Regional Democratic Councils. Use this form
                to request an appointment directly.
              </p>
            </Reveal>

            <ol className="mt-6 space-y-4">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={0.05 * (i + 1)}>
                  <li className="flex gap-4 rounded-2xl border bg-card p-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
                      <s.icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-heading font-bold">{s.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {s.body}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={0.25}>
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-5">
                <Clock className="mt-0.5 size-5 shrink-0 text-gold-700" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Appointments are scheduled during office hours,{" "}
                  <span className="font-medium text-foreground">
                    {ministry.hours}
                  </span>
                  . Times are a request only — the REO&rsquo;s office will confirm
                  the final slot.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right: booking form */}
          <Reveal delay={0.1}>
            <BookingForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
