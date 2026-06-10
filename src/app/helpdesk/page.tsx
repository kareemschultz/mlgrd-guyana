import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, Phone, Mail, MessageSquareText, BookOpen, MapPin } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { MultiStepForm } from "@/components/forms/multi-step-form";
import { ministry } from "@/lib/site";

export const metadata: Metadata = {
  title: "Helpdesk",
  description:
    "The Ministry of Local Government & Regional Development helpdesk — get support, find answers, or send a message to the right team.",
};

const channels = [
  { icon: Phone, label: "Call us", value: ministry.phone, href: `tel:${ministry.phone}`, note: ministry.hours },
  { icon: Mail, label: "Email us", value: ministry.email, href: `mailto:${ministry.email}`, note: "We aim to reply within a few business days" },
  { icon: MapPin, label: "Visit us", value: ministry.address, note: "Walk-in enquiries during office hours" },
];

const quick = [
  { icon: BookOpen, label: "Browse FAQs", href: "/faq", desc: "Answers to common questions" },
  { icon: MessageSquareText, label: "Report a problem", href: "/services/reporting-local-problems", desc: "Roads, drainage, sanitation & more" },
  { icon: LifeBuoy, label: "Find your council", href: "/ndcs", desc: "Locate your NDC or municipality" },
];

export default function HelpdeskPage() {
  return (
    <>
      <PageHero
        eyebrow="We're here to help"
        title="Ministry Helpdesk"
        lead="Get support with services, local councils, laws and general enquiries. Use the channels below or send us a message."
        crumbs={[{ label: "Helpdesk" }]}
      />

      {/* channels */}
      <section className="py-14">
        <div className="container-gov grid gap-4 md:grid-cols-3">
          {channels.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.07}>
              <div className="h-full rounded-2xl border bg-card p-6">
                <div className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
                  <c.icon className="size-5" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="mt-1 block font-heading text-lg font-bold hover:text-brand-600">{c.value}</a>
                ) : (
                  <p className="mt-1 font-heading text-lg font-bold">{c.value}</p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* quick links + form */}
      <section className="pb-20">
        <div className="container-gov grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Reveal>
              <h2 className="font-heading text-2xl font-bold">Quick links</h2>
              <p className="mt-2 text-muted-foreground">Many enquiries can be resolved right away.</p>
            </Reveal>
            <div className="mt-6 flex flex-col gap-3">
              {quick.map((q, i) => (
                <Reveal key={q.href} delay={i * 0.06}>
                  <Link
                    href={q.href}
                    className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                  >
                    <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-brand-600">
                      <q.icon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-semibold">{q.label}</span>
                      <span className="block text-sm text-muted-foreground">{q.desc}</span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.05}>
            <MultiStepForm configId="helpdesk" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
