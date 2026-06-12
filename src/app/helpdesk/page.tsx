import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, MessageSquareText, BookOpen, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { MultiStepForm } from "@/components/forms/multi-step-form";
import { HelpdeskEmbed } from "@/components/helpdesk/helpdesk-embed";
import {
  StudioHelpdeskContact,
  studioHelpdeskIcons,
} from "@/components/shadcn-studio/blocks/contact-us-page-07/contact-us-page-07";
import { ministry } from "@/lib/site";

export const metadata: Metadata = {
  title: "Helpdesk",
  description:
    "The Ministry of Local Government & Regional Development helpdesk — get support, find answers, or send a message to the right team.",
};

const channels = [
  {
    icon: studioHelpdeskIcons.MessageCircleIcon,
    title: "WhatsApp chatbot",
    description: `Start a chat with the Ministry of Local Govt Chat Bot at ${ministry.whatsapp.display}.`,
    href: ministry.whatsapp.url,
    label: "Message now",
  },
  {
    icon: studioHelpdeskIcons.PhoneIcon,
    title: "Call us",
    description: `${ministry.phone} · ${ministry.hours}`,
    href: `tel:${ministry.phone}`,
    label: "Call the Ministry",
  },
  {
    icon: studioHelpdeskIcons.MailIcon,
    title: "Email helpdesk",
    description: "Send written requests, attachments or follow-up information by email.",
    href: `mailto:${ministry.helpdeskEmail}`,
    label: ministry.helpdeskEmail,
  },
  {
    icon: studioHelpdeskIcons.MapPinIcon,
    title: "Visit us",
    description: "Walk-in enquiries are available during office hours at the Ministry.",
    label: "View address below",
  },
];

const quick = [
  { icon: MessageCircle, label: "Message the chatbot", href: ministry.whatsapp.url, desc: "Start a WhatsApp helpdesk chat" },
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
        lead="Get support with services, local councils, laws and general enquiries. Message the Ministry of Local Govt Chat Bot on WhatsApp or use the channels below."
        crumbs={[{ label: "Helpdesk" }]}
      />

      <Reveal>
        <StudioHelpdeskContact
          contactMethods={channels}
          location={{
            name: "Ministry of Local Government & Regional Development",
            address: ministry.address,
            phone: ministry.phone,
            email: ministry.helpdeskEmail,
          }}
          whatsappUrl={ministry.whatsapp.url}
        />
      </Reveal>

      {/* Online helpdesk — embedded single-window app */}
      <section className="pb-10">
        <div className="container-gov">
          <Reveal>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
                <LifeBuoy className="size-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                  Online helpdesk
                </p>
                <h2 className="font-heading text-2xl font-extrabold">
                  Submit &amp; track requests online
                </h2>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <HelpdeskEmbed />
          </Reveal>
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
                    target={q.href.startsWith("http") ? "_blank" : undefined}
                    rel={q.href.startsWith("http") ? "noopener noreferrer" : undefined}
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
