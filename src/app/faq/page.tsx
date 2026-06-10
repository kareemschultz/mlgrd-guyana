import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ministry } from "@/lib/site";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about local government in Guyana — NDCs and RDCs, finding your council, reporting problems, permits and licences, rates, and contacting the Ministry.",
};

const faqs: { q: string; a: string }[] = [
  {
    q: "What is a Neighbourhood Democratic Council (NDC)?",
    a: "A Neighbourhood Democratic Council is the most local tier of government. NDCs are elected bodies responsible for everyday community services in their area — such as local roads, drainage, sanitation, public spaces and minor infrastructure — and for representing residents' interests.",
  },
  {
    q: "What is a Regional Democratic Council (RDC)?",
    a: "A Regional Democratic Council coordinates development and service delivery at the level of one of Guyana's ten administrative regions. RDCs oversee region-wide planning and work alongside neighbourhood and municipal councils to serve citizens.",
  },
  {
    q: "How do I find which council serves my area?",
    a: "Use the directories on this portal. You can browse Neighbourhood Democratic Councils, Regional Democratic Councils and municipalities by region to locate the body that serves your community, along with available contact details.",
  },
  {
    q: "How do I report a local problem such as a road, drain or sanitation issue?",
    a: "You can report local problems online through the Ministry's reporting service. Provide a clear description and location of the issue so it can be directed to the responsible local authority. Where possible, include nearby landmarks to help teams locate the site.",
  },
  {
    q: "How do I apply for a building permit?",
    a: "Building permits are issued in connection with your local authority area. The portal's building-permits guidance explains the general application process, the kinds of documents usually required, and how applications are reviewed and tracked.",
  },
  {
    q: "How do I obtain or renew a business licence?",
    a: "Business licences allow you to trade within a local authority area. The business-licences guidance outlines how to register a new licence, how renewals generally work, and where to direct enquiries about your specific circumstances.",
  },
  {
    q: "How do property rates and taxes work?",
    a: "Property rates help fund local services in your area. Rates are generally based on the valuation of a property as assessed for the relevant local authority. The rates-and-taxes guidance explains the principles involved and how to find out about payment arrangements.",
  },
  {
    q: "What services does the Ministry provide online?",
    a: "The portal offers guidance and digital access points for services including building permits, business licences, rates and taxes, reporting local problems, community projects, and vendor and supplier enquiries. New services are added over time.",
  },
  {
    q: "Are there job opportunities with the Ministry?",
    a: "Current openings, when available, are posted on the Job Vacancies page. The Ministry recruits through open, equal-opportunity processes. If no vacancies are listed, you may still register your interest through the Ministry's contact channels.",
  },
  {
    q: "How can I contact the Ministry?",
    a: `You can reach the Ministry at ${ministry.address}, by telephone on ${ministry.phone}, or by email at ${ministry.email}. The Ministry's helpdesk and contact page provide further ways to get assistance.`,
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Help & support"
        title="Frequently asked questions"
        lead="Quick answers to the questions citizens and businesses ask most about local government and the Ministry's services."
        crumbs={[{ label: "FAQ" }]}
      />

      <section className="py-16 sm:py-20">
        <div className="container-gov grid gap-10 lg:grid-cols-[1fr_2fr]">
          {/* Intro / aside */}
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
                <HelpCircle className="size-6" />
              </div>
              <h2 className="mt-5 font-heading text-2xl font-extrabold">
                Need more help?
              </h2>
              <p className="mt-3 text-muted-foreground">
                If your question isn&apos;t answered here, our helpdesk and
                contact team are ready to assist.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button asChild className="bg-brand-600 text-white hover:bg-brand-700">
                  <Link href="/contact">
                    Contact us <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/helpdesk">Visit the helpdesk</Link>
                </Button>
              </div>
            </div>
          </Reveal>

          {/* Accordion */}
          <Reveal delay={0.08}>
            <div className="rounded-2xl border bg-card px-6 sm:px-8">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="py-5 font-heading text-base font-bold">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[0.95rem] leading-relaxed text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
